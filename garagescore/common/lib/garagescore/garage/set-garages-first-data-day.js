const { ObjectID } = require('mongodb');

const app = require('../../../../server/server');
const timeHelper = require('../../../lib/util/time-helper');
const DataTypes = require('../../../../common/models/data/type/data-types');
const publicApi = require('../api/public-api');
const { updateFromObject } = require('../../../../common/models/garage/garage-methods');
const { TIBO, log } = require('../../../../common/lib/util/log');

module.exports = {
  async setFirstDataDay(garageIds = null, dataTypes = null) {
    let garages = [];

    if (garageIds && !Array.isArray(garageIds)) {
      log.warning(TIBO, `GarageIDS Argument Is Not An Array !`);
    }

    if (dataTypes && !Array.isArray(dataTypes)) {
      log.warning(TIBO, `DataTypes Argument Is Not An Array !`);
    }

    garages = await this._fetchGarages(garageIds);

    for (const garage of garages) {
      await this._updateGarage(garage, dataTypes);
    }
  },

  async _updateGarage(garage, dataTypes) {
    let dataFirstDays = {};
    let firstMaintenanceData = null;
    let firstNewVehicleSaleData = null;
    let firstUsedVehicleSaleData = null;

    log.info(TIBO, `Updating First Data Days For Garage ${garage.publicDisplayName}`);

    if (!dataTypes || dataTypes.includes(DataTypes.MAINTENANCE)) {
      firstMaintenanceData = (await this._fetchFirstData(DataTypes.MAINTENANCE, garage)) || null;
    }
    if (!dataTypes || dataTypes.includes(DataTypes.NEW_VEHICLE_SALE)) {
      firstNewVehicleSaleData = (await this._fetchFirstData(DataTypes.NEW_VEHICLE_SALE, garage)) || null;
    }
    if (!dataTypes || dataTypes.includes(DataTypes.USED_VEHICLE_SALE)) {
      firstUsedVehicleSaleData = (await this._fetchFirstData(DataTypes.USED_VEHICLE_SALE, garage)) || null;
    }

    dataFirstDays = {
      firstMaintenanceDay:
        (firstMaintenanceData && timeHelper.dayNumber(new Date(firstMaintenanceData.service.providedAt))) || null,
      firstNewVehicleSaleDay:
        (firstNewVehicleSaleData && timeHelper.dayNumber(new Date(firstNewVehicleSaleData.service.providedAt))) || null,
      firstUsedVehicleSaleDay:
        (firstUsedVehicleSaleData && timeHelper.dayNumber(new Date(firstUsedVehicleSaleData.service.providedAt))) ||
        null,
    };

    return updateFromObject(garage, { dataFirstDays }, app, publicApi);
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
          },
        }
      )
      .toArray();
  },

  async _fetchFirstData(type, garage) {
    const mongoDatas = app.models.Data.getMongoConnector();

    return mongoDatas.findOne(
      {
        garageId: garage._id.toString(),
        type,
        'service.providedAt': { $gte: new Date('2016/01/01') },
      },
      {
        projection: {
          'service.providedAt': true,
        },
        sort: {
          'service.providedAt': 1,
        },
      }
    );
  },
};
