const moment = require('moment-timezone');
const { ObjectID } = require('mongodb');
const async = require('async');
const garageSubscriptionTypes = require('../../../models/garage.subscription.type.js');
const KpiType = require('../../../models/kpi-type');
const KpiDictionary = require('../kpi/KpiDictionary');
const { log, SIMON, JEAN } = require('../../../../common/lib/util/log');
const { DEFAULT_MAX_TOTAL_PRICE_FOR_USERS } = require('./constants');

class AutomaticBillingHandler {
  /**
   * CONSTRUCTOR
   */
  constructor(nowInMs, app) {
    this._now = moment(nowInMs).tz('UTC');
    this._dayOfMonthNow = 'END_OF_MONTH';
    this._app = app;
    this._finalCallback = null;
    this._billingAccountsToBill = [];
    this._currentRange = null;
    this._bill = [];
  }

  //
  // ===================== PUBLIC METHODS =====================
  //

  forceGenerateBill(finalCallback) {
    this._finalCallback = finalCallback;
    this._currentRange = { start: 1, end: this._dayOfMonthNow };
    this._handleBillingForRange();
  }

  billToCsvString(bill) {
    let result =
      '\ufeffNom du compte de facturation;Identifiant comptable du compte de facturation;' +
      'E-mail;Raison sociale;Adresse;Code postal;Ville;' +
      "Établissement;Nom de l'option;Identifiant comptable de l'option;Quantité;Prix unitaire;" +
      'Prix HT;Prix TTC;Échéance mensuelle facturation\r';

    if (!bill || bill.length <= 0) {
      return result;
    }
    for (const line of bill) {
      result += `${this._cleanString(line.billingAccountName)};`;
      result += `${this._cleanString(line.billingAccountAccountingId)};`;
      result += `${this._cleanString(line.billingAccountEmail)};`;
      result += `${this._cleanString(line.billingAccountCompanyName)};`;
      result += `${this._cleanString(line.billingAccountAddress)};`;
      result += `${this._cleanString(line.billingAccountPostalCode)};`;
      result += `${this._cleanString(line.billingAccountCity)};`;
      result += `${this._cleanString(line.garageName)};`;
      result += `${this._cleanString(line.optionName)};`;
      result += `${this._cleanString(line.optionAccountingId)};`;
      result += `${this._cleanString(line.quantity)};`;
      result += `${this._cleanString(line.basePrice)};`;
      result += `${this._cleanString(line.totalPrice)};`;
      result += `${this._cleanString(line.totalPriceWithTaxes)};`;
      result += `${this._cleanString(line.billingAccountBillingDate)}\r`;
    }
    return result;
  }

  //
  // ===================== PRIVATE METHODS =====================
  //

