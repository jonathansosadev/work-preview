/**
 * Process on one garage, example: the imports
 */

const ObjectId = require('mongodb').ObjectId;
const defaults = { dataType: 'Unknown', stepNumber: 0 };
const EVENTS = {
  EVENT_IMPORT_IGNORE_ROW: 'IMPORT_IGNORE_ROW',
};
const correlatedFields = async function (app, keys) {
  const { key1: garageId } = keys;
  const { group, publicDisplayName } = await app.models.Garage.getMongoConnector().findOne(
    {
      _id: new ObjectId(garageId),
    },
    { projection: { group: true, publicDisplayName: true } }
  );
  return { key4: group || 'undefined', garageName: publicDisplayName };
};
function create(garageId, dataType = defaults.dataType, stepNumber = defaults.stepNumber, emitListener) {
  return {
    key1: garageId,
    key2: dataType,
    key3: stepNumber,
    emitListener,
    correlatedFields,
  };
}
function createForUnitTest(emitListener) {
  return {
    key1: 'test',
    key2: defaults.dataType,
    key3: defaults.stepNumber,
    emitListener,
  };
}
module.exports = {
  create,
  createForUnitTest,
  correlatedFields,
  EVENTS,
};
