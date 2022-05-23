/**
 * Update generalStats in the Configuration collection
 * A precomputed list of values representing top and average of values through periods
 */
const { promisify } = require('util');
const moment = require('moment');

const app = require('../../../server/server');
const { log, FED } = require('../../../common/lib/util/log');

const CronRunner = require('../../../common/lib/cron/runner');
const garageTypes = require('../../../common/models/garage.type');
const dataTypes = require('../../../common/models/data/type/data-types');
const automationTypes = require('../../../common/models/automation-campaign.type');

const GarageHistoryPeriod = require('../../../common/models/garage-history.period');
const KpiDictionary = require('../../../common/lib/garagescore/kpi/KpiDictionary');
const KpiPeriods = require('../../../common/lib/garagescore/kpi/KpiPeriods');
const KpiTypes = require('../../../common/models/kpi-type');

let directMongoKpi = null;
const topLimit = 200;

const dTypes = [dataTypes.NEW_VEHICLE_SALE, dataTypes.USED_VEHICLE_SALE, dataTypes.MAINTENANCE, null];
const lTypes = [...dTypes, dataTypes.UNKNOWN];

const getSuffixedKpiKey = (key, type) => {
  /** Returns the KpiDictionary translation of the requested key with the given type
   * Ex: with key: countUnsatisfied and type: NEW_VEHICLE_SALE => countUnsatisfiedVn => 10301
   */
  const typeToSuffix = {
    [dataTypes.MAINTENANCE]: 'Apv',
    [dataTypes.NEW_VEHICLE_SALE]: 'Vn',
    [dataTypes.USED_VEHICLE_SALE]: 'Vo',
    [automationTypes.AUTOMATION_MAINTENANCE]: 'Apv',
    [automationTypes.AUTOMATION_VEHICLE_SALE]: 'Sales',
    [automationTypes.AUTOMATION_NEW_VEHICLE_SALE]: 'Vn',
    [automationTypes.AUTOMATION_USED_VEHICLE_SALE]: 'Vo',
  };
  if (!type || !(type in typeToSuffix)) return KpiDictionary[key];
  return KpiDictionary[`${key}${typeToSuffix[type]}`];
};

async function getUnsatisfiedStat(garageList, period, keyName, desc, type) {
  const periods = KpiPeriods.fromGhPeriodToKpiPeriod(period.id, { convertToMonthlyList: true });
  const $matchPeriod = Array.isArray(periods) ? { $in: periods } : periods;
  const $match = {
    [KpiDictionary.garageId]: { $in: garageList.map((g) => g.id) },
    [KpiDictionary.kpiType]: KpiTypes.GARAGE_KPI,
    [KpiDictionary.period]: $matchPeriod,
    [getSuffixedKpiKey('countUnsatisfied', type)]: { $gt: 0 },
  };
  const $project = {
    garageId: `$${KpiDictionary.garageId}`,
    countUnsatisfied: `$${getSuffixedKpiKey('countUnsatisfied', type)}`,
    [keyName]: `$${getSuffixedKpiKey(keyName, type)}`,
  };
  const $group = {
    _id: '$garageId',
    total: { $sum: { $ifNull: ['$countUnsatisfied', 0] } },
    count: { $sum: { $ifNull: [`$${keyName}`, 0] } },
  };
  const $project2 = {
    _id: true,
    total: true,
    count: true,
    rate: { $divide: [{ $sum: '$count' }, { $sum: '$total' }] },
  };
  const $sort = { rate: desc ? -1 : 1 };
  const $limit = topLimit;
  const $group2 = {
    _id: null,
    count: { $sum: '$count' },
    total: { $sum: '$total' },
  };
  const $project3 = {
    count: { $sum: '$count' },
    total: { $sum: '$total' },
    rate: { $multiply: [100, { $divide: ['$count', '$total'] }] },
  };

  const query = {
    top: [
      { $match },
      { $project },
      { $group },
      { $project: $project2 },
      { $sort },
      { $limit },
      { $group: $group2 },
      { $project: $project3 },
    ],
    allGarages: [
      { $match },
      { $project },
      { $group },
      { $project: $project2 },
      { $sort },
      { $group: $group2 },
      { $project: $project3 },
    ],
  };

  // Getting Aggregation Result Directly From MongoDB
  const top = await directMongoKpi.aggregate(query.top).toArray();
  const allGarages = await directMongoKpi.aggregate(query.allGarages).toArray();
  return {
    top: top && top[0],
    allGarages: allGarages && allGarages[0],
  };
}

