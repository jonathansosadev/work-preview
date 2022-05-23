const app = require('../../../../server/server');
const { JS, time, timeEnd } = require('../../util/log');
const GarageTypes = require('../../../models/garage.type');

const TTL = 1000 * 60 * 10; // time expiration time in ms
let _lastRefresh = 0; // last time the cache was refreshed

const _garageType = {};
// did we reach the cache ttl ?
const _mustRefresh = () => Date.now() - _lastRefresh > TTL;

const refresh = async (force = true) => {
  if (!force && !_mustRefresh()) {
    return;
  }
  time(JS, 'GarageType Cache refresh');
  const directMongoConnector = app.models.Garage.getMongoConnector();
  const fields = { projection: { id: true, type: true } };
  const garages = await directMongoConnector.find({}, fields).toArray();
  // #3434-mongo-projections : if there is a bug there, verify that the projection returns what's needed
  _lastRefresh = Date.now();
  garages.forEach((garage) => {
    const g = garage._id.toString();
    _garageType[g] = garage.type;
  });
  timeEnd(JS, 'GarageType Cache refresh');
};
const filterGaragesByType = async function filterGaragesByType(garages, cockpitType) {
  await refresh();
  return garages.filter((id) => {
    const type = _garageType[id.toString()];
    const ct = GarageTypes.getCockpitType(type);
    return ct === cockpitType;
  });
};
const garageType = async function garageType(garageId) {
  await refresh();
  return _garageType[garageId];
};
module.exports = { filterGaragesByType, garageType };
