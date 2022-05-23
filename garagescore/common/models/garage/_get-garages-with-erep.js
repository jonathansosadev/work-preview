const { ObjectID } = require('mongodb');

/* Gets garages with Erep given their Id's */
module.exports = async (app, garageIds = []) => {
  let match = { 'subscriptions.EReputation.enabled': true }
  if (garageIds && garageIds.length) {
    match = { _id: { $in: garageIds.map(ObjectID) }, ...match }
  }
  const mongo = app.models.Garage.getMongoConnector();
  return mongo.find(match).toArray();
};
