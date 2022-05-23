const { AuthenticationError, ForbiddenError } = require('apollo-server-express');
const { garageGetGaragesSignatures } = require('../../../../frontend/api/graphql/definitions/queries.json');
const UserAuthorization = require('../../../../common/models/user-autorization');
const { getGaragesDefaultSignature } = require('../../../../common/models/garage/garage-methods');
const { SAMAN, log } = require('../../../../common/lib/util/log');

const typePrefix = 'garageGetGaragesSignatures';

module.exports.typeDef = `
  extend type Query {
    ${garageGetGaragesSignatures.type}: [${typePrefix}Signature]
  }
  type ${typePrefix}Signature{
    _id: ID
    group: String
    lastName: String
    firstName: String
    job: String
  }

`;
module.exports.resolvers = {
  Query: {
    [typePrefix]: async (obj, args, context) => {
      try {
        const {
          scope: { logged, authenticationError, garageIds, user },
        } = context;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }
        if (!user.hasAuthorization(UserAuthorization.ACCESS_TO_COCKPIT)) {
          throw new ForbiddenError('Not authorized');
        }
        const result = await getGaragesDefaultSignature(garageIds)

        return result;
      } catch (error) {
        log.error(SAMAN, error);
        return error;
      }
    },
  },
};
