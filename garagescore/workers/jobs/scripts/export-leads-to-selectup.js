const soap = require('soap');
const config = require('config');
const { ObjectId } = require('mongodb');
const app = require('../../../server/server');
const LeadSaleTypes = require('../../../common/models/data/type/lead-sale-types.js');
const { ExternalApi } = require('../../../frontend/utils/enumV2');
const { description, decryptPassword, updateData } = require('./export-leads-common');
const { slackMessage } = require('../../../common/lib/garagescore/cross-leads/util');

//Basculer tous les leads de type « indéfini / autres / ne sait pas » en leads VN
const saleTypes = {
  Maintenance: 'Atelier',
  UsedVehicleSale: 'VO',
  NewVehicleSale: 'VN',
  Unknown: 'VN',
};
// handle caractere '\u0000' decimal equivalent is 00 Char equivalent is NULL.
const _cleanUnicode = (text) => {
  if (/\\u0000/.test(JSON.stringify(text))) {
    return 'Non renseigné';
  }
  return text;
};

const getCustomerNameParts = ({ firstName = '', lastName = '', fullName = '' }) => {
  const defaultOutput = 'Non renseigné';
  let sPrenomE = firstName && firstName.length ? firstName.trim() : defaultOutput;
  let sNomE = lastName && lastName.length ? lastName.trim() : defaultOutput;
  sPrenomE = _cleanUnicode(sPrenomE);
  sNomE = _cleanUnicode(sNomE);
  // si on a un firstName OU un lastName, il ne pas tenir compte du fullName
  if (fullName && fullName.length && sPrenomE === defaultOutput && sNomE === defaultOutput) {
    const splitted = fullName.split(' ');
    const [guessedFirstName, ...guessedLastName] = splitted.length > 1 ? splitted : [defaultOutput, splitted[0]];

    return { sPrenomE: guessedFirstName, sNomE: guessedLastName.join(' ') };
  }

  return { sPrenomE, sNomE };
};

const getSelectupCredentials = (garageSelectupProp, leadType) => {
  const loginKeyByLeadType = {
    [LeadSaleTypes.MAINTENANCE]: 'loginAPV',
    [LeadSaleTypes.NEW_VEHICLE_SALE]: 'loginVN',
    [LeadSaleTypes.USED_VEHICLE_SALE]: 'loginVO',
    [LeadSaleTypes.UNKNOWN]: 'loginVN',
  };

  return {
    login: garageSelectupProp[loginKeyByLeadType[leadType]] || 'testLead1',
    password: garageSelectupProp.password,
  };
};

const getExportLeadsConfiguration = async (garageId, garageSelectupProp) => {
  // configuration don't have model but we can direct connect with this hack
  const configuration = await app.models.Configuration.getMongoConnector().findOne({
    reserved_field_name: 'ExportLeads',
  });
  const findExportLead = configuration.exportLeads.find(({ name }) => name === ExternalApi.SELECTUP);
  const configurations = findExportLead.garages[garageId]
    .filter(({ enabled }) => enabled)
    .map((exportLead) => {
      exportLead.credentials = getSelectupCredentials(garageSelectupProp, exportLead.query.leadType);
      return exportLead;
    });
  return {
    name: ExternalApi.SELECTUP,
    apiUrl: findExportLead.apiUrl,
    configurations: configurations,
  };
};

const formatLeads = (
  lead,
  credentials,
  { family = 'GarageScore', subFamily = 'GarageScore', contactType, emailAlerts = true },
  garageName,
  source
) => {
  const { sPrenomE, sNomE } = getCustomerNameParts(lead);
  const sTelPortableE = lead.telephone ? lead.telephone.replace(/ /g, '').replace('+33', '0') : lead.telephone;
  const review = { rating: { value: lead.score }, comment: { text: lead.comment } };
  // if saleType is null or undefined , NewVehicleSale is used instead.
  if (!lead.saleType) {
    lead.saleType = LeadSaleTypes.NEW_VEHICLE_SALE;
  }
  return {
    // Those ones are for SelectUp API, the actual data that we send
    sLoginE: credentials.login,
    sPasswordE: credentials.password,
    sCiviliteE: _cleanUnicode(lead.title),
    sPrenomE,
    sNomE,
    sAdresse1E: _cleanUnicode(lead.streetAddress),
    sCodePostalE: lead.postCode,
    sVilleE: lead.city,
    sTelPortableE,
    sEmailE: lead.email,
    sCommentaireRapportE: description(lead, review, source, garageName),
    bEnvoyerMailE: emailAlerts,
    sOrigineLeadE: `Intérêt ${saleTypes[lead.saleType]}`,
    sFamilleOrigineLeadE: family,
    sSousFamilleOrigineLeadE: subFamily,
    sCanalOrigineLeadE: lead.email ? 'Email' : 'SMS',
    sActionAFaireE: lead.telephone ? 'Téléphoner' : 'Email',
    iDelaiTraitementE: 12,
    sTypeContactE: contactType || `Projet d'achat ${saleTypes[lead.saleType]}`,
    eTypeLeadE: saleTypes[lead.saleType],
    bEstQualifieE: '0',
    bModifierFicheClientE: '1',
  };
};

