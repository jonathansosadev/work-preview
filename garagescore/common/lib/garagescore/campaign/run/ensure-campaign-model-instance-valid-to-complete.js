var debug = require('debug')(
  'garagescore:common:lib:garagescore:campaign:run:ensure-campaign-model-instance-valid-to-complete'
); // eslint-disable-line max-len,no-unused-vars
var util = require('util');
var config = require('config');
var gsCampaignStatus = require('../../../../models/campaign.status');

/*
 * Ensure Campaign model instance is valid to complete
 */
function ensureCampaignModelInstanceValidToComplete(callback) {
  // Skip this step (usually for test purpose)
  if (config.get('campaign.run.skipEnsureValid')) {
    debug('Skipping ensureCampaignModelInstanceValidToComplete');
    callback();
    return;
  }

  var campaign = this.modelInstances.campaign;

  if (campaign.status === gsCampaignStatus.COMPLETE || campaign.status === gsCampaignStatus.CANCELLED) {
    callback(new Error(util.format('campaign.status is "%s"', campaign.status)));
    return;
  }
  callback();
}

module.exports = ensureCampaignModelInstanceValidToComplete;
