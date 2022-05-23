const axios = require('axios');
const config = require('config');
const { ObjectId } = require('mongodb');
const app = require('../../../server/server');
const crypto = require('../../../common/lib/util/crypto');
const { GarageTypes, DataTypes, SourceTypes, ExternalApi } = require('../../../frontend/utils/enumV2');
const { description, updateData } = require('./export-leads-common');
const { slackMessage } = require('../../../common/lib/garagescore/cross-leads/util');

const decryptPassword = (rawPassword) => {
  const [secretKey, alg] = config.has('salesforce.cryptoAlgo') && config.get('salesforce.cryptoAlgo').split('.');
  if (!secretKey || !alg) {
    return rawPassword;
  }
  return crypto.decrypt(rawPassword, alg, secretKey);
};

// test API saleForce
const getStatus = async (apiUrl, salesforce) => {
  try {
    const url = apiUrl + '/status';
    const options = {
      headers: {
        client_id: salesforce.clientId,
        client_secret: salesforce.clientSecret,
      },
    };
    const response = await axios.get(url, options);
    return response && response.data;
  } catch (err) {
    throw new Error(err.response);
  }
};

const getOutlets = async (apiUrl, salesforce) => {
  try {
    const url = apiUrl + '/outlets';
    const options = {
      headers: {
        client_id: salesforce.clientId,
        client_secret: salesforce.clientSecret,
        user: salesforce.user,
        pw: salesforce.pw,
        token: salesforce.token,
      },
    };
    const response = await axios.get(url, options);
    return response && response.data;
  } catch (err) {
    throw new Error(err.response);
  }
};

const getUsersWithOutlets = async (apiUrl, salesforce) => {
  try {
    const url = apiUrl + '/usersWithOutlets';
    const options = {
      headers: {
        client_id: salesforce.clientId,
        client_secret: salesforce.clientSecret,
        user: salesforce.user,
        pw: salesforce.pw,
        token: salesforce.token,
      },
    };
    const response = await axios.get(url, options);
    return response && response.data;
  } catch (err) {
    throw new Error(err.response);
  }
};

const postNewLead = async (apiUrl, salesforce, lead) => {
  try {
    const url = apiUrl + '/leads/newLead';
    const options = {
      headers: {
        client_id: salesforce.clientId,
        client_secret: salesforce.clientSecret,
        user: salesforce.user,
        pw: salesforce.pw,
        token: salesforce.token,
      },
    };

    // for recette/test, return fake response
    if (!config.get('publicUrl.app_url') || !config.get('publicUrl.app_url').includes('app.custeed.com')) {
      return { success: true, status: null, message: '', leadID: '00Q7a000008dBqlEAE' };
    }

    const response = await axios.post(url, lead, options);
    return response && response.data;
  } catch (err) {
    throw new Error(err.response);
  }
};

const getLeadfromApi = async (apiUrl, salesforce, leadId) => {
  try {
    const url = apiUrl + '/leads/' + leadId;
    const config = {
      headers: {
        client_id: salesforce.clientId,
        client_secret: salesforce.clientSecret,
        user: salesforce.user,
        pw: salesforce.pw,
        token: salesforce.token,
        leadID: leadId,
      },
    };
    const response = await axios.get(url, config);
    return response && response.data;
  } catch (err) {
    throw new Error(err.response);
  }
};

const _isValidOutlet = (outlets, garageOutletId) => {
  const isFindOutlet = outlets.find(({ outletID }) => outletID === garageOutletId);
  return !!isFindOutlet;
};

const checkOutlets = async (garage, jopId) => {
  const outlets = await getOutlets(garage.salesforce.urlApi, garage.salesforce);
  if (!outlets || outlets.length === 0) {
    const text = `Outlets is empty: ${outlets.length}`;
    await slackMessage(text, 'SalesForce', '#çavapastrop');
    throw new Error(text);
  }
  const isValidOutlet = _isValidOutlet(outlets, garage.salesforce.outletId);
  if (!isValidOutlet) {
    const text = `SalesForce API:: ${garage.publicDisplayName} | ${garage._id}, l'outletId : ${garage.salesforce.outletId} n'existe plus - jobId: ${jopId}`;
    await slackMessage(text, 'SalesForce', '#çavapastrop');
    throw new Error(text);
  }
};

const getGarage = async (garageId) => {
  const garage = await app.models.Garage.getMongoConnector().findOne(
    { _id: ObjectId(garageId), 'salesforce.enabled': true },
    { projection: { publicDisplayName: true, salesforce: true, ticketsConfiguration: true } }
  );

  if (garage) {
    garage.salesforce.clientSecret = decryptPassword(garage.salesforce.clientSecret);
    garage.salesforce.pw = decryptPassword(garage.salesforce.pw);
    garage.salesforce.token = decryptPassword(garage.salesforce.token);
  } else {
    throw new Error(':: saleforce error no garage found garageId: ' + garageId);
  }

  return garage;
};

