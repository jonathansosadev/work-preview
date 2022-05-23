const { ObjectId } = require('mongodb');
const app = require('../../../server');
const SubscriptionType = require('../../../../common/models/garage.subscription.type');
const {
  DEFAULT_MAX_TOTAL_PRICE_FOR_USERS,
} = require('../../../../common/lib/garagescore/automatic-billing/constants.js');

/** return all garages with goCardless = true or empty array */
const getGoCardless = async () => {
  const BillingAccount = app.models.BillingAccount.getMongoConnector();
  const result = await BillingAccount.aggregate([
    { $match: { mandateId: /[a-zA-Z0-9]+/, customerId: /[a-zA-Z0-9]+/ } },
    { $project: { garageIds: true } },
    { $unwind: '$garageIds' },
    {
      $group: {
        _id: null,
        res: { $addToSet: { id: '$garageIds' } },
      },
    },
  ]).toArray();

  return result[0] ? result[0].res.map((g) => g.id.toString()) : [];
};

/** calculate nbUsers price by garage and total users */
const _calcNbUsersByGarage = (usersByGarage, garage) => {
  let nbUsers = 0;
  const garageId = garage.id ? garage.id.toString() : garage._id.toString();
  const users = usersByGarage[garageId] || [];
  nbUsers = users && users.length;
  nbUsers -= garage.subscriptions.users.included;
  nbUsers = nbUsers < 0 ? 0 : nbUsers;
  const totalUsers = nbUsers * garage.subscriptions.users.price;
  const maximumTotalPriceForUsers =
    garage.subscriptions.users.maximumTotalPriceForUsers || DEFAULT_MAX_TOTAL_PRICE_FOR_USERS;
  return {
    price: Math.min(totalUsers, maximumTotalPriceForUsers),
    nbUsers,
  };
};

/** calculate xLeadSource source by garage */
const _calcXLeadSource = async (garage, app) => {
  const garageId = garage.id ? garage.id.toString() : garage._id.toString();
  const sources = await app.models.Garage.getAllSources([new ObjectId(garageId.toString())]);
  const activeSources = (sources && sources.filter((s) => s.enabled)) || null;
  if (activeSources && activeSources.length > (garage.subscriptions[SubscriptionType.CROSS_LEADS].included || 0)) {
    return activeSources.length - (garage.subscriptions[SubscriptionType.CROSS_LEADS].included || 0);
  }
  return 0;
};

const getUsersByGarages = async () => {
  // chunks an array into smaller arrays of the specified size. [[id , id], [id , id] ...]
  const chunkIt = function* (garageIds, size) {
    let chunk = [];
    for (const { _id } of garageIds) {
      chunk.push(_id);
      if (chunk.length === size) {
        yield chunk;
        chunk = [];
      }
    }
    if (chunk.length) yield chunk;
  };
  // all garages are not billed , take only those whore are (small optimization)
  let garageIdsToGetUsersFrom = await app.models.Garage.getMongoConnector().find({}).project({ _id: 1 }).toArray();
  // build batches of 500 garagesIds to avoid overwhelming the db
  const batches = [...chunkIt(garageIdsToGetUsersFrom, 500)];
  // for each batch retrieve the users for each garageId
  let usersByGarage = {};
  for (const batch of batches) {
    const usersByGarageBatch = await app.models.User.getRealUsersByGarage(batch);
    usersByGarage = { ...usersByGarage, ...usersByGarageBatch };
  }
  return usersByGarage;
};

module.exports = {
  _calcNbUsersByGarage,
  _calcXLeadSource,
  getGoCardless,
  getUsersByGarages,
};
