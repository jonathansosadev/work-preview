const debug = require('debug')(
  'garagescore:common:lib:garagescore:campaign-item:run:ensure-campaign-item-model-instance-valid-to-cancel'
); // eslint-disable-line max-len,no-unused-consts
const config = require('config');
const campaignStatus = require('../../../../models/data/type/campaign-status');

/*
 * Ensure data model instance is valid to cancel
 */
function ensureValidToCancel(callback) {
  // Skip this step (usually for test purpose)
  if (config.has('campaign.item.run.skipEnsureValid') && config.get('campaign.item.run.skipEnsureValid')) {
    debug('Skipping ensureValidToCancel');
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
  if (data.campaign.status === campaignStatus.NEW || data.campaign.status === campaignStatus.WAITING) {
    callback(new Error(`data.campaign.status is ${data.campaign.status}`));
    return;
  }
  callback();
}

module.exports = ensureValidToCancel;
