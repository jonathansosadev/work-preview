const { ObjectID } = require('mongodb');

module.exports = async (app, garageIds = [], $project = {}, additionalStages = []) => {
  const User = app.models.User.getMongoConnector();
  const toObjectId = (value) => (typeof value === 'string' ? new ObjectID(value) : value);
  const garageIdsList = Array.isArray(garageIds)
    ? garageIds.filter((gId) => gId).map((gId) => toObjectId(gId))
    : [toObjectId(garageIds)];

  // Simple $project would be key: true, but here it bugs because we are projecting inside a nested document
  // So we need to transform those key: true  into key: '$key' for our projections to work
  const fixedProjection = Object.fromEntries(
    Object.entries($project).map(([key, spec]) => [key, spec === true ? `$${key}` : spec])
  );

  const aggregate = [
    ...(garageIdsList.length ? [{ $match: { garageIds: { $in: garageIdsList } } }] : []),
    { $project: { garageIds: true, user: { ...fixedProjection, id: '$_id' } } },
    { $unwind: '$garageIds' },
    ...(garageIdsList.length ? [{ $match: { garageIds: { $in: garageIdsList } } }] : []),
    { $group: { _id: '$garageIds', users: { $addToSet: '$user' } } },
    ...additionalStages,
  ];

  return User.aggregate(aggregate).toArray();
};
