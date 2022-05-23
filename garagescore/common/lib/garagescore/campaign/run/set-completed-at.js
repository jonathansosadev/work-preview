/*
 * Set completedAt field
 * a field telling us when we completed the campaign
 */
function setCompletedAt(date, callback) {
  var campaign = this.modelInstances.campaign;
  campaign.updateAttribute('completedAt', date, callback);
}

module.exports = setCompletedAt;
