/*
 * Set run event
 */
module.exports = function updateCampaignItemModelInstanceStatus(event, callback) {
  this.currentRunEvent = event;
  callback();
};