  _cleanString(string) {
    if (!string || typeof string !== 'string') {
      return string;
    }
    return string.replace(/[;"']/g, ' ');
  }

  _handleBillingForRange() {
    async.auto(
      {
        fetchAllBillingAccounts: this.__fetchAllBillingAccounts.bind(this),
        billSelectedBillingAccounts: ['fetchAllBillingAccounts', this.__billSelectedBillingAccounts.bind(this)],
      },
      (err) => this._finalCallback(err, this._bill)
    );
  }

  __fetchAllBillingAccounts(asyncCb) {
    this._app.models.BillingAccount.find({ include: this.__getIncludeFilters() }, (errFind, billingAccounts) => {
      if (errFind || !billingAccounts) {
        console.error(`Unable to fetch billingAccounts ${errFind}`);
        asyncCb(errFind);
      } else {
        this.__filterBillingAccountsToBill(billingAccounts);
        asyncCb();
      }
    });
  }

  __getIncludeFilters() {
    const include = { relation: 'garages', scope: { fields: [] } };

    include.scope.fields.push(
      ...['id', 'type', 'status', 'slug', 'publicDisplayName', 'usersQuota', 'subscriptions', 'annexGarageId', 'tva']
    );
    include.scope.fields.push(...['automaticBillingBillNow', 'locale']);
    return include;
  }

  __filterBillingAccountsToBill(billingAccounts) {
    for (const ba of billingAccounts) {
      if (this.__billingAccountNeedToBeBilled(ba)) {
        this._billingAccountsToBill.push(ba);
      }
    }
  }

  __billingAccountNeedToBeBilled(billingAccount) {
    return (
      this.__billingAccountBillingDateMatchesCurrentRange(billingAccount) &&
      billingAccount.id.toString() !== '5c1a47e9f10b010014baabc8'
    ); // Comptes Test
  }

  __billingAccountBillingDateMatchesCurrentRange(billingAccount) {
    return (
      billingAccount.billingDate >= this._currentRange.start &&
      billingAccount.billingDate <= (this._currentRange.end === 'END_OF_MONTH' ? 31 : this._currentRange.end)
    );
  }

  async __util_getUsersByGarage() {
    // chunks an array into smaller arrays of the specified size.
    // [[id , id], [id , id] ...]
    const chunkIt = function* (garageIds, size) {
      let chunk = [];
      for (const id of garageIds) {
        chunk.push(id);
        if (chunk.length === size) {
          yield chunk;
          chunk = [];
        }
      }
      if (chunk.length) yield chunk;
    };

    // all garages are not billed , take only those whore are (small optimization)
    let garageIdsToGetUsersFrom = this._billingAccountsToBill.reduce((acc, billingAccounts) => {
      billingAccounts.garageIds.forEach((id) => {
        if (!acc.includes(id)) acc.push(id);
      });
      return acc;
    }, []);

    // build batches of 500 garagesIds to avoid overwhelming the db
    const batches = [...chunkIt(garageIdsToGetUsersFrom, 500)];

    // for each batch retrieve the users for each garageId
    let usersByGarage = {};
    for (const batch of batches) {
      const usersByGarageBatch = await this._app.models.User.getRealUsersByGarage(batch);
      usersByGarage = { ...usersByGarage, ...usersByGarageBatch };
    }

    return usersByGarage;
  }

  __billSelectedBillingAccounts(asyncCb) {
    this.__util_getUsersByGarage()
      .then((usersByGarage) => {
        async.eachSeries(
          this._billingAccountsToBill,
          (billingAccount, eachCb) => {
            async.eachSeries(
              billingAccount.garages(),
              (garage, eachGarageCb) => {
                if (this.__billingAccountBillingDateMatchesCurrentRange(billingAccount)) {
                  this._billGarage(billingAccount, garage, usersByGarage, eachGarageCb);
                } else {
                  eachGarageCb();
                }
              },
              eachCb
            );
          },
          asyncCb
        );
      })
      .catch((err) => {
        console.error('Error occured : ', err);
        asyncCb(err);
      });
  }

  __updateSelectedBillingAccounts(asyncCb) {
    // NOT TO USE ANYMORE - CONFLICT WITH VOSFACTURES
    async.eachSeries(
      this._billingAccountsToBill,
      (billingAccount, eachCb) => {
        async.eachSeries(
          billingAccount.garages(),
          (garage, eachGarageCb) => {
            const sub = garage.subscriptions;
            let modified = false;

            if (
              sub.active &&
              moment(sub.dateStart).tz('UTC').isSameOrBefore(this._now, 'day') &&
              sub.setup &&
              sub.setup.enabled &&
              !sub.setup.alreadyBilled &&
              moment(sub.setup.billDate).tz('UTC').isSameOrBefore(this._now, 'day')
            ) {
              sub.setup.alreadyBilled = true;
              modified = true;
            }

            if (garage.automaticBillingBillNow) {
              garage.automaticBillingBillNow = false; // eslint-disable-line no-param-reassign
              modified = true;
            }

            if (modified) {
              this._app.models.Garage.findByIdAndUpdateAttributes(
                garage.getId(),
                {
                  automaticBillingBillNow: !!garage.automaticBillingBillNow,
                  'subscriptions.setup.alreadyBilled': !!sub.setup.alreadyBilled,
                },
                eachGarageCb
              );
              // garage.updateAttributes({garageIds: [garage1.getId(), garage5.getId(), garage9.getId()]},
              //  garage.save(eachGarageCb);
            } else {
              eachGarageCb();
            }
          },
          (errGarages) => {
            if (errGarages) {
              eachCb(errGarages);
            } else if (
              this.__billingAccountBillingDateMatchesCurrentRange(billingAccount) &&
              this.__billingAccountNeedBillingDateUpdate(billingAccount)
            ) {
              billingAccount.updateAttribute('dateNextBilling', this.__calcDateNextBilling(billingAccount), eachCb);
            } else {
              eachCb();
            }
          }
        );
      },
      asyncCb
    );
  }

  __calcDateNextBilling(billingAccount) {
    const nextMonth = this._now.clone().date(15).add(1, 'month');
    const theoricNextDate = moment(billingAccount.dateNextBilling)
      .tz('UTC')
      .add(1, 'month')
      .date(billingAccount.billingDate);

    if (!theoricNextDate.isSame(nextMonth, 'month')) {
      return nextMonth.clone().endOf('month').hour(20).toDate();
    }
    return theoricNextDate.toDate();
  }

  __billingAccountNeedBillingDateUpdate(billingAccount) {
    const nextMonth = this._now.clone().date(15).add(1, 'month');
    const theoricNextDate = moment(billingAccount.dateNextBilling).tz('UTC');

    return theoricNextDate.isBefore(nextMonth, 'month');
  }

  _billGarage(billingAccount, garage, usersByGarage, eachCb) {
    const { subscriptions } = garage;

    if (
      subscriptions &&
      subscriptions.active &&
      moment(subscriptions.dateStart).tz('UTC').isSameOrBefore(this._now, 'day')
    ) {
      this._billGarageSubscription(billingAccount, garage, usersByGarage, (errBillSubs) => {
        if (errBillSubs) {
          eachCb(errBillSubs);
        } else if (this.__billingAccountBillingDateMatchesCurrentRange(billingAccount)) {
          this._billGarageContacts(billingAccount, garage, eachCb);
        } else {
          eachCb();
        }
      });
      return;
    }
    eachCb();
  }

  _billGarageSubscription(billingAccount, garage, usersByGarage, cb) {
    this._billGarageSetup(billingAccount, garage);
    this._billGarageConnect(billingAccount, garage);

    for (const subcriptionType of garageSubscriptionTypes.getGarageScoreComponents()) {
      this._billGarageScoreComponent(billingAccount, garage, subcriptionType);
    }
    this._billGarageManager(billingAccount, garage);
    this._billGarageTransfer(billingAccount, garage);
    this._billGarageCoaching(billingAccount, garage);
    this._billGarageUsers(billingAccount, garage, usersByGarage);
    this._billGarageEReputationSub(billingAccount, garage);
    this._billGarageCrossLeadsSub(billingAccount, garage)
      .then(() => {
        this._billGarageAutomationSub(billingAccount, garage, cb); // cb async need to be called one time at the end
      })
      .catch((err) => {
        console.error(err);
        cb(err);
      });
  }

  _billGarageSetup(billingAccount, garage) {
    const {
      subscriptions: { setup },
    } = garage;
    if (
      setup &&
      setup.enabled &&
      moment(new Date(setup.billDate)).tz('UTC').isSame(this._now, 'month') &&
      moment(new Date(setup.billDate)).tz('UTC').isSame(this._now, 'year')
    ) {
      this._addBillElement(
        billingAccount,
        garage,
        'Set-up',
        this._getProductAccountId('4', '01', this._getCountryCode(garage)),
        1,
        setup.price,
        !setup.alreadyBilled
      );
    }
  }

  _billGarageConnect(billingAccount, garage) {
    const {
      subscriptions: { [garageSubscriptionTypes.CONNECT]: subscription },
    } = garage;

    if (subscription && subscription.enabled) {
      this._addBillElement(
        billingAccount,
        garage,
        'Connect',
        this._getProductAccountId('3', '01', this._getCountryCode(garage)),
        1,
        subscription.price
      );
    }
  }

  _billGarageScoreComponent(billingAccount, garage, subcriptionType) {
    const {
      subscriptions: { [subcriptionType]: subscription },
    } = garage;

    if (subscription && subscription.enabled) {
      this._addBillElement(
        billingAccount,
        garage,
        garageSubscriptionTypes.displayName(subcriptionType, 'fr', 'BILLING'),
        this._getProductAccountId('1', this._getProductCode(garage, '11', true), this._getCountryCode(garage)),
        1,
        subscription.price
      ); // eslint-disable-line max-len
    }
  }

  _billGarageManager(billingAccount, garage) {
    const {
      subscriptions: { [garageSubscriptionTypes.ANALYTICS]: subscription },
    } = garage;

    if (subscription && subscription.enabled) {
      this._addBillElement(
        billingAccount,
        garage,
        'Manager',
        this._getProductAccountId('1', this._getProductCode(garage, '01', true), this._getCountryCode(garage)),
        1,
        subscription.price
      );
    }
  }

  _billGarageCoaching(billingAccount, garage) {
    const {
      subscriptions: { [garageSubscriptionTypes.COACHING]: subscription },
    } = garage;

    if (subscription && subscription.enabled) {
      this._addBillElement(
        billingAccount,
        garage,
        'Coaching',
        this._getProductAccountId('1', this._getProductCode(garage, '02', true), this._getCountryCode(garage)),
        1,
        subscription.price
      );
    }
  }

  _billGarageEReputationSub(billingAccount, garage) {
    const {
      subscriptions: { [garageSubscriptionTypes.E_REPUTATION]: subscription },
    } = garage;

    if (subscription && subscription.enabled) {
      this._addBillElement(
        billingAccount,
        garage,
        'E-Réputation',
        this._getProductAccountId('1', this._getProductCode(garage, '16', true), this._getCountryCode(garage)),
        1,
        subscription.price
      );
    }
  }

  _billGarageAutomationSub(billingAccount, garage, cb) {
    const {
      subscriptions: { [garageSubscriptionTypes.AUTOMATION]: subscription },
    } = garage;

    if (subscription && subscription.enabled) {
      // Fix cost
      this._addBillElement(
        billingAccount,
        garage,
        'Automation',
        this._getProductAccountId('1', this._getProductCode(garage, '21', true), this._getCountryCode(garage)),
        1,
        subscription.price
      );
      // Variable part
      this._getGarageAutomationContacts(garage, (nbContacts) => {
        this._addBillElement(
          billingAccount,
          garage,
          `Automation Contacts (au delà des ${subscription.included || 0} inclus)`,
          this._getProductAccountId('1', this._getProductCode(garage, '22'), this._getCountryCode(garage)),
          Math.max(0, nbContacts - (subscription.included || 0)),
          subscription.every || 0
        );
        cb();
      });
    } else {
      cb();
    }
  }

  async _getGarageAutomationContacts(garage, cb) {
    const period = parseInt(this._now.clone().subtract(1, 'months').format('YYYYMM'), 10);
    const garageId = new ObjectID(garage.id.toString());

    const mongoConnector = this._app.models.KpiByPeriod.getMongoConnector();
    try {
      const kpis = await mongoConnector
        .aggregate([
          {
            $match: {
              [KpiDictionary.garageId]: garageId,
              [KpiDictionary.period]: period,
              [KpiDictionary.kpiType]: KpiType.GARAGE_KPI,
            },
          },
          {
            $project: {
              KPI_automationCountSentSales: `$${KpiDictionary.KPI_automationCountSentSales}`,
              KPI_automationCountSentMaintenances: `$${KpiDictionary.KPI_automationCountSentMaintenances}`,
            },
          },
        ])
        .toArray();

      const stat = kpis && kpis.length ? kpis[0] : {};
      if (!stat.KPI_automationCountSentSales && !stat.KPI_automationCountSentMaintenances) {
        throw new Error('No KPI found');
      }

      const isValidKPINumber = (count) => Number.isFinite(count) && count > 0;
      const { KPI_automationCountSentSales, KPI_automationCountSentMaintenances } = stat;
      if (!isValidKPINumber(KPI_automationCountSentSales) && !isValidKPINumber(KPI_automationCountSentMaintenances)) {
        console.error(
          `_getGarageAutomationContacts: Invalid amount of Automation contacts sent for garage ${garage.id.toString()}`
        );
        cb(0);
        return;
      }
      const nContactsSent = (KPI_automationCountSentSales || 0) + (KPI_automationCountSentMaintenances || 0);
      cb(nContactsSent);
    } catch {
      console.error(`_getGarageAutomationContacts: No KPI for Garage ${garage.id.toString()} on period ${period}`);
      cb(0);
    }
  }

  async _billGarageCrossLeadsSub(billingAccount, garage) {
    const {
      subscriptions: { [garageSubscriptionTypes.CROSS_LEADS]: subscription },
    } = garage;

    if (subscription && subscription.enabled) {
      // fixed part
      this._addBillElement(
        billingAccount,
        garage,
        'X-Leads',
        this._getProductAccountId('1', this._getProductCode(garage, '26', true), this._getCountryCode(garage)),
        1,
        subscription.price
      );
      // Variable part, additional sources
      const sources = await this._app.models.Garage.getAllSources([new ObjectID(garage.id.toString())]);
      const activeSources = (sources && sources.filter((s) => s.enabled)) || null;
      if (activeSources && activeSources.length > (subscription.included || 0)) {
        this._addBillElement(
          billingAccount,
          garage,
          'X-Leads sources supplémentaires',
          this._getProductAccountId('1', this._getProductCode(garage, '27'), this._getCountryCode(garage)),
          activeSources.length - (subscription.included || 0),
          subscription.unitPrice || 0
        );
      }
      // Variable part, mobile consumption
      const lastMonthTotalMobileMinutes = await this._getGarageCrossLeadsLastMonthTotalMobileMinutes(garage);
      if (lastMonthTotalMobileMinutes) {
        let minutePrice = 0.15; // default price
        if (typeof subscription.minutePrice === 'number') {
          minutePrice = subscription.minutePrice;
        }
        this._addBillElement(
          billingAccount,
          garage,
          'X-Leads consommation mobile',
          this._getProductAccountId('1', this._getProductCode(garage, '27'), this._getCountryCode(garage)),
          lastMonthTotalMobileMinutes,
          minutePrice
        );
      }
    }
  }

  async _getGarageCrossLeadsLastMonthTotalMobileMinutes(garage) {
    const startOfLastMonth = this._now.clone().subtract(1, 'month').date(1).startOf('day');
    const endOfLastMonth = this._now.clone().date(1).startOf('day');
    const mongo = this._app.models.IncomingCrossLead.getMongoConnector();
    const [seconds] = await mongo
      .aggregate([
        {
          $match: {
            garageId: garage.id,
            receivedAt: { $gte: startOfLastMonth.toDate(), $lt: endOfLastMonth.toDate() },
            'raw.destinationType': 'mobile',
          },
        },
        { $project: { 'raw.duration': true } },
        {
          $group: {
            _id: null,
            total: {
              $sum: '$raw.duration',
            },
          },
        },
      ])
      .toArray();
    if (!seconds || !seconds.total) return 0;
    const totalMinutes = Math.round(seconds.total / 60);
    log.info(SIMON, `${totalMinutes} mns for garage ${garage.id.toString()}`);
    return totalMinutes;
  }

  _billGarageUsers(billingAccount, garage, usersByGarages) {
    const {
      subscriptions: { users },
    } = garage;

    const usersByGarage = usersByGarages[garage.getId().toString()] || [];

    let nbUsers = usersByGarage && usersByGarage.length;
    nbUsers -= users.included;
    nbUsers = nbUsers < 0 ? 0 : nbUsers;
    this._addBillElement(
      billingAccount,
      garage,
      `Utilisateurs (Au delà des ${users.included} inclus)`,
      this._getProductAccountId('1', this._getProductCode(garage, '04'), this._getCountryCode(garage)),
      nbUsers,
      users.price
    );
  }

  _billGarageTransfer(billingAccount, garage) {
    if (billingAccount.billingType === 'transfer' && !billingAccount.billingTypeBilled) {
      this._addBillElement(
        billingAccount,
        garage,
        'Traitement du règlement par virement',
        this._getProductAccountId('1', this._getProductCode(garage, '05'), this._getCountryCode(garage)),
        1,
        billingAccount.billingTypePrice
      );
      billingAccount.billingTypeBilled = true; // eslint-disable-line no-param-reassign
    }
  }

  async _billGarageContacts(billingAccount, garage, eachCb) {
    const period = parseInt(this._now.clone().subtract(1, 'months').format('YYYYMM'), 10);
    const garageId = new ObjectID(garage.id.toString());
    const mongoConnector = this._app.models.KpiByPeriod.getMongoConnector();
    try {
      const kpis = await mongoConnector
        .aggregate([
          {
            $match: {
              [KpiDictionary.garageId]: garageId,
              [KpiDictionary.period]: period,
              [KpiDictionary.kpiType]: KpiType.GARAGE_KPI,
            },
          },
          {
            $project: {
              countReceivedSurveys: `$${KpiDictionary.contactsCountReceivedSurveys}`,
              countScheduledContacts: `$${KpiDictionary.contactsCountScheduledContacts}`,
            },
          },
        ])
        .toArray();

      const stat = kpis && kpis.length ? kpis[0] : {};
      this._billGarageContactsType(billingAccount, garage, stat);
    } catch (err) {
      log.error(JEAN, err);
    } finally {
      eachCb();
    }
  }

  _billGarageContactsType(billingAccount, garage, stat) {
    const {
      subscriptions: { contacts },
    } = garage;

    let nbContacts = (stat.countReceivedSurveys || 0) + (stat.countScheduledContacts || 0);
    let price = 0;
    let name = 'Coût au contact';

    if (contacts) {
      nbContacts -= contacts.included;
      nbContacts = nbContacts < 0 ? 0 : nbContacts;
      price = contacts.price;
    }
    if (contacts && contacts.bundle) {
      nbContacts /= 100;
      name = 'Coût au contact par tranche de 100';
    }
    this._addBillElement(
      billingAccount,
      garage,
      name,
      this._getProductAccountId('1', this._getProductCode(garage, '12'), this._getCountryCode(garage)),
      nbContacts,
      price
    );
  }

  _addBillElement(billingAccount, garage, option, ref, q, price, shouldBeBilled) {
    if (Number.isInteger(garage.tva)) {
      const tva = 1 + garage.tva / 100; // use TVA by garage
      const garageMaxTotalPriceForUsers =
        garage.subscriptions && garage.subscriptions.users && garage.subscriptions.users.maximumTotalPriceForUsers;
      const maximumTotalPriceForUsers = garageMaxTotalPriceForUsers || DEFAULT_MAX_TOTAL_PRICE_FOR_USERS;
      const totalPrice = Math.round(q * price * 100) / 100;
      this._bill.push({
        billingAccountId: billingAccount.getId(),
        billingAccountName: billingAccount.name,
        billingAccountAccountingId: billingAccount.accountingId,
        billingAccountCompanyName: billingAccount.companyName,
        billingAccountAddress: billingAccount.address,
        billingAccountPostalCode: billingAccount.postalCode,
        billingAccountCity: billingAccount.city,
        garageName: garage.publicDisplayName,
        billingAccountEmail: billingAccount.email,
        garageId: garage.getId(),
        optionName: option,
        optionAccountingId: ref,
        quantity: Math.round(q * 100) / 100,
        basePrice: price,
        totalPrice: option.includes('Utilisateurs') ? Math.min(totalPrice, maximumTotalPriceForUsers) : totalPrice, // Users can't go over maximumTotalPriceForUsers
        totalPriceWithTaxes:
          (option.includes('Utilisateurs') ? Math.min(totalPrice, maximumTotalPriceForUsers) : totalPrice) * tva, // Users can't go over maximumTotalPriceForUsers
        billingAccountBillingDate: billingAccount.billingDate,
        shouldBeBilled,
      });
    } else {
      console.log(`no TVA find for garage ${garage.publicDisplayName} - ${garage.getId()}`);
    }
  }

  _getProductCode(garage, defaultCode, isSubscription = false) {
    const isMirror = !!garage.annexGarageId && isSubscription;
    return isMirror ? '03' : defaultCode;
  }

  _getCountryCode(garage) {
    const countryCode = garage.locale ? garage.locale.substr(-2).toUpperCase() : 'FR';
    switch (countryCode) {
      case 'BE':
        return '01';
      case 'ES':
        return '02';
      case 'NC':
        return '03';
      default:
        return '00';
    }
  }

  _getProductAccountId(prefixCode, productCode, countryCode) {
    return `706${prefixCode}${productCode}${countryCode}`;
  }
}

module.exports = AutomaticBillingHandler;
