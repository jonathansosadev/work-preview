const { ObjectID } = require('mongodb');

const { AutomationCampaignTargets, AutomationCampaignStatuses } = require('../../../../frontend/utils/enumV2');
const AutomationCampaignChannelTypes = require('../../../../common/models/automation-campaign-channel.type');
const { AuthenticationError } = require('apollo-server-express');
const mutations = require('../../../../frontend/api/graphql/definitions/mutations.json');
const { TIBO, log } = require('../../../../common/lib/util/log');
const {
  resolvers: {
    Query: { AutomationGetCampaignsForSpecificTarget },
  },
} = require('./automation-get-campaigns-for-specific-target');

const typePrefix = 'AutomationCampaignsToggleStatus';

module.exports.typeDef = `
  extend type Mutation {
    ${mutations.AutomationCampaignsToggleStatus.type}: [${typePrefix}AutomationCampaignList]
  }
  type ${typePrefix}AutomationCampaignList {
    garageId: String,
    garageName: String,
    status: String,
    contactType: String,
    runDate: Date,
    customContentId: String
    garageLogo: String
    garageBrand: String
  }
`;

module.exports.resolvers = {
  Mutation: {
    AutomationCampaignsToggleStatus: async (obj, args, context) => {
      try {
        const {
          app,
          scope: { logged, authenticationError, garageIds, godMode, user },
        } = context;
        const togglableStatuses = [AutomationCampaignStatuses.IDLE, AutomationCampaignStatuses.RUNNING];

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }

        if (
          !godMode &&
          args.garageIds.some((garageId) => !garageIds.map((garageId) => garageId.toString()).includes(garageId))
        ) {
          throw new Error(
            `AutomationCampaignsToggleStatus ERROR : You're trying to access a garage that does not belong to you`
          );
        }

        if (!AutomationCampaignTargets.hasValue(args.target)) {
          throw new Error(`AutomationCampaignsToggleStatus ERROR : Unknown target ${args.target}`);
        }

        if (args.status && !togglableStatuses.includes(args.status)) {
          throw new Error(`AutomationCampaignsToggleStatus ERROR : Unknown status ${args.status}`);
        }

        if (args.channelType && !AutomationCampaignChannelTypes.hasValue(args.channelType)) {
          throw new Error(`AutomationCampaignsToggleStatus ERROR : Unknown channelType ${args.channelType}`);
        }

        if (!args.channelType && !args.status) {
          throw new Error(
            'AutomationCampaignsToggleStatus ERROR : No status and no channelType provided. What are you trying to do?'
          );
        }
        const lastToggledDate = new Date();
        if (args.status) {
          const updateResult = await app.models.AutomationCampaign.getMongoConnector().updateMany(
            {
              garageId: { $in: args.garageIds.map((garageId) => new ObjectID(garageId)) },
              target: args.target,
              status:
                args.status === AutomationCampaignStatuses.RUNNING
                  ? AutomationCampaignStatuses.IDLE
                  : AutomationCampaignStatuses.RUNNING,
              hidden: { $ne: true },
            },
            {
              $set: {
                status: args.status,
                runDayNumber: app.models.AutomationCampaign.getNextRunDayNumber(
                  app.models.AutomationCampaign.getFrequency(args.target)
                ),
                lastToggledBy: user.id,
                lastToggledDate: lastToggledDate,
              },
            }
          );
          log.info(TIBO, `AutomationCampaignsToggleStatus : Updated ${updateResult.modifiedCount} Campaigns`);
        } else {
          const contactType = args.channelType === AutomationCampaignChannelTypes.BOTH ? null : args.channelType;
          const updateResult = await app.models.AutomationCampaign.getMongoConnector().updateMany(
            {
              garageId: { $in: args.garageIds.map((garageId) => new ObjectID(garageId)) },
              target: args.target,
              status: AutomationCampaignStatuses.IDLE,
              ...(contactType ? { contactType } : {}),
              hidden: { $ne: true },
            },
            {
              $set: {
                status: AutomationCampaignStatuses.RUNNING,
                runDayNumber: app.models.AutomationCampaign.getNextRunDayNumber(
                  app.models.AutomationCampaign.getFrequency(args.target)
                ),
                lastToggledBy: user.id,
                lastToggledDate: lastToggledDate,
              },
            }
          );
          if (contactType) {
            await app.models.AutomationCampaign.getMongoConnector().updateMany(
              {
                garageId: { $in: args.garageIds.map((garageId) => new ObjectID(garageId)) },
                target: args.target,
                status: AutomationCampaignStatuses.RUNNING,
                contactType:
                  contactType === AutomationCampaignChannelTypes.EMAIL
                    ? AutomationCampaignChannelTypes.MOBILE
                    : AutomationCampaignChannelTypes.EMAIL,
                hidden: { $ne: true },
              },
              {
                $set: {
                  status: AutomationCampaignStatuses.IDLE,
                  lastToggledBy: user.id,
                  lastToggledDate: lastToggledDate,
                },
              }
            );
          }
          log.info(
            TIBO,
            `AutomationCampaignsToggleStatus : Updated ${updateResult.modifiedCount} Campaignsby ${user.email} (${user.id})`
          );
        }

        return AutomationGetCampaignsForSpecificTarget(obj, args, context);
      } catch (error) {
        log.error(TIBO, error);
        return error;
      }
    },
  },
};
