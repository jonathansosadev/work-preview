const { ObjectId } = require('mongodb');
const _automationEventPipeline = require('./_automation-event-pipeline');
const { AutomationCampaignsEventsType, GaragesTest } = require('../../../../../frontend/utils/enumV2');
const timeHelper = require('../../../util/time-helper');
const app = require('../../../../../server/server');

const period = 1;

const snakeToCamel = (value) => {
  return value.toLowerCase().replace(/([-_][a-z])/g, (group) => group.toUpperCase().replace('-', '').replace('_', ''));
};

const countEvents = async () => {
  const $in = AutomationCampaignsEventsType.valuesWithFilter('sendAutomationToCustomerEvent', true);

  const campaignRunDay = timeHelper.todayDayNumber() - 1;
  let totalEvents = 0;
  let totalTargeted = 0;

  const [targeted] = await app.models.AutomationCampaignsEvents.getMongoConnector()
    .aggregate([
      {
        $match: {
          campaignRunDay,
          type: AutomationCampaignsEventsType.TARGETED,
          garageId: { $nin: GaragesTest.values().map((gId) => ObjectId(gId)) },
        },
      },
      { $group: { _id: null, count: { $sum: '$nsamples' } } },
    ])
    .toArray();
  if (targeted) totalTargeted += targeted.count;

  const [result] = await app.models.AutomationCampaignsEvents.getMongoConnector()
    .aggregate([
      {
        $match: {
          campaignRunDay,
          type: { $in: $in },
          garageId: { $nin: GaragesTest.values().map((gId) => ObjectId(gId)) },
        },
      },
      { $group: { _id: null, count: { $sum: '$nsamples' } } },
    ])
    .toArray();
  if (result) totalEvents += result.count;
  let isSuspect = totalEvents !== totalTargeted;

  // We have targeted events during the week end but we arent supposed to have jobs running = no exit events
  const today = new Date();
  const isWeekEnd = (today.getDay() - period + 7) % 7 === 0 || (today.getDay() - period + 7) % 7 === 6;
  if (isWeekEnd) {
    isSuspect = totalEvents !== 0;
  }

  return {
    isSuspect,
    target: totalTargeted,
    totalEvents: totalEvents,
    eventsName: $in.map((event) => snakeToCamel(event)),
    yesterday: timeHelper.dayNumberToDate(campaignRunDay),
  };
};

const duplicateEvents = async () => {
  return app.models.AutomationCampaignsEvents.getMongoConnector()
    .aggregate([
      {
        $match: {
          campaignRunDay: { $gte: new Date() / 8.64e7 - 2, $lte: new Date() / 8.64e7 - 1 },
          eventDay: { $gte: new Date() / 8.64e7 - 2, $lte: new Date() / 8.64e7 - 1 },
          nsamplesMobile: { $gt: 0 },
          garageId: { $nin: GaragesTest.values().map((gId) => ObjectId(gId)) },
          type: {
            $in: [
              'PREPARE_TO_SEND',
              'PRESSURE_BLOCKED',
              'DELAYED_BY_GDPR',
              'DELAYED_BY_SMS_CHECKING',
              'CANNOT_SEND_CONTACT_UNSUBSCRIBED',
              'CANNOT_SEND_CONTACT_NO_CONTACT_DETAILS',
            ],
          },
        },
      },
      { $unwind: '$samples' },
      { $group: { _id: '$samples.customerId', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
      { $group: { _id: 'null', total: { $sum: '$count' } } },
    ])
    .toArray();
};

module.exports = {
  enabled: true,
  model: 'AutomationCampaignsEvents',
  pipeline: _automationEventPipeline(period, AutomationCampaignsEventsType.TARGETED),
  shouldSendMessage: async (res) => {
    const result = await countEvents();
    return result.isSuspect;
  },
  message: async (res) => {
    const { totalEvents, target, eventsName, yesterday } = await countEvents();
    const [duplicate] = await duplicateEvents();
    const year = yesterday.getFullYear();
    const month = yesterday.getMonth() + 1;
    const day = yesterday.getDate();
    const duplicateTotal = (duplicate && duplicate.total / 2) || 0;
    return `Automation le \`${day}/${month}/${year}\` il y a \`${target}\` customers targeted mais \`${
      totalEvents - duplicateTotal
    }\` events sont comptabilisés (events concernés: _${eventsName.join(', ')})_`;
  },
  slackChannel: 'çavapastrop',
};
