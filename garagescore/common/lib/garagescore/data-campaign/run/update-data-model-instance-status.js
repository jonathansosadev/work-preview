/*
 * Update status of CampaignItem
 */
function updateStatus(status, callback) {
  const data = this.modelInstances.data;
  data.set('campaign.status', status);
  data.save(callback);
}

module.exports = updateStatus;
