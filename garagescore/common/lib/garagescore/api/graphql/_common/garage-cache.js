const lruCache = require('lru-cache');
const server = require('../../../../../../server/server');
const { ObjectID } = require('mongodb');

const garageCache = lruCache({
  length: () => 1,
  maxAge: 1000 * 60 * 5, // lasts 5 minutes
});

const projection = {
  externalId: true,
  type: true,
  publicDisplayName: true,
  subscriptions: true,
  parent: true,
  hideDirectoryPage: true,
  campaignScenarioId: true,
  exogenousReviewsConfigurations: true,
  ratingType: true,
  group: true,
  surveySignature: true,
};

const getGarage = async (gId) => {
  const garageId = gId.toString();
  if (garageCache.has(garageId)) {
    return garageCache.get(garageId);
  }

  try {
    const _id = new ObjectID(garageId);
    const garage = await server.models.Garage.getMongoConnector().findOne({ _id }, { projection });
    if (!garage) throw new Error(`Garage with id: ${garageId} not found in DB`);
    garageCache.set(garageId, garage);
    return garage;
  } catch (e) {
    console.error('garage-cache:getGarage, error retrieving the garage', e);
    return Promise.reject(e);
  }
};

const getGarages = async (garageIds) => {
  const missingGarages = garageIds.filter((gId) => !garageCache.has(gId.toString()));
  // We're lucky, all garages can be found in cache, so we'll just return them :)
  if (!missingGarages.length) return garageIds.map((gId) => garageCache.get(gId.toString()));

  try {
    const existingGarages = Object.fromEntries(
      garageIds
        .filter((gId) => garageCache.has(gId.toString()))
        .map((gId) => [gId.toString(), JSON.parse(JSON.stringify(garageCache.get(gId.toString())))])
    );
    const _id = { $in: missingGarages.map((gId) => new ObjectID(gId)) };
    const garages = await server.models.Garage.getMongoConnector().find({ _id }, { projection }).toArray();
    const returnedGarages = garageIds.map(
      (gId) => existingGarages[gId] || garages.find((g) => g._id.toString() === gId.toString())
    );
    for (const garage of garages) {
      garageCache.set(garage._id.toString(), garage);
    }
    return returnedGarages;
  } catch (e) {
    console.error('garage-cache:getGarage, error retrieving some garages', e);
    return Promise.reject(e);
  }
};

module.exports = {
  getGarage,
  getGarages,
};
