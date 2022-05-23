const lruCache = require('lru-cache');
const { ObjectID } = require('mongodb');
const GarageTypes = require('../../../../common/models/garage.type');

const garageIdsCache = lruCache({
  max: 100,
  length: () => 1,
  maxAge: 1000 * 60, // last 1 minute
});

/** Get a list of object garageId(s) for an user, use a cache */
async function garageIds(app, user, cockpitType = null, garageId = null) {
  try {
    const cacheKey = `${user.email}${cockpitType || '-'}${garageId || '-'}`;
    const cached = garageIdsCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const query = {};
    const options = { projection: { _id: true } };

    // Add GarageIds Filter
    if (garageId) {
      if (garageId.length <= 1){
        query._id = new ObjectID(garageId[0]);
      }else {
        query._id = { $in: garageId.map((id) => new ObjectID(id)) }
      }
    } else {
      query._id = { $in: user.garageIds };
    }
    // Add CockpitType Filter
    if (cockpitType) query.type = { $in: GarageTypes.getGarageTypesFromCockpitType(cockpitType) };

    let result = await app.models.Garage.getMongoConnector().find(query, options).toArray();
    result = result.map((id) => id._id);
    garageIdsCache.set(cacheKey, result);
    return result;
  } catch (error) {
    throw new Error(error);
  }
}

module.exports = {
  garageIds,
};
