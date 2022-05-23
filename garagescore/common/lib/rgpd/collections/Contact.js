const app = require('../../../../server/server');
const { maskEmail, maskCustom } = require('./_utils.js');

const fieldsToMask = {
  to: maskEmail,
  recipient: maskCustom('recipient'),
};

/**
 * Find and anonymize contact by dataIds
 * @param {any} {dataIds}
 * @param {any} projection={}
 * @param {any} anonymize=false
 * @returns {any}
 */
module.exports = async ({ dataIds }, projection = {}, anonymize = false) => {
  const collection = 'Contact';
  const $match = {};
  const mongoCollectionName = app.models[collection].settings.mongodb.collection;
  const mongoConnector = app.models[collection].getMongoConnector();

  if (!dataIds || !dataIds.length) {
    throw new Error(`dataIds needed to anonymize ${collection}`);
  }
  $match['payload.dataId'] = { $in: dataIds };

  if (!anonymize) {
    return await mongoConnector.find($match, { projection }).toArray();
  }

  const $set = {};
  for (const [field, func] of Object.entries(fieldsToMask)) {
    $set[field] = { $function: { lang: 'js', args: [`$${field}`], body: func.toString() } };
  }
  return await mongoConnector.aggregate([{ $match }, { $set }, { $merge: mongoCollectionName }]).toArray();
};
