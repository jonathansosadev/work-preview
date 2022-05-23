const { AuthenticationError } = require('apollo-server-express');
const { garagesGetAutomaticReviewResponseDelay } = require('../../../../frontend/api/graphql/definitions/queries.json');
const { getGaragesAutomaticReviewResponseDelayByPage } = require('../../../../common/models/garage/garage-methods');
const { ObjectId } = require('mongodb')
const { SAMAN, log } = require('../../../../common/lib/util/log');
const prefix = 'garagesGetAutomaticReviewResponseDelay';

module.exports.typeDef = `
  extend type Query {
    ${garagesGetAutomaticReviewResponseDelay.type}: ${prefix}Result
  }
  type ${prefix}Result {
    garages: [${prefix}Garage]
    hasMore: Boolean
    message: String 
    status: String
  }
  type ${prefix}Garage{
    _id: ID
    publicDisplayName: String
    automaticReviewResponseDelay: Int

  }
`;
module.exports.resolvers = {
  Query: {
    [prefix]: async (obj, args, context) => {
      try {
        const {
          app,
          scope: { logged, authenticationError, garageIds: userGarages },
        } = context;
        const { page, limit } = args;
        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }
        if (limit > 100 || limit <= 0) {
          throw new Error("Invalid limit")
        }
        const garageList = await getGaragesAutomaticReviewResponseDelayByPage(app, userGarages, limit, page);
        if (!garageList.garages.length) {
          throw new Error("not found")
        }

        return {
          message: "",
          status: "OK",
          garages: garageList.garages,
          hasMore: garageList.hasMore
        }
      } catch (error) {
        log.error(SAMAN, error);
        return { status: 'FAILED', message: error.message };
      }
    },
  },
};
