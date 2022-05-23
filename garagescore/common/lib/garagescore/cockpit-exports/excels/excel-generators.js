const ExcelJS = require('exceljs');
const lruCache = require('lru-cache');
const { ObjectID } = require('mongodb');

const app = require('../../../../../server/server');
const I18nRequire = require('../../i18n/i18n');
const KpiDictionary = require('../../kpi/KpiDictionary');
const AutomationCampaignChannelTypes = require('../../../../models/automation-campaign-channel.type');
const { dayNumberToDate, todayDayNumber } = require('../../../util/time-helper');
const AsyncPool = require('../../../../../scripts/migration/scopes/asyncPool');
const { groupBy } = require('lodash');
const {
  ExportTypes,
  AutomationCampaignsEventsType,
  AutomationCampaignTypes,
} = require('../../../../../frontend/utils/enumV2');
const _byGaragesExcelConfiguration = require('./_by-garages-excel-configuration');
const _byFrontDeskUsersExcelConfiguration = require('./_by-front-desk-users-excel-configuration');
const _byDataExcelConfiguration = require('./_by-data-excel-configuration');
const _byAdminUsersExcelConfiguration = require('./_by-admin-users-excel-configuration');
const _byAdminGaragesExcelConfiguration = require('./_by-admin-garages-excel-configuration');
const { isGarageScoreUserByEmail } = require('../../custeed-users');
const _automationRgpdExcelConfiguration = require('./_automation-rgpd-excel-configuration');
const _automationCampaignExcelConfiguration = require('./_automation-campaign-excel-configuration');

const garageCache = new lruCache({
  maxAge: 1000 * 60 * 30, // 30mn
});

const userCache = {
  cache: new lruCache({
    maxAge: 1000 * 60 * 30, // 30mn
  }),
  projection: {
    civility: true,
    firstName: true,
    lastName: true,
    email: true,
    phone: true,
    mobilePhone: true,
    job: true,
    role: true,
  },
};

const _periodIdToString = (i18n, periodId) => {
  if (typeof periodId !== 'string') {
    return periodId;
  }
  if (periodId.match(/^[0-9]+$/)) {
    return periodId;
  }
  const month = periodId.match(/([0-9]+)-(month[0-9]+)/);
  if (month) {
    return `${i18n.$t(`Period_${month[2]}`)} ${month[1]}`;
  }
  const quarter = periodId.match(/([0-9]+)-(quarter[0-9]+)/);
  if (quarter) {
    return `${i18n.$t(`Period_${quarter[2]}`)} ${quarter[1]}`;
  }
  return i18n.$t(`Period_${periodId}`);
};

const _zeroPad = (value) => {
  return `0${value}`.slice(-2);
};

const arrayToCSV = (arr, delimiter = ';') =>
  arr.map((v) => (isNaN(v) ? `"${v.replace(/"/g, '""').replace(/\n/g, ' ')}"` : v)).join(delimiter);

