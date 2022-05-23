var debug = require('debug')(
  'garagescore:common:lib:garagescore:campaign:run:update-campaign-model-instance-shouldSurfaceInStatistics'
); // eslint-disable-line max-len,no-unused-vars

/*
 * Update shouldSurfaceInStatistics of Campaign model instance
 */
function upadateCampaignModelInstanceShouldSurfaceInStatistics(state, callback) {
  var campaign = this.modelInstances.campaign;
  campaign.updateAttribute('shouldSurfaceInStatistics', state, callback);
}

module.exports = upadateCampaignModelInstanceShouldSurfaceInStatistics;
