const debug = require('debug')(
  'garagescore:common:lib:garagescore:campaign-item:run:ensure-campaign-item-model-instance-valid-to-run'
); // eslint-disable-line max-len,no-unused-vars
const config = require('config');
const campaignStatus = require('../../../../models/data/type/campaign-status');

/*
 * Ensure CampaignItem model instance is valid to run
 */
function ensureValidToRun(callback) {
  // skip this test when retrying
  if (this.retry) {
    debug('Skipping ensureValidToRun (retry)');
    callback();
    return;
  }
  // Skip this step (usually for test purpose)
  if (config.has('campaign.item.run.skipEnsureValid') && config.get('campaign.item.run.skipEnsureValid')) {
    debug('Skipping ensureValidToRun (config)');
    callback();
    return;
  }
  const data = this.modelInstances.data;

  if (!data.campaign) {
    callback(new Error('Undefined campaign'));
    return;
  }
  if (!data.campaign.status) {
    callback(new Error('Undefined campaign.status'));
    return;
  }
  if (data.campaign.status !== campaignStatus.NEW) {
    callback(new Error(`data.campaign.status is ${data.campaign.status}`));
    return;
  }
  callback();
}

module.exports = ensureValidToRun;
