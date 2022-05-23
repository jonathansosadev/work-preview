const { promisify } = require('util');
const zoho = require('./zoho-api');
const { ObjectId } = require('mongodb');
const moment = require('moment');
const app = require('../../../server/server.js');
const { getDeepFieldValue } = require('../util/object.js');
const { getUpdate, getLastWeekPeriod, formatZohoDate } = require('./utils');
const { datafilesImports, campaignsCreation } = require('../garagescore/monitoring/data');
const GarageStatus = require('../../models/garage.status.js');
const { getXLeadsStats, getExogenousStats } = require('../garagescore/cross-leads/sources-stats.js');
const SourceTypes = require('../../models/data/type/source-types.js');
const { GaragesTest } = require('../../../frontend/utils/enumV2');
const { SIMON, log } = require('../util/log');
const garageSubscriptionTypes = require('../../models/garage.subscription.type.js');
const KpiDictionary = require('../../lib/garagescore/kpi/KpiDictionary');
const { KpiTypes } = require('../../../frontend/utils/enumV2');

const transformGarage = {
  /** dont forget to add the fields in the find projection + forceFields if we are the only source */
  Account_Name: 'publicDisplayName',
  SIRET: 'businessId',
  Phone: 'phone',
  Billing_City: 'city',
  Billing_Code: 'postalCode',
  Billing_Street: 'streetAddress',
  Billing_State: 'region',
  Billing_Country: 'countryCode',
  Marques_du_portefeuille: 'brandNames',
  EReputation: 'subscriptions.EReputation.enabled',
  M_M: 'M_M',
  M_M_14: 'M_M_14',
  M_M_23: 'M_M_23',
  M_M_26: 'M_M_26',
  M_M_35: 'M_M_35',
  M_UVS: 'M_UVS',
  M_UVS_14: 'M_UVS_14',
  M_UVS_23: 'M_UVS_23',
  M_UVS_26: 'M_UVS_26',
  M_UVS_35: 'M_UVS_35',
  VS_M_11: 'VS_M_11',
  VS_M_12: 'VS_M_12',
  VS_M_6: 'VS_M_6',
  VS_UVS_18: 'VS_UVS_18',
  VS_UVS_24: 'VS_UVS_24',
  evol_date: (g) => {
    const date = getDeepFieldValue(g, 'subscriptions.churnEffectiveDate');
    return date instanceof Date ? moment(date).utc().format('YYYY-MM-DD') : null;
  },
  EReputationPrice: (g) =>
    getDeepFieldValue(g, 'subscriptions.EReputation.enabled')
      ? getDeepFieldValue(g, 'subscriptions.EReputation.price')
      : 0,
  EReputationPrice_evol: (g) => getDeepFieldValue(g, 'subscriptions.EReputation.churn.delta') || 0,
  Lead: 'subscriptions.Lead.enabled',
  LeadPrice: (g) =>
    getDeepFieldValue(g, 'subscriptions.Lead.enabled') ? getDeepFieldValue(g, 'subscriptions.Lead.price') : 0,
  LeadPrice_evol: (g) => getDeepFieldValue(g, 'subscriptions.Lead.churn.delta') || 0,
  UsedVehicleSale: 'subscriptions.UsedVehicleSale.enabled',
  UsedVehicleSalePrice: (g) =>
    getDeepFieldValue(g, 'subscriptions.UsedVehicleSale.enabled')
      ? getDeepFieldValue(g, 'subscriptions.UsedVehicleSale.price')
      : 0,
  UsedVehicleSalePrice_evol: (g) => getDeepFieldValue(g, 'subscriptions.UsedVehicleSale.churn.delta') || 0,
  NewVehicleSale: 'subscriptions.NewVehicleSale.enabled',
  NewVehicleSalePrice: (g) =>
    getDeepFieldValue(g, 'subscriptions.NewVehicleSale.enabled')
      ? getDeepFieldValue(g, 'subscriptions.NewVehicleSale.price')
      : 0,
  NewVehicleSalePrice_evol: (g) => getDeepFieldValue(g, 'subscriptions.NewVehicleSale.churn.delta') || 0,
  Maintenance: 'subscriptions.Maintenance.enabled',
  MaintenancePrice: (g) =>
    getDeepFieldValue(g, 'subscriptions.Maintenance.enabled')
      ? getDeepFieldValue(g, 'subscriptions.Maintenance.price')
      : 0,
  MaintenancePrice_evol: (g) => getDeepFieldValue(g, 'subscriptions.Maintenance.churn.delta') || 0,
  VehicleInspection: 'subscriptions.VehicleInspection.enabled',
  VehicleInspectionPrice: (g) =>
    getDeepFieldValue(g, 'subscriptions.VehicleInspection.enabled')
      ? getDeepFieldValue(g, 'subscriptions.VehicleInspection.price')
      : 0,
  VehicleInspectionPrice_evol: (g) => getDeepFieldValue(g, 'subscriptions.VehicleInspection.churn.delta') || 0,
  Analytics: 'subscriptions.Analytics.enabled',
  AnalyticsPrice: (g) =>
    getDeepFieldValue(g, 'subscriptions.Analytics.enabled') ? getDeepFieldValue(g, 'subscriptions.Analytics.price') : 0,
  AnalyticsPrice_evol: (g) => getDeepFieldValue(g, 'subscriptions.Analytics.churn.delta') || 0,
  Xleads: 'subscriptions.CrossLeads.enabled',
  XleadsPrice: (g) =>
    getDeepFieldValue(g, 'subscriptions.CrossLeads.enabled')
      ? getDeepFieldValue(g, 'subscriptions.CrossLeads.price')
      : 0,
  XleadsPrice_evol: (g) => getDeepFieldValue(g, 'subscriptions.CrossLeads.churn.delta') || 0,
  Automation: 'subscriptions.Automation.enabled',
  AutomationPrice: (g) =>
    getDeepFieldValue(g, 'subscriptions.Automation.enabled')
      ? getDeepFieldValue(g, 'subscriptions.Automation.price')
      : 0,
  AutomationPrice_evol: (g) => getDeepFieldValue(g, 'subscriptions.Automation.churn.delta') || 0,
  debut_abo: (g) => formatZohoDate(getDeepFieldValue(g, 'subscriptions.dateStart') || ''),
  // Here I can't use process.env.APP_URL because those info will be stored in Zoho, so it will remain hardcoded
  Lien_cockpit: (g) => `https://app.custeed.com/cockpit/satisfaction?garageId=${g.id.toString()}`,
  Bizdev: (g, h, p, stats, gc, gi, b) => (b ? `${b.firstName} ${b.lastName}` : 'Non assigné'),
  Rating: (g) => `3. ${GarageStatus.displayName(g.status)}`,
  validEmailPercentage: (g, h) => {
    const value = Math.round(((h.countValidEmails || 0) / (h.totalShouldSurfaceInCampaignStats || 0)) * 10000) / 100;
    return Number.isInteger(value) ? value : 0;
  }, // Taux d'email valide (Last quarter)
  respondentPercentage: (garage, kpiByPeriod) => {
    const value =
      Math.round(((kpiByPeriod.countSurveysResponded || 0) / (kpiByPeriod.countSurveys || 0)) * 10000) / 100;
    return Number.isInteger(value) ? value : 0;
  }, // Taux de répondant (Last quarter)
  recontactPercentage: (garage, kpiByPeriod) => {
    const value =
      Math.round(((kpiByPeriod.countFollowupResponseQid122 || 0) / (kpiByPeriod.countFollowupResponded || 0)) * 10000) /
      100;
    return Number.isInteger(value) ? value : 0;
  }, // Nombre de personne qui ont dit avoir été recontacté (via le followupUnsatisfied) / répondant au followupUnsatisfied (last_quarter)
  leadConversionPercentage: (garage, kpiByPeriod) => {
    const value =
      Math.round(((kpiByPeriod.countConversions || 0) / (kpiByPeriod.countPotentialSales || 0)) * 10000) / 100;
    return Number.isInteger(value) ? value : 0;
  }, // Taux de transformation des leads (12 mois sur last_quarter)
  countValidEmails: (garage, kpiByPeriod) => (kpiByPeriod && kpiByPeriod.countValidEmails) || 0,
  totalShouldSurfaceInCampaignStats: (garage, kpiByPeriod) =>
    (kpiByPeriod && kpiByPeriod.totalShouldSurfaceInCampaignStats) || 0,
  countSurveysResponded: (garage, kpiByPeriod) => (kpiByPeriod && kpiByPeriod.countSurveysResponded) || 0,
  countSurveys: (garage, kpiByPeriod) => (kpiByPeriod && kpiByPeriod.countSurveys) || 0,
  countFollowupResponseQid122: (garage, kpiByPeriod) => (kpiByPeriod && kpiByPeriod.countFollowupResponseQid122) || 0,
  countFollowupResponded: (garage, kpiByPeriod) => (kpiByPeriod && kpiByPeriod.countFollowupResponded) || 0,
  countConversions: (garage, kpiByPeriod) => (kpiByPeriod && kpiByPeriod.countConversions) || 0,
  countPotentialSales: (garage, kpiByPeriod) => (kpiByPeriod && kpiByPeriod.countPotentialSales) || 0,
  MiroirCusteed: (garage) => !!garage.annexGarageId,
  xleads_sources_subscribed: (garage, kpiByPeriod, performer, stats) => {
    // nombre de sources paramètrées
    const stat = stats.find((s) => s.garageId && garage.id && s.garageId.toString() === garage.id.toString());
    if (!stat) return 0;
    let total = 0;
    for (const source of SourceTypes.supportedCrossLeadsSources()) {
      total += !!(stat[`${source}Config`] && stat[`${source}Config`].createdAt);
    }
    return total;
  },
  xleads_sources_email_parsed_last_week: (garage, kpiByPeriod, performer, stats) => {
    // Nombre de sources email avec au moins 1 leads sur les 7 derniers jours
    const stat = stats.find((s) => s.garageId && garage.id && s.garageId.toString() === garage.id.toString());
    if (!stat) return 0;
    let total = 0;
    for (const source of SourceTypes.supportedCrossLeadsSources())
      total += !!(stat[source] && stat[source].Email.Parsed);
    return total;
  },
  xleads_sources_call_parsed_last_week: (garage, kpiByPeriod, performer, stats) => {
    // Nombre de sources tel avec au moins 1 leads sur les 7 derniers jours
    const stat = stats.find((s) => s.garageId && garage.id && s.garageId.toString() === garage.id.toString());
    if (!stat) return 0;
    let total = 0;
    for (const source of SourceTypes.supportedCrossLeadsSources())
      total += !!(stat[source] && stat[source].Call.Parsed);
    return total;
  },
  boolean_fichier_vide: ({ id }, kpiByPeriod, performer, stats, garagesWithoutCampaigns, garagesWithoutImports) =>
    !!garagesWithoutImports[id.toString()],
  date_fichier_vide: ({ id }, kpiByPeriod, performer, stats, garagesWithoutCampaigns, garagesWithoutImports) =>
    (garagesWithoutImports[id.toString()] && garagesWithoutImports[id.toString()].date) || '',
  text_fichier_vide: ({ id }, kpiByPeriod, performer, stats, garagesWithoutCampaigns, garagesWithoutImports) =>
    (garagesWithoutImports[id.toString()] && garagesWithoutImports[id.toString()].job) || '',
  boolean_pas_de_campagne: ({ id }, kpiByPeriod, performer, stats, garagesWithoutCampaigns, garagesWithoutImports) => {
    // No imported files = no campaigns
    return !!(garagesWithoutCampaigns[id.toString()] || garagesWithoutImports[id.toString()]);
  },
  date_pas_de_campagne: ({ id }, kpiByPeriod, performer, stats, garagesWithoutCampaigns, garagesWithoutImports) => {
    if (garagesWithoutCampaigns[id.toString()])
      return (garagesWithoutCampaigns[id.toString()] && garagesWithoutCampaigns[id.toString()].date) || '';
    if (garagesWithoutImports[id.toString()])
      return (garagesWithoutImports[id.toString()] && garagesWithoutImports[id.toString()].date) || '';
  },
  text_pas_de_campagne: ({ id }, kpiByPeriod, performer, stats, garagesWithoutCampaigns, garagesWithoutImports) => {
    if (garagesWithoutCampaigns[id.toString()])
      return (garagesWithoutCampaigns[id.toString()] && garagesWithoutCampaigns[id.toString()].job) || '';
    if (garagesWithoutImports[id.toString()])
      return (garagesWithoutImports[id.toString()] && garagesWithoutImports[id.toString()].job) || '';
  },
  boolean_source_xleads_disable: ({ crossLeadsLast7DaysSourcesDisabled }) => {
    if (crossLeadsLast7DaysSourcesDisabled) {
      const eightDaysAgo = new Date(Date.now() - 1000 * 3600 * 192).getTime();
      const lastReceivedAt = new Date(crossLeadsLast7DaysSourcesDisabled.lastReceivedAt).getTime();
      return lastReceivedAt > eightDaysAgo;
    }
    return false;
  },
  source_xleads_disable: ({ crossLeadsLast7DaysSourcesDisabled }) =>
    (crossLeadsLast7DaysSourcesDisabled && crossLeadsLast7DaysSourcesDisabled.sourcesTypes.join(', ')) || '',
  date_source_xleads_disable: ({ crossLeadsLast7DaysSourcesDisabled }) =>
    (crossLeadsLast7DaysSourcesDisabled &&
      moment(crossLeadsLast7DaysSourcesDisabled.lastReceivedAt).format('YYYY-MM-DD')) ||
    '',
  handleSourcesProperties: (
    source,
    field,
    kpiByPeriod,
    performer,
    stats,
    gwc,
    gwi,
    bizdev,
    garageStat,
    exogenousGarageStats
  ) => {
    const properties = {
      lastCall: () => formatZohoDate(getDeepFieldValue(garageStat, `${source}.Call.receivedAt`)) || null,
      lastEmail: () => formatZohoDate(getDeepFieldValue(garageStat, `${source}.Email.receivedAt`)) || null,
      createdAt: () => formatZohoDate(getDeepFieldValue(garageStat, `${source}Config.createdAt`)) || null,
      error: () => !!getDeepFieldValue(exogenousGarageStats, `${source}.error`),
      connected: () => !!getDeepFieldValue(exogenousGarageStats, `${source}.connected`),
    };
    if (field in properties) {
      return properties[field]();
    }
    return null;
  },
  XleadsSourcesCosts: async (g) => {
    const {
      subscriptions: { [garageSubscriptionTypes.CROSS_LEADS]: subscription },
    } = g;

    if (subscription && subscription.enabled) {
      const sources = await app.models.Garage.getAllSources([g.id]);
      const activeSources = (sources && sources.filter((s) => s.enabled)) || null;
      if (activeSources && activeSources.length > (subscription.included || 0)) {
        const qte = activeSources.length - (subscription.included || 0);
        const price = subscription.unitPrice || 0;
        return qte * price;
      }
    }
    return null;
  },
  UserCosts: async (g) => {
    const {
      id,
      subscriptions: { users },
    } = g;

    if (users && users.price) {
      let nbUsers = 0;
      const garageUsersRaw = await app.models.User.getRealUsersByGarage([id]);
      const garageUsers = garageUsersRaw[id.toString()];

      nbUsers = (garageUsers && garageUsers.length) || 0;
      nbUsers -= users.included || 0;
      nbUsers = nbUsers < 0 ? 0 : nbUsers;

      const total = Number((nbUsers * users.price).toFixed(2));

      if (users.maximumTotalPriceForUsers && total > users.maximumTotalPriceForUsers) {
        return users.maximumTotalPriceForUsers;
      }
      return total;
    }
    return null;
  },
  Coaching: (g) => getDeepFieldValue(g, `subscriptions.Coaching.enabled`) || false,
  CoachingPrice: (g) => getDeepFieldValue(g, `subscriptions.Coaching.price`) || null,
  CoachingPrice_evol: (g) => getDeepFieldValue(g, 'subscriptions.Coaching.churn.delta') || 0,
};
/**
 * crossLeadsLast7DaysSourcesDisabled: { lastReceivedAt:'2021-01-11T13:24:12.000Z' , sourcesTypes: [ leBonCoin, Lacentrale,... ] }
 */
