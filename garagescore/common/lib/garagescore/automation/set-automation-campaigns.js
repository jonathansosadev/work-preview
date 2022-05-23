const { ObjectID } = require('mongodb');

const app = require('../../../../server/server');
const { TIBO, log } = require('../../../../common/lib/util/log');

module.exports = {
  async setAutomationCampaigns(garageIds = null) {
    let garages = [];

    if (garageIds && !Array.isArray(garageIds)) {
      log.warning(TIBO, `GarageIDS Argument Is Not An Array !`);
    }

    garages = await this._fetchGarages(garageIds);

    for (const garage of garages) {
      await this._setAutomationCampaignsForGarage(garage);
    }
  },

  async _fetchGarages(garageIds = null) {
    const mongoGarages = app.models.Garage.getMongoConnector();

    return mongoGarages
      .find(
        {
          ...(garageIds ? { _id: { $in: garageIds.map((id) => new ObjectID(id)) } } : {}),
        },
        {
          projection: {
            _id: true,
            publicDisplayName: true,
            subscriptions: true,
            dataFirstDays: true,
            locale: true,
            status: true,
          },
        }
      )
      .toArray();
  },

  async _setAutomationCampaignsForGarage(garage) {
    return app.models.AutomationCampaign.setCampaigns(
      garage._id,
      garage.subscriptions,
      garage.dataFirstDays,
      garage.locale,
      garage.status
    );
  },
};
