const { AuthenticationError, ForbiddenError } = require('apollo-server-express');
const { TIBO, log } = require('../../../../common/lib/util/log');
const queries = require('../../../../frontend/api/graphql/definitions/queries.json');
const UserAuthorization = require('../../../../common/models/user-autorization');
const Validations = require('../../../../common/lib/garagescore/cockpit-exports/validations/export-validations');
const { JobTypes } = require('../../../../frontend/utils/enumV2');
const Scheduler = require('../../../../common/lib/garagescore/scheduler/scheduler');
const queryGenerators = require('../../../../common/lib/garagescore/cockpit-exports/queries/query-generators');
const serializer = require('../../../../common/lib/util/serializer');
const { isUnitTest } = require('../../../../common/lib/util/process-env');
const { ObjectId } = require('mongodb');
const { isGarageScoreUserByEmail } = require('../../../../common/lib/garagescore/custeed-users');

const typePrefix = 'startCockpitExport';

module.exports.typeDef = `
  extend type Query {
    ${queries.CockpitExport.type}: ${typePrefix}Result
  }

  type ${typePrefix}Result {
    status: String
    message: String
    data: ${typePrefix}Data
  }

  type ${typePrefix}Data {
    recipients: [String]
  }

  input FrontDeskUser {
    id: String!,
    frontDeskUserName: String!,
    garageId: String,
    garagePublicDisplayName: String
  }
`;

module.exports.resolvers = {
  Query: {
    async CockpitExport(obj, args, context) {
      try {
        const { app } = context;
        const {
          exportName,
          exportType,
          periodId,
          startPeriodId,
          endPeriodId,
          dataTypes = [],
          garageIds = ['All'],
          fields = [],
          recipients = [],
          adminFilterRole,
          adminFilterJob,
          adminFilterLastCockpitOpenAt,
          adminSearch,
          exportConfigurationId = null,
          frequency,
          selectedAutomationCampaigns,
          automationCampaignType,
          isBackdoor,
        } = args;
        const { garageIds: currentGarageIds, logged, authenticationError, user, locale, fullLocale } = context.scope;

        // Check if the user is logged
        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }

        if (!user.hasAuthorization(UserAuthorization.ACCESS_TO_COCKPIT)) {
          throw new ForbiddenError('Not authorized');
        }

        Validations.commonValidations(args);

        Validations.validationsByExportType[exportType](
          {
            exportType,
            periodId,
            startPeriodId,
            endPeriodId,
            dataTypes,
            garageIds,
            fields,
            recipients,
            adminFilterRole,
            adminFilterJob,
            adminFilterLastCockpitOpenAt,
            frequency,
            selectedAutomationCampaigns,
          },
          { currentGarageIds, user }
        );

        const userInfo = {
          id: user.id.toString(),
          isCusteed: Boolean(isGarageScoreUserByEmail(user.email)),
          isBackdoor: Boolean(isBackdoor),
        };

        const query = await queryGenerators.generate({
          app,
          args,
          userGarageIds: currentGarageIds,
          user: userInfo,
        });

        if (!isUnitTest()) {
          log.info(
            TIBO,
            `[APOLLO / START-COCKPIT-EXPORT] Creating Export Job Of Type ${exportType} For ${recipients.join(', ')}`
          );

          await Scheduler.upsertJob(
            JobTypes.START_EXPORT,
            {
              ...{
                ...args,
                exportConfigurationId: exportConfigurationId ? new ObjectId(exportConfigurationId) : null,
                user: userInfo,
              },
              query: serializer.serialize(query),
              locale,
              fullLocale,
              // avoid duplicate payload
              timestamp: new Date().getTime(),
            },
            new Date(),
            { immediate: true }
          );
        }

        return {
          status: 'success',
          message: '',
          data: { recipients },
        };
      } catch (e) {
        log.error(TIBO, `[APOLLO / START-COCKPIT-EXPORT] ERROR :: ${e.toString()}`);
        log.error(TIBO, e);
        return {
          status: 'error',
          message: e.toString(),
          data: { recipients: [] },
        };
      }
    },
  },
};
