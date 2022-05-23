const momentTz = require('moment-timezone');
const config = require('config');
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
const PNT = require('google-libphonenumber').PhoneNumberType;

const slackClient = require('../../../../../../../slack/client');
const BillingAccountException = require('../billing-accounts.exception');
const garageSubscriptionTypes = require('../../../../../../../../models/garage.subscription.type.js');
const garageStatus = require('../../../../../../../../models/garage.status.js');
const UserAutorization = require('../../../../../../../../models/user-autorization');

const garageFields = [
  'id',
  'type',
  'status',
  'slug',
  'publicDisplayName',
  'group',
  'usersQuota',
  'subscriptions',
  'annexGarageId',
  'bizDevId',
  'performerId',
  'businessId',
  'googlePlaceId',
  'locale',
  'timezone',
  'zohoDealUrl',
  'disableZohoUrl',
  'ratingType',
  'isReverseRating',
  'certificateWording',
  'brandNames',
  'surveySignature',
  'thresholds',
  'links',
  'parent',
  'ticketsConfiguration',
  'allowReviewCreationFromContactTicket',
  'enableCrossLeadsSelfAssignCallAlert',
];

class BillingAccountPipelineInternalCatalog {
  static get getAllBillingAccounts() {
    return [this._getAllBillingAccounts, [], ['[BA]']];
  }

  static get getOneBillingAccount() {
    return [this._getOneBillingAccount, ['BAId'], ['{BA}']];
  }

  static get createBillingAccount() {
    return [
      this._createBillingAccount,
      [
        'BAName',
        'BAEmail',
        'BABillingDate',
        'BAAddress',
        'BACompanyName',
        'BAPostalCode',
        'BAAccountingId',
        'BACity',
        'BACountry',
      ],
      ['{BA}'],
    ];
  }

  static get updateBillingAccount() {
    return [this._updateBillingAccount, ['{BA}'], ['{BA}']];
  }

  static get getOneGarage() {
    return [this._getOneGarage, ['GAId'], ['{GA}']];
  }

  static get checkIfGarageIsAlreadyTaken() {
    return [this._checkIfGarageIsAlreadyTaken, ['GAId', '[GA]'], []];
  }

  static get findAlreadyTakenGarages() {
    return [this._findAlreadyTakenGarages, [], ['[GA]']];
  }

  static get addGaragetoBillingAccount() {
    return [this._addGaragetoBillingAccount, ['GAId', '{BA}'], []];
  }

  static get checkIfGarageExistsInBillingAccount() {
    return [this._checkIfGarageExistsInBillingAccount, ['{BA}', 'BAId', 'GAId'], []];
  }

  static get removeGarageFromBillingAccount() {
    return [this._removeGarageFromBillingAccount, ['{BA}', 'GAId'], []];
  }

  static get deleteBillingAccount() {
    return [this._deleteBillingAccount, ['{BA}'], []];
  }

  static get checkIfDateStartIsValid() {
    return [this._checkIfDateStartIsValid, ['{BA}'], []];
  }

  static get checkIfGarageAlreadyHasActiveSubscription() {
    return [this._checkIfGarageAlreadyHasActiveSubscription, ['{BA}', '{GA}'], []];
  }

  static get createSubscription() {
    return [this._createSubscription, [], []];
  }

  static get checkIfShouldBillNow() {
    return [this._checkIfShouldBillNow, ['{GA}'], []];
  }

  static get checkIfSubscriptionBelongsToGarage() {
    return [this._checkIfSubscriptionBelongsToGarage, ['{BA}', '{SU}'], []];
  }

  static get getOneSubscription() {
    return [this._getOneSubscription, ['{BA}', '{GA}', 'subscriptionId'], ['{SU}']];
  }

  static get updateOneSubscription() {
    return [this._updateOneSubscription, [], ['{GA}', '{oldSubscription}']];
  }

  static get terminateOneSubscription() {
    return [this._terminateOneSubscription, [], []];
  }

  static get notifySlackChannelsCreation() {
    return [this._notifySlackChannelsCreation, ['{GA}', '{BA}'], []];
  }

  static get notifySlackChannelsModification() {
    return [this._notifySlackChannelsModification, ['{GA}', '{oldSubscription}'], []];
  }

  static _getAllBillingAccounts(data, cb) {
    data.models.BillingAccount.find(
      {
        include: {
          relation: 'garages',
          scope: {
            fields: garageFields,
          },
        },
      },
      (e, r) => cb(e, { billingAccounts: r })
    );
  }

