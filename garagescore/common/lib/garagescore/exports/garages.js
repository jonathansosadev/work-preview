const garageSubscriptionTypes = require('../../../models/garage.subscription.type.js');
const GarageTypes = require('../../../models/garage.type.js');
const HEADERS = require('./garages-headers');
const { _checkIfDefined, _checkIfBooleanDefined, _checkIfDateDefined, _checkIfNumberDefined } = require('./utils');

/**
 * Gets the language associated with the locale specified in the garage
 * Fastest way to do so but I wonder if it's worth creating an Enum for the locales we have
 */
function getLocaleDisplayName(value) {
  const localeDisplayNames = {
    fr_FR: 'Français (France)',
    es_ES: 'Espagnol (Espagne)',
    en_US: 'Anglais (USA)',
    fr_NC: 'Français (Nouvelle-Calédonie)',
    ca_ES: 'Catalan (Espagne)',
    fr_BE: 'Français (Belgique)',
    nl_BE: 'Néerlandais (Belgique)',
  };
  return localeDisplayNames[value] || value;
}

function getBrandNames(garage) {
  if (Array.isArray(garage.brandNames)) return garage.brandNames.join(',');
  return 'Non renseigné';
}
function getTags(garage) {
  if (Array.isArray(garage.tags)) return garage.tags.join(',');
  return 'Non renseigné';
}

/**
 * [handleSubSetup handle the subscription called setup ]
 * @param {[type]} subscriptions [subscriptions object]
 * @return {[type]} [string]
 */

function handleSubSetup({ active, setup }) {
  let tmp = '';
  if (active && setup && setup.enabled) {
    const { billDate, price } = setup;
    tmp += `Oui;${_checkIfDateDefined(billDate)};${_checkIfNumberDefined(price)};`;
  } else {
    tmp += `Non;Non renseigné;Non renseigné;`;
  }
  return tmp;
}

/**
 * if a subscription is active return the subscription formatted output
 * else return default output taken as a param
 */

function subOutput(subscriptions, key, subscriptionOutput, defaultOutput) {
  if (subscriptions && subscriptions.active && subscriptions[key]) {
    if (!!(subscriptions[key] && subscriptions[key].enabled) === true) {
      return subscriptionOutput;
    } else {
      return defaultOutput;
    }
  } else {
    return defaultOutput;
  }
}

/**
 * return the formatted output of the Automation subscription
 */

function handleSubAutomation(subscriptions, key) {
  const defaultOutput = `Non;${'Non renseigné;'.repeat(4)}`;
  const { date, included, price, every } = subscriptions[key] || {};
  const subscriptionOutput = `Oui;${_checkIfDateDefined(date)};${_checkIfNumberDefined(
    included
  )};${_checkIfNumberDefined(price)};${_checkIfNumberDefined(every)};`;
  return subOutput(subscriptions, key, subscriptionOutput, defaultOutput);
}

/**
 * return the formatted output of the CrossLeads subscription
 */

function handleSubCrossLeads(subscriptions, key) {
  const defaultOutput = `Non;${'Non renseigné;'.repeat(5)}`;
  const { date, included, price, unitPrice, minutePrice } = subscriptions[key] || {};
  const subscriptionOutput = `Oui;${_checkIfDateDefined(date)};${_checkIfNumberDefined(
    included
  )};${_checkIfNumberDefined(price)};${_checkIfNumberDefined(unitPrice)};${_checkIfNumberDefined(minutePrice)};`;
  return subOutput(subscriptions, key, subscriptionOutput, defaultOutput);
}

/**
 * return the formatted output of the subscriptions of garageSubscriptionTypes
 */
function handleSubTypes(subscriptions) {
  let tmp = '';
  garageSubscriptionTypes.values().forEach((key) => {
    switch (key) {
      case 'Automation':
        tmp += handleSubAutomation(subscriptions, key);
        break;
      case 'CrossLeads':
        tmp += handleSubCrossLeads(subscriptions, key);
        break;
      default:
        const defaultOutput = `Non;${'Non renseigné;'.repeat(2)}`;
        const { date, price } = subscriptions[key] || {};
        const subscriptionOutput = `Oui;${_checkIfDateDefined(date)};${_checkIfNumberDefined(price)};`;
        tmp += subOutput(subscriptions, key, subscriptionOutput, defaultOutput);
        break;
    }
  });
  return tmp;
}

/**
 * return the formatted output of the subscriptions of garageSubscriptionTypes
 */

function handleSubUsers({ users }) {
  let tmp = 'Oui;';
  if (users) {
    const { included, price } = users;
    tmp += `${_checkIfNumberDefined(included)};${_checkIfNumberDefined(price)};`;
  } else {
    tmp += 'Non renseigné;Non renseigné;';
  }
  return tmp;
}

/**
 * return the formatted output of the contact subscription
 */

function handleSubContacts({ contacts }) {
  let tmp = 'Oui;';
  if (contacts) {
    const { bundle, price, included } = contacts;
    tmp += `${_checkIfBooleanDefined(bundle)};${_checkIfNumberDefined(price)};${_checkIfNumberDefined(included)};`;
  } else {
    tmp += 'Non renseigné;Non renseigné;Non renseigné;';
  }
  return tmp;
}

/**
 * [getPerformerEmail return the PerformerEmail, 'Invalide' si l'id n'est pas valide, 'Non renseigné' si il n'y a pas d'id]
 * @return {String} [return an email or 'Invalide' or 'Non renseigné']
 */

function getPerformerEmail(id, performers = []) {
  if (id) {
    let index = performers.findIndex((p) => p.id === id);
    if (index !== -1) return performers[index].email;
    return 'Invalide';
  }
  return 'Non renseigné';
}

