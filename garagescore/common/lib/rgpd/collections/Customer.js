const app = require('../../../../server/server');
const { maskEmail, maskPhone, maskCustom } = require('./_utils.js');

const fieldsToMask = {
  email: maskEmail,
  phone: maskPhone,
  fullName: maskCustom('fullName'),
  emailList: maskEmail,
  phoneList: maskPhone,
  plate: maskCustom('plate'),
  index: ((...args) => {
    const maskIndex = function maskIndex(index) {
      if (!index || !Array.isArray(index)) return index;
      // dont remove this comment
      return index.map((i) => {
        if (i.k === 'email') return { k: 'email', v: maskEmail(i.v) };
        if (i.k === 'phone') return { k: 'phone', v: maskPhone(i.v) };
        if (i.k === 'fullName') return { k: 'fullName', v: maskCustom(i.v) };
        return i;
      });
    };
    return maskIndex.toString().replace('// dont remove this comment', args.map((func) => func.toString()).join('\n'));
  })(maskEmail, maskPhone, maskCustom('fullName')),
};

/**
 * Find and anonymize a customers by phone OR email (don't use both, it will not work)
 * @param {string} {phone
 * @param {string} email}
 * @param {any} projection={}
 * @param {boolean} anonymize=false
 * @returns {Customers}
 */
module.exports = async ({ phone, email }, projection = {}, anonymize = false) => {
  const field = phone ? 'phoneList' : 'emailList';
  const collection = 'Customer';
  const $match = {};
  const mongoCollectionName = app.models[collection].settings.mongodb.collection;
  const mongoConnector = app.models[collection].getMongoConnector();

  if (!phone && !email) {
    throw new Error(`phone OR email needed to anonymize ${collection}`);
  }
  $match[field] = phone || email;

  if (!anonymize) {
    return await mongoConnector.find($match, { projection }).toArray();
  }

  const $set = {};
  for (const [field, func] of Object.entries(fieldsToMask)) {
    $set[field] = { $function: { lang: 'js', args: [`$${field}`], body: func.toString() } };
  }
  return await mongoConnector.aggregate([{ $match }, { $set }, { $merge: mongoCollectionName }]).toArray();
};
