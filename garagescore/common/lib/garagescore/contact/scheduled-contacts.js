const ScheduledContactAggregatorStream = require('./Scheduled-contacts-aggregator-stream');
const app = require('../../../../server/server');
/**
 * get the list of scheduled contacts
 * @param options supported options : filters: filter for campaignItems.find
 * @param callback
 */
module.exports = function getScheduledContacts(options, callback) {
  const filters = options.filters ? JSON.parse(JSON.stringify(options.filters)) : {};
  if (filters.where['campaign.contactScenario.nextCampaignContact'] === ScheduledContactAggregatorStream.recontacts) {
    filters.where['campaign.contactScenario.nextCampaignReContactDay'] = filters.where.nextCampaignContactDay;
    delete filters.where['campaign.contactScenario.nextCampaignReContactDay'];
    delete filters.where['campaign.contactScenario.nextCampaignContact'];
    options.checkRecontact = true; // eslint-disable-line no-param-reassign
  }
  const readStream = app.models.Data.findStream(filters);
  const aggregatorStream = new ScheduledContactAggregatorStream(options);
  readStream.pipe(aggregatorStream).on('finish', () => {
    callback(null, aggregatorStream.getAggregationResult());
  });
  readStream.on('error', callback);
  aggregatorStream.on('error', callback);
};