module.exports = {
  getExportFileName(locale, exportType, { periodId, startPeriodId, endPeriodId }) {
    const i18n = new I18nRequire('cockpit-exports/common/start-export', { locale });
    // Date
    const today = new Date();
    const date = `${_zeroPad(today.getDate())}-${_zeroPad(today.getMonth() + 1)}-${today.getFullYear()}`;
    // Interface name
    const interfaceName = i18n.$t(`ExportType_${exportType}`);
    // Period
    let period = '';
    if (periodId) {
      period = _periodIdToString(i18n, periodId);
    } else if (startPeriodId && endPeriodId && startPeriodId === endPeriodId) {
      period = _periodIdToString(i18n, startPeriodId);
    } else {
      period = `${_periodIdToString(i18n, startPeriodId)} - ${_periodIdToString(i18n, endPeriodId)}`;
    }
    // Unique Id
    const hash = Math.random().toString(36).substring(3);
    // Final result
    return period ? `${date}_${interfaceName}_${period}_${hash}.xlsx` : `${date}_${interfaceName}_${hash}.xlsx`;
  },
  /**
   * If logOnlyToConsole is set to true , log to the console the excel line prepended by a separator
   * otherwise, add row to the excel sheet
   * @param {{line , sheet?, logOnlyToConsole}} obj line sheet(optionnal) and logOnlyToConsole(optionnal)
   * @returns {void}
   */
  _processLine({ line = {}, sheet = {}, logOnlyToConsole } = { logOnlyToConsole: false }) {
    if (logOnlyToConsole) {
      console.log(arrayToCSV(Object.values(line)));
    } else {
      sheet.addRow(line);
    }
  },
  /**
   * Log the excel columns to the console
   * @param {{i18n : object, fields : object, excelConfiguration : object}} parameters
   * @returns {object} empty object to avoid destructuring errors
   */
  _logColumns({ i18n, fields, excelConfiguration }) {
    const columns = excelConfiguration.getColumns({ i18n, fields }).map(({ header }) => header);
    this._processLine({ line: columns, logOnlyToConsole: true });
    return {};
  },
  _excelGeneratorCommon({ i18n, fields, excelConfiguration, logOnlyToConsole } = { logOnlyToConsole: false }) {
    /* if logOnlyToConsole is set to true, the excel will not be built, instead each computed line will be printed in the console */
    if (logOnlyToConsole) {
      return this._logColumns({ i18n, fields, excelConfiguration });
    }

    const workbook = new ExcelJS.Workbook();
    let sheet = null;

    workbook.creator = 'Custeed';
    workbook.lastModifiedBy = 'Custeed';
    workbook.created = new Date();
    sheet = workbook.addWorksheet(excelConfiguration.getSheetName(i18n), { views: [{ state: 'frozen', ySplit: 1 }] });

    sheet.columns = excelConfiguration
      .getColumns({ i18n, fields })
      .map(({ key, header, width, style }) => ({ key, header, width, style }));

    return { workbook, sheet };
  },

  async _excelGeneratorFromDatas(
    query,
    { i18n, sheet, fields, excelConfiguration, logOnlyToConsole } = { logOnlyToConsole: false }
  ) {
    const mongoData = app.models.Data.getMongoConnector();
    const mongoGarage = app.models.Garage.getMongoConnector();
    let cursor = null;
    let data = null;

    const options = { sort: query.sort };

    /* remove limit if logOnlyToConsole is set to true */
    if (!logOnlyToConsole) {
      options.limit = 10000;
    }

    cursor = await mongoData.find(query.where, options);

    while (await cursor.hasNext()) {
      let garage = null;

      data = await cursor.next();
      garage = garageCache.get(data.garageId);

      if (!garage) {
        garage = await mongoGarage.findOne({ _id: new ObjectID(data.garageId) });
        garageCache.set(data.garageId, garage);
      }

      const row = await excelConfiguration.getRow({ i18n, fields, data, garage });

      this._processLine({ line: row, sheet, logOnlyToConsole });
    }
  },

  async _excelGeneratorFromKpisByPeriod(
    query,
    { exportType, dataTypes, i18n, sheet, fields, excelConfiguration, logOnlyToConsole, onError } = {
      logOnlyToConsole: false,
      onError: () => {},
    }
  ) {
    const mongoKpiByPeriod = app.models.KpiByPeriod.getMongoConnector();
    const mongoGarage = app.models.Garage.getMongoConnector();
    const mongoUser = app.models.User.getMongoConnector();
    const $match = (query.find((e) => e.$match) && query.find((e) => e.$match).$match) || null;
    const garageIds = ($match && $match[KpiDictionary.garageId] && $match[KpiDictionary.garageId].$in) || [];
    const countGarages = (garageIds && garageIds.length) || 0;
    const documents = await mongoKpiByPeriod.aggregate(query, { allowDiskUse: countGarages > 50 }).toArray();
    let garageId = null;
    let frontDeskUser = null;

    for (const document of documents) {
      let garage = null;

      if (exportType === ExportTypes.GARAGES) {
        garageId = document._id;
      } else if (exportType === ExportTypes.FRONT_DESK_USERS_CUSTEED && ObjectID.isValid(document._id.userId)) {
        /* we need to convert the userId to a name */
        const userId = document._id.userId.toString();

        let user = userCache.cache.get(document._id.userId.toString());
        /* user not cached */
        if (!user) {
          user = await mongoUser.findOne(
            { _id: ObjectID(userId) },
            {
              projection: userCache.projection,
            }
          );
          userCache.cache.set(userId, user);
        }

        /* Skip custeed users */
        if (isGarageScoreUserByEmail(user.email)) {
          continue;
        }

        garageId = document._id.garageId;
        //TODO: use the new method if it's merged before this PR
        frontDeskUser =
          user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : user.email;
      } else {
        garageId = document._id.garageId;
        frontDeskUser = document._id.userId;
      }

      garage = garageCache.get(garageId.toString());

      if (!garage) {
        garage = await mongoGarage.findOne({ _id: garageId });
        garageCache.set(garageId.toString(), garage);
      }
      const row = await excelConfiguration.getRow({
        i18n,
        fields,
        document,
        dataTypes,
        garage,
        frontDeskUser,
        onError,
      });

      this._processLine({ line: row, sheet, logOnlyToConsole });
    }
  },

  async _excelGeneratorFromAdminUser(
    query,
    { i18n, sheet, fields, excelConfiguration, logOnlyToConsole } = { logOnlyToConsole: false }
  ) {
    const mongoGarage = app.models.Garage.getMongoConnector();
    const mongoUser = app.models.User.getMongoConnector();

    const users = await mongoUser.aggregate(query).toArray();

    for (const user of users) {
      const garages = [];
      const garagesNotCached = [];

      if (user.garageIds && user.garageIds.length) {
        user.garageIds.forEach((garageId) => {
          if (garageCache.has(garageId)) {
            garages.push(garageCache.get(garageId));
          } else {
            garagesNotCached.push(garageId);
          }
        });

        if (garagesNotCached.length) {
          const tmp = await mongoGarage
            .find({ _id: { $in: [...garagesNotCached.map((gId) => new ObjectID(gId))] } })
            .toArray();
          tmp.forEach((garageData) => {
            garageCache.set(garageData._id.toString(), garageData);
            garages.push(garageData);
          });
        }
      }

      const row = await excelConfiguration.getRow({ i18n, fields, user, garages });
      this._processLine({ line: row, sheet, logOnlyToConsole });
    }
  },

  async _excelGeneratorFromAdminGarage(
    query,
    { i18n, sheet, fields, excelConfiguration, logOnlyToConsole } = { logOnlyToConsole: false }
  ) {
    const mongoGarage = app.models.Garage.getMongoConnector();
    const mongoUser = app.models.User.getMongoConnector();

    const datas = await mongoGarage.aggregate(query).toArray();

    const formattedByGarage = [];
    for (const data of datas) {
      const res = [];
      for (const ticket of data.ticketsConfiguration.filter((ticket) => ticket.ticketManagerId)) {
        const managerTicket = res.find(
          (managerTicket) =>
            managerTicket && managerTicket.ticketManagerId.toString() === ticket.ticketManagerId.toString()
        );
        if (managerTicket) {
          managerTicket.assigns.push(ticket.ticketType);
        } else {
          const manager = {
            ticketManagerId: ticket.ticketManagerId.toString(),
            assigns: [ticket.ticketType],
            user: {},
          };
          let cacheUser = {};
          if (userCache.cache.has(ticket.ticketManagerId.toString())) {
            cacheUser = userCache.cache.get(ticket.ticketManagerId.toString());
          } else {
            cacheUser = await mongoUser.findOne(
              { _id: ObjectID(ticket.ticketManagerId) },
              {
                projection: userCache.projection,
              }
            );
          }
          manager.user = { ...cacheUser, publicDisplayName: data.publicDisplayName, externalId: data.externalId };
          if (!isGarageScoreUserByEmail(manager.user.email)) {
            res.push(manager);
          }
        }
      }
      formattedByGarage.push(res);
    }

    for (const manager of formattedByGarage.flat(1)) {
      const { user, assigns } = manager;
      const row = await excelConfiguration.getRow({ i18n, fields, user, assigns });
      this._processLine({ line: row, sheet, logOnlyToConsole });
    }
  },

  async _excelGeneratorFromAutomationRgpd(
    query,
    { i18n, sheet, fields, excelConfiguration, logOnlyToConsole } = { logOnlyToConsole: false }
  ) {
    const mongoAutomationCampaignEvents = app.models.AutomationCampaignsEvents.getMongoConnector();
    const mongoGarage = app.models.Garage.getMongoConnector();
    const mongoCustomer = app.models.Customer.getMongoConnector();
    const [results] = await mongoAutomationCampaignEvents.aggregate(query).toArray();
    if (!results || !results.customerIds || !results.garageIds || results.isGaragescoreFullScope) {
      return; // no result or no full scope
    }

    const customers = await mongoCustomer
      .find({ _id: { $in: results.customerIds } })
      .project({
        _id: true,
        garageId: true,
        unsubscribed: true,
        gender: true,
        fullName: true,
        email: true,
        phone: true,
        city: true,
        plate: true,
        automationCampaignsEvents: true,
        updatedAt: true,
      })
      .toArray();

    for (const customer of customers) {
      if (customer.unsubscribed) {
        const event = customer.automationCampaignsEvents.find((event) => {
          return [
            AutomationCampaignsEventsType.GDPR_UNSUBSCRIBED,
            AutomationCampaignsEventsType.UNSUBSCRIBED,
            AutomationCampaignsEventsType.CANNOT_SEND_CONTACT_UNSUBSCRIBED,
          ].includes(event.type);
        });
        customer.unsubscribedDate = (event && new Date(event.time)) || new Date(customer.updatedAt);
      }
      const garageId = customer.garageId.toString();
      let garage = garageCache.get(garageId);
      if (!garage || !garage.publicDisplayName) {
        garage = await mongoGarage.findOne({ _id: ObjectID(garageId) });
        garageCache.set(garageId, garage);
      }
      const row = await excelConfiguration.getRow({ i18n, fields, customer, garage });

      this._processLine({ line: row, sheet, logOnlyToConsole });
    }
  },

  async _excelGeneratorFromAutomationCampaign(
    query,
    { i18n, sheet, fields, excelConfiguration, logOnlyToConsole } = { logOnlyToConsole: false }
  ) {
    // the code is as complex as the excel file, I comment for myself and the next dev
    const mongoAutomationCampaignEvents = app.models.AutomationCampaignsEvents.getMongoConnector();
    const mongoGarage = app.models.Garage.getMongoConnector();
    const mongoCustomer = app.models.Customer.getMongoConnector();
    const mongoKpiByPeriod = app.models.KpiByPeriod.getMongoConnector();
    const [resultQuery] = await mongoKpiByPeriod.aggregate(query).toArray();
    if (!resultQuery || !resultQuery.garageIds || resultQuery.isGaragescoreFullScope) {
      return; // no result, empty excel or not export for fullscope
    }
    const gt = (resultQuery && resultQuery.runDayNumber && resultQuery.runDayNumber.gt) || 0;
    const lt = (resultQuery && resultQuery.runDayNumber && resultQuery.runDayNumber.lt) || todayDayNumber();
    const campaignType = {
      $in: [AutomationCampaignsEventsType.CONVERTED, AutomationCampaignsEventsType.CROSSED],
    };
    if (resultQuery.campaignType.includes(AutomationCampaignTypes.AUTOMATION_VEHICLE_SALE)) {
      campaignType.$in.push(AutomationCampaignsEventsType.LEAD);
    }
    console.log('====resultQuery', resultQuery);
    const aggregate = [
      { $unwind: '$samples' },
      {
        $addFields: {
          'customer.customerId': '$samples.customerId',
          'customer.campaignId': '$campaignId',
          'customer.garageId': '$garageId',
          'customer.type': '$type',
          'customer.time': '$samples.time',
          'customer.isMobile': '$samples.isMobile',
          'customer.target': '$target',
          'customer.campaignRunDay': '$campaignRunDay',
          'customer.eventDay': '$eventDay',
        },
      },
      { $replaceRoot: { newRoot: '$customer' } },
      {
        $group: {
          _id: null,
          exports: {
            $addToSet: {
              customerId: '$customerId',
              campaignId: '$campaignId',
              garageId: '$garageId',
              type: '$type',
              time: '$time',
              contactType: {
                $cond: [
                  { $eq: ['$isMobile', true] },
                  AutomationCampaignChannelTypes.MOBILE,
                  AutomationCampaignChannelTypes.EMAIL,
                ],
              },
              target: '$target',
              campaignRunDay: '$campaignRunDay',
              eventDay: '$eventDay',
              status: {
                $switch: {
                  branches: [
                    {
                      case: {
                        $in: [
                          '$type',
                          [AutomationCampaignsEventsType.CONVERTED, AutomationCampaignsEventsType.CROSSED],
                        ],
                      },
                      then: { CONVERTED: true, LEAD: true, OPENED: true, RECEIVED: true, SENT: true },
                    },
                    {
                      case: { $eq: ['$type', AutomationCampaignsEventsType.LEAD] },
                      then: { LEAD: true, OPENED: true, RECEIVED: true, SENT: true },
                    },
                    {
                      case: { $eq: ['$type', AutomationCampaignsEventsType.OPENED] },
                      then: { OPENED: true, RECEIVED: true, SENT: true },
                    },
                    {
                      case: { $eq: ['$type', AutomationCampaignsEventsType.RECEIVED] },
                      then: { RECEIVED: true, SENT: true },
                    },
                    {
                      case: {
                        $in: [
                          '$type',
                          [
                            AutomationCampaignsEventsType.PRESSURE_BLOCKED,
                            AutomationCampaignsEventsType.CANNOT_SEND_CONTACT_NO_CONTACT_DETAILS,
                          ],
                        ],
                      },
                      then: { PRESSURE_BLOCKED: true, SENT: true },
                    },
                    {
                      case: { $eq: ['$type', 'SENT'] },
                      then: { SENT: true },
                    },
                  ],
                  default: { SENT: true },
                },
              },
            },
          },
        },
      },
    ];

    const events = [
      {
        $match: {
          campaignId: { $in: resultQuery.automationCampaigns },
          eventDay: { $gt: gt, $lte: lt },
          type: campaignType,
        },
      },
      {
        $match: {
          campaignId: { $in: resultQuery.automationCampaigns },
          campaignRunDay: { $gt: gt, $lte: lt },
          type: AutomationCampaignsEventsType.OPENED,
        },
      },
      {
        $match: {
          campaignId: { $in: resultQuery.automationCampaigns },
          campaignRunDay: { $gt: gt, $lte: lt },
          type: AutomationCampaignsEventsType.RECEIVED,
        },
      },
      {
        $match: {
          campaignId: { $in: resultQuery.automationCampaigns },
          campaignRunDay: { $gt: gt, $lte: lt },
          type: AutomationCampaignsEventsType.SENT,
        },
      },
      {
        $match: {
          campaignId: { $in: resultQuery.automationCampaigns },
          campaignRunDay: { $gt: gt, $lte: lt },
          type: {
            $in: [
              AutomationCampaignsEventsType.PRESSURE_BLOCKED,
              AutomationCampaignsEventsType.CANNOT_SEND_CONTACT_NO_CONTACT_DETAILS,
            ],
          },
        },
      },
    ];

    // get each event
    const [resultsConverted, resultsOpened, resultsReceived, resultsSent, resultsBlocked] = await AsyncPool(
      5,
      events,
      async (match) => {
        const res = (await mongoAutomationCampaignEvents.aggregate([match, ...aggregate]).toArray())[0];
        return res;
      }
    );

    const validResults = [resultsConverted, resultsOpened, resultsReceived, resultsSent, resultsBlocked]
      .filter((e) => e)
      .reduce((acc, cv) => [...acc, ...cv.exports], []);

    if (!resultsSent) {
      return; // no event found, empty excel
    }
    const results = {
      exports: [],
      automationCampaigns: [...resultQuery.automationCampaigns],
      garageIds: [...resultQuery.garageIds],
    };
    // for event CONVERTED, find the true eventDay for event LEAD
    const findEventLead = async (customerId, campaignId, gt, lt) => {
      return mongoAutomationCampaignEvents.findOne(
        {
          'samples.customerId': customerId,
          campaignId: campaignId,
          type: AutomationCampaignsEventsType.LEAD,
          eventDay: { $gt: gt, $lte: lt },
        },
        { projection: { eventDay: 1 } }
      );
    };
    if (resultsConverted && resultsConverted.exports) {
      await AsyncPool(20, resultsConverted.exports, async (res) => {
        const leadEvent = await findEventLead(res.customerId, res.campaignId, gt, lt);
        res.status.LEAD = !!leadEvent;
        if (leadEvent) {
          res.eventDayLead = leadEvent.eventDay;
        }
      });
    }

    const grouped = groupBy(validResults, 'customerId');
    // merge eventDay with campaignRunDay
    // from the event SENT (campaigRunDay), we will find the OPENED > RECEIVEND > BLOCKED
    const validGroupedBySentConverted = [resultsConverted, resultsSent]
      .filter((e) => e)
      .reduce((acc, cv) => [...acc, ...cv.exports], []);

    const groupedBySentConverted = groupBy(validGroupedBySentConverted, 'customerId');
    // get the most recent event CONVERTED > LEAD > OPENED > RECEIVED > BLOCKED > SENT
    const statuses = ['CONVERTED', 'LEAD', 'OPENED', 'RECEIVED', 'BLOCKED', 'SENT'];
    for (const customerId in groupedBySentConverted) {
      if (grouped[customerId] && grouped[customerId].length === 1) {
        results.exports.push(grouped[customerId][0]);
        continue;
      }
      for (const status of statuses) {
        const event = grouped[customerId] && grouped[customerId].find((el) => el.status[status]);
        if (event) {
          grouped[customerId] = grouped[customerId].filter(({ time }) => time !== event.time);
          results.exports.push(event);
          break;
        }
      }
    }
    // get customer personnal data like email, phone...
    const customers = groupBy(
      await mongoCustomer
        .find({ _id: { $in: results.exports.map((e) => e.customerId) } })
        .project({ _id: 1, garageId: 1, gender: 1, fullName: 1, email: 1, phone: 1, city: 1, plate: 1 })
        .toArray(),
      '_id'
    );
    // build the excel
    for (const result of results.exports) {
      const [customer] = customers[result.customerId] || [];
      const garageId = result.garageId.toString();
      let garage = garageCache.get(garageId);
      if (!garage || !garage.publicDisplayName) {
        garage = await mongoGarage.findOne({ _id: ObjectID(garageId) });
        garageCache.set(garageId, garage);
      }

      const isCurrentPeriodCampaignRunDay = result.campaignRunDay > gt;
      const isCurrentPeriodEventDay = result.eventDay > gt;
      result.isCurrentPeriodNotSend = isCurrentPeriodCampaignRunDay;
      result.isCurrentPeriodReceived = isCurrentPeriodCampaignRunDay;
      result.isCurrentPeriodOpened = isCurrentPeriodCampaignRunDay;
      result.isCurrentPeriodLead = isCurrentPeriodEventDay;
      result.isCurrentPeriodConverted = isCurrentPeriodEventDay;
      // convert dayNumber to date
      result.campaignRunDay = dayNumberToDate(result.campaignRunDay);
      result.eventDay = dayNumberToDate(result.eventDay);
      if (result.eventDayLead) {
        result.eventDayLead = dayNumberToDate(result.eventDayLead);
      }

      const row = await excelConfiguration.getRow({ i18n, fields, customer, garage, campaign: result });
      this._processLine({ line: row, sheet, logOnlyToConsole });
    }
  },

  async garagesExcelGenerator(
    query,
    { exportType, locale, dataTypes, fields, logOnlyToConsole, onError } = {
      logOnlyToConsole: false,
      onError: () => {},
    }
  ) {
    const i18n = new I18nRequire('cockpit-exports/excels/_by-garages-excel-configuration', { locale });
    const { sheet = null, workbook = null } = this._excelGeneratorCommon({
      i18n,
      locale,
      fields,
      excelConfiguration: _byGaragesExcelConfiguration,
      logOnlyToConsole,
    });

    await this._excelGeneratorFromKpisByPeriod(query, {
      exportType,
      dataTypes,
      i18n,
      sheet,
      fields,
      excelConfiguration: _byGaragesExcelConfiguration,
      logOnlyToConsole,
      onError,
    });

    return workbook;
  },

  async frontDeskUsersDmsExcelGenerator(
    query,
    { exportType, locale, dataTypes, fields, logOnlyToConsole, onError } = {
      logOnlyToConsole: false,
      onError: () => {},
    }
  ) {
    const i18n = new I18nRequire('cockpit-exports/excels/_by-front-desk-users-excel-configuration', { locale });

    const { sheet = null, workbook = null } = this._excelGeneratorCommon({
      i18n,
      locale,
      fields,
      excelConfiguration: _byFrontDeskUsersExcelConfiguration,
      logOnlyToConsole,
    });

    await this._excelGeneratorFromKpisByPeriod(query, {
      exportType,
      dataTypes,
      i18n,
      sheet,
      fields,
      excelConfiguration: _byFrontDeskUsersExcelConfiguration,
      logOnlyToConsole,
      onError,
    });

    return workbook;
  },

  async frontDeskUsersCusteedExcelGenerator(
    query,
    { exportType, locale, dataTypes, fields, logOnlyToConsole, onError } = {
      logOnlyToConsole: false,
      onError: () => {},
    }
  ) {
    const i18n = new I18nRequire('cockpit-exports/excels/_by-front-desk-users-excel-configuration', { locale });

    const { sheet = null, workbook = null } = this._excelGeneratorCommon({
      i18n,
      locale,
      fields,
      excelConfiguration: _byFrontDeskUsersExcelConfiguration,
      logOnlyToConsole,
    });

    await this._excelGeneratorFromKpisByPeriod(query, {
      exportType,
      dataTypes,
      i18n,
      sheet,
      fields,
      excelConfiguration: _byFrontDeskUsersExcelConfiguration,
      logOnlyToConsole,
      onError,
    });

    return workbook;
  },

  async satisfactionExcelGenerator(query, { locale, fields, logOnlyToConsole } = { logOnlyToConsole: false }) {
    const i18n = new I18nRequire('cockpit-exports/excels/_by-data-excel-configuration', { locale });

    const { workbook = null, sheet = null } = this._excelGeneratorCommon({
      i18n,
      locale,
      fields,
      excelConfiguration: _byDataExcelConfiguration,
      logOnlyToConsole,
    });

    await this._excelGeneratorFromDatas(query, {
      i18n,
      sheet,
      fields,
      excelConfiguration: _byDataExcelConfiguration,
      logOnlyToConsole,
    });

    return workbook;
  },

  async contactsExcelGenerator(query, { locale, fields, logOnlyToConsole } = { logOnlyToConsole: false }) {
    const i18n = new I18nRequire('cockpit-exports/excels/_by-data-excel-configuration', { locale });

    const { sheet = null, workbook = null } = this._excelGeneratorCommon({
      i18n,
      locale,
      fields,
      excelConfiguration: _byDataExcelConfiguration,
      logOnlyToConsole,
    });

    await this._excelGeneratorFromDatas(query, {
      i18n,
      sheet,
      fields,
      excelConfiguration: _byDataExcelConfiguration,
      logOnlyToConsole,
    });

    return workbook;
  },

  async unsatisfiedExcelGenerator(query, { locale, fields, logOnlyToConsole } = { logOnlyToConsole: false }) {
    const i18n = new I18nRequire('cockpit-exports/excels/_by-data-excel-configuration', { locale });

    const { sheet = null, workbook = null } = this._excelGeneratorCommon({
      i18n,
      locale,
      fields,
      excelConfiguration: _byDataExcelConfiguration,
      logOnlyToConsole,
    });

    await this._excelGeneratorFromDatas(query, {
      i18n,
      sheet,
      fields,
      excelConfiguration: _byDataExcelConfiguration,
      logOnlyToConsole,
    });

    return workbook;
  },

  async leadsExcelGenerator(query, { locale, fields, logOnlyToConsole } = { logOnlyToConsole: false }) {
    const i18n = new I18nRequire('cockpit-exports/excels/_by-data-excel-configuration', { locale });

    const { sheet = null, workbook = null } = this._excelGeneratorCommon({
      i18n,
      locale,
      fields,
      excelConfiguration: _byDataExcelConfiguration,
      logOnlyToConsole,
    });

    await this._excelGeneratorFromDatas(query, {
      i18n,
      sheet,
      fields,
      excelConfiguration: _byDataExcelConfiguration,
      logOnlyToConsole,
    });

    return workbook;
  },

  async forwardedLeadsExcelGenerator(query, { locale, fields, logOnlyToConsole } = { logOnlyToConsole: false }) {
    const i18n = new I18nRequire('cockpit-exports/excels/_by-data-excel-configuration', { locale });

    const { sheet = null, workbook = null } = this._excelGeneratorCommon({
      i18n,
      locale,
      fields,
      excelConfiguration: _byDataExcelConfiguration,
      logOnlyToConsole,
    });

    await this._excelGeneratorFromDatas(query, {
      i18n,
      sheet,
      fields,
      excelConfiguration: _byDataExcelConfiguration,
      logOnlyToConsole,
    });

    return workbook;
  },

  async ereputationExcelGenerator(query, { locale, fields, logOnlyToConsole } = { logOnlyToConsole: false }) {
    const i18n = new I18nRequire('cockpit-exports/excels/_by-data-excel-configuration', { locale });

    const { sheet = null, workbook = null } = this._excelGeneratorCommon({
      i18n,
      locale,
      fields,
      excelConfiguration: _byDataExcelConfiguration,
      logOnlyToConsole,
    });

    await this._excelGeneratorFromDatas(query, {
      i18n,
      sheet,
      fields,
      excelConfiguration: _byDataExcelConfiguration,
      logOnlyToConsole,
    });

    return workbook;
  },

  async adminUsersExcelGenerator(query, { locale, fields, logOnlyToConsole } = { logOnlyToConsole: false }) {
    const i18n = new I18nRequire('cockpit-exports/excels/_by-admin-users-excel-configuration', { locale });

    const { sheet = null, workbook = null } = this._excelGeneratorCommon({
      i18n,
      locale,
      fields,
      excelConfiguration: _byAdminUsersExcelConfiguration,
      logOnlyToConsole,
    });

    await this._excelGeneratorFromAdminUser(query, {
      i18n,
      sheet,
      fields,
      excelConfiguration: _byAdminUsersExcelConfiguration,
      logOnlyToConsole,
    });

    return workbook;
  },

  async adminGaragesExcelGenerator(query, { locale, fields, logOnlyToConsole } = { logOnlyToConsole: false }) {
    const i18n = new I18nRequire('cockpit-exports/excels/_by-admin-garages-excel-configuration', { locale });

    const { sheet = null, workbook = null } = this._excelGeneratorCommon({
      i18n,
      locale,
      fields,
      excelConfiguration: _byAdminGaragesExcelConfiguration,
      logOnlyToConsole,
    });

    await this._excelGeneratorFromAdminGarage(query, {
      i18n,
      sheet,
      fields,
      excelConfiguration: _byAdminGaragesExcelConfiguration,
      logOnlyToConsole,
    });

    return workbook;
  },

  async automationRgpdExcelGenerator(query, { locale, fields, logOnlyToConsole } = { logOnlyToConsole: false }) {
    const i18n = new I18nRequire('cockpit-exports/excels/_automation-rgpd-excel-configuration', { locale });

    const { sheet = null, workbook = null } = this._excelGeneratorCommon({
      i18n,
      locale,
      fields,
      excelConfiguration: _automationRgpdExcelConfiguration,
      logOnlyToConsole,
    });

    await this._excelGeneratorFromAutomationRgpd(query, {
      i18n,
      sheet,
      fields,
      excelConfiguration: _automationRgpdExcelConfiguration,
      logOnlyToConsole,
    });

    return workbook;
  },

  async automationCampaignExcelGenerator(query, { locale, fields, logOnlyToConsole } = { logOnlyToConsole: false }) {
    const i18n = new I18nRequire('cockpit-exports/excels/_automation-campaign-excel-configuration', { locale });

    const { sheet = null, workbook = null } = this._excelGeneratorCommon({
      i18n,
      locale,
      fields,
      excelConfiguration: _automationCampaignExcelConfiguration,
      logOnlyToConsole,
    });

    await this._excelGeneratorFromAutomationCampaign(query, {
      i18n,
      sheet,
      fields,
      excelConfiguration: _automationCampaignExcelConfiguration,
      logOnlyToConsole,
    });

    return workbook;
  },

  getGeneratedExcel(
    query,
    { exportType, locale, dataTypes, fields, logOnlyToConsole, onError } = {
      logOnlyToConsole: false,
      onError: () => {},
    }
  ) {
    switch (exportType) {
      case ExportTypes.GARAGES:
        return this.garagesExcelGenerator(query, { exportType, locale, dataTypes, fields, logOnlyToConsole, onError });
      case ExportTypes.FRONT_DESK_USERS_DMS:
        return this.frontDeskUsersDmsExcelGenerator(query, {
          exportType,
          locale,
          dataTypes,
          fields,
          logOnlyToConsole,
          onError,
        });
      case ExportTypes.FRONT_DESK_USERS_CUSTEED:
        return this.frontDeskUsersCusteedExcelGenerator(query, {
          exportType,
          locale,
          dataTypes,
          fields,
          logOnlyToConsole,
          onError,
        });
      case ExportTypes.SATISFACTION:
        return this.satisfactionExcelGenerator(query, { locale, fields, logOnlyToConsole });
      case ExportTypes.CONTACTS:
        return this.contactsExcelGenerator(query, { locale, fields, logOnlyToConsole });
      case ExportTypes.CONTACTS_MODIFIED:
        return this.contactsExcelGenerator(query, { locale, fields, logOnlyToConsole });
      case ExportTypes.UNSATISFIED:
        return this.unsatisfiedExcelGenerator(query, { locale, fields, logOnlyToConsole });
      case ExportTypes.LEADS:
        return this.leadsExcelGenerator(query, { locale, fields, logOnlyToConsole });
      case ExportTypes.FORWARDED_LEADS:
        return this.forwardedLeadsExcelGenerator(query, { locale, fields, logOnlyToConsole });
      case ExportTypes.EREPUTATION:
        return this.ereputationExcelGenerator(query, { locale, fields, logOnlyToConsole });
      case ExportTypes.ADMIN_USERS:
        return this.adminUsersExcelGenerator(query, { locale, fields, logOnlyToConsole });
      case ExportTypes.ADMIN_GARAGES:
        return this.adminGaragesExcelGenerator(query, { locale, fields, logOnlyToConsole });
      case ExportTypes.AUTOMATION_RGPD:
        return this.automationRgpdExcelGenerator(query, { locale, fields, logOnlyToConsole });
      case ExportTypes.AUTOMATION_CAMPAIGN:
        return this.automationCampaignExcelGenerator(query, { locale, fields, logOnlyToConsole });
      default:
        return null;
    }
  },
};
