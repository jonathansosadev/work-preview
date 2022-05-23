/**
 * Data.review
 * For the moment the events coming here are related to
 *  - new review received
 *  - reply to review (either automatic or manual)
 */
const ObjectId = require('mongodb').ObjectId;
const EVENTS = {
  ADD_REVIEW: 'ADD_REVIEW',
  REPLY_TO_REVIEW: 'REPLY_TO_REVIEW',
};
const correlatedFields = async function (app, keys) {
  const { key1: garageId } = keys;
  try {
    const { type, group, publicDisplayName } = await app.models.Garage.getMongoConnector().findOne(
      { _id: new ObjectId(garageId) },
      { projection: { type: true, publicDisplayName: true } }
    );
    return { garageType: type, group, garagePublicDisplayName: publicDisplayName };
  } catch (e) {
    return {};
  }
};
function create(garageId, sourceType, eventDay, emitListener) {
  return {
    key1: garageId,
    key2: sourceType,
    emitListener,
    correlatedFields,
    eventDay,
  };
}
module.exports = {
  create,
  EVENTS,
  correlatedFields,
};