async function getLeadsStat(garageList, period, keyName, desc, type) {
  const periods = KpiPeriods.fromGhPeriodToKpiPeriod(period.id, { convertToMonthlyList: true });
  const $matchPeriod = Array.isArray(periods) ? { $in: periods } : periods;
  const $match = {
    [KpiDictionary.garageId]: { $in: garageList.map((g) => g.id) },
    [KpiDictionary.kpiType]: KpiTypes.GARAGE_KPI,
    [KpiDictionary.period]: $matchPeriod,
    [getSuffixedKpiKey('countLeads', type)]: { $gt: 0 },
  };
  const $project = {
    garageId: `$${KpiDictionary.garageId}`,
    countLeads: `$${getSuffixedKpiKey('countLeads', type)}`,
    [keyName]: `$${getSuffixedKpiKey(keyName, type)}`,
  };
  const $group = {
    _id: '$garageId',
    total: { $sum: { $ifNull: ['$countLeads', 0] } },
    count: { $sum: { $ifNull: [`$${keyName}`, 0] } },
  };
  const $project2 = {
    _id: true,
    total: true,
    count: true,
    rate: { $divide: [{ $sum: '$count' }, { $sum: '$total' }] },
  };
  const $sort = { rate: desc ? -1 : 1 };
  const $limit = topLimit;
  const $group2 = {
    _id: null,
    count: { $sum: '$count' },
    total: { $sum: '$total' },
  };
  const $project3 = {
    count: { $sum: '$count' },
    total: { $sum: '$total' },
    rate: { $multiply: [100, { $divide: ['$count', '$total'] }] },
  };

  const query = {
    top: [
      { $match },
      { $project },
      { $group },
      { $project: $project2 },
      { $sort },
      { $limit },
      { $group: $group2 },
      { $project: $project3 },
    ],
    allGarages: [
      { $match },
      { $project },
      { $group },
      { $project: $project2 },
      { $sort },
      { $group: $group2 },
      { $project: $project3 },
    ],
  };

  // Getting Aggregation Result Directly From MongoDB
  const top = await directMongoKpi.aggregate(query.top).toArray();
  const allGarages = await directMongoKpi.aggregate(query.allGarages).toArray();
  return {
    top: top && top[0],
    allGarages: allGarages && allGarages[0],
  };
}

