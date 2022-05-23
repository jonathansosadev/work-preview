const { ObjectID } = require('mongodb');

/* Gets one garage */
module.exports = async (app, garageId, projection = {}) => {
  if (!garageId) {
    throw new TypeError('no garageId was supplied');
  }

  const _id = typeof garageId === 'string' ? ObjectID(garageId) : garageId;
  const mongo = app.models.Garage.getMongoConnector();
  const res = await mongo.findOne({ _id }, { projection });
  return res;
};
