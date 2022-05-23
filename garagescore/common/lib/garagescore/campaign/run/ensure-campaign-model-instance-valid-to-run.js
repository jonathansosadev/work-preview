var debug = require('debug')(
  'garagescore:common:lib:garagescore:campaign:run:ensure-campaign-model-instance-valid-to-complete'
); // eslint-disable-line max-len,no-unused-vars
var util = require('util');
var config = require('config');
var gsCampaignStatus = require('../../../../models/campaign.status');

/*
 * Ensure Campaign model instance is valid to run
 */
function ensureCampaignModelInstanceValidToRun(callback) {
  // Skip this step (usually for test purpose)
  if (config.get('campaign.run.skipEnsureValid')) {
    debug('Skipping ensureCampaignModelInstanceValidToRun');
    callback();
    return;
  }

  var campaign = this.modelInstances.campaign;

  if (campaign.status !== gsCampaignStatus.NEW && campaign.status !== gsCampaignStatus.WAITING) {
    callback(new Error(util.format('campaign.status is "%s"', campaign.status)));
    return;
  }

  if (typeof campaign.garageId === 'undefined') {
    callback(new Error('Undefined campaign.garageId'));
    return;
  }
  if (typeof campaign.garage === 'undefined') {
    callback(new Error('Undefined campaign.garage'));
    return;
  }

  callback();
}

module.exports = ensureCampaignModelInstanceValidToRun;