const crossLeadsLast7DaysSourcesDisabled = async () => {
  // retrieve xLeads errors from last 7 days
  const sevenDaysAgo = new Date(Date.now() - 1000 * 3600 * 168);
  const incomingCrossLeadsSourceDisabled = await app.models.IncomingCrossLead.getMongoConnector()
    .aggregate([
      {
        $match: {
          status: 'Error',
          receivedAt: { $gte: sevenDaysAgo },
          error: /is disabled/,
        },
      },
      {
        $group: {
          _id: '$garageId',
          lastReceivedAt: { $first: '$receivedAt' },
          sourcesTypes: { $addToSet: '$sourceType' },
        },
      },
    ])
    .toArray();
  // update garages with crossleads sources disabled
  const promiseUpdatedAll = incomingCrossLeadsSourceDisabled.map(({ _id, lastReceivedAt, sourcesTypes }) => {
    return app.models.Garage.getMongoConnector().updateOne(
      { _id: ObjectId(_id) },
      {
        $set: {
          crossLeadsLast7DaysSourcesDisabled: {
            lastReceivedAt,
            sourcesTypes,
          },
        },
      }
    );
  });

  await Promise.all(promiseUpdatedAll);
};

const garagesWithOnlyAutomation = async () => {
  const { min } = getLastWeekPeriod();
  const garages = await app.models.Garage.getMongoConnector()
    .find(
      {
        'subscriptions.Maintenance.enabled': false,
        'subscriptions.NewVehicleSale.enabled': false,
        'subscriptions.UsedVehicleSale.enabled': false,
        'subscriptions.Lead.enabled': false,
        'subscriptions.EReputation.enabled': false,
        'subscriptions.VehicleInspection.enabled': false,
        'subscriptions.Analytics.enabled': false,
        'subscriptions.CrossLeads.enabled': false,
        'subscriptions.Automation.enabled': true,
        'subscriptions.active': true,
      },
      {
        projection: { _id: 1 },
      }
    )
    .toArray();
  return app.models.DataFile.getMongoConnector()
    .find(
      {
        garageId: { $in: garages.map((garage) => garage._id) },
        createdAt: { $gte: new Date(min.toISOString()) },
      },
      {
        projection: {
          garageId: 1,
          importStatus: 1,
          nbDatasCreated: 1,
        },
      }
    )
    .toArray();
};
/** Get garage from S3 import */
const getGaragesWithoutImports = async () => {
  const { min, max } = getLastWeekPeriod();
  const results = await promisify(datafilesImports)(min, max);
  const typeJob = ['all', 'apv', 'vn', 'vo', 'mixedsales'];
  const { period } = results.errorsCountPerGarage;
  const garages = results.garagesData;
  const garageImportFtp = {};
  const daysCount = Object.keys(results.perDay).length;

  for (const type of typeJob) {
    const count = period[type];
    for (const gId in count) {
      if (gId && garages[gId] && count[gId] >= daysCount) {
        garageImportFtp[gId] = { date: min.format('YYYY-MM-DD'), job: type };
      }
    }
  }
  // garages with only automation, check if import is success or no data created
  const dataFiles = await garagesWithOnlyAutomation();
  for (const file of dataFiles) {
    if (file.importStatus !== 'Complete' || file.nbDatasCreated === 0) {
      garageImportFtp[file.garageId.toString()] = {
        date: min.format('YYYY-MM-DD'),
        job: 'all',
      };
    }
  }

  return garageImportFtp;
};

