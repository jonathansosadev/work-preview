/**
 * Lead tickets
 */
const ObjectId = require('mongodb').ObjectId;
const EVENTS = {
  ADD_LEAD_TICKET: 'ADD_LEAD_TICKET',
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
function create(garageId, leadSaleType, eventDay, emitListener) {
  return {
    key1: garageId,
    key2: leadSaleType,
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
