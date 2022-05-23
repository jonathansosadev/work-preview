var debug = require('debug')('garagescore:common:lib:garagescore:campaign:run:emit-campaign-model-event'); // eslint-disable-line max-len,no-unused-vars

/*
 * Emit an event for the campaign
 */
function emitCampaignModelEvent(eventName, eventPayload, callback) {
  this.modelInstances.campaign.emitEvent(eventName, eventPayload, callback);
}

module.exports = emitCampaignModelEvent;
