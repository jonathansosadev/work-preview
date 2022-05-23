const { AuthenticationError, ForbiddenError } = require('apollo-server-express');
const UserAuthorization = require('../../../../common/models/user-autorization');
const { garageGetAllSources } = require('../../../../frontend/api/graphql/definitions/queries.json');

const { IZAD, log } = require('../../../../common/lib/util/log');

const typePrefix = 'garageGetAllSources';
module.exports.typeDef = `
  extend type Query {
    ${garageGetAllSources.type}: [${typePrefix}Result]
  }
  type ${typePrefix}Result {
    garageId: String
    garagePublicDisplayName: String
    type: String
    enabled: Boolean
    phone: String
    email: String
    followed_phones: [String]
    followed_email: String
  }
`;
module.exports.resolvers = {
  Query: {
    [typePrefix]: async (obj, args, context) => {
      try {
        const {
          app,
          scope: { logged, authenticationError, user, garageIds },
        } = context;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        } else if (!user.hasAuthorization(UserAuthorization.ACCESS_TO_COCKPIT)) {
          throw new ForbiddenError('Not authorized to access this resource');
        }
        return await app.models.Garage.getAllSources(garageIds);
      } catch (error) {
        log.error(IZAD, error);
        return;
      }
    },
  },
};
