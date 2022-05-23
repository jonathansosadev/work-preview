var debug = require('debug')(
  'garagescore:common:lib:garagescore:campaign:run:ensure-campaign-model-instance-valid-to-delete'
); // eslint-disable-line max-len,no-unused-vars
var util = require('util');
var config = require('config');
var gsCampaignStatus = require('../../../../models/campaign.status');

/*
 * Ensure Campaign model instance is valid to delete
 */
function ensureCampaignModelInstanceValidToDelete(callback) {
  // Skip this step (usually for test purpose)
  if (config.get('campaign.run.skipEnsureValid')) {
    debug('Skipping ensureCampaignModelInstanceValidToDelete');
    callback();
    return;
  }

  var campaign = this.modelInstances.campaign;

  if (campaign.status !== gsCampaignStatus.NEW && campaign.status !== gsCampaignStatus.WAITING) {
    // too late to delete
    callback(new Error(util.format('campaign.status is "%s"', campaign.status)));
    return;
  }
  callback();
}

module.exports = ensureCampaignModelInstanceValidToDelete;
