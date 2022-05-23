const { AuthenticationError, ForbiddenError, UserInputError } = require('apollo-server-express');
const { cockpitExportsConfigurationGet } = require('../../../../frontend/api/graphql/definitions/queries.json');
const UserAuthorization = require('../../../../common/models/user-autorization');
const { ObjectID } = require('mongodb');
const { MOMO, log } = require('../../../../common/lib/util/log');

const typePrefix = 'cockpitExportsConfigurationGet';

module.exports.typeDef = `
  extend type Query {
    ${cockpitExportsConfigurationGet.type}: ${typePrefix}Result
  }

  type ${typePrefix}Result {
    status: String
    message: String
    data : [${typePrefix}Configuration]
  }

  type ${typePrefix}Configuration {
    id: String
    userId: String
    exportType: String
    periodId: String
    startPeriodId: String
    endPeriodId: String
    frequency: String
    dataTypes: [String]
    garageIds: [String]
    fields: [String]
    name: String
    recipients: [String]
    frontDeskUsers: [${typePrefix}FrontDeskUser]
  }

  type ${typePrefix}FrontDeskUser {
    id: String
    frontDeskUserName : String!
    garageId: String
    garagePublicDisplayName: String
  }
`;
module.exports.resolvers = {
  Query: {
    [typePrefix]: async (obj, args, context) => {
      try {
        const {
          app,
          hasMore,
          scope: { logged, authenticationError, user, godMode, garageIds: userGarageIds },
        } = context;
        const { id, userId } = args;

        //--------------------------------------------------------------------------------------//
        //                                      Validation                                      //
        //--------------------------------------------------------------------------------------//

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }
        if (!user.hasAuthorization(UserAuthorization.ACCESS_TO_COCKPIT)) {
          throw new ForbiddenError('Not authorized');
        }

        /** ARGS **/
        /* userId : valid objectId */
        if (userId && !ObjectID.isValid(userId)) {
          throw new UserInputError(`Invalid userId : ${userId}`);
        }

        /* a user can only request his own export configuration */
        /* argument userId should be validated before */
        if (userId && user.id.toString() !== userId.toString()) {
          throw new ForbiddenError("Not authorized to access this user export's configuration");
        }
        //--------------------------------------------------------------------------------------//

        const mongoConnector = app.models.CockpitExportConfiguration.getMongoConnector();

        let $match = {};

        if (id) {
          $match = {
            _id: new ObjectID(id),
            /* a user can only request his own export configuration */
            userId: new ObjectID(user.id),
          };
        } else {
          $match = {
            ...(id && { id }),
            /* a user can only request his own export configuration */
            userId: new ObjectID(user.id),
          };
        }
        const $project = {
          id: '$_id',
          userId: 1,
          exportType: 1,
          periodId: 1,
          startPeriodId: 1,
          endPeriodId: 1,
          frequency: 1,
          dataTypes: 1,
          garageIds: 1,
          fields: 1,
          name: 1,
          recipients: 1,
          frontDeskUsers: 1,
        };

        const res = await mongoConnector.aggregate([{ $match }, { $project }]).toArray();
        return { status: 'success', data: res };
      } catch (error) {
        log.error(MOMO, error);
        return { status: 'error', data: null, message: error.message };
      }
    },
  },
};
