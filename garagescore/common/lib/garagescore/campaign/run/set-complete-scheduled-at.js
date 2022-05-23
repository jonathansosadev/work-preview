/*
 * Set completeScheduledAtfield
 * a field telling us when we should complete the campaign
 */

const makeSurveysCategories = ['Maintenance', 'NewVehicleSale', 'UsedVehicleSale'];

function setCompleteScheduledAt(callback) {
  const campaign = this.modelInstances.campaign;
  const garage = campaign.garage();
  garage.getCampaignScenario((err, campaignScenario) => {
    if (err) {
      callback(err);
      return;
    }
    let delay = 0;
    if (garage.firstContactDelay) {
      for (const sub of makeSurveysCategories) {
        const garageDelay = (garage.firstContactDelay[sub] && garage.firstContactDelay[sub].value) || 0;
        const scenarioDelay =
          (campaignScenario.chains &&
            campaignScenario.chains[sub] &&
            campaignScenario.chains[sub].contacts &&
            campaignScenario.chains[sub].contacts[0] &&
            campaignScenario.chains[sub].contacts[0].delay) ||
          null;
        if (scenarioDelay !== null && garageDelay - scenarioDelay > delay) {
          delay = garageDelay - scenarioDelay;
        }
      }
    }
    campaign.updateAttribute('completeScheduledAt', campaignScenario.completeScheduledAt(campaign, delay), callback);
  });
}

module.exports = setCompleteScheduledAt;