const getData = async (dataId, allowedSourceTypes) => {
  const data = await app.models.Data.getMongoConnector().findOne(
    {
      _id: ObjectId(dataId),
      'source.type': { $in: allowedSourceTypes },
    },
    {
      projection: {
        _id: true,
        garageId: true,
        garageType: true,
        customer: true,
        source: true,
        leadTicket: true,
        review: true,
        leadExports: true,
      },
    }
  );

  if (!data) {
    throw new Error(':: saleforce error no data found dataId: ' + dataId);
  }

  return data;
};

const getUsers = async (ticketsConfiguration) => {
  const userIds = Object.keys(ticketsConfiguration).map((key) => ticketsConfiguration[key]);
  return app.models.User.getMongoConnector()
    .find({ _id: { $in: userIds.map((uId) => ObjectId(uId)) } })
    .project({ _id: true, email: true, garageIds: true })
    .toArray();
};
/*******************************************************
 * private function to create leads to the Salesforce BMW API
 *******************************************************/
const _setSaleType = (saleType) => {
  switch (saleType) {
    case DataTypes.NEW_VEHICLE_SALE:
      return 'New';
    case DataTypes.USED_VEHICLE_SALE:
      return 'Used';
    default:
      return 'New';
  }
};

const _setInterestVehicleBrand = (brand) => {
  if (/BMW i/i.test(brand)) {
    return 'BMW i';
  }
  if (/BMW/i.test(brand)) {
    return 'BMW';
  }
  if (/MINI/i.test(brand)) {
    return 'MINI';
  }
  return 'No Active Vehicle';
};

const _carClassification = (garageType) => {
  switch (garageType) {
    case GarageTypes.DEALERSHIP:
      return 'Car';
    case GarageTypes.MOTORBIKE_DEALERSHIP:
      return 'Motorcycle';
    default:
      return 'Car';
  }
};

const _salution = (gender) => {
  switch (gender) {
    case 'M':
      return 'Mr.';
    case 'F':
      return 'Mrs.';
    default:
      return 'Mr.';
  }
};
/**
 * Parse street number like: "287 Rue Des Trois Chatels" -> 287
 * @param { String } street
 * @returns { Number }
 */
const _parseStreetNumber = (street) => {
  if (!street) {
    return '';
  }
  const number = street.match(/[0-9]+/);
  return (number && number[0]) || '';
};
/**
 * Parse street name like: "287 Rue Des Trois Chatels" -> "Rue Des Trois Chatels"
 * @param { String } street
 * @returns { String }
 */
const _parseStreetName = (street) => {
  if (!street) {
    return '';
  }
  return street.replace(/\d/g, '').trim();
};
// no comment -_-
const LEADS_SOURCES = [
  'LeBonCoin',
  'LaCentrale',
  'Largus',
  'ParuVendu',
  'CustomVo',
  'CustomVn',
  'CustomApv',
  'Promoneuve',
  'OuestFranceAuto',
  'Zoomcar',
  'EkonsilioVo',
  'EkonsilioVn',
];

const _setLeadSource = (sourceType) => {
  // handle **** xleads source
  if (LEADS_SOURCES.includes(sourceType)) {
    return 'Car Market';
  }
  const category = SourceTypes.getProperty(sourceType.toUpperCase(), 'category');
  if (category === 'XLEADS') {
    return 'Car Market';
  }
  if ([SourceTypes.DATAFILE, SourceTypes.MANUAL_LEAD].includes(sourceType)) {
    return 'Aftersales Request for NC/UC';
  }
  return 'Other';
};
// return date in this format '2019-09-05T09:55:00',
const _setLeadCreationDate = (createdAt) => {
  const date = new Date(createdAt);
  return date.toISOString().split('.')[0];
};

