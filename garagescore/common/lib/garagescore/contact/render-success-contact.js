const app = require('../../../../server/server');
const KpiDictionary = require('../kpi/KpiDictionary');
const MongoObjectID = require('mongodb').ObjectID;
const KpiTypes = require('../../../models/kpi-type');
const KpiDictionnary = require('../../../../common/lib/garagescore/kpi/KpiDictionary');
const moment = require('moment-timezone');

function generateLast10MonthPeriod() {
  // period will be in format YYYYMM
  return [...Array(11).keys()].map((i) =>
    parseInt(
      moment()
        .utc()
        .subtract(i + 1, 'months')
        .format('YYYYMM'),
      10
    )
  );
}

function generateDaysFromStartOfCurrentMonth() {
  return [...Array(moment.utc().date()).keys()].map((i) =>
    parseInt(moment.utc().startOf('month').add(i, 'day').format('YYYYMMDD'), 10)
  );
}

function generateDaysToEndOfLastYearMonth() {
  const day = moment.utc().date();
  const twelveMonthsAgo = moment.utc().subtract(12, 'months').set('date', day);
  const endOfMonth = moment.utc().subtract(12, 'months').endOf('month').date();
  return [twelveMonthsAgo.format('YYYYMMDD'), ...Array.from({ length: endOfMonth - day - 1 }).keys()].map(() =>
    parseInt(twelveMonthsAgo.add(1, 'day').format('YYYYMMDD'), 10)
  );
}

function mergeKpiResults(fetchedKpis, defaultResponse = {}) {
  return fetchedKpis.reduce(
    (acc, kpi) => {
      Object.keys(kpi).forEach((key) => {
        if (!(key in acc)) return;
        acc[key] += kpi[key];
      });
      return acc;
    },
    { ...defaultResponse }
  );
}

function addAggregationMatchPeriod($match, kpiByPeriodType) {
  return {
    ...$match,
    [KpiDictionnary.period]:
      kpiByPeriodType === 'monthly'
        ? { $in: generateLast10MonthPeriod() }
        : { $in: [...generateDaysFromStartOfCurrentMonth(), ...generateDaysToEndOfLastYearMonth()] },
  };
}

async function _aggregateResults(match, queryBase, KpiByPeriodCollection, kpiByPeriodType = 'monthly') {
  const mongoConnector = KpiByPeriodCollection.getMongoConnector();

  const finalQuery = [...[{ $match: addAggregationMatchPeriod(match, kpiByPeriodType) }], ...queryBase];

  let agg = await mongoConnector.aggregate(finalQuery).toArray();

  if (!agg || !agg.length || !agg[0]) {
    agg = [{}];
  }
  return agg;
}

const getLeadSuccessAlertPayload = async (contact) => {
  const payload = {};
  if (contact.payload.garageId) payload.garage = await app.models.Garage.findById(contact.payload.garageId);
  if (contact.payload.dataId) payload.data = await app.models.Data.findById(contact.payload.dataId);
  else {
    console.error('Error contact.payload.dataId not found');
    return payload;
  }
  const match = {
    [KpiDictionary.garageId]: new MongoObjectID(contact.payload.garageId),
    [KpiDictionary.kpiType]: KpiTypes.GARAGE_KPI,
  };
  const query = [
    {
      $project: {
        countConversions: {
          $add: [
            { $ifNull: [`$${KpiDictionary.countConvertedLeads}`, 0] },
            { $ifNull: [`$${KpiDictionary.countConvertedTradeIns}`, 0] },
          ],
        },
        countPotentialSales: { $ifNull: [`$${KpiDictionary.countLeads}`, 0] },
      },
    },
    {
      $group: {
        _id: null,
        countConversions: { $sum: '$countConversions' },
        countPotentialSales: { $sum: '$countPotentialSales' },
      },
    },
  ];

  const [aggregationsMonthlyResults, aggregationsDailyResults] = await Promise.all([
    _aggregateResults(match, query, app.models.KpiByPeriod, 'monthly'),
    _aggregateResults(match, query, app.models.KpiByDailyPeriod, 'daily'),
  ])

  payload.leadConversion = mergeKpiResults([...aggregationsMonthlyResults, ...aggregationsDailyResults], {
    countConversions: 0,
    countPotentialSales: 0,
  });
  payload.crossLeadConverted = !!(
    payload.data &&
    payload.data.get('leadTicket.actions') &&
    payload.data.get('leadTicket.actions')[payload.data.get('leadTicket.actions').length - 1].crossLeadConverted
  );
  if (!payload.crossLeadConverted) {
    payload.closingUser =
      payload.data &&
      payload.data.get('leadTicket.actions') &&
      (await app.models.User.findById(
        payload.data.get('leadTicket.actions')[payload.data.get('leadTicket.actions').length - 1].assignerUserId
      ));
  }

  payload.locale = payload.garage && payload.garage.locale;
  payload.timezone = (payload.garage && payload.garage.timezone) || null;
  payload.dataId = contact.payload.dataId;
  return payload;
};