  static _getOneBillingAccount(data, cb) {
    data.models.BillingAccount.findById(
      data.argv.billingAccountId,
      {
        include: {
          relation: 'garages',
          scope: {
            fields: garageFields,
          },
        },
      },
      (e, r) => cb(e, { billingAccount: r })
    );
  }

  static _createBillingAccount(data, cb) {
    // TODO #3569 check if we need to set the surveySignature here
    const today = momentTz().tz('UTC').hours(21).minutes(0).seconds(0).milliseconds(0); // eslint-disable-line
    const theoricNextBill = today.clone().date(data.argv.billingAccountBillingDate);
    const fields = {
      name: data.argv.billingAccountName,
      accountingId: data.argv.billingAccountAccountingId,
      email: data.argv.billingAccountEmail,
      billingDate: data.argv.billingAccountBillingDate,
      address: data.argv.billingAccountAddress,
      companyName: data.argv.billingAccountCompanyName,
      postalCode: data.argv.billingAccountPostalCode,
      city: data.argv.billingAccountCity,
      country: data.argv.billingAccountCountry,
      note: data.argv.billingAccountNote,
      billingType: data.argv.billingAccountBillingType,
      billingTypePrice: data.argv.billingAccountBillingTypePrice,
      dateNextBilling: theoricNextBill.isBefore(today) ? theoricNextBill.add(1, 'month') : theoricNextBill,
      goCardLessSetup: data.argv.billingAccountGoCardLessSetup,
      mandateId: data.argv.billingAccountMandateId,
      customerId: data.argv.billingAccountCustomerId,
      technicalContact: data.argv.billingAccountTechnicalContact,
      accountingContact: data.argv.billingAccountAccountingContact,
      RGPDContact: data.argv.billingAccountRGPDContact,
    };

    if (theoricNextBill.isAfter(today, 'month') && today.date() < data.argv.billingAccountBillingDate) {
      fields.dateNextBilling = today.clone().endOf('month').hours(21).minutes(0).seconds(0).milliseconds(0); // eslint-disable-line
    }
    data.models.BillingAccount.create(fields, (e, r) => cb(e, { billingAccount: r }));
  }