/**
 * [getBizDevEmail return the bizDevEmail, 'Invalide' si l'id n'est pas valide, 'Non renseigné' si il n'y a pas d'id]
 * @return {String} [return an email or 'Invalide' or 'Non renseigné']
 */

function getBizDevEmail(id, bizDevs = []) {
  if (id) {
    let index = bizDevs.findIndex((p) => p.id === id);
    if (index !== -1) return bizDevs[index].email;
    return 'Invalide';
  }
  return 'Non renseigné';
}

/**
 * [generateHeaders generate columns based on the headers model for the export garage in CSV]
 * @return {String} [return a valid csv line]
 */
function generateHeaders() {
  return `${HEADERS.join(';')};\r`;
}

/**
 * [generateLines generate lines for the export garage in CSV]
 * @param {[type]} [garageModel] [garages from DB]
 * @return {String} [return a valid csv line with the garage's data]
 */
function generateLines(garages, performers, bizDevs) {
  let lineOutput = '';
  garages.forEach((garage) => {
    const { subscriptions = {} } = garage;
    lineOutput += garage.id ? `${garage.id};` : 'Non renseigné;';
    lineOutput += `${_checkIfDefined(garage.externalId)};`;
    lineOutput += `${_checkIfDefined(GarageTypes.displayName(garage.type))};`;
    lineOutput += `${_checkIfDefined(garage.group)};`;
    lineOutput += `${_checkIfDefined(garage.status)};`;
    lineOutput += `${_checkIfDefined(garage.businessId)};`;
    lineOutput += `${_checkIfDefined(garage.publicDisplayName)};`;
    lineOutput += `${_checkIfDefined(garage.streetAddress)};`;
    lineOutput += `${_checkIfDefined(garage.postalCode)};`;
    lineOutput += `${_checkIfDefined(garage.city)};`;
    lineOutput += `${_checkIfDefined(getLocaleDisplayName(garage.locale))};`;
    lineOutput += `${garage.annexGarageId ? 'Oui' : 'Non'};`;
    lineOutput += `${_checkIfDefined(garage.annexGarageId)};`;
    lineOutput += `${_checkIfDateDefined(subscriptions.dateStart)};`;
    //setup
    lineOutput += handleSubSetup(subscriptions);
    //Maintenance, NewVehicleSale, UsedVehicleSale, VehicleInspection, Lead, Analytics, EReputation, Automation, CrossLeads , Coaching, Connect
    lineOutput += handleSubTypes(subscriptions);
    //users
    lineOutput += handleSubUsers(subscriptions);
    //contacts
    lineOutput += handleSubContacts(subscriptions);
    //brandNames
    lineOutput += `${getBrandNames(garage)};`;

    const { performerId, bizDevId } = garage;
    //Performance Manager
    lineOutput += `${getPerformerEmail(performerId, performers)};`;
    //Business Dev
    lineOutput += `${getBizDevEmail(bizDevId, bizDevs)};`;
    //Tags
    lineOutput += `${getTags(garage)};`;

    lineOutput += '\r';
  });
  return lineOutput;
}

function generateContentCSV(garages, performers, bizDevs) {
  let output = '\ufeff';
  output += generateHeaders();
  output += generateLines(garages, performers, bizDevs);
  return output;
}

/**
 * [getPerformersData get all performers from Users]
 * @param {[type]} userModel [description]
 * @return {[type]} [performer] [return an array of performer {id , email}]
 */
async function getPerformersData(userModel) {
  try {
    const result = await userModel
      .getMongoConnector()
      .find({ isPerfMan: true }, { projection: { _id: true, email: true } })
      .toArray();
    const performersData = result.map(({ _id, email }) => ({ id: _id.toString(), email }));
    return performersData;
  } catch (error) {
    return [];
  }
}

/**
 * [getBizDevData get all bizDevs from Users]
 * @param {[type]} userModel [description]
 * @return {[type]} [bizDev] [return an array of bizDev {id , email}]
 */

async function getBizDevData(userModel) {
  try {
    const result = await userModel
      .getMongoConnector()
      .find({ isBizDev: true }, { projection: { _id: true, email: true } })
      .toArray();
    const bizDevData = result.map(({ _id, email }) => ({ id: _id.toString(), email }));
    return bizDevData;
  } catch (error) {
    return [];
  }
}

/**
 * [exportGarages get all garages]
 * @param {[type]} garageModel [description]
 * @param {[type]} userModel [description]
 * @param {[type]} callBack [description]
 */

async function exportGarages(garageModel, userModel, cb) {
  const fields = {
    type: true,
    subscriptions: true,
    group: true,
    status: true,
    businessId: true,
    publicDisplayName: true,
    streetAddress: true,
    postalCode: true,
    city: true,
    locale: true,
    annexGarageId: true,
    brandNames: true,
    id: true,
    bizDevId: true,
    performerId: true,
    tags: true,
    externalId: true,
  };

  const performers = await getPerformersData(userModel);
  const bizDevs = await getBizDevData(userModel);

  garageModel.find({ fields }, (err, garages) => {
    if (err) {
      cb(err);
      return;
    }
    cb(null, generateContentCSV(garages, performers, bizDevs));
  });
}

module.exports = {
  exportGarages,
  generateContentCSV,
  generateHeaders,
  generateLines,
  getLocaleDisplayName,
  getBrandNames,
  getTags,
  handleSubSetup,
  handleSubTypes,
  handleSubUsers,
  handleSubContacts,
  handleSubAutomation,
  getPerformerEmail,
  getBizDevEmail,
};