async function getRespondents(garageList, period, type) {
  // contactsCountReceivedSurveys + contactsCountScheduledContacts
  const periods = KpiPeriods.fromGhPeriodToKpiPeriod(period.id, { convertToMonthlyList: true });
  const $matchPeriod = Array.isArray(periods) ? { $in: periods } : periods;
  const $match = {
    [KpiDictionary.garageId]: { $in: garageList.map((g) => g.id) },
    [KpiDictionary.kpiType]: KpiTypes.GARAGE_KPI,
    [KpiDictionary.period]: $matchPeriod,
    $or: [
      { [getSuffixedKpiKey('contactsCountReceivedSurveys', type)]: { $gt: 0 } },
      { [getSuffixedKpiKey('contactsCountScheduledContacts', type)]: { $gt: 0 } },
    ],
  };

  const $project = {
    garageId: `$${KpiDictionary.garageId}`,
    count: { $ifNull: [`$${getSuffixedKpiKey('contactsCountSurveysResponded', type)}`, 0] },
    total: {
      $add: [
        { $ifNull: [`$${getSuffixedKpiKey('contactsCountReceivedSurveys', type)}`, 0] },
        { $ifNull: [`$${getSuffixedKpiKey('contactsCountScheduledContacts', type)}`, 0] },
      ],
    },
  };

  const $group = {
    _id: '$garageId',
    count: { $sum: '$count' },
    total: { $sum: '$total' },
  };
  const $project2 = {
    garageId: true,
    count: true,
    total: true,
    rate: { $cond: [{ $gt: ['$total', 0] }, { $divide: ['$count', '$total'] }, 0] },
  };
  const $sort = { rate: -1 };
  const $limit = topLimit;
  const $group2 = {
    _id: null,
    count: { $sum: '$count' },
    total: { $sum: '$total' },
  };
  const $project3 = {
    count: { $sum: '$count' },
    total: { $sum: '$total' },
    rate: { $multiply: [100, { $cond: [{ $gt: ['$total', 0] }, { $divide: ['$count', '$total'] }, 0] }] },
  };

  const query = {
    top: [
      { $match },
      { $project },
      { $group },
      { $project: $project2 },
      { $sort },
      { $limit },
      { $group: $group2 },
      { $project: $project3 },
    ],
    allGarages: [
      { $match },
      { $project },
      { $group },
      { $project: $project2 },
      { $sort },
      { $group: $group2 },
      { $project: $project3 },
    ],
  };

  // Getting Aggregation Result Directly From MongoDB
  const top = await directMongoKpi.aggregate(query.top).toArray();
  const allGarages = await directMongoKpi.aggregate(query.allGarages).toArray();
  return {
    top: top && top[0],
    allGarages: allGarages && allGarages[0],
  };
}

async function getValidEmails(garageList, period, type) {
  const periods = KpiPeriods.fromGhPeriodToKpiPeriod(period.id, { convertToMonthlyList: true });
  const $matchPeriod = Array.isArray(periods) ? { $in: periods } : periods;
  const $match = {
    [KpiDictionary.garageId]: { $in: garageList.map((g) => g.id) },
    [KpiDictionary.kpiType]: KpiTypes.GARAGE_KPI,
    [KpiDictionary.period]: $matchPeriod,
    $or: [{ [getSuffixedKpiKey('contactsCountTotalShouldSurfaceInCampaignStats', type)]: { $gt: 0 } }],
  };

  const $project = {
    garageId: `$${KpiDictionary.garageId}`,
    count: {
      $add: [
        { $ifNull: [`$${getSuffixedKpiKey('contactsCountValidEmails', type)}`, 0] },
        { $ifNull: [`$${getSuffixedKpiKey('contactsCountBlockedByEmail', type)}`, 0] },
      ],
    },
    total: {
      $add: [
        { $ifNull: [`$${getSuffixedKpiKey('contactsCountValidEmails', type)}`, 0] },
        { $ifNull: [`$${getSuffixedKpiKey('contactsCountBlockedByEmail', type)}`, 0] },
        { $ifNull: [`$${getSuffixedKpiKey('contactsCountWrongEmails', type)}`, 0] },
        { $ifNull: [`$${getSuffixedKpiKey('contactsCountNotPresentEmails', type)}`, 0] },
      ],
    },
  };

  const $group = {
    _id: '$garageId',
    count: { $sum: '$count' },
    total: { $sum: '$total' },
  };
  const $project2 = {
    garageId: true,
    count: true,
    total: true,
    rate: { $cond: [{ $gt: ['$total', 0] }, { $divide: ['$count', '$total'] }, 0] },
  };
  const $sort = { rate: -1 };
  const $limit = topLimit;
  const $group2 = {
    _id: null,
    count: { $sum: '$count' },
    total: { $sum: '$total' },
  };
  const $project3 = {
    count: { $sum: '$count' },
    total: { $sum: '$total' },
    rate: { $multiply: [100, { $divide: ['$count', '$total'] }] },
  };

  const query = {
    top: [
      { $match },
      { $project },
      { $group },
      { $project: $project2 },
      { $sort },
      { $limit },
      { $group: $group2 },
      { $project: $project3 },
    ],
    allGarages: [
      { $match },
      { $project },
      { $group },
      { $project: $project2 },
      { $sort },
      { $group: $group2 },
      { $project: $project3 },
    ],
  };

  // Getting Aggregation Result Directly From MongoDB
  const top = await directMongoKpi.aggregate(query.top).toArray();
  const allGarages = await directMongoKpi.aggregate(query.allGarages).toArray();
  return {
    top: top && top[0],
    allGarages: allGarages && allGarages[0],
  };
}