  static _updateBillingAccount(data, cb) {
    // TODO #3569 check if we need to set the surveySignature here
    const fields = {};
    let needUpdate = false;

    if (data.argv.billingAccount.name !== data.argv.billingAccountName && data.argv.billingAccountName) {
      fields.name = data.argv.billingAccountName;
      data.enrich({ billingAccountNewName: fields.name }, 'billingAccountNewName');
      needUpdate = true;
    }
    if (
      data.argv.billingAccount.accountingId !== data.argv.billingAccountAccountingId &&
      data.argv.billingAccountAccountingId
    ) {
      fields.accountingId = data.argv.billingAccountAccountingId;
      data.enrich({ billingAccountNewAccountingId: fields.accountingId }, 'billingAccountNewAccountingId');
      needUpdate = true;
    }
    if (data.argv.billingAccount.email !== data.argv.billingAccountEmail && data.argv.billingAccountEmail) {
      fields.email = data.argv.billingAccountEmail;
      data.enrich({ billingAccountNewEmail: fields.email }, 'billingAccountNewEmail');
      needUpdate = true;
    }
    if (
      data.argv.billingAccount.companyName !== data.argv.billingAccountCompanyName &&
      data.argv.billingAccountCompanyName
    ) {
      fields.companyName = data.argv.billingAccountCompanyName;
      data.enrich({ billingAccountNewCompanyName: fields.companyName }, 'billingAccountNewCompanyName');
      needUpdate = true;
    }
    if (data.argv.billingAccount.address !== data.argv.billingAccountAddress && data.argv.billingAccountAddress) {
      fields.address = data.argv.billingAccountAddress;
      data.enrich({ billingAccountNewAddress: fields.address }, 'billingAccountNewAddress');
      needUpdate = true;
    }
    if (
      data.argv.billingAccount.postalCode !== data.argv.billingAccountPostalCode &&
      data.argv.billingAccountPostalCode
    ) {
      fields.postalCode = data.argv.billingAccountPostalCode;
      data.enrich({ billingAccountNewPostalCode: fields.postalCode }, 'billingAccountNewPostalCode');
      needUpdate = true;
    }
    if (data.argv.billingAccount.city !== data.argv.billingAccountCity && data.argv.billingAccountCity) {
      fields.city = data.argv.billingAccountCity;
      data.enrich({ billingAccountNewCity: fields.city }, 'billingAccountNewCity');
      needUpdate = true;
    }
    if (data.argv.billingAccount.country !== data.argv.billingAccountCountry && data.argv.billingAccountCountry) {
      fields.country = data.argv.billingAccountCountry;
      data.enrich({ billingAccountNewCountry: fields.country }, 'billingAccountNewCountry');
      needUpdate = true;
    }
    if (data.argv.billingAccount.note !== data.argv.billingAccountNote && data.argv.billingAccountNote) {
      fields.note = data.argv.billingAccountNote;
      data.enrich({ billingAccountNewNote: fields.note }, 'billingAccountNewNote');
      needUpdate = true;
    }
    if (
      data.argv.billingAccount.billingType !== data.argv.billingAccountBillingType &&
      data.argv.billingAccountBillingType
    ) {
      fields.billingType = data.argv.billingAccountBillingType;
      data.enrich({ billingAccountNewBillingType: fields.billingType }, 'billingAccountNewBillingType');
      needUpdate = true;
    }
    if (
      data.argv.billingAccount.billingTypePrice !== data.argv.billingAccountBillingTypePrice &&
      data.argv.billingAccountBillingType
    ) {
      fields.billingTypePrice = data.argv.billingAccountBillingTypePrice;
      data.enrich({ billingAccountNewBillingTypePrice: fields.billingTypePrice }, 'billingAccountNewBillingTypePrice');
      needUpdate = true;
    }
    if (
      data.argv.billingAccountBillingDate &&
      parseInt(data.argv.billingAccount.billingDate, 10) !== parseInt(data.argv.billingAccountBillingDate, 10)
    ) {
      fields.billingDate = data.argv.billingAccountBillingDate;
      data.enrich({ billingAccountNewBillingDate: fields.billingDate }, 'billingAccountNewBillingDate');
      needUpdate = true;
    }
    if (data.argv.billingAccount.goCardLessSetup !== data.argv.billingAccountGoCardLessSetup) {
      fields.goCardLessSetup = data.argv.billingAccountGoCardLessSetup;
      data.enrich({ billingAccountGoCardLessSetup: fields.goCardLessSetup }, 'billingAccountGoCardLessSetup');
      needUpdate = true;
    }
    if (data.argv.billingAccount.mandateId !== data.argv.billingAccountMandateId) {
      fields.mandateId = data.argv.billingAccountMandateId;
      data.enrich({ billingAccountMandateId: fields.mandateId }, 'billingAccountMandateId');
      needUpdate = true;
    }
    if (data.argv.billingAccount.customerId !== data.argv.billingAccountCustomerId) {
      fields.customerId = data.argv.billingAccountCustomerId;
      data.enrich({ billingAccountCustomerId: fields.customerId }, 'billingAccountCustomerId');
      needUpdate = true;
    }
    if (
      data.argv.billingAccount.technicalContact !== data.argv.billingAccountTechnicalContact &&
      data.argv.billingAccountTechnicalContact
    ) {
      fields.technicalContact = data.argv.billingAccountTechnicalContact;
      data.enrich({ billingAccountTechnicalContact: fields.technicalContact }, 'billingAccountTechnicalContact');
      needUpdate = true;
    }
    if (
      data.argv.billingAccount.accountingContact !== data.argv.billingAccountAccountingContact &&
      data.argv.billingAccountAccountingContact
    ) {
      fields.accountingContact = data.argv.billingAccountAccountingContact;
      data.enrich({ billingAccountAccountingContact: fields.accountingContact }, 'billingAccountAccountingContact');
      needUpdate = true;
    }
    if (
      data.argv.billingAccount.RGPDContact !== data.argv.billingAccountRGPDContact &&
      data.argv.billingAccountRGPDContact
    ) {
      fields.RGPDContact = data.argv.billingAccountRGPDContact;
      data.enrich({ billingAccountRGPDContact: fields.RGPDContact }, 'billingAccountRGPDContact');
      needUpdate = true;
    }
    if (needUpdate) {
      data.argv.billingAccount.updateAttributes(fields, (e, r) => cb(e, { billingAccount: r }));
    } else {
      cb(null, { billingAccount: data.argv.billingAccount });
    }
  }

  static _getOneGarage(data, cb) {
    data.models.Garage.findById(data.argv.garageId, (e, r) => cb(e, { garage: r }));
  }

  static _checkIfGarageIsAlreadyTaken(data, cb) {
    for (const garage of data.argv.garages) {
      if (garage.id.toString() === data.argv.garageId) {
        return cb(new BillingAccountException('This garage already belong to a billingAccount').badRequest());
      }
    }
    return cb(null);
  }

  static _findAlreadyTakenGarages(data, cb) {
    let taken = [];

    data.models.BillingAccount.find({}, (err, billingAccounts) => {
      if (err) {
        cb(err, null);
      } else {
        for (const ba of billingAccounts) {
          taken = taken.concat(ba.garageIds);
        }
        cb(null, { garages: taken.map((e) => ({ id: e.toString() })) });
      }
    });
  }

