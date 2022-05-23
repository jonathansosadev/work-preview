function cancelFutureContact(callback) {
  const data = this.modelInstances.data;
  data.set('campaign.contactScenario.nextCampaignContact', null);
  data.set('campaign.contactScenario.nextCampaignContactDay', null);
  data.save(callback);
}
module.exports = cancelFutureContact;