async function getUnreachables(garageList, period, type) {
  const periods = KpiPeriods.fromGhPeriodToKpiPeriod(period.id, { convertToMonthlyList: true });
  const $matchPeriod = Array.isArray(periods) ? { $in: periods } : periods;
  const $match = {
    [KpiDictionary.garageId]: { $in: garageList.map((g) => g.id) },
    [KpiDictionary.kpiType]: KpiTypes.GARAGE_KPI,
    [KpiDictionary.period]: $matchPeriod,
    [getSuffixedKpiKey('contactsCountReceivedSurveys', type)]: { $gt: 0 },
  };

  const $project = {
    garageId: `$${KpiDictionary.garageId}`,
    count: { $ifNull: [`$${getSuffixedKpiKey('contactsCountNotContactable', type)}`, 0] },
    total: { $ifNull: [`$${getSuffixedKpiKey('contactsCountTotalShouldSurfaceInCampaignStats', type)}`, 0] },
  };

  const $group = {
    _id: '$garageId',
    count: { $sum: '$count' },
    total: { $sum: '$total' },
  };
  const $project2 = {
    garageId: true,
    count: true,
    total: true,
    rate: { $divide: [{ $sum: '$count' }, { $sum: '$total' }] },
  };
  const $sort = { rate: 1 };
  const $limit = topLimit;
  const $group2 = {
    _id: null,
    count: { $sum: '$count' },
    total: { $sum: '$total' },
  };
  const $project3 = {
    count: { $sum: '$count' },
    total: { $sum: '$total' },
    rate: { $multiply: [100, { $divide: ['$count', '$total'] }] },
  };

  const query = {
    top: [
      { $match },
      { $project },
      { $group },
      { $project: $project2 },
      { $sort },
      { $limit },
      { $group: $group2 },
      { $project: $project3 },
    ],
    allGarages: [
      { $match },
      { $project },
      { $group },
      { $project: $project2 },
      { $sort },
      { $group: $group2 },
      { $project: $project3 },
    ],
  };

  // Getting Aggregation Result Directly From MongoDB
  const top = await directMongoKpi.aggregate(query.top).toArray();
  const allGarages = await directMongoKpi.aggregate(query.allGarages).toArray();
  return {
    top: top && top[0],
    allGarages: allGarages && allGarages[0],
  };
}

// Mongo $multiply
function mMultiply(array) {
  return { $multiply: array };
}

// Mongo $divide
function mDivide(first, second) {
  return {
    $cond: [{ $or: [{ $eq: [first, 0] }, { $eq: [second, 0] }] }, 0, { $divide: [first, second] }],
  };
}

// Mongo $Cond
function mCond(cond, thenCond, elseCond) {
  return {
    $cond: [cond, thenCond, elseCond],
  };
}

// Mongo $IfNull
function mIfNull(array) {
  return {
    $ifNull: array,
  };
}

// Mongo $subtract
function mSubtract(first, second) {
  return { $subtract: [first, second] };
}

// Mongo $eq
function mEq(first, second) {
  return { $eq: [first, second] };
}

// Mongo $or
function mOr(first, second) {
  return { $or: [first, second] };
}