  static _addGaragetoBillingAccount(data, cb) {
    data.argv.billingAccount.garages.add(data.argv.garageId, cb);
  }

  static _checkIfGarageExistsInBillingAccount(data, cb) {
    for (const id of data.argv.billingAccount.garageIds) {
      if (id.toString() === data.argv.garageId) {
        return cb(null);
      }
    }
    return cb(
      new BillingAccountException(
        `Garage ${data.argv.garageId} does not exist in billingAccount ${data.argv.billingAccountId}`
      ).badRequest()
    );
  }

  static _removeGarageFromBillingAccount(data, cb) {
    data.argv.billingAccount.garages.remove(data.argv.garageId, cb);
  }

  static _deleteBillingAccount(data, cb) {
    data.argv.billingAccount.destroy(cb);
  }

  static _checkIfDateStartIsValid(data, cb) {
    const today = momentTz().tz('UTC').hours(21).minutes(0).seconds(0).milliseconds(0);
    const chosenDate = momentTz(data.argv.sub.dateStart).tz('UTC');
    const res = [];
    let date = momentTz().tz('UTC').date(data.argv.billingAccount.billingDate);

    if (date.isAfter(today)) {
      date.subtract(1, 'month');
      today.subtract(1, 'month');
    }
    if (date.isAfter(today, 'month')) {
      date = today.clone().endOf('month').hours(21).minutes(0).seconds(0).milliseconds(0);
    }
    res.push(date);
    date = date.clone().add(1, 'month').date(data.argv.billingAccount.billingDate);
    today.add(1, 'month');
    if (date.isAfter(today, 'month')) {
      date = today.clone().endOf('month').hours(21).minutes(0).seconds(0).milliseconds(0);
    }
    res.push(date);
    if (!chosenDate.isSame(res[0], 'day') && !chosenDate.isSame(res[1], 'day')) {
      cb(new BillingAccountException('Unauthorized dateStart: jour anniversaire non respecté').badRequest(), null);
    } else {
      cb(null, null);
    }
  }

  static _checkIfGarageAlreadyHasActiveSubscription(data, cb) {
    if (data.argv.garage.subscriptions && data.argv.garage.subscriptions.active) {
      cb(new BillingAccountException('This garage already has an active subscription').badRequest(), null);
    } else {
      cb(null, null);
    }
  }

  static _createSubscription(data, cb) {
    const g = data.argv.garage;
    const s = data.argv.sub;
    if (s.annexGarageId) {
      g.annexGarageId = s.annexGarageId;
    }

    g.subscriptions.dateStart = s.dateStart;
    g.subscriptions.dateEnd = null;
    g.subscriptions.setup = s.setup.enabled ? s.setup : null;
    g.subscriptions.users = s.users;
    g.subscriptions.contacts = s.contacts;
    g.subscriptions.active = true;
    g.subscriptions.priceValidated = s.priceValidated;
    for (const subType of garageSubscriptionTypes.values()) {
      g.subscriptions[subType] = s[subType];
    }
    // hellofed temp automation
    g.subscriptions.AutomationApv = { enabled: !!(s.AutomationApv && s.AutomationApv.enabled) };
    g.subscriptions.AutomationVn = { enabled: !!(s.AutomationVn && s.AutomationVn.enabled) };
    g.subscriptions.AutomationVo = { enabled: !!(s.AutomationVo && s.AutomationVo.enabled) };

    if (g.status === garageStatus.TO_CREATE) {
      g.status = garageStatus.TO_PLUG;
    }

    data.argv.garage.save((e) => {
      if (e) {
        cb(e);
      }
      data.argv.subscription = data.argv.garage.subscriptions; // eslint-disable-line no-param-reassign
      // Garage newly subscribed to Automation, we will activate the ACCESS_TO_AUTOMATION for its users
      const automationSub = data.argv.garage.subscriptions[garageSubscriptionTypes.AUTOMATION];
      if (automationSub && automationSub.enabled) {
        data.models.User.giveAuthorizationToGaragesUsers(UserAutorization.ACCESS_TO_AUTOMATION, [
          data.argv.garage.id.toString(),
        ]);
      }
      data.models.AutomationCampaign.setCampaigns(
        data.argv.garage.getId(),
        data.argv.garage.subscriptions,
        data.argv.garage.dataFirstDays,
        data.argv.garage.locale,
        data.argv.garage.status
      ).then(
        () => {
          cb(null, data.argv.garage.subscriptions);
        },
        (error) => {
          cb(error);
        }
      );
    });
  }

