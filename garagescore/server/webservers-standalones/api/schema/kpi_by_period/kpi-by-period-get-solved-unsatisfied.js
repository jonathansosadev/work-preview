const { AuthenticationError, ForbiddenError, gql } = require('apollo-server-express');
const UserAuthorization = require('../../../../../common/models/user-autorization');
const { JEAN, log } = require('../../../../../common/lib/util/log');
const { match } = require('../../_common/kpi-by-period');
const KpiTypes = require('../../../../../common/models/kpi-type');
const KpiDictionnary = require('../../../../../common/lib/garagescore/kpi/KpiDictionary');
const moment = require('moment');

module.exports.typeDef = gql`
  extend type Query {
    kpiByPeriodGetSolvedUnsatisfied(cockpitType: String!, garageIds: [String]): kpiByPeriodGetSolvedUnsatisfiedResult
  }
  type kpiByPeriodGetSolvedUnsatisfiedResult {
    # solved unsatisfied
    countSolvedUnsatisfied: Int
    countSolvedAPVUnsatisfied: Int
    countSolvedVNUnsatisfied: Int
    countSolvedVOUnsatisfied: Int

    # unsatisfied
    countUnsatisfied: Int
    countUnsatisfiedApv: Int
    countUnsatisfiedVn: Int
    countUnsatisfiedVo: Int

    # percentages
    countSolvedUnsatisfiedApvPct: Float
    countSolvedUnsatisfiedVnPct: Float
    countSolvedUnsatisfiedVoPct: Float
    countSolvedUnsatisfiedPct: Float
  }
`;

const emptyResponse = {
  countUnsatisfied: 0,
  countUnsatisfiedApv: 0,
  countUnsatisfiedVn: 0,
  countUnsatisfiedVo: 0,
  countSolvedUnsatisfied: 0,
  countSolvedAPVUnsatisfied: 0,
  countSolvedVNUnsatisfied: 0,
  countSolvedVOUnsatisfied: 0,
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
  const $project = {
    _id: 0,
    countUnsatisfied: `$${KpiDictionnary.countUnsatisfied}`,
    countUnsatisfiedApv: `$${KpiDictionnary.countUnsatisfiedApv}`,
    countUnsatisfiedVn: `$${KpiDictionnary.countUnsatisfiedVn}`,
    countUnsatisfiedVo: `$${KpiDictionnary.countUnsatisfiedVo}`,
    countSolvedUnsatisfied: `$${KpiDictionnary.countUnsatisfiedClosedWithResolution}`,
    countSolvedAPVUnsatisfied: `$${KpiDictionnary.countUnsatisfiedClosedWithResolutionApv}`,
    countSolvedVNUnsatisfied: `$${KpiDictionnary.countUnsatisfiedClosedWithResolutionVn}`,
    countSolvedVOUnsatisfied: `$${KpiDictionnary.countUnsatisfiedClosedWithResolutionVo}`,
  };
  return $project;
}

async function _aggregateResults(
  requestArgs,
  KpiByPeriodCollection,
  isUserIsInGodMode = false,
  userAllowedGaragesIds = [],
  kpiByPeriodType = 'monthly'
) {
  const { cockpitType, garageIds } = requestArgs;
  const mongoConnector = KpiByPeriodCollection.getMongoConnector();

  let $match = match(
    KpiTypes.GARAGE_KPI,
    isUserIsInGodMode,
    cockpitType,
    'last12Month',
    null,
    garageIds,
    userAllowedGaragesIds
  );

  $match = addAggregationMatchPeriod($match, kpiByPeriodType);

  const $project = generateAggregationProjection();

  let agg = await mongoConnector.aggregate([{ $match }, { $project }]).toArray();

  if (!agg || !agg.length || !agg[0]) {
    agg = [{ ...emptyResponse }];
  }
  return agg;
}

module.exports.resolvers = {
  Query: {
    kpiByPeriodGetSolvedUnsatisfied: async (obj, args, context) => {
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
        log.error(JEAN, error);
        return error;
      }
    },
  },
  kpiByPeriodGetSolvedUnsatisfiedResult: {
    countSolvedUnsatisfiedApvPct({ countSolvedAPVUnsatisfied, countUnsatisfiedApv }) {
      if (!countSolvedAPVUnsatisfied && !countUnsatisfiedApv) return 0;
      return Math.round((1000 * countSolvedAPVUnsatisfied) / countUnsatisfiedApv) / 10;
    },
    countSolvedUnsatisfiedVnPct({ countSolvedVNUnsatisfied, countUnsatisfiedVn }) {
      if (!countSolvedVNUnsatisfied && !countUnsatisfiedVn) return 0;
      return Math.round((1000 * countSolvedVNUnsatisfied) / countUnsatisfiedVn) / 10;
    },
    countSolvedUnsatisfiedVoPct({ countSolvedVOUnsatisfied, countUnsatisfiedVo }) {
      if (!countSolvedVOUnsatisfied && !countUnsatisfiedVo) return 0;
      return Math.round((1000 * countSolvedVOUnsatisfied) / countUnsatisfiedVo) / 10;
    },
    countSolvedUnsatisfiedPct({ countSolvedUnsatisfied, countUnsatisfied }) {
      if (!countSolvedUnsatisfied && !countUnsatisfied) return 0;
      return Math.round((1000 * countSolvedUnsatisfied) / countUnsatisfied) / 10;
    },
  },
};