async function getScoreStats(garageList, period, type) {
  const periods = KpiPeriods.fromGhPeriodToKpiPeriod(period.id, { convertToMonthlyList: true });
  const $matchPeriod = Array.isArray(periods) ? { $in: periods } : periods;
  const $match = {
    [KpiDictionary.garageId]: { $in: garageList.map((g) => g.id) },
    [KpiDictionary.kpiType]: KpiTypes.GARAGE_KPI,
    [KpiDictionary.period]: $matchPeriod,
    [getSuffixedKpiKey('satisfactionCountReviews', type)]: { $gt: 0 },
  };

  const $group = {
    _id: `$${KpiDictionary.garageId}`,
    reviews: { $sum: `$${getSuffixedKpiKey('satisfactionCountReviews', type)}` },
    promoters: { $sum: `$${getSuffixedKpiKey('satisfactionCountPromoters', type)}` },
    detractors: { $sum: `$${getSuffixedKpiKey('satisfactionCountDetractors', type)}` },
  };

  const $project = {
    reviews: '$reviews',
    promoters: '$promoters',
    detractors: '$detractors',
    detractorsRate: mMultiply([mDivide('$detractors', '$reviews'), 100]),
    promotersRate: mMultiply([mDivide('$promoters', '$reviews'), 100]),
    scoreNPS: mCond(
      mIfNull([`$reviews`, false]),
      mMultiply(
        mCond(
          mOr(mEq(mSubtract(`$promoters`, `$detractors`), 0), mEq(`$reviews`, 0)),
          0,
          mDivide(mSubtract(`$promoters`, `$detractors`), `$reviews`)
        ),
        100
      ),
      0
    ),
  };

  const query = [{ $match }, { $group }, { $project }];

  const allGarages = await directMongoKpi.aggregate(query).toArray();

  const returnItem = {
    detractors: {
      top: {
        count: 0,
        total: 0,
        rate: 0,
      },
      allGarages: {
        count: 0,
        total: 0,
        rate: 0,
      },
    },
    promotors: {
      top: {
        count: 0,
        total: 0,
        rate: 0,
      },
      allGarages: {
        count: 0,
        total: 0,
        rate: 0,
      },
    },
    nps: {
      top: {
        total: 0,
        rate: 0,
        detractors: {
          count: 0,
          rate: 0,
        },
        promotors: {
          count: 0,
          rate: 0,
        },
      },
      allGarages: {
        rate: 0,
      },
    },
  };

  for (const garage of allGarages) {
    returnItem.detractors.allGarages.count += garage.detractors || 0;
    returnItem.promotors.allGarages.count += garage.promoters || 0;
    returnItem.detractors.allGarages.total += garage.reviews || 0;
  }
  returnItem.promotors.allGarages.total = returnItem.detractors.allGarages.total;
  returnItem.detractors.allGarages.rate =
    100 * ((returnItem.detractors.allGarages.count || 0) / (returnItem.detractors.allGarages.total || 1));
  returnItem.promotors.allGarages.rate =
    100 * ((returnItem.promotors.allGarages.count || 0) / (returnItem.promotors.allGarages.total || 1));
  returnItem.nps.allGarages.rate =
    (returnItem.promotors.allGarages.rate || 0) - (returnItem.detractors.allGarages.rate || 0);

  // TOP DETRACTORS
  allGarages.sort((a, b) => a.detractorsRate - b.detractorsRate);
  for (const garage of allGarages.slice(0, topLimit)) {
    returnItem.detractors.top.count += garage.detractors || 0;
    returnItem.detractors.top.total += garage.reviews || 0;
  }
  returnItem.detractors.top.rate =
    100 * ((returnItem.detractors.top.count || 0) / (returnItem.detractors.top.total || 1));

  // TOP PROMOTORS
  allGarages.sort((a, b) => b.promotersRate - a.promotersRate);
  for (const garage of allGarages.slice(0, topLimit)) {
    returnItem.promotors.top.count += garage.promoters || 0;
    returnItem.promotors.top.total += garage.reviews || 0;
  }
  returnItem.promotors.top.rate = 100 * ((returnItem.promotors.top.count || 0) / (returnItem.promotors.top.total || 1));

  // TOP NPS
  allGarages.sort((a, b) => b.scoreNPS - a.scoreNPS);
  for (const garage of allGarages.slice(0, topLimit)) {
    returnItem.nps.top.detractors.count += garage.detractors || 0;
    returnItem.nps.top.promotors.count += garage.promoters || 0;
    returnItem.nps.top.total += garage.reviews || 0;
  }
  returnItem.nps.top.detractors.rate = 100 * (returnItem.nps.top.detractors.count / (returnItem.nps.top.total || 1));
  returnItem.nps.top.promotors.rate = 100 * (returnItem.nps.top.promotors.count / (returnItem.nps.top.total || 1));
  returnItem.nps.top.rate = returnItem.nps.top.promotors.rate - returnItem.nps.top.detractors.rate;

  return returnItem;
}

