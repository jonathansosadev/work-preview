/**
 * Update monthlySummary in the Configuration collection
 * A precomputed list of values (a ranking of the best dealerships last month) used in montly summary
 */
const { Promise } = require('es6-promise');
const moment = require('moment');

const KpiDictionary = require('../../../lib/garagescore/kpi/KpiDictionary');
const timeHelper = require('../../../lib/util/time-helper');
const { log, FLO } = require('../../../lib/util/log');
const { GarageStatuses, GarageSubscriptions, KpiTypes } = require('../../../../frontend/utils/enumV2');

let directMongoKpis = null;

/**
 * Get the 12 past months tokens
 * @param {Number} baseMonth
 * @param {Number} baseYear
 * @returns {Array | Number[]} Period tokens
 */
const getPeriods = (baseMonth, baseYear) => {
  const now = moment().utc().month(baseMonth).year(baseYear);
  const res = [];
  for (let i = 0; i < 12; i++) {
    const d = now.clone().subtract(i, 'month');
    res.push(Number(`${d.year()}${`0${d.month() + 1}`.slice(-2)}`));
  }
  return [res, res[0]];
};

const pickGaragesForCategories = (fullGarageList) => {
  const leads = fullGarageList
    .filter(
      (g) =>
        // Pick garages that have leads AND either VN or VO subscriptions
        g.isSubscribed(GarageSubscriptions.LEAD) &&
        (g.isSubscribed(GarageSubscriptions.NEW_VEHICLE_SALE) || g.isSubscribed(GarageSubscriptions.USED_VEHICLE_SALE))
    )
    .map((g) => g.id);
  const satisfaction = fullGarageList
    .filter(
      (g) =>
        // Pick garages that have either APV or VN or VO subscriptions
        g.isSubscribed(GarageSubscriptions.MAINTENANCE) ||
        g.isSubscribed(GarageSubscriptions.NEW_VEHICLE_SALE) ||
        g.isSubscribed(GarageSubscriptions.USED_VEHICLE_SALE)
    )
    .map((g) => g.id);
  const problemResolution = satisfaction;
  const validEmails = satisfaction;

  return { leads, satisfaction, problemResolution, validEmails };
};

const getTop20Leads = async (garageList, periods, mode) => {
  // Setup MongoDB Matching
  const $match = {};
  $match[KpiDictionary.garageId] = { $in: garageList };
  $match[KpiDictionary.period] = { $in: periods };
  $match[KpiDictionary.kpiType] = KpiTypes.GARAGE_KPI;

  const $project = {
    garageId: `$${KpiDictionary.garageId}`,
    convertedLeads: {
      $add: [
        { $ifNull: [`$${KpiDictionary.countConvertedLeads}`, 0] },
        { $ifNull: [`$${KpiDictionary.countConvertedTradeIns}`, 0] },
      ],
    },
  };
  const $group = { _id: '$garageId', convertedLeads: { $sum: '$convertedLeads' } };
  const $sort = { convertedLeads: -1 };
  // limit to 20% of the garages
  const $limit = Math.ceil(0.2 * garageList.length);
  const $group2 = { _id: null, convertedLeads: { $avg: '$convertedLeads' } };

  const query = {
    top20: [{ $match }, { $project }, { $group }, { $sort }, { $limit }, { $group: $group2 }],
    allGarages: [{ $match }, { $project }, { $group }, { $sort }, { $group: $group2 }],
  };

  // Getting Aggregation Result Directly From MongoDB
  return directMongoKpis.aggregate(query[mode]).toArray();
};

