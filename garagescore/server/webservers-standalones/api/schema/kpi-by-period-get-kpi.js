const { AuthenticationError, ForbiddenError } = require('apollo-server-express');
const GraphQLDate = require('graphql-date');
const { kpiByPeriodGetKpi } = require('../../../../frontend/api/graphql/definitions/queries.json');
const kpiDictionary = require('../../../../common/lib/garagescore/kpi/KpiDictionary');
const { ObjectID } = require('mongodb');
const UserAuthorization = require('../../../../common/models/user-autorization');
const KpiTypes = require('../../../../common/models/kpi-type');
const { match, $groups } = require('../_common/kpi-by-period');
const { IZAD, log } = require('../../../../common/lib/util/log');

const typePrefix = 'kpiByPeriodGetKpi';
const resolveFunctions = {
  Date: GraphQLDate,
};

const listFields = kpiDictionary.keysAsArray.map((key) => {
  return `${key}: ${kpiDictionary.keyTypes[key] === String ? 'String' : 'Int'}`;
});

module.exports.typeDef = `
  extend type Query {
    ${kpiByPeriodGetKpi.type}: ${typePrefix}Kpi
  }
  type ${typePrefix}Kpi {    
    garagesKpi: ${typePrefix}KpiCounts
    usersKpi: ${typePrefix}KpiCounts
  }

  type ${typePrefix}KpiCounts {
    ${listFields.toString()}
  }
`;
module.exports.resolvers = {
  Query: {
    [typePrefix]: async (obj, args, context) => {
      try {
        const {
          app,
          scope: { logged, authenticationError, user, godMode, garageIds },
        } = context;
        const { kpiType, garageId, periodId, cockpitType } = args;
        let { userId: selectedUserId } = args;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }
        if (!user.hasAuthorization(UserAuthorization.ACCESS_TO_COCKPIT)) {
          throw new ForbiddenError('Not authorized');
        }

        const userId = user.id;
        const isManager = godMode || (await user.isManager());

        if (isManager && selectedUserId) {
          selectedUserId = new ObjectID(selectedUserId.toString());
        } else if (!isManager) {
          selectedUserId = userId;
        }

        const KpiByPeriod = app.models.KpiByPeriod.getMongoConnector();
        const results = {};

        {
          // aggregate leads
          const type = kpiType === KpiTypes.AGENT_GARAGE_KPI ? KpiTypes.AGENT_GARAGE_KPI : KpiTypes.GARAGE_KPI;
          const $match = match(type, godMode, cockpitType, periodId, selectedUserId, garageId, garageIds);
          const $group = $groups('garage');
          const aggregate = [{ $match }, { $group }];
          const list = await KpiByPeriod.aggregate(aggregate).toArray();
          results.garagesKpi = !list || list.length === 0 ? {} : list[0];
        }
        if (kpiType !== KpiTypes.AGENT_GARAGE_KPI) {
          // aggregate unsat
          const $match = match(
            KpiTypes.USER_KPI,
            godMode,
            cockpitType,
            periodId,
            selectedUserId,
            garageId,
            garageIds
          );
          const $group = $groups('user');
          const aggregate = [{ $match }, { $group }];
          const list = await KpiByPeriod.aggregate(aggregate).toArray();
          results.usersKpi = !list ? {} : list[0];
        }
        return results;
      } catch (error) {
        log.error(IZAD, error);
        return error;
      }
    },
  },
};