const generateForPeriod = async (fullGarageList, period) => {
  const subGarageStats = {};
  // Dealership
  let garageType = garageTypes.getGarageTypesFromCockpitType(garageTypes.DEALERSHIP);
  subGarageStats[garageTypes.DEALERSHIP] = {};
  let gStats = subGarageStats[garageTypes.DEALERSHIP];
  let garageList = fullGarageList.filter((g) => garageType.includes(g.type));
  for (const type of dTypes) {
    gStats[type || 'ALL'] = {};
    Object.assign(gStats[type || 'ALL'], await getScoreStats(garageList, period, type)); // detractors: Rating <= 6 // promotors: Rating >= 9 // nps:  = %promotors - %detractors
    // Ticket closed by GS or ticket to recontact
    gStats[type || 'ALL'].unsatisfiedUntreated = await getUnsatisfiedStat(
      garageList,
      period,
      'countUnsatisfiedUntouched',
      false,
      type
    );
    // Ticket not closed by GS and ticket not to recontact
    gStats[type || 'ALL'].unsatisfiedPendingOrProcessed = await getUnsatisfiedStat(
      garageList,
      period,
      'countUnsatisfiedTouched',
      true,
      type
    );
    // Ticket closed and resolved
    gStats[type || 'ALL'].unsatisfiedSaved = await getUnsatisfiedStat(
      garageList,
      period,
      'countUnsatisfiedClosedWithResolution',
      true,
      type
    );
    gStats[type || 'ALL'].validEmails = await getValidEmails(garageList, period, type);
    gStats[type || 'ALL'].respondents = await getRespondents(garageList, period, type);
    gStats[type || 'ALL'].unreachables = await getUnreachables(garageList, period, type);
  }
  for (const leadSaleType of lTypes) {
    gStats[leadSaleType || 'ALL'] = gStats[leadSaleType || 'ALL'] || {};
    // Ticket closed by GS or ticket to recontact
    gStats[leadSaleType || 'ALL'].leadUntreated = await getLeadsStat(
      garageList,
      period,
      'countLeadsUntouched',
      false,
      leadSaleType
    );
    // Ticket not closed by GS and ticket not to recontact
    gStats[leadSaleType || 'ALL'].leadPendingOrProcessed = await getLeadsStat(
      garageList,
      period,
      'countLeadsTouched',
      true,
      leadSaleType
    );
    // Ticket closed and resolved
    gStats[leadSaleType || 'ALL'].leadConverted = await getLeadsStat(
      garageList,
      period,
      'countLeadsClosedWithSale',
      true,
      leadSaleType
    );
  }
  // Motorbike
  garageType = garageTypes.MOTORBIKE_DEALERSHIP;
  subGarageStats[garageType] = {};
  gStats = subGarageStats[garageType];
  garageList = fullGarageList.filter((g) => g.type === garageType);
  for (const type of dTypes) {
    gStats[type || 'ALL'] = {};
    Object.assign(gStats[type || 'ALL'], await getScoreStats(garageList, period, type)); // detractors: Rating <= 6 // promotors: Rating >= 9 // nps:  = %promotors - %detractors
    // Ticket closed by GS or ticket to recontact
    gStats[type || 'ALL'].unsatisfiedUntreated = await getUnsatisfiedStat(
      garageList,
      period,
      'countUnsatisfiedUntouched',
      false,
      type
    );
    // Ticket not closed by GS and ticket not to recontact
    gStats[type || 'ALL'].unsatisfiedPendingOrProcessed = await getUnsatisfiedStat(
      garageList,
      period,
      'countUnsatisfiedTouched',
      true,
      type
    );
    // Ticket closed and resolved
    gStats[type || 'ALL'].unsatisfiedSaved = await getUnsatisfiedStat(
      garageList,
      period,
      'countUnsatisfiedClosedWithResolution',
      true,
      type
    );
    gStats[type || 'ALL'].validEmails = await getValidEmails(garageList, period, type);
    gStats[type || 'ALL'].respondents = await getRespondents(garageList, period, type);
    gStats[type || 'ALL'].unreachables = await getUnreachables(garageList, period, type);
  }
  for (const leadSaleType of lTypes) {
    gStats[leadSaleType || 'ALL'] = gStats[leadSaleType || 'ALL'] || {};
    // Ticket closed by GS or ticket to recontact
    gStats[leadSaleType || 'ALL'].leadUntreated = await getLeadsStat(
      garageList,
      period,
      'countLeadsUntouched',
      false,
      leadSaleType
    );
    // Ticket not closed by GS and ticket not to recontact
    gStats[leadSaleType || 'ALL'].leadPendingOrProcessed = await getLeadsStat(
      garageList,
      period,
      'countLeadsTouched',
      true,
      leadSaleType
    );
    // Ticket closed and resolved
    gStats[leadSaleType || 'ALL'].leadConverted = await getLeadsStat(
      garageList,
      period,
      'countLeadsClosedWithSale',
      true,
      leadSaleType
    );
  }

  // VehicleInspection
  garageType = garageTypes.VEHICLE_INSPECTION;
  subGarageStats[garageType] = {};
  gStats = subGarageStats[garageType];
  garageList = fullGarageList.filter((g) => g.type === garageType);
  Object.assign(gStats, await getScoreStats(garageList, period)); // detractors: Rating <= 6 // promotors: Rating >= 9 // nps:  = %promotors - %detractors

  gStats.unsatisfiedUntreated = await getUnsatisfiedStat(garageList, period, 'countUnsatisfiedUntouched', false); // Ticket closed by GS or ticket to recontact
  gStats.unsatisfiedPendingOrProcessed = await getUnsatisfiedStat(garageList, period, 'countUnsatisfiedTouched', true); // Ticket not closed by GS and ticket not to recontact
  gStats.unsatisfiedSaved = await getUnsatisfiedStat(garageList, period, 'countUnsatisfiedClosedWithResolution', true); // Ticket closed and resolved

  gStats.leadUntreated = await getLeadsStat(garageList, period, 'countLeadsUntouched', false); // Ticket closed by GS or ticket to recontact
  gStats.leadPendingOrProcessed = await getLeadsStat(garageList, period, 'countLeadsTouched', true); // Ticket not closed by GS and ticket not to recontact
  gStats.leadConverted = await getLeadsStat(garageList, period, 'countLeadsClosedWithSale', true); // Ticket closed and resolved

  gStats.validEmails = await getValidEmails(garageList, period);
  gStats.respondents = await getRespondents(garageList, period);
  gStats.unreachables = await getUnreachables(garageList, period);
  // Done
  return subGarageStats;
};