const _mappingFields = (data, garage, users, usersWithOutlets) => {
  const { customer, source, leadTicket, review } = data;
  const usersEmail = users
    .filter(({ garageIds }) => garageIds && garageIds.map((g) => g.toString()).includes(data.garageId))
    .map((u) => u.email);
  const outletUser = usersWithOutlets.find(({ userEmail }) => usersEmail.includes(userEmail));

  return {
    lastName: (customer.lastName && customer.lastName.value) || 'not answered',
    customerMainType: 'Individual', // Enum [ Individual, Self-Employed, Organization ]
    companyName: garage.salesforce.outletName,
    salutation: (customer.gender && _salution(customer.gender.value)) || 'Mr.',
    firstName: (customer.firstName && customer.firstName.value) || '',
    secondLastName: '', // we don't have this field -> Parameter can be used as name suffix or as second last name (for the Spanish market).
    mobilePhone: (customer.contact.mobilePhone && customer.contact.mobilePhone.value) || '',
    email: (customer.contact.email && customer.contact.email.value) || '',
    privateAddressStreet: customer.street && _parseStreetName(customer.street.value),
    privateAddressStreetNumber: customer.street && _parseStreetNumber(customer.street.value),
    privateAddressPostalCode: (customer.postalCode && customer.postalCode.value) || '',
    privateAddressCity: (customer.city && customer.city.value) || '',
    privateAddressCountry: (customer.countryCode && customer.countryCode.value) || 'FR',
    privateAddressState: 'unknown', // ENUM [unknown, FR_HDF, FR_COR, FR_IDF,] but we don't have this field
    privateAddressComplement: '', // we don't have this field -> Parameter currently used only for the Spanish market.
    businessAddressStreet: '', // Parameters must be set for qualifying organizational and self-employed leads.
    businessAddressStreetNumber: '', // Parameters must be set for qualifying organizational and self-employed leads.
    businessAddressPostalCode: '', // Parameters must be set for qualifying organizational and self-employed leads.
    businessAddressCity: '', // Parameters must be set for qualifying organizational and self-employed leads.
    businessAddressComplement: '', // Parameters must be set for qualifying organizational and self-employed leads.
    leadSource: _setLeadSource(source.type),
    leadDescription: description(leadTicket, review, source.type, garage.publicDisplayName), // leadTicket.message || leadTicket.comment || (review && review.comment.text) || '',
    leadComment: leadTicket.message || leadTicket.comment || (review && review.comment.text) || '',
    leadContextWholesale: '', // we don't have this field
    leadSourceType: 'Online', // Enum [ Online, Offline ]
    sourceSystem: 'External Lead Mgmt. System', // Parameter is set to "Ext. Lead Mgmt. Sys." by default,
    recordType: 'General Request', // Enum [ Campaign Member Response, Car Configurator, General Request, Quote Request, Request Test Drive, Aftersales ]
    leadCreationDate: _setLeadCreationDate(leadTicket.createdAt),
    campaignName: '',
    campaignNumberAftersales: '', // we don't have this field
    interestVehicleClassification: _carClassification(data.garageType), // 'Car',
    interestVehicleType: _setSaleType(leadTicket.saleType), // Enum [ New, Used ]
    interestVehicleBrand: _setInterestVehicleBrand(leadTicket.brandModel) || '', // Enum [ No Active Vehicle, BMW, BMW i, MINI ]
    interestVehicleDescription: description(leadTicket, review, source.type, garage.publicDisplayName), //leadTicket.message || leadTicket.comment || (review && review.comment.text) || '', // Parameter is only considered, if "BMW", "MINI" and "BMW i" is selected as vehicle brand.
    interestVehicleConfigurationDeepLink: leadTicket.adUrl || '', // we don't have this field
    outletID: garage.salesforce.outletId, // Parameter must match a valid user-outlet-relationship and therefore it must match the parameter assignedPersonID.
    assignedPersonID: (outletUser && outletUser.userID) || '',
    sourceSystemKey: data._id,
  };
};

const sendLeadToSalesforce = async (job) => {
  try {
    const { garageId, dataId } = job.payload;
    // 1. get need informations for send our lead
    const garage = await getGarage(garageId);
    const data = await getData(dataId, garage.salesforce.allowedSourceTypes);
    const users = await getUsers(garage.ticketsConfiguration);
    const usersWithOutlets = await getUsersWithOutlets(garage.salesforce.urlApi, garage.salesforce);
    // 2. check if current outlet is valid, send slack alert if invalid
    await checkOutlets(garage, job._id);
    // 3. mapping our fields with API fields
    const leadToSend = _mappingFields(data, garage, users, usersWithOutlets);
    // 4. send to API
    const response = await postNewLead(garage.salesforce.urlApi, garage.salesforce, leadToSend);
    // 5. save response on data
    await updateData(app, dataId, response, ExternalApi.SALESFORCE);
  } catch (err) {
    // slend slack error
    const jobId = job._id.toString();
    const text = `SalesForce API:: error on jobId: ${jobId} - ${err.message}`;
    await slackMessage(text, ExternalApi.SALESFORCE, '#çavapastrop');
    throw new Error(text);
  }
};

module.exports = {
  getStatus,
  getOutlets,
  sendLeadToSalesforce,
  getLeadfromApi,
};
