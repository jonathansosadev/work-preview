var debug = require('debug')('garagescore:common:lib:garagescore:campaign:run:update-campaign-model-instance-status'); // eslint-disable-line max-len,no-unused-vars

/*
 * Update status of Campaign model instance
 */
function upadateCampaignModelInstanceStatus(status, callback) {
  var campaign = this.modelInstances.campaign;
  campaign.updateAttribute('status', status, callback);
}

module.exports = upadateCampaignModelInstanceStatus;