/** get Garages campaign creation  */
const getGaragesWithoutCampaigns = async () => {
  const { min, max } = getLastWeekPeriod();
  const results = await promisify(campaignsCreation)(min, max);
  const typeJob = ['sales', 'apv'];
  const { period } = results.missingCampaign;
  const campaigns = {};
  for (const type of typeJob) {
    for (const garageId in period[type]) {
      campaigns[garageId] = { date: min.format('YYYY-MM-DD'), job: type };
    }
  }
  return campaigns;
};

const getMissingGaragesDetails = async (zohoGarages) => {
  const missingGarageLogs = [];
  const $nin = [
    ...zohoGarages
      .map((g) => {
        if (!ObjectId.isValid(g.GS_GarageID)) {
          log.error(SIMON, `${g.GS_GarageID} is not a valid ObjectId`);
          return;
        }
        return ObjectId(g.GS_GarageID);
      })
      .filter((garageId) => garageId),
    ...GaragesTest.values()
      .map((id) => ObjectId.isValid(id) && ObjectId(id))
      .filter((garageId) => garageId),
  ];
  const missingGarages = await app.models.Garage.getMongoConnector()
    .find(
      {
        _id: { $nin },
        doNotShowInZohoReport: { $ne: true },
      },
      {
        projection: {
          _id: true,
          publicDisplayName: true,
        },
      }
    )
    .toArray();
  if (missingGarages.length <= 0) return [0, []];
  missingGarageLogs.push('', '');
  missingGarageLogs.push(`${Array.isArray(missingGarages) ? missingGarages.length : 0} GARAGES MANQUANT SUR zoho:`);
  missingGarageLogs.push(...missingGarages.map((g) => `- (${g.id}) ${g.publicDisplayName}`));
  missingGarageLogs.push('', '');
  return [missingGarages.length, missingGarageLogs];
};