const getUnsatisfiedSuccessAlertPayload = async (contact) => {
  // #2996
  const payload = {};
  if (contact.payload.garageId) payload.garage = await app.models.Garage.findById(contact.payload.garageId);
  if (contact.payload.dataId) payload.data = await app.models.Data.findById(contact.payload.dataId);
  else {
    console.error('Error contact.payload.dataId not found');
    return payload;
  }

  const match = {
    [KpiDictionary.garageId]: new MongoObjectID(contact.payload.garageId),
    [KpiDictionary.kpiType]: KpiTypes.GARAGE_KPI,
  };
  const query = [
    {
      $project: {
        countUnsatisfiedClosedWithResolution: {
          $ifNull: [`$${KpiDictionary.countUnsatisfiedClosedWithResolution}`, 0],
        }, // 10010
        countUnsatisfied: { $ifNull: [`$${KpiDictionary.countUnsatisfied}`, 0] }, // 10001
      },
    },
    {
      $group: {
        _id: null,
        countUnsatisfiedClosedWithResolution: { $sum: '$countUnsatisfiedClosedWithResolution' },
        countUnsatisfied: { $sum: '$countUnsatisfied' },
      },
    },
  ];

  const [aggregationsMonthlyResults, aggregationsDailyResults] = await Promise.all([
    _aggregateResults(match, query, app.models.KpiByPeriod, 'monthly'),
    _aggregateResults(match, query, app.models.KpiByDailyPeriod, 'daily'),
  ])

  const savedUnsatisfied = mergeKpiResults([...aggregationsMonthlyResults, ...aggregationsDailyResults], {
    countUnsatisfiedClosedWithResolution: 0,
    countUnsatisfied: 0,
  });

  payload.savedUnsatisfied = {
    rateSolveUnsatisfied:
      savedUnsatisfied.countUnsatisfied > 0
        ? savedUnsatisfied.countUnsatisfiedClosedWithResolution / savedUnsatisfied.countUnsatisfied
        : null,
    ...savedUnsatisfied,
  };

  payload.customerFollowupResolved =
    payload.data &&
    payload.data.get('unsatisfiedTicket.actions') &&
    payload.data.get('unsatisfiedTicket.actions')[payload.data.get('unsatisfiedTicket.actions').length - 1]
      .customerFollowupResolved;
  if (!payload.customerFollowupResolved) {
    payload.closingUser =
      payload.data &&
      payload.data.get('unsatisfiedTicket.actions') &&
      (await app.models.User.findById(
        payload.data.get('unsatisfiedTicket.actions')[payload.data.get('unsatisfiedTicket.actions').length - 1]
          .assignerUserId
      ));
  }
  payload.locale = payload.garage && payload.garage.locale;
  payload.timezone = (payload.garage && payload.garage.timezone) || null;
  payload.dataId = contact.payload.dataId;
  return payload;
};

module.exports = {
  getLeadSuccessAlertPayload,
  getUnsatisfiedSuccessAlertPayload,
};
