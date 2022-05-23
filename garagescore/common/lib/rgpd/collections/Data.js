const app = require('../../../../server/server');
const { maskEmail, maskPhone, maskCustom, erase } = require('./_utils.js');

const fieldsToMask = {
  // Raw
  'source.raw': erase,

  // Customer
  'customer.contact.email.value': maskEmail,
  'customer.contact.email.original': maskEmail,

  'customer.contact.mobilePhone.value': maskPhone,
  'customer.contact.mobilePhone.original': maskPhone,

  'customer.firstName.value': maskCustom('firstName'),
  'customer.firstName.original': maskCustom('firstName'),

  'customer.lastName.value': maskCustom('lastName'),
  'customer.lastName.original': maskCustom('lastName'),

  'customer.fullName.value': maskCustom('fullName'),
  'customer.fullName.original': maskCustom('fullName'),

  // Tickets
  'leadTicket.customer.contact.email': maskEmail,
  'leadTicket.customer.contact.mobilePhone': maskPhone,
  'leadTicket.customer.fullName': maskCustom('fullName'),

  'unsatisfiedTicket.customer.contact.email': maskEmail,
  'unsatisfiedTicket.customer.contact.mobilePhone': maskPhone,
  'unsatisfiedTicket.customer.fullName': maskCustom('fullName'),

  //Vehicle
  'vehicle.plate.value': maskCustom('plate'),
  'vehicle.plate.original': maskCustom('plate')
};

/**
 * Find and anonymize datas by dataIds OR garageId (don't use both, it will not work)
 * @param {any} {dataIds
 * @param {any} garageId}
 * @param {any} projection={}
 * @param {any} anonymize=false
 * @returns {any}
 */
module.exports = async ({ dataIds, garageId }, projection = {}, anonymize = false) => {
  const collection = 'Data';
  const $match = {};
  const mongoCollectionName = app.models[collection].settings.mongodb.collection;
  const mongoConnector = app.models[collection].getMongoConnector();

  if ((!dataIds || !dataIds.length) && !garageId) {
    throw new Error(`dataIds or garageId needed to anonymize ${collection}`);
  }
  if (dataIds) {
    $match._id = { $in: dataIds };
  } else {
    $match.garageId = garageId;
  }

  if (!anonymize) {
    return await mongoConnector.find($match, { projection }).toArray();
  }

  const $set = {};
  for (const [field, func] of Object.entries(fieldsToMask)) {
    $set[field] = { $function: { lang: 'js', args: [`$${field}`], body: func.toString() } };
  }
  return await mongoConnector.aggregate([{ $match }, { $set }, { $merge: mongoCollectionName }]).toArray();
};
