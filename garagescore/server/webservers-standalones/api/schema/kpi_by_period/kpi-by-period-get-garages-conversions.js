/**
 * Query, returns lead conversions data for all the user garages
 */
const { AuthenticationError, ForbiddenError, gql } = require('apollo-server-express');
const KpiDictionary = require('../../../../../common/lib/garagescore/kpi/KpiDictionary');
const UserAuthorization = require('../../../../../common/models/user-autorization');
const { ANASS, log } = require('../../../../../common/lib/util/log');
const { match } = require('../../_common/kpi-by-period');
const KpiTypes = require('../../../../../common/models/kpi-type');
const moment = require('moment');
const KpiDictionnary = require('../../../../../common/lib/garagescore/kpi/KpiDictionary');

module.exports.typeDef = gql`
  extend type Query {
    kpiByPeriodGetGaragesConversions(
      garageIds: [String]
      cockpitType: String!
      periodId: String
    ): kpiByPeriodGetGaragesConversionsValues
  }
  type kpiByPeriodGetGaragesConversionsValues {
    countConversionsVO: Int
    countConversionsVN: Int
    countConversionsLeads: Int
    countConversionsTradeins: Int
    countConversions: Int
    countLeads: Int

    countConversionsPct: Float
    countConvertedLeadsPct: Float
    countConversionsTradeInsPct: Float
  }
`;

const emptyResponse = {
  countConversionsVO: 0,
  countConversionsVN: 0,
  countConversionsLeads: 0,
  countConversionsTradeins: 0,
  countConversions: 0,
  countLeads: 0,
  countConversionsPct: 0,
  countConvertedLeadsPct: 0,
  countConversionsTradeInsPct: 0,
};

const dateHelpers = {
  generateLast10MonthPeriod: () => {
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
  },

  generateDaysFromStartOfCurrentMonth: () => {
    return [...Array(moment().utc().date()).keys()].map((i) =>
      parseInt(moment().utc().startOf('month').add(i, 'day').format('YYYYMMDD'), 10)
    );
  },

  generateDaysToEndOfLastYearMonth: () => {
    const day = moment().utc().date();
    const twelveMonthsAgo = moment().utc().subtract(12, 'months').set('date', day);
    const endOfMonth = moment().utc().subtract(12, 'months').endOf('month').date();
    return [twelveMonthsAgo.format('YYYYMMDD'), ...Array.from({ length: endOfMonth - day - 1 }).keys()].map(() =>
      parseInt(twelveMonthsAgo.add(1, 'day').format('YYYYMMDD'), 10)
    );
  },
};

async function mergeKpiResults(fetchedKpis) {
  return fetchedKpis.reduce(
    (acc, kpi) => {
      Object.keys(kpi).forEach((key) => {
        if (!Object.keys(acc).includes(key)) return;
        acc[key] += kpi[key];
      });
      return acc;
    },
    { ...emptyResponse }
  );
}

function addAggregationMatchPeriod($match, kpiByPeriodType) {
  return {
    ...$match,
    [KpiDictionnary.period]:
      kpiByPeriodType === 'monthly'
        ? { $in: dateHelpers.generateLast10MonthPeriod() }
        : {
            $in: [
              ...dateHelpers.generateDaysFromStartOfCurrentMonth(),
              ...dateHelpers.generateDaysToEndOfLastYearMonth(),
            ],
          },
  };
}

function generateAggregationProjection() {
  return {
    _id: null,
    countConversionsVO: `$${KpiDictionary.countConvertedLeadsVo}`,
    countConversionsVN: `$${KpiDictionary.countConvertedLeadsVn}`,
    countConversionsLeads: `$${KpiDictionary.countConvertedLeads}`,
    countConversionsTradeins: `$${KpiDictionary.countConvertedTradeIns}`,
    countConversions: {
      $add: [
        { $ifNull: [`$${KpiDictionary.countConvertedLeads}`, 0] },
        { $ifNull: [`$${KpiDictionary.countConvertedTradeIns}`, 0] },
      ],
    },
    countLeads: `$${KpiDictionary.countLeadsPotentialSales}`,
  };
}

async function _aggregateResults(args, model, godMode, userGaragesIds, kpiByPeriodType = 'monthly') {
  const { garageIds: requestGarageIds, periodId = 'last12Month', cockpitType } = args;

  let $match = match(KpiTypes.GARAGE_KPI, godMode, cockpitType, periodId, null, requestGarageIds, userGaragesIds);

  $match = addAggregationMatchPeriod($match, kpiByPeriodType);

  const $project = generateAggregationProjection();

  let agg = await model.getMongoConnector().aggregate([{ $match }, { $project }]).toArray();
  if (!agg || !agg.length || !agg[0]) {
    agg = [{ ...emptyResponse }];
  }
  return agg;
}

module.exports.resolvers = {
  Query: {
    kpiByPeriodGetGaragesConversions: async (obj, args, context) => {
      try {
        const {
          app,
          scope: { logged, authenticationError, user, godMode },
        } = context;
        const { garageIds: userGaragesIds } = user;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        } else if (!user.hasAuthorization(UserAuthorization.ACCESS_TO_COCKPIT)) {
          throw new ForbiddenError('Not authorized');
        }

        const aggregationsResults = [
          ...(await _aggregateResults(args, app.models.KpiByPeriod, godMode, userGaragesIds, 'monthly')),
          ...(await _aggregateResults(args, app.models.KpiByDailyPeriod, godMode, userGaragesIds, 'daily')),
        ];

        return mergeKpiResults(aggregationsResults);
      } catch (error) {
        log.error(ANASS, error);
        return error;
      }
    },
  },
  kpiByPeriodGetGaragesConversionsValues: {
    countConversionsPct({ countConversions, countLeads }) {
      if (!countConversions || !countLeads) return 0;
      return Math.round((1000 * countConversions) / countLeads) / 10;
    },
    countConvertedLeadsPct({ countConversionsLeads, countLeads }) {
      if (!countConversionsLeads || !countLeads) return 0;
      return Math.round((1000 * countConversionsLeads) / countLeads) / 10;
    },
    countConversionsTradeInsPct({ countConversionsTradeins, countLeads }) {
      if (!countConversionsTradeins || !countLeads) return 0;
      return Math.round((1000 * countConversionsTradeins) / countLeads) / 10;
    },
  },
};
