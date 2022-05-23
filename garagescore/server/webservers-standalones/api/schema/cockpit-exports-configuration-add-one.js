const { AuthenticationError, ForbiddenError } = require('apollo-server-express');
const UserAuthorization = require('../../../../common/models/user-autorization');
const { cockpitExportsConfigurationAddOne } = require('../../../../frontend/api/graphql/definitions/mutations.json');
const { ObjectID } = require('mongodb');
const { ExportTypes } = require('../../../../frontend/utils/enumV2');
const { MOMO, log } = require('../../../../common/lib/util/log');
const Validations = require('../../../../common/lib/garagescore/cockpit-exports/validations/export-validations');

const prefix = 'cockpitExportsConfigurationAddOne';

module.exports.typeDef = `
  extend type Mutation {
    ${cockpitExportsConfigurationAddOne.type}: ${prefix}Result
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
          scope: { logged, authenticationError, user, garageIds: userGarageIds, locale, fullLocale },
        } = context;
        const {
          userId,
          exportType,
          periodId,
          startPeriodId,
          endPeriodId,
          frequency,
          dataTypes,
          garageIds,
          fields,
          name,
          recipients,
          frontDeskUsers,
        } = args;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }
        if (!user.hasAuthorization(UserAuthorization.ACCESS_TO_COCKPIT)) {
          throw new ForbiddenError('Not authorized');
        }
        /* validate every arguments */
        Validations.commonValidations(args);

        Validations.validateCustomExport(args, { currentGarageIds: userGarageIds, user });

        /* a user can only create his own export configuration */
        /* argument userId should be validated before => do not move */
        if (user.id.toString() !== userId.toString()) {
          throw new ForbiddenError("Not authorized to create this user export's configuration");
        }

        const mongoConnector = app.models.CockpitExportConfiguration.getMongoConnector();
        const query = {
          userId: new ObjectID(userId),
          exportType,
          periodId,
          startPeriodId,
          endPeriodId,
          frequency,
          dataTypes,
          garageIds: garageIds.map((gId) => (gId === 'All' ? gId : new ObjectID(gId))),
          fields,
          name,
          recipients,
          automaticallyGenerated: false,
          ...([ExportTypes.FRONT_DESK_USERS_DMS, ExportTypes.FRONT_DESK_USERS_CUSTEED].includes(exportType) && {
            frontDeskUsers,
          }),
          locale,
          fullLocale,
        };

        const res = await mongoConnector.insertOne(query);

        return {
          status: 'success',
          message: 'Configuration created',
          data: { id: res.insertedId },
        };
      } catch (error) {
        log.error(MOMO, error);
        return { status: 'error', message: error.message, data: null };
      }
    },
  },
};
