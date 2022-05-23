const { AuthenticationError } = require('apollo-server-express');
const queries = require('../../../../frontend/api/graphql/definitions/queries.json');

const generalStatsCommon = require('../../../../common/lib/garagescore/generalStats/_common.js');

const typePrefix = 'configurationGetGeneralStats';
module.exports.typeDef = `
  extend type Query {
    ${queries.GeneralStats.type}: ${typePrefix}GeneralStats
  }

  type ${typePrefix}GeneralStats {
    top: ${typePrefix}RateItem
    allGarages: ${typePrefix}RateItem
  }

  type ${typePrefix}RateItem {
    rate: Float
  }
`;
module.exports.resolvers = {
  Query: {
    GeneralStats: async (obj, args, context) => {
      const { logged, authenticationError, garageIds, app } = context.scope;
      const { period, cockpitType, type, key } = args;
      if (!logged) {
        throw new AuthenticationError(authenticationError);
      }
      const generalStats = await generalStatsCommon.getGeneralStats(app);
      return generalStats[period][cockpitType][type][key];
    },
  },
};
