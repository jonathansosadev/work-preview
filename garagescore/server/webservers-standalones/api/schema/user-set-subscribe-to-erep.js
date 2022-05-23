const { AuthenticationError, ForbiddenError } = require('apollo-server-express');
const { userSetSubscribeToErep } = require('../../../../frontend/api/graphql/definitions/mutations.json');
const UserAuthorization = require('../../../../common/models/user-autorization');
const { isGarageScoreUser, isPriorityProfile } = require('../../../../common/models/user/user-methods');
const { IZAD, log } = require('../../../../common/lib/util/log');

const prefix = 'userSetSubscribeToErep';

module.exports.typeDef = `
  extend type Mutation {
    ${userSetSubscribeToErep.type}: ${prefix}Result
  }
  type ${prefix}Result {
    message: String
    success: Boolean
    unauthorized: Boolean
  }
`;
module.exports.resolvers = {
  Mutation: {
    [prefix]: async (obj, args, context) => {
      let unauthorized = true;
      try {
        const {
          app,
          scope: { logged, authenticationError, user },
        } = context;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        } else if (!user.hasAuthorization(UserAuthorization.ACCESS_TO_COCKPIT)) {
          throw new ForbiddenError('Not authorized to access this resource');
        }

        if (isGarageScoreUser(user)) {
          return {
            success: false,
            message: 'errorGarageScoreUser',
            unauthorized,
          };
        }
        if (isPriorityProfile(user)) {
          await app.models.User.subscribeToErep(user);
          unauthorized = false;
        }
        return { success: true, unauthorized };
      } catch (error) {
        log.error(IZAD, error);
        return { success: false, unauthorized };
      }
    },
  },
};
