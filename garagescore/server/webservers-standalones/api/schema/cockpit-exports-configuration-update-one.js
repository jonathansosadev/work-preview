const { AuthenticationError, UserInputError, ForbiddenError } = require('apollo-server-express');
const UserAuthorization = require('../../../../common/models/user-autorization');
const { cockpitExportsConfigurationUpdateOne } = require('../../../../frontend/api/graphql/definitions/mutations.json');
const { ObjectID } = require('mongodb');
const { ExportTypes } = require('../../../../frontend/utils/enumV2');
const { MOMO, log } = require('../../../../common/lib/util/log');
const Validations = require('../../../../common/lib/garagescore/cockpit-exports/validations/export-validations');

const prefix = 'cockpitExportsConfigurationUpdateOne';

module.exports.typeDef = `
  extend type Mutation {
    ${cockpitExportsConfigurationUpdateOne.type}: ${prefix}Result
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
          id,
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

        const mongoConnector = app.models.CockpitExportConfiguration.getMongoConnector();

        const query = {
          _id: new ObjectID(id.toString()),
          /* a user can only update his own export configuration */
          userId: new ObjectID(user.id.toString()),
        };

        const $set = {
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
          ...([ExportTypes.FRONT_DESK_USERS_DMS, ExportTypes.FRONT_DESK_USERS_CUSTEED].includes(exportType) && {
            frontDeskUsers,
          }),
          automaticallyGenerated: false,
          locale,
          fullLocale,
        };

        const res = await mongoConnector.updateOne(query, { $set });

        if (!res.matchedCount) {
          throw new Error(`Configuration not found or doesn't belongs to user ${user.id.toString()}`);
        }

        return {
          status: 'success',
          message: res.modifiedCount ? 'Configuration updated' : 'Configuration found, nothing to update',
          data: { id },
        };
      } catch (error) {
        log.error(MOMO, error);
        return { status: 'error', message: error.message, data: null };
      }
    },
  },
};
