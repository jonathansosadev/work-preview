/** Return all garages of an user */
const { ObjectID } = require('mongodb');

module.exports = async (app, userIds, $project, additionalStages = []) => {
  if (!$project) {
    console.error('get-garages Dont f*** with the Database please');
    process.exit();
  }

  if (!Array.isArray(userIds)) {
    userIds = [userIds];
  }
  userIds = userIds.map((id) => new ObjectID(id.toString()));
  const _id = userIds.length === 1 ? userIds[0] : { $in: userIds };
  const users = await app.models.User.getMongoConnector()
    .find({ _id }, { projection: { garageIds: true } })
    .toArray();
  const garageIds = users.reduce((acc, element) => [...acc, ...element.garageIds], []);
  if (!garageIds || !garageIds.length) {
    return [];
  }

  const aggregate = [{ $match: { _id: { $in: garageIds } } }, { $project }, ...additionalStages];

  return app.models.Garage.getMongoConnector().aggregate(aggregate).toArray();
};
