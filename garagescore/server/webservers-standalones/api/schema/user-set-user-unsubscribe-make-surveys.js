const { AuthenticationError } = require('apollo-server-express');
const { userSetUserUnsubscribeMakeSurveys } = require('../../../../frontend/api/graphql/definitions/mutations.json');

const { FED, log } = require('../../../../common/lib/util/log');

const typePrefix = 'userSetUserUnsubscribeMakeSurveys';

module.exports.typeDef = `
  extend type Mutation {
    ${userSetUserUnsubscribeMakeSurveys.type}: ${typePrefix}userSetUserUnsubscribeMakeSurveys
  }
  type ${typePrefix}userSetUserUnsubscribeMakeSurveys {
    success: Boolean
  }
`;
module.exports.resolvers = {
  Mutation: {
    [typePrefix]: async (obj, args, context) => {
      try {
        const {
          app,
          scope: { logged, authenticationError, user },
        } = context;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }
        await app.models.User.getMongoConnector().updateOne(
          { _id: user.getId() },
          { $set: { unsubscribedMakeSurveys: true } }
        );

        return { success: true };
      } catch (error) {
        log.error(FED, error);
        return error;
      }
    },
  },
};