const getLead = async (dataId, exportConfiguration) => {
  const sourceTypes = exportConfiguration.configurations.map(({ query }) => query.source);
  const leadSaleTypes = exportConfiguration.configurations.map(({ query }) => query.leadType);
  return app.models.Data.getMongoConnector().findOne(
    {
      _id: ObjectId(dataId),
      'source.type': { $in: sourceTypes },
      'lead.saleType': { $in: leadSaleTypes },
    },
    {
      projection: {
        id: '$_id',
        garageId: '$garageId',
        score: '$review.rating.value',
        comment: '$review.comment.text',
        reportedAt: '$lead.reportedAt',
        saleType: '$lead.saleType',
        status: '$lead.type',
        timing: '$lead.timing',
        knownVehicle: '$lead.knownVehicle',
        tradeIn: '$lead.tradeIn',
        financing: '$lead.financing',
        fullName: '$customer.fullName.value',
        firstName: '$customer.firstName.value',
        lastName: '$customer.lastName.value',
        email: '$customer.contact.email.value',
        telephone: '$customer.contact.mobilePhone.value',
        gender: '$customer.gender.value',
        brand: '$lead.brands',
        model: '$lead.vehicle',
        energyType: '$lead.energyType',
        title: '$customer.title.value',
        streetAddress: '$customer.street.value',
        postCode: '$customer.postalCode.value',
        city: '$customer.city.value',
        campaignId: '$campaign.campaignId',
        currentVehicle: {
          brand: '$vehicle.make.value',
          model: '$vehicle.model.value',
          mileage: '$vehicle.mileage.value',
          firstRegistration: { $year: '$vehicle.registrationDate.value' },
        },
        findCredential: {
          source: '$source.type',
          leadType: '$lead.saleType',
        },
      },
    }
  );
};

const getGarage = async (garageId) => {
  const garage = await app.models.Garage.getMongoConnector().findOne(
    { _id: ObjectId(garageId), 'selectup.enabled': true },
    { projection: { publicDisplayName: true, selectup: true } }
  );

  if (garage) {
    garage.selectup.password = decryptPassword(garage.selectup.password, ExternalApi.SELECTUP);
  } else {
    throw new Error(':: Selectup error no garage found garageId: ' + garageId);
  }

  return garage;
};

/* Exporting leads to SelectUp and returning detailed results */
const exportLeadsToSelectup = async (apiUrl, exportedLead, job) => {
  try {
    // for recette/test, return fake ID
    if (!config.get('publicUrl.app_url') || !config.get('publicUrl.app_url').includes('app.custeed.com')) {
      return {
        iIDClientS: Math.floor(Math.random() * 100000) + 100000,
      };
    }
    const soapClient = await soap.createClientAsync(apiUrl);
    const [response] = await soapClient.CreeLead2Async(exportedLead);
    return response;
  } catch (err) {
    const fault =
      (err.root && err.root.Envelope && err.root.Envelope.Body && err.root.Envelope.Body.Fault) ||
      `job: ${JSON.stringify(job)} :: ` + err.message;
    await slackMessage(fault, ExternalApi.SELECTUP, '#çavapastrop');
  }
};
// executed the job
const exportLeadToSelectup = async (job) => {
  try {
    const { garageId, dataId } = job.payload;
    const garage = await getGarage(garageId);
    const rawConfigurations = await getExportLeadsConfiguration(garageId, garage.selectup);
    const rawLead = await getLead(dataId, rawConfigurations);
    if (!rawLead) {
      return;
    }
    const configurationExport = rawConfigurations.configurations.find(({ query }) => {
      return query.source === rawLead.findCredential.source && query.leadType === rawLead.findCredential.leadType;
    });

    const formatLead = formatLeads(
      rawLead,
      configurationExport.credentials,
      configurationExport.exportedValues,
      garage.publicDisplayName,
      rawConfigurations.source
    );
    // send lead to Selectup
    const response = await exportLeadsToSelectup(rawConfigurations.apiUrl, formatLead, job);
    await updateData(app, dataId, response, ExternalApi.SELECTUP);
  } catch (err) {
    const text = `job: ${JSON.stringify(job)} :: ${err.message}`;
    await slackMessage(text, ExternalApi.SELECTUP, '#çavapastrop');
  }
};

module.exports = {
  exportLeadToSelectup,
};
