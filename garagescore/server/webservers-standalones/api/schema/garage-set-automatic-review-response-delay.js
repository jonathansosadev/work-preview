const { AuthenticationError } = require('apollo-server-express');
const { garageSetAutomaticReviewResponseDelay } = require('../../../../frontend/api/graphql/definitions/mutations.json');
const { setGarageAutomaticReviewResponseDelay } = require('../../../../common/models/garage/garage-methods');
const { ObjectId } = require('mongodb')
const { SAMAN, log } = require('../../../../common/lib/util/log');
const prefix = 'garageSetAutomaticReviewResponseDelay';

module.exports.typeDef = `
  extend type Mutation {
    ${garageSetAutomaticReviewResponseDelay.type}: ${prefix}Result
  }
  type ${prefix}Result {
    message: String,
    status: String,
    automaticReviewResponseDelay: Int 
  }
`;
module.exports.resolvers = {
  Mutation: {
    [prefix]: async (obj, args, context) => {
      try {
        const {
          app,
          scope: { logged, authenticationError, garageIds: userGarages },
        } = context;
        const { garageId, automaticReviewResponseDelay } = args;
        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }
        if (automaticReviewResponseDelay < -1) {
          throw new Error("Invalid delay");
        }
        const userGaragesString = userGarages.map((garage) => garage.toString())
        if (!userGaragesString.includes(garageId.toString())) {
          throw new Error("This garage doesn't belong to you")
        }
        // updates the garage
        const garage = await setGarageAutomaticReviewResponseDelay(app, garageId, automaticReviewResponseDelay);
        if (!garage) {
          throw new Error("Garage not found")
        }
        return {
          message: "Delay modified",
          status: "OK",
          automaticReviewResponseDelay: garage.automaticReviewResponseDelay
        }
      } catch (error) {
        log.error(SAMAN, error);
        return { status: 'FAILED', message: error.message };
      }
    },
  },
};
