/*
 * Set recontactAt field
 */
function setRecontactDate(callback) {
  const data = this.modelInstances.data;
  const garage = this.modelInstances.garage;
  garage.getCampaignScenario((err, campaignScenario) => {
    if (err) {
      callback(err);
      return;
    }
    data.set('campaign.contactScenario.nextCampaignReContactDay', campaignScenario.recontactAt(data));
    data.save(callback);
  });
}

module.exports = setRecontactDate;