async function getGaragesFromDB(garagesToModify) {
  const mongoGarageConnector = await app.models.Garage.getMongoConnector();
  const query = [
    {
      $match: {
        _id: { $in: garagesToModify.map((g) => new ObjectId(g.GS_GarageID)) },
        doNotShowInZohoReport: { $ne: true },
      },
    },
    {
      $project: {
        id: '$_id',
        status: 1,
        publicDisplayName: 1,
        businessId: 1,
        performerId: 1,
        subscriptions: 1,
        phone: 1,
        city: 1,
        postalCode: 1,
        streetAddress: 1,
        region: 1,
        countryCode: 1,
        brandNames: 1,
        annexGarageId: 1,
        crossLeadsLast7DaysSourcesDisabled: 1,
      },
    },
    {
      $lookup: {
        from: 'automationCampaign',
        localField: '_id',
        foreignField: 'garageId',
        as: 'automationCampaign',
      },
    },
  ];
  return mongoGarageConnector.aggregate(query).toArray();
}

async function getKpisForGarage(garageMongo) {
  const ifNull = (field) => ({ $ifNull: [`$${field}`, 0] });
  const add = (fields) => ({ $add: fields.map((field) => ifNull(field)) });
  const mongo = app.models.KpiByPeriod.getMongoConnector();
  const $match = {
    [KpiDictionary.period]: 10,
    [KpiDictionary.garageId]: garageMongo.id,
    [KpiDictionary.kpiType]: KpiTypes.GARAGE_KPI,
  };

  const $project = {
    garageId: ifNull(KpiDictionary.garageId),
    countValidEmails: ifNull(KpiDictionary.contactsCountValidEmails),
    totalShouldSurfaceInCampaignStats: ifNull(KpiDictionary.contactsCountTotalShouldSurfaceInCampaignStats),
    countSurveysResponded: ifNull(KpiDictionary.contactsCountSurveysResponded),
    countSurveys: ifNull(KpiDictionary.contactsCountReceivedSurveys),
    countConversions: add([KpiDictionary.countConvertedLeads, KpiDictionary.countConvertedTradeIns]),
    countPotentialSales: ifNull(KpiDictionary.countLeads),
    countFollowupResponded: ifNull(KpiDictionary.countUnsatisfiedFollowupResponded),
    countFollowupResponseQid122: ifNull(KpiDictionary.countUnsatisfiedFollowupRecontacted),
  };

  const kpiByPeriods = await mongo.aggregate([{ $match }, { $project }]).toArray();

  return kpiByPeriods.length > 0 ? kpiByPeriods[0] : null;
}