//--------------------------------------------------------------------------------------//
//                                     Analytics v2                                     //
//--------------------------------------------------------------------------------------//
// the aim is to get a 12 months details for all the periods
const setAdditionalPeriods = (periods = [], forcedPeriod = null) => {
  // utility : format to period object
  const buildPeriod = (period, format = 'YYYYMM') => {
    const refDate = moment(period, format);
    const periodId = moment(refDate).format(GarageHistoryPeriod.MONTHLY_FORMAT);
    return {
      id: periodId,
      minDate: GarageHistoryPeriod.getPeriodMinDate(periodId),
      maxDate: GarageHistoryPeriod.getPeriodMaxDate(periodId),
    };
  };

  // do not compute unnecessary months if a period is given in the script's arguments "--period <periodId>"
  if (forcedPeriod) {
    const interval =
      forcedPeriod.match(KpiPeriods.GH_ALL_HISTORY) || forcedPeriod.match(KpiPeriods.GH_LAST_QUARTER)
        ? KpiPeriods.getLast12Months()
        : KpiPeriods.fromGhPeriodToKpiPeriod(forcedPeriod, { convertToMonthlyList: true });

    const newForcedPeriod = interval.map((p) => buildPeriod(p));

    return [...periods, ...newForcedPeriod];
  }

  const getMinPeriod = () => {
    let tmp = { minDate: moment() };
    for (const period of periods) {
      if (moment(period.minDate).diff(moment(tmp.minDate)) <= 0 && period.id !== KpiPeriods.GH_ALL_HISTORY) {
        tmp = period;
      }
    }
    return tmp;
  };

  // build interval => min = minDate of minPeriod
  const min = moment(getMinPeriod().minDate).subtract(1, 'year');
  const max = moment();
  const additionalPeriods = [];

  // get all months in between
  while (min <= max) {
    //avoid duplicates
    if (!periods.find((p) => p.id === moment(min).format(GarageHistoryPeriod.MONTHLY_FORMAT))) {
      additionalPeriods.push(buildPeriod(min));
    }
    min.add(1, 'month');
  }

  return [...periods, ...additionalPeriods].sort((a, b) => b.id.localeCompare(a.id));
};

