const app = require('../../../server/server');
const { FED, log } = require('../../../common/lib/util/log');
const timeHelper = require('../../../common/lib/util/time-helper');
const { AutomationCampaignsEventsType } = require('@/utils/enumV2');

const intro = '[Monitoring Lone Targets] : ';

const _parseArgs = (args) => {
  return {
    campaignRunDay:
      args.indexOf('--campaignRunDay') === -1
        ? timeHelper.dayNumber(new Date()) - 1
        : parseInt(args[args.indexOf('--campaignRunDay') + 1]),
  };
};

const mandatoryEventList = AutomationCampaignsEventsType.valuesWithFilter('sendAutomationToCustomerEvent', true);

app.on('booted', async () => {
  try {
    console.time(`${intro}execution_time`);
    const { campaignRunDay } = _parseArgs(process.argv);
    log.info(FED, `${intro}Getting singularity sample for campaignRunDay : ${campaignRunDay}`);
    const ACEConnector = app.models.AutomationCampaignsEvents.getMongoConnector();
    let campaignOccurences = await ACEConnector.aggregate([
      { $match: { campaignRunDay: campaignRunDay } },
      { $unwind: '$samples' },
      { $project: { campaignId: '$campaignId', customerId: '$samples.customerId' } },
      { $group: { _id: '$campaignId', customerIds: { $push: '$customerId' } } },
    ]).toArray();
    log.info(FED, `${intro} ${campaignOccurences.length} campaign on a single customer found`);
    for (const campaignOccurence of campaignOccurences) {
      const allRelatedEvents = await ACEConnector.aggregate([
        {
          $match: {
            campaignRunDay,
            campaignId: campaignOccurence._id,
            'samples.customerId': { $in: campaignOccurence.customerIds },
          },
        },
        {
          $project: { type: '$type', samples: '$samples' },
        },
        {
          $unwind: '$samples',
        },
        { $group: { _id: '$samples.customerId', type: { $push: '$type' } } },
      ]).toArray();
      for (const relatedEvent of allRelatedEvents) {
        const mandatoryEvents = relatedEvent.type.filter((type) => {
          return mandatoryEventList.includes(type);
        });
        if (mandatoryEvents.length < 1) {
          log.info(
            FED,
            `campaignId: ${campaignOccurence._id}, customerId: ${
              relatedEvent._id
            }, only has event ${relatedEvent.type.join(', ')}`
          );
        }
      }
    }
    console.timeEnd(`${intro}execution_time`);
    process.exit(0);
  } catch (e) {
    console.log(e.toString(), e.toString().includes('ns not found'));
    if (!e.toString().includes('ns not found')) {
      console.error(e);
      process.exit(1);
    }
  }
});
