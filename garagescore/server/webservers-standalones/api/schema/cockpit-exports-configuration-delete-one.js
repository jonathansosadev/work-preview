const { AuthenticationError, ForbiddenError } = require('apollo-server-express');
const UserAuthorization = require('../../../../common/models/user-autorization');
const { cockpitExportsConfigurationDeleteOne } = require('../../../../frontend/api/graphql/definitions/mutations.json');
const { ObjectID } = require('mongodb');
const { MOMO, log } = require('../../../../common/lib/util/log');

const prefix = 'cockpitExportsConfigurationDeleteOne';

module.exports.typeDef = `
  extend type Mutation {
    ${cockpitExportsConfigurationDeleteOne.type}: ${prefix}Result
  }
  type ${prefix}Result {
    status: String
    message: String
    data : ${prefix}Configuration
  }
  type ${prefix}Configuration {
    id: String
  }
`;

module.exports.resolvers = {
  Mutation: {
    [prefix]: async (obj, args, context) => {
      try {
        const {
          app,
          // eslint-disable-next-line no-unused-vars
          hasMore,
          scope: { logged, authenticationError, user },
        } = context;
        const { id } = args;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }
        if (!user.hasAuthorization(UserAuthorization.ACCESS_TO_COCKPIT)) {
          throw new ForbiddenError('Not authorized');
        }

        const mongoConnector = app.models.CockpitExportConfiguration.getMongoConnector();
        const query = {
          _id: new ObjectID(id),
          /* a user can only delete his own export configuration */
          userId: new ObjectID(user.id.toString()),
        };

        const res = await mongoConnector.deleteOne(query);

        if (!res.deletedCount) {
          throw new Error(`Configuration not found or doesn't belongs to user ${user.id.toString()}`);
        }

        return {
          status: 'success',
          message: 'Configuration deleted',
          data: { id },
        };
      } catch (error) {
        log.error(MOMO, error);
        return { status: 'error', message: error.message };
      }
    },
  },
};
