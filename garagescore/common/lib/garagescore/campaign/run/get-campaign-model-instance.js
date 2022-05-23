const app = require('../../../../../server/server');
const debug = require('debug')('garagescore:common:lib:garagescore:campaign:run:get-campaign-model-instance'); // eslint-disable-line max-len,no-unused-vars

/*
 * Get Campaign model instance
 */
function getCampaignModelInstance(callback) {
  const campaignId = this.campaignId.toString();
  const self = this;
  try {
    app.models.Campaign.findById(campaignId, { include: ['garage'] }, (e, campaign) => {
      if (e) {
        callback(e);
        return;
      }
      if (!campaign) {
        callback(new Error(`No campaign found with id ${campaignId}`));
        return;
      }
      self.modelInstances.campaign = campaign;
      callback();
    });
  } catch (e) {
    console.error(e);
    callback(e);
  }
}

module.exports = getCampaignModelInstance;