  static _checkIfShouldBillNow(data, cb) {
    const now = momentTz().tz('UTC');
    const dateStart = momentTz(data.argv.sub.dateStart).tz('UTC');

    if (dateStart.isBefore(now, 'day')) {
      data.argv.garage.updateAttribute('automaticBillingBillNow', true, cb);
    } else {
      cb();
    }
  }

  static _getOneSubscription(data, cb) {
    if (!data.argv.garage.automaticBillingSubscriptions) {
      cb(new BillingAccountException('This garage does not have any subscription').badRequest(), null);
    } else {
      data.argv.garage.automaticBillingSubscriptions((err, subs) => {
        if (err || !Array.isArray(subs)) {
          cb(new BillingAccountException('Unable to fetch garage subscriptions').serverError(), null);
        } else {
          for (const sub of subs) {
            if (sub.id.toString() === data.argv.subscriptionId) {
              cb(null, { subscription: sub });
              return;
            }
          }
          cb(new BillingAccountException('This subscription does not belong to this garage').badRequest(), null);
        }
      });
    }
  }

  static _checkIfSubscriptionBelongsToGarage(data, cb) {
    if (!data.argv.garage.automaticBillingSubscriptions) {
      cb(new BillingAccountException('This garage does not have any subscription').badRequest(), null);
    } else {
      data.argv.garage.automaticBillingSubscriptions((err, subs) => {
        if (err || !Array.isArray(subs)) {
          cb(new BillingAccountException('Unable to fetch garage subscriptions').serverError(), null);
        } else {
          for (const sub of subs) {
            if (sub.id.toString() === data.argv.subscriptionId) {
              cb(null, null);
              return;
            }
          }
          cb(new BillingAccountException('This subscription does not belong to this garage').badRequest(), null);
        }
      });
    }
  }