const handleGarageModifications = async (garagesToModify = []) => {
  const updates = [];

  const garagesFromMongo = await getGaragesFromDB(garagesToModify);

  const stats = await getXLeadsStats(); // XLEADS STATS - [NEW]
  const exogenousStats = await getExogenousStats();
  /** ---------------------------------------- DATAFILE AND CAMPAIGN STATUS ---------------------------------------- */
  const garagesWithoutImports = await getGaragesWithoutImports();
  zoho.addlogs('retrieve garage from datafilesImports done! ', Object.keys(garagesWithoutImports).length);
  const garagesWithoutCampaigns = await getGaragesWithoutCampaigns();
  zoho.addlogs('retrieve garage from campaignCreation done! ', Object.keys(garagesWithoutCampaigns).length);
  for (const garageZoho of garagesToModify) {
    const garageMongo = garagesFromMongo.find((g) => g.id.toString() === garageZoho.GS_GarageID);
    if (garageMongo) {
      garageMongo.automationCampaign.forEach((campaign) => (garageMongo[campaign.target] = campaign.status));
      const { _id, performerId, bizDevId } = garageMongo;

      const history = await getKpisForGarage(garageMongo);

      const performer = performerId
        ? await app.models.User.findById(performerId, {
            fields: {
              firstName: 1,
              lastName: 1,
            },
          })
        : null;
      const bizdev = bizDevId
        ? await app.models.User.findById(bizDevId, {
            fields: {
              firstName: 1,
              lastName: 1,
            },
          })
        : null;
      const garageStat = stats.find(({ garageId = '' }) => garageId && _id && garageId.toString() === _id.toString());
      const exogenousGarageStats = exogenousStats.find((s) => s._id && _id && s._id.toString() === _id.toString());
      const zohoFields = Object.keys(garageZoho);
      let updateFields = await Promise.all(
        zohoFields.map(async (field) => {
          try {
            const update = await getUpdate(
              transformGarage,
              field,
              garageZoho,
              garageMongo,
              history,
              performer,
              stats,
              garagesWithoutCampaigns,
              garagesWithoutImports,
              bizdev,
              garageStat,
              exogenousGarageStats,
              exogenousStats
            );
            if (!update) return null;
            if (update.field === 'SIRET' && update.oldValue) {
              // Skip update for SIRET
              zoho.addlogs(
                `<-- GS ${field} (${garageMongo.id.toString()}) "${update.newValue}". Zoho (${garageZoho.id}) "${
                  update.oldValue
                }"`
              );
              return null;
            }

            return update;
          } catch (e) {
            console.error(
              `handleGarageModifications error for garage : ${garageMongo.id.toString()} : ${e} more details here:`
            );
            console.error(e);
            return null;
          }
        })
      );
      updateFields = updateFields.filter((obj) => obj);
      if (updateFields.length > 0) {
        updates.push({
          id: garageZoho.id,
          last_api_update: formatZohoDate(new Date()),
          ...updateFields.reduce((acc, update) => {
            acc[update.field] = update.newValue;
            return acc;
          }, {}),
        });
      }
    }
  }
  return updates;
};

module.exports = {
  crossLeadsLast7DaysSourcesDisabled,
  handleGarageModifications,
  getMissingGaragesDetails,
};
