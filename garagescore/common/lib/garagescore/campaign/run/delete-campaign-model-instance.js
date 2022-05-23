var debug = require('debug')('garagescore:common:lib:garagescore:campaign:run:delete-campaign-model-instance'); // eslint-disable-line max-len,no-unused-vars

/*
 * Update status of Campaign model instance
 */
function deleteCampaignModelInstance(callback) {
  var campaign = this.modelInstances.campaign;
  campaign.destroy(callback);
}

module.exports = deleteCampaignModelInstance;