  static _updateOneSubscription(data, cb) {
    const oldSubscription = JSON.parse(JSON.stringify(data.argv.garage.subscriptions));
    const g = data.argv.garage;
    const s = data.argv.sub;
    let total = 0;
    total +=
      (s.Automation.enabled ? s.Automation.price : 0) +
      (s.CrossLeads.enabled ? s.CrossLeads.price : 0) +
      (s.Maintenance.enabled ? s.Maintenance.price : 0) +
      (s.NewVehicleSale.enabled ? s.NewVehicleSale.price : 0) +
      (s.UsedVehicleSale.enabled ? s.UsedVehicleSale.price : 0) +
      (s.VehicleInspection.enabled ? s.VehicleInspection.price : 0) +
      (s.Coaching && s.Coaching.enabled ? s.Coaching.price : 0) +
      (s.Connect && s.Connect.enabled ? s.Connect.price : 0) +
      (s.Lead.enabled ? s.Lead.price : 0) +
      (s.EReputation.enabled ? s.EReputation.price : 0) +
      (s.Analytics.enabled ? s.Analytics.price : 0);
    if (total <= 0) {
      cb(new BillingAccountException(`Error because subscription price ${total}`).badRequest(), null); // send error 400 bad request
    }
    oldSubscription.annexGarageId = g.annexGarageId;
    g.annexGarageId = s.annexGarageId;
    g.subscriptions.dateStart = s.dateStart;
    g.subscriptions.dateEnd = null;
    g.subscriptions.isFullChurn = s.isFullChurn;
    g.subscriptions.churnEffectiveDate = s.churnEffectiveDate;
    g.subscriptions.setup = s.setup.enabled ? s.setup : null;
    g.subscriptions.users = s.users;
    g.subscriptions.contacts = s.contacts;
    g.subscriptions.priceValidated = s.priceValidated;
    for (const subType of garageSubscriptionTypes.values()) {
      // this is like that so we don't remove the saved fields under a "subType"
      g.subscriptions[subType] = { ...g.subscriptions[subType], ...s[subType] }; // Overwrite with zeros...
    }
    if (g.subscriptions[garageSubscriptionTypes.CROSS_LEADS] && oldSubscription[garageSubscriptionTypes.CROSS_LEADS]) {
      if (
        !g.subscriptions[garageSubscriptionTypes.CROSS_LEADS].enabled &&
        oldSubscription[garageSubscriptionTypes.CROSS_LEADS].enabled
      ) {
        data.argv.garage.unsubscribeToCrossLeads();
      }
      // See if there is no mobile number before restrictMobile is switched on
      if (
        g.subscriptions[garageSubscriptionTypes.CROSS_LEADS].restrictMobile &&
        !oldSubscription[garageSubscriptionTypes.CROSS_LEADS].restrictMobile
      ) {
        const shouldBeUndefined = data.argv.garage
          .getSources()
          .reduce((acc, s) => {
            acc.push(...s.followed_phones);
            return acc;
          }, [])
          .find((p) => {
            const country = (data.argv.garage.locale && data.argv.garage.locale.split('_').pop()) || 'FR';
            return phoneUtil.getNumberType(phoneUtil.parse(p, country)) === PNT.MOBILE;
          });
        if (shouldBeUndefined !== undefined) {
          // send error: we can't allow restrictMobile to be true if the garage already have a mobile in a source
          cb(
            new BillingAccountException(
              `Impossible de désactiver l'option "Autoriser les portables" tant que des traceurs pointent vers des mobiles (${shouldBeUndefined})`
            ).badRequest(),
            null
          );
          return;
        }
      }
    }
    //re-active crossLeadsConfig sources if exist
    if (s.CrossLeads.enabled && data.argv.garage.crossLeadsConfig) {
      data.argv.garage.enableAllSourcesCrossLeads();
    }

    g.subscriptions.AutomationApv = { enabled: !!(s.AutomationApv && s.AutomationApv.enabled) };
    g.subscriptions.AutomationVn = { enabled: !!(s.AutomationVn && s.AutomationVn.enabled) };
    g.subscriptions.AutomationVo = { enabled: !!(s.AutomationVo && s.AutomationVo.enabled) };
    // active/hide Automation campaign (ex: user don't have subscription UsedVehicleSale and AutomationVo, we active/hide all campaign Vo)
    if (
      [true, false].includes(g.subscriptions.AutomationVo.enabled) ||
      [true, false].includes(g.subscriptions.AutomationVn.enabled) ||
      [true, false].includes(g.subscriptions.AutomationApv.enabled)
    ) {
      data.models.AutomationCampaign.setCampaigns(
        data.argv.garage.getId(),
        data.argv.garage.subscriptions,
        data.argv.garage.dataFirstDays,
        data.argv.garage.locale,
        data.argv.garage.status
      );
    }

    const everyPrice = (g.subscriptions.Automation && g.subscriptions.Automation.every) || 0;
    const oldEveryPrice = (oldSubscription.Automation && oldSubscription.Automation.every) || 0;
    const automationPrice = g.subscriptions.Automation.price;
    const oldAutomationPrice = oldSubscription.Automation.price;
    if (everyPrice !== oldEveryPrice || automationPrice !== oldAutomationPrice) {
      const update = {
        price: automationPrice,
        every: everyPrice,
        date: new Date(),
      };
      data.models.Garage.updateSubscriptionsHistory(
        data.argv.garage.getId(),
        garageSubscriptionTypes.AUTOMATION,
        update
      );
    }
    data.argv.garage.save((e) => {
      if (e) {
        cb(e);
      }
      // Garage newly subscribed to Automation, we will activate the ACCESS_TO_AUTOMATION for its users
      const automationSub = data.argv.garage.subscriptions[garageSubscriptionTypes.AUTOMATION];
      const oldAutomationSub = oldSubscription[garageSubscriptionTypes.AUTOMATION];
      if (automationSub && automationSub.enabled && (!oldAutomationSub || !oldAutomationSub.enabled)) {
        data.models.User.giveAuthorizationToGaragesUsers(UserAutorization.ACCESS_TO_AUTOMATION, [
          data.argv.garage.id.toString(),
        ]);
      }
      cb(null, { garage: g, oldSubscription });
    });
  }

  static _terminateOneSubscription(data, cb) {
    data.argv.garage.subscriptions.dateEnd = momentTz().tz('UTC').toDate(); // eslint-disable-line no-param-reassign
    data.argv.garage.subscriptions.active = false; // eslint-disable-line no-param-reassign
    if (data.argv.garage.subscriptions.setup) {
      data.argv.garage.subscriptions.setup.enabled = false; // eslint-disable-line no-param-reassign
    }
    if (data.argv.garage.subscriptions.CrossLeads) {
      data.argv.garage.unsubscribeToCrossLeads();
    }
    data.argv.garage.status = 'Stopped'; // eslint-disable-line no-param-reassign
    for (const subType of garageSubscriptionTypes.values()) {
      if (data.argv.garage.subscriptions[subType]) {
        data.argv.garage.subscriptions[subType].enabled = false; // eslint-disable-line no-param-reassign
      }
    }
    data.argv.garage.save((e) => {
      if (e) {
        cb(e);
      }
      data.argv.subscription = data.argv.garage.subscriptions; // eslint-disable-line no-param-reassign
      data.models.AutomationCampaign.setCampaigns(
        data.argv.garage.getId(),
        data.argv.garage.subscriptions,
        data.argv.garage.dataFirstDays,
        data.argv.garage.locale,
        data.argv.garage.status
      ).then(
        () => {
          cb(null, data.argv.garage.subscriptions);
        },
        (error) => {
          cb(error);
        }
      );
    });
  }

