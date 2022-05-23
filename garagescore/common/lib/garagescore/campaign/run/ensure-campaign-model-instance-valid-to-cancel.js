var debug = require('debug')(
  'garagescore:common:lib:garagescore:campaign:run:ensure-campaign-model-instance-valid-to-cancel'
); // eslint-disable-line max-len,no-unused-vars
var util = require('util');
var config = require('config');
var gsCampaignStatus = require('../../../../models/campaign.status');

/*
 * Ensure Campaign model instance is valid to cancel
 */
function ensureCampaignModelInstanceValidToCancel(callback) {
  // Skip this step (usually for test purpose)
  if (config.get('campaign.run.skipEnsureValid')) {
    debug('Skipping ensureCampaignModelInstanceValidToCancel');
    callback();
    return;
  }

  var campaign = this.modelInstances.campaign;

  if (campaign.status === gsCampaignStatus.NEW || campaign.status === gsCampaignStatus.WAITING) {
    // Still deletable
    callback(new Error(util.format('campaign.status is "%s"', campaign.status)));
    return;
  }
  callback();
}

module.exports = ensureCampaignModelInstanceValidToCancel;
