/**
 * When a garage is created, custeed users will have it in their scopes
 **/
const { ObjectId } = require('mongodb');

module.exports = async (app, rawGarageId) => {
  const User = app.models.User.getMongoConnector();
  const garageId = new ObjectId(rawGarageId.toString());

  await User.updateMany({ job: 'Custeed' }, { $addToSet: { garageIds: garageId } });
};