  static _notifySlackChannelsCreation(data, cb) {
    const garageName = data.argv.garage.publicDisplayName;
    const garageId = data.argv.garage.id.toString();
    const billingAccountId = data.argv.billingAccount.id.toString();
    const dboUrl = `${config.get('publicUrl.app_url')}/backoffice/garages#${garageId}`;
    const gboUrl = `${config.get(
      'publicUrl.app_url'
    )}/grey-bo/automatic-billing/billing-account/${billingAccountId}/garages/${garageId}`;

    const newSub = data.argv.garage.subscriptions;

    let addedOptionsDetails = '';
    let newTotal = 0;

    if (data.argv.garage.annexGarageId) {
      addedOptionsDetails += ` - Miroir de l'établissement ${data.argv.garage.annexGarageId}\n`;
    }
    addedOptionsDetails += ` - Utilisateurs, _${newSub.users.included} inclus puis ${newSub.users.price}€ l'unité_\n`;
    addedOptionsDetails += ` - Contacts, _${newSub.contacts.included} inclus puis ${newSub.contacts.price}€ ${
      newSub.contacts.bundle ? 'tous les 100 contacts' : "l'unité"
    }_\n`;

    for (const subType of garageSubscriptionTypes.values()) {
      if (newSub[subType] && newSub[subType].enabled) {
        addedOptionsDetails += ` - ${garageSubscriptionTypes.displayName(subType)}, à ${newSub[subType].price}€\n`;
        newTotal += newSub[subType].price;
      }
    }

    const total = `${newTotal}€ :moneybag:`;

    const modificationDetails = `*Détails : *\n${addedOptionsDetails}*TOTAL FIXE MENSUEL : ${total}*`;
    const username = data.argv.sub.greyBologgedUser.username
      ? data.argv.sub.greyBologgedUser.username
      : data.argv.sub.greyBologgedUser.email;

    slackClient.postMessage(
      {
        text: `Un abonnement vient d'être créé pour l'établissement ${garageName}`,
        channel: '#factu_garages-à-brancher',
        username,
        attachments: [
          {
            fallback: `Voir cet établissement à ${dboUrl}`,
            actions: [
              {
                type: 'button',
                text: 'Lien DarkBO 🐍',
                url: dboUrl,
              },
              {
                type: 'button',
                text: 'Lien GreyBO 🔧',
                url: gboUrl,
              },
            ],
          },
        ],
      },
      (err) => {
        if (err) {
          cb(err);
          return;
        }
        slackClient.postMessage(
          {
            text: `Nouveau :sparkles: - Un abonnement vient d'être créé pour l'établissement ${garageName} :\n${modificationDetails}`,
            channel: '#factu_abonnements-à-valider',
            username,
            attachments: [
              {
                fallback: `Voir cet établissement à ${dboUrl}`,
                actions: [
                  {
                    type: 'button',
                    text: 'Lien DarkBO 🐍',
                    url: dboUrl,
                  },
                  {
                    type: 'button',
                    text: 'Lien GreyBO 🔧',
                    url: gboUrl,
                  },
                ],
              },
            ],
          },
          cb
        );
      }
    );
  }

