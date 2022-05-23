const debug = require('debug')(
  'garagescore:common:lib:garagescore:campaign-item:run:ensure-valid-to-send-next-campaign-contact'
); // eslint-disable-line max-len,no-unused-vars
const config = require('config');
const campaignStatus = require('../../../../models/data/type/campaign-status');

/*
 * Ensure CampaignItem model instance is valid to send nextcontact
 */
function ensureValidToSendNextContact(callback) {
  // Skip this step (usually for test purpose)
  if (config.has('campaign.item.run.skipEnsureValid') && config.get('campaign.item.run.skipEnsureValid')) {
    debug('Skipping ensureValidToSendNextContact (config)');
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
  if (data.campaign.status !== campaignStatus.RUNNING) {
    callback(new Error(`data.campaign.status is ${data.campaign.status}`));
    return;
  }
  callback();
}

module.exports = ensureValidToSendNextContact;
