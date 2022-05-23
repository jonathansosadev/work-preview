const config = require('config');
const { ObjectId } = require('mongodb');
const crypto = require('../../../common/lib/util/crypto');
const { ExternalApi, TicketActionNames } = require('../../../frontend/utils/enumV2');
const I18nRequire = require('../../../common/lib/garagescore/i18n/i18n.js');
const i18nSelectup = new I18nRequire('data/selectup/selectup');
const i18nLeadSaleTypes = new I18nRequire('data/type/lead-sale-types');
const i18nLeadFinancingTypes = new I18nRequire('data/type/lead-financing-types');
const i18nLeadTypes = new I18nRequire('data/type/lead-types');
const i18nLeadTradeInsTypes = new I18nRequire('data/type/lead-trade-ins-types');
const i18nBodyTypes = new I18nRequire('data/type/body-types');

const _energy = (gsEnergy) => {
  switch (gsEnergy) {
    case 'fuel':
      return 'Essence';
    case 'diesel':
      return 'Diesel';
    case 'electric':
      return 'Electrique';
    case 'hybrid':
      return 'Hybride';
    case 'pluginHybrid':
      return 'Hybride rechargeable';
    case 'unknown':
      return '';
    default:
      return '';
  }
};

const _transformEnergy = (energies) => {
  if (!energies || !Array.isArray(energies)) return 'Non défini';
  return energies
    .map(_energy)
    .filter((e) => e)
    .join(', ');
};

const _formatCurrentVehicle = ({ brand, model }) => {
  if (brand && model) return `${brand} ${model}`;
  else if (brand || model) return `${brand || model}`;
  else return `Non renseigné`;
};

const description = (leadTicket, review, source, garageName) => {
  const {
    status,
    saleType,
    timing,
    brand,
    model,
    bodyType,
    energyType,
    financing,
    tradeIn,
    currentVehicle = { brand: '', model: '' },
  } = leadTicket;
  const score = (review && review.rating && review.rating.value) || 0;
  const comment = (review && review.comment && review.comment.text) || '';

  let result = `Etablissement concerné : ${garageName} \nModèle possédé : ${_formatCurrentVehicle(currentVehicle)}\n`;

  if (saleType === 'Maintenance') {
    result += 'Type de demande : Prise de RDV\nDemande urgente : Oui\n';
  }

  if (source === 'Automation') {
    return result;
  }

  result +=
    'Voici les informations déclarées par le client: \n' +
    `\nDernier commentaire client: ${score}/10 - ${comment}` +
    `\nEtat du projet: ${i18nLeadTypes.$t(status)}` +
    `\nType: ${i18nLeadSaleTypes.$t(saleType) || i18nSelectup.$t('Unknown')}` +
    `\nEchéance: ${i18nSelectup.$t(timing) || i18nSelectup.$t('NotDefined')}` +
    (Array.isArray(brand) ? `\nMarques: ${brand.join(', ')}` : `\nModèle: ${model || i18nSelectup.$t('Unknown')}`) +
    `\nCarrosserie: ` +
    (Array.isArray(bodyType)
      ? bodyType.map((type) => i18nBodyTypes.$t(type)).join(', ')
      : i18nSelectup.$t('NotDefined')) +
    `\nEnergie: ${_transformEnergy(energyType)}` +
    `\nFinancement: ${i18nLeadFinancingTypes.$t(financing) || i18nSelectup.$t('Unknown')}` +
    `\nReprise: ${i18nLeadTradeInsTypes.$t(tradeIn) || i18nSelectup.$t('Unknown')}`;

  return result;
};

const decryptPassword = (rawPassword, apiName) => {
  let alg = null;
  let secretKey = null;
  if (apiName === ExternalApi.SELECTUP) {
    alg = config.has('selectup.algo') && config.get('selectup.algo');
    secretKey = config.has('selectup.cryptoKey') && config.get('selectup.cryptoKey');
  }
  if (apiName === ExternalApi.SALESFORCE) {
    [secretKey, alg] = config.has('salesforce.cryptoAlgo') && config.get('salesforce.cryptoAlgo').split('.');
  }
  if (!secretKey || !alg) {
    return rawPassword;
  }
  return crypto.decrypt(rawPassword, alg, secretKey);
};

const updateData = async (app, dataId, response, apiName) => {
  const data = await app.models.Data.getMongoConnector().findOne(
    { _id: ObjectId(dataId.toString()) },
    { projection: { leadTicket: 1, leadExports: 1 } }
  );
  const date = new Date();
  const lastActionHero = data.leadTicket.actions[data.leadTicket.actions.length - 1];
  lastActionHero.createdAt = date;
  let $set = {};
  let $push = {};
  let needUpdate = false;

  if (apiName === ExternalApi.SELECTUP && response) {
    needUpdate = true;
    $set = { 'leadExports.selectup.isRequestSuccess': response && !!response.iIDClientS };
    $push = { 'leadExports.selectup.request': { response: response, sendAt: date } };
    lastActionHero.name = TicketActionNames.SEND_API_SELECTUP;
    lastActionHero.comment = response.iIDClientS;
    $push['leadTicket.actions'] = lastActionHero;
  }

  if (apiName === ExternalApi.SALESFORCE && response) {
    needUpdate = true;
    $set = { 'leadExports.salesforce.isRequestSuccess': response && response.success };
    $push = { 'leadExports.salesforce.request': { response: response, sendAt: date } };
    lastActionHero.name = TicketActionNames.SEND_API_SALESFORCE;
    lastActionHero.comment = response.leadID;
    $push['leadTicket.actions'] = lastActionHero;
  }

  if (apiName === ExternalApi.DAIMLER && response) {
    needUpdate = true;
    $set = { 'leadExports.daimler.isRequestSuccess': response && response.success };
    $push = { 'leadExports.daimler.request': { response: response, sendAt: date } };
    lastActionHero.name = TicketActionNames.SEND_LEAD_BY_EMAIL;
    lastActionHero.comment = response.name;
    $push['leadTicket.actions'] = lastActionHero;
  }

  if (needUpdate) {
    return app.models.Data.getMongoConnector().updateOne(
      { _id: ObjectId(dataId.toString()) },
      { $push: $push, $set: $set }
    );
  }
};

module.exports = {
  description,
  decryptPassword,
  updateData,
};