//--------------------------------------------------------------------------------------//

const compute = async (forcedPeriod = null) => {
  try {
    log.debug(FED, '[GeneralStats] Generation started');
    directMongoKpi = app.models.KpiByPeriod.getMongoConnector();

    const garageList = await app.models.Garage.find({ where: {}, fields: { id: true, type: true } });
    const generalStats = {};
    let periods = GarageHistoryPeriod.getCockpitAvailablePeriods().map((period) => ({
      id: period.id,
      minDate: period.minDate,
      maxDate: period.maxDate,
    }));
    if (forcedPeriod && periods.find((p) => p.id === forcedPeriod)) {
      periods = [periods.find((p) => p.id === forcedPeriod)];
    }

    // [Analytics v2]
    periods = setAdditionalPeriods(periods, forcedPeriod);

    for (const period of periods) {
      log.debug(FED, `[GeneralStats] Generating for ${period.id}`);
      generalStats[period.id] = await generateForPeriod(garageList, period);
      log.debug(FED, `[GeneralStats] Generated for ${period.id}`);
    }
    await promisify(app.models.Configuration.setGeneralStats)(generalStats);
    return null;
  } catch (e) {
    return e;
  }
};

const _parseArgs = (args) => {
  const options = {};
  args.forEach((val, index) => {
    if (val === '--help') {
      console.log('');
      console.log('* Creates generalStats : for all garages and top200 garages');
      console.log('');
      console.log('Usage node scripts/cron/garage-history/generalStats.js [--force] [--period <periodToken>]');
      process.exit(0);
    }
    if (val === '--force') {
      options.force = true;
    }
    if (val === '--period' || val === '--periodToken') {
      options.forcedPeriod = process.argv[index + 1];
    }
  });

  return options;
};

app.on('booted', () => {
  const parsedArgs = _parseArgs(process.argv);
  if (parsedArgs.force) {
    // running outside of cron
    log.debug(FED, '[GeneralStats] Running without cronRunner');
    compute(parsedArgs.forcedPeriod).then((err) => {
      err ? log.debug(FED, err) : log.debug(FED, '[GeneralStats] Generation OK : shutting down.'); // eslint-disable-line
      process.exit(err ? -1 : 0);
    });
  } else {
    log.debug(FED, '[GeneralStats] Running inside cronRunner');
    const runner = new CronRunner({
      frequency: CronRunner.supportedFrequencies.DAILY,
      description: 'Calcul des top + moyenne GS.',
    });
    runner.execute = (options, callback) => {
      compute(parsedArgs.forcedPeriod).then((err) => {
        if (err) {
          callback(err);
        }
        callback();
      });
    };
    runner.run((err) => {
      err ? log.debug(FED, err) : log.debug(FED, '[GeneralStats] Generation OK : shutting down.'); // eslint-disable-line
      process.exit(err ? -1 : 0);
    });
  }
});
