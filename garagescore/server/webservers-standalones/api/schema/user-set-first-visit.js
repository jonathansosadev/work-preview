const { AuthenticationError, ForbiddenError, UserInputError } = require('apollo-server-express');
const { userSetFirstVisit } = require('../../../../frontend/api/graphql/definitions/mutations.json');
const UserAuthorization = require('../../../../common/models/user-autorization');
const { IZAD, log } = require('../../../../common/lib/util/log');

const prefix = 'userSetFirstVisit';

module.exports.typeDef = `
  extend type Mutation {
    ${userSetFirstVisit.type}: ${prefix}Result
  }
  type ${prefix}Result {
    success: Boolean!
    error: String
  }
`;
module.exports.resolvers = {
  Mutation: {
    [prefix]: async (obj, args, context) => {
      try {
        const {
          app,
          scope: { logged, authenticationError, user },
        } = context;
        const { firstVisit, value } = args;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        } else if (!user.hasAuthorization(UserAuthorization.ACCESS_TO_COCKPIT)) {
          throw new ForbiddenError('Not authorized to access this resource');
        }

        const allowedFirstVisitFieldName = ['EREPUTATION'];
        if (!allowedFirstVisitFieldName.includes(firstVisit)) {
          throw new UserInputError('Field firstVisit supplied is not allowed');
        }
        await app.models.User.getMongoConnector().updateOne(
          { _id: user.id },
          { $set: { [`firstVisit.${firstVisit}`]: value } }
        );

        return { success: true };
      } catch (error) {
        log.error(IZAD, error);
        return { success: false, error: (error && error.message) || 'an error occured' };
      }
    },
  },
};