async function getTop20Satisfaction(garageList, periodToken, mode) {
  const $match = {
    [KpiDictionary.garageId]: { $in: garageList },
    [KpiDictionary.kpiType]: KpiTypes.GARAGE_KPI,
    [KpiDictionary.satisfactionCountReviews]: { $gt: 0 },
    [KpiDictionary.period]: periodToken,
  };
  const $project = {
    garageId: `$${KpiDictionary.garageId}`,
    satisfactionCountReviews: `$${KpiDictionary.satisfactionCountReviews}`,
    satisfactionSumRating: `$${KpiDictionary.satisfactionSumRating}`,
  };
  const $group = {
    _id: '$garageId',
    satisfactionSumRating: { $sum: '$satisfactionSumRating' },
    satisfactionCountReviews: { $sum: '$satisfactionCountReviews' },
  };
  const $project2 = {
    garageId: true,
    score: {
      $divide: ['$satisfactionSumRating', '$satisfactionCountReviews'],
    },
    satisfactionCountReviews: true,
    satisfactionSumRating: true,
  };
  const $sort = { score: -1 };
  // limit to 20% of the garages
  const $limit = Math.ceil(0.2 * garageList.length);
  const $group2 = {
    _id: null,
    satisfactionSumRating: { $sum: '$satisfactionSumRating' },
    satisfactionCountReviews: { $sum: '$satisfactionCountReviews' },
  };
  const $project3 = {
    score: {
      $divide: ['$satisfactionSumRating', '$satisfactionCountReviews'],
    },
  };

  const query = {
    top20: [
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
  return directMongoKpis.aggregate(query[mode]).toArray();
}

const getTop20ProblemResolution = async (garageList, period, mode) => {
  // Setup MongoDB Matching
  const $match = {
    [KpiDictionary.garageId]: { $in: garageList },
    [KpiDictionary.period]: period,
    [KpiDictionary.kpiType]: KpiTypes.GARAGE_KPI,
    [KpiDictionary.countUnsatisfied]: { $gt: 0 }, // in order to avoid dividing by 0
  };

  const $project = {
    garageId: `$${KpiDictionary.garageId}`,
    countUnsatisfied: `$${KpiDictionary.countUnsatisfied}`,
    countUnsatisfiedResolved: `$${KpiDictionary.countUnsatisfiedClosedWithResolution}`,
    unsatisfiedResolvedRate: {
      $divide: [`$${KpiDictionary.countUnsatisfiedClosedWithResolution}`, `$${KpiDictionary.countUnsatisfied}`],
    },
  };
  const $sort = { unsatisfiedResolvedRate: -1 };
  // limit to 20% of the garages
  const $limit = Math.ceil(0.2 * garageList.length);
  const $group = {
    _id: null,
    countUnsatisfiedResolved: { $sum: '$countUnsatisfiedResolved' },
    countUnsatisfied: { $sum: '$countUnsatisfied' },
  };
  const $project2 = {
    unsatisfiedResolvedRate: { $multiply: [100, { $divide: ['$countUnsatisfiedResolved', '$countUnsatisfied'] }] },
  };

  const query = {
    top20: [{ $match }, { $project }, { $sort }, { $limit }, { $group }, { $project: $project2 }],
    allGarages: [{ $match }, { $project }, { $sort }, { $group }, { $project: $project2 }],
  };
  // Getting Aggregation Result Directly From MongoDB
  return directMongoKpis.aggregate(query[mode]).toArray();
};

const getTop20ValidEmails = async (garageList, periodToken, mode) => {
  const $match = {
    [KpiDictionary.garageId]: { $in: garageList },
    [KpiDictionary.satisfactionCountSurveys]: { $gt: 0 },
    [KpiDictionary.period]: periodToken,
    [KpiDictionary.kpiType]: KpiTypes.GARAGE_KPI,
  };

  const $project = {
    garageId: `$${KpiDictionary.garageId}`,
    countValidEmails: {
      $add: [
        `$${KpiDictionary.contactsCountValidEmails}`,
        `$${KpiDictionary.contactsCountBlockedLastMonthEmail}`,
        `$${KpiDictionary.contactsCountUnsubscribedByEmail}`,
      ],
    },
    totalForEmails: `$${KpiDictionary.contactsCountTotalShouldSurfaceInCampaignStats}`,
  };
  const $group = {
    _id: '$garageId',
    countValidEmails: { $sum: '$countValidEmails' },
    totalForEmails: { $sum: '$totalForEmails' },
  };
  const $project2 = {
    garageId: true,
    countValidEmails: true,
    totalForEmails: true,
    validEmailsRate: { $divide: [{ $sum: '$countValidEmails' }, { $sum: '$totalForEmails' }] },
  };
  const $sort = { validEmailsRate: -1 };
  // limit to 20% of the garages
  const $limit = Math.ceil(0.2 * garageList.length);
  const $group2 = {
    _id: null,
    countValidEmails: { $sum: '$countValidEmails' },
    totalForEmails: { $sum: '$totalForEmails' },
  };
  const $project3 = {
    validEmailsRate: { $multiply: [100, { $divide: ['$countValidEmails', '$totalForEmails'] }] },
  };

  const query = {
    top20: [
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

  return directMongoKpis.aggregate(query[mode]).toArray();
};

const compute = async (app, dayNumber) => {
  try {
    // We set our direct mongo global variable, we will need it for aggregate queries
    directMongoKpis = app.models.KpiByPeriod.getMongoConnector();

    // We calculate all the periods we have to generate
    const date = dayNumber ? moment(timeHelper.dayNumberToDate(dayNumber)) : moment();
    date.subtract(1, 'month');
    const month = date.month();
    const year = date.year();

    const [period12M, periodM] = getPeriods(month, year);
    const garageList = await app.models.Garage.find({
      where: { status: { inq: [GarageStatuses.RUNNING_AUTO, GarageStatuses.RUNNING_MANUAL] } },
      fields: { id: true, subscriptions: true },
    });
    const authorizedGarages = pickGaragesForCategories(garageList);

    const kpiStart = moment.utc();

    const top20Leads = await getTop20Leads(authorizedGarages.leads, period12M, 'top20');
    const top20Satisfaction = await getTop20Satisfaction(authorizedGarages.satisfaction, periodM, 'top20');
    const top20ProblemResolution = await getTop20ProblemResolution(
      authorizedGarages.problemResolution,
      periodM,
      'top20'
    );
    const top20ValidEmails = await getTop20ValidEmails(authorizedGarages.validEmails, periodM, 'top20');

    const avgLeads = await getTop20Leads(authorizedGarages.leads, period12M, 'allGarages');
    const avgSatisfaction = await getTop20Satisfaction(authorizedGarages.satisfaction, periodM, 'allGarages');
    const avgProblemResolution = await getTop20ProblemResolution(
      authorizedGarages.problemResolution,
      periodM,
      'allGarages'
    );
    const avgValidEmails = await getTop20ValidEmails(authorizedGarages.validEmails, periodM, 'allGarages');

    const kpiDuration = moment.duration(moment().valueOf() - kpiStart.valueOf());
    log.debug(
      FLO,
      `KPI computing took ${kpiDuration.minutes()} ${kpiDuration.seconds()}s ${kpiDuration.milliseconds()}ms.`
    );

    return {
      top20Leads,
      top20Satisfaction,
      top20ProblemResolution,
      top20ValidEmails,
      avgLeads,
      avgSatisfaction,
      avgProblemResolution,
      avgValidEmails,
    };
  } catch (err) {
    log.error(FLO, 'MonthlySummaryStats compute  error', err);
    return {};
  }
};

const save = async (app, stats, dayNumber) => {
  // Ok this line is weird and ugly but it prevents the ugly code below from being more despicable
  const {
    top20Leads,
    top20Satisfaction,
    top20ProblemResolution,
    top20ValidEmails,
    avgLeads,
    avgSatisfaction,
    avgProblemResolution,
    avgValidEmails,
  } = stats || {};

  // We calculate all the periods we have to generate
  const date = dayNumber ? moment(timeHelper.dayNumberToDate(dayNumber)) : moment();
  date.subtract(1, 'month');
  const month = date.month();
  const year = date.year();

  // We can now proceed to save
  await new Promise((res) => {
    app.models.Configuration.getMonthlySummary(true, (err, top20stats) => {
      const update = err || !top20stats ? {} : top20stats;
      update[year] = update[year] || {};
      update[year][month] = {
        bestLeadsPerf: Math.round(top20Leads[0].convertedLeads / 12),
        bestSatisfactionPerf: Math.round(10 * top20Satisfaction[0].score) / 10,
        bestProblemResolutionPerf: Math.round(top20ProblemResolution[0].unsatisfiedResolvedRate),
        bestValidEmailsPerf: Math.round(top20ValidEmails[0].validEmailsRate),
        averageLeadsPerf: Math.round(avgLeads[0].convertedLeads / 12),
        averageSatisfactionPerf: Math.round(10 * avgSatisfaction[0].score) / 10,
        averageProblemResolutionPerf: Math.round(avgProblemResolution[0].unsatisfiedResolvedRate),
        averageValidEmailsPerf: Math.round(avgValidEmails[0].validEmailsRate),
      };
      app.models.Configuration.setMonthlySummary(update, (e) => {
        if (e) {
          log.error(FLO, 'setMonthlySummary error', e);
        }
        res();
      });
    });
  });
};

module.exports = {
  compute,
  save,
};
