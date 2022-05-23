const { KpiTypes } = require('../../../../../frontend/utils/enumV2');
const garageType = require('../../../../models/garage.type');
const { ObjectId } = require('mongodb');

async function _fetchGarages(app, garageIds = []) {
  const match = {};

  if (garageIds.length) {
    match._id = garageIds.length === 1 ? ObjectId(garageIds[0]) : { $in: garageIds.map(ObjectId) };
  }

  return app.models.Garage.getMongoConnector().find(match).project({ id: '$_id', _id: false, type: true }).toArray();
}

async function _fetchUsers(app) {
  const match = { email: { $not: /@garagescore\.com|@custeed\.com/ } };

  return app.models.User.getMongoConnector()
    .find(match)
    .project({ id: '$_id', _id: false, garageIds: true, email: true })
    .toArray();
}

module.exports = async function _prepareEntities(app, garageIds = []) {
  // Fetch all garages and all not custeed users
  const [garages, users] = await Promise.all([_fetchGarages(app, garageIds), _fetchUsers(app)]);

  const garageEntities = garages.reduce((acc, garage) => {
    acc[garage.id] = {
      id: garage.id,
      kpiType: KpiTypes.GARAGE_KPI,
      garageType: garageType.getIntegerVersion(garage.type),
    };
    return acc;
  }, {});

  const userEntities = users.reduce((acc, user) => {
    acc[user.id] = { id: user.id, kpiType: KpiTypes.USER_KPI, garageIds: user.garageIds || [] };
    return acc;
  }, {});

  return [garageEntities, userEntities];
};