  static _notifySlackChannelsModification(data, cb) {
    const garageName = data.argv.garage.publicDisplayName;
    const garageId = data.argv.garage.id.toString();
    const billingAccountId = data.argv.billingAccount.id.toString();
    const dboUrl = `${config.get('publicUrl.app_url')}/backoffice/garages#${garageId}`;
    const gboUrl = `${config.get(
      'publicUrl.app_url'
    )}/grey-bo/automatic-billing/billing-account/${billingAccountId}/garages/${garageId}`;

    const newSub = data.argv.garage.subscriptions;
    const oldSub = data.argv.oldSubscription;

    let addedOptionsDetails = '';
    let removedOptionsDetails = '';
    let updatedOptionsDetails = '';
    let oldTotal = 0;
    let newTotal = 0;

    if (data.argv.garage.annexGarageId !== oldSub.annexGarageId) {
      if (!oldSub.annexGarageId && data.argv.garage.annexGarageId) {
        addedOptionsDetails += ` - Miroir de l'établissement ${data.argv.garage.annexGarageId}\n`;
      } else if (oldSub.annexGarageId && !data.argv.garage.annexGarageId) {
        removedOptionsDetails += ` - Miroir de l'établissement ${oldSub.annexGarageId}\n`;
      } else if (oldSub.annexGarageId && data.argv.garage.annexGarageId) {
        updatedOptionsDetails += ` - Miroir de l'établissement ${oldSub.annexGarageId} *-->* ${data.argv.garage.annexGarageId}\n`;
      }
    }

    if (newSub.users.included !== oldSub.users.included || newSub.users.price !== oldSub.users.price) {
      updatedOptionsDetails += ` - Utilisateurs, _${oldSub.users.included} inclus puis ${oldSub.users.price}€ l'unité_ *-->* _${newSub.users.included} inclus puis ${newSub.users.price}€ l'unité_\n`;
    }

    if (
      newSub.contacts.bundle !== oldSub.contacts.bundle ||
      newSub.contacts.included !== oldSub.contacts.included ||
      newSub.contacts.price !== oldSub.contacts.price
    ) {
      updatedOptionsDetails += ` - Contacts, _${oldSub.contacts.included} inclus puis ${oldSub.contacts.price}€ ${
        oldSub.contacts.bundle ? 'tous les 100 contacts' : "l'unité"
      }_ *-->* _${newSub.contacts.included} inclus puis ${newSub.contacts.price}€ ${
        newSub.contacts.bundle ? 'tous les 100 contacts' : "l'unité"
      }_\n`;
    }

    for (const subType of garageSubscriptionTypes.values()) {
      if (oldSub[subType] && !oldSub[subType].enabled && newSub[subType].enabled) {
        addedOptionsDetails += ` - ${garageSubscriptionTypes.displayName(subType)}, à ${newSub[subType].price}€\n`;
      } else if (oldSub[subType] && oldSub[subType].enabled && !newSub[subType].enabled) {
        removedOptionsDetails += ` - ${garageSubscriptionTypes.displayName(subType)}, à ${oldSub[subType].price}€\n`;
      } else if (
        oldSub[subType] &&
        oldSub[subType].enabled &&
        newSub[subType].enabled &&
        oldSub[subType].price !== newSub[subType].price
      ) {
        updatedOptionsDetails += ` - ${garageSubscriptionTypes.displayName(subType)}, ${oldSub[subType].price}€ *-->* ${
          newSub[subType].price
        }€\n`;
      }

      if (oldSub[subType] && oldSub[subType].enabled) {
        oldTotal += oldSub[subType].price;
      }
      if (newSub[subType] && newSub[subType].enabled) {
        newTotal += newSub[subType].price;
      }
    }

    oldTotal = Math.round(oldTotal * 100) / 100;
    newTotal = Math.round(newTotal * 100) / 100;

    const total = `${
      oldTotal === newTotal
        ? `${newTotal}€ (Pas de changement)`
        : `${
            newTotal > oldTotal
              ? `${oldTotal}€ *-->* ${newTotal}€ :arrow_upper_right:`
              : `${oldTotal}€ *-->* ${newTotal}€ :arrow_lower_right:`
          }`
    }`;

    let modificationDetails = `*Options Ajoutées :sparkles: : *\n${
      addedOptionsDetails || '  _Aucune_\n'
    }*Options Retirées :fire: : *\n${removedOptionsDetails || '  _Aucune_\n'}*Options Modifiées :wrench: : *\n${
      updatedOptionsDetails || '  _Aucune_\n'
    }*TOTAL FIXE MENSUEL : ${total}*`;

    if (!addedOptionsDetails && !removedOptionsDetails && !updatedOptionsDetails) {
      modificationDetails = `_Cette modification ne concerne aucune option. Il peut s'agir d'une modification de date, d'une validation de prix, etc._\n_Veuillez consulter la page GreyBO pour en savoir plus._\n*TOTAL FIXE MENSUEL : ${total}*`;
    }
    // Send a notification only if the price changed
    if (oldTotal !== newTotal) {
      const username = data.argv.sub.greyBologgedUser.username
        ? data.argv.sub.greyBologgedUser.username
        : data.argv.sub.greyBologgedUser.email;
      slackClient.postMessage(
        {
          text: `Modification :pencil: - Un abonnement vient d'être modifié pour l'établissement ${garageName} :\n${modificationDetails}`,
          channel: '#factu_abonnements-à-valider',
          username,
          attachments: [
            {
              fallback: `Voir cet établissement à ${dboUrl}`,
              actions: [
                {
                  type: 'button',
                  text: 'Lien DarkBO 🐍',
                  url: dboUrl,
                },
                {
                  type: 'button',
                  text: 'Lien GreyBO 🔧',
                  url: gboUrl,
                },
              ],
            },
          ],
        },
        cb
      );
    } else {
      cb(); // update billing account but don't send notification on Slack
    }
  }
}

module.exports = BillingAccountPipelineInternalCatalog;
