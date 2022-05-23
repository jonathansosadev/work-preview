const { ObjectID } = require('mongodb');
const { AuthenticationError } = require('apollo-server-express');
const mutations = require('../../../../frontend/api/graphql/definitions/mutations.json');
const { FED, log } = require('../../../../common/lib/util/log');

const typePrefix = 'AutomationCampaignsAssignCustomContentToCampaigns';

module.exports.typeDef = `
  extend type Mutation {
    ${mutations.AutomationCampaignsAssignCustomContentToCampaigns.type}: [${typePrefix}modifiedGarageIds]
  }
  type ${typePrefix}modifiedGarageIds {
    modifiedGarageIds: [String]
  }
`;

module.exports.resolvers = {
  Mutation: {
    AutomationCampaignsAssignCustomContentToCampaigns: async (obj, args, context) => {
      try {
        const {
          app,
          scope: { logged, authenticationError, garageIds, godMode, user },
        } = context;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }

        const { target, customContentId } = args;

        if (
          !godMode &&
          args.garageIds.some((garageId) => !garageIds.map((garageId) => garageId.toString()).includes(garageId))
        ) {
          throw new Error(
            `AutomationCampaignsAssignCustomContentToCampaigns ERROR : You're trying to access a garage that does not belong to you`
          );
        }

        await app.models.AutomationCampaign.getMongoConnector().updateMany(
          {
            target,
            garageId: { $in: args.garageIds.map((gId) => new ObjectID(gId)) },
          },
          {
            $set: {
              customContentId: customContentId ? new ObjectID(customContentId) : null,
            },
          }
        );
        await app.models.AutomationCampaignsCustomContent.getMongoConnector().updateMany(
          {
            target,
            activeGarageIds: { $in: args.garageIds.map((gId) => new ObjectID(gId)) },
          },
          {
            $pull: { activeGarageIds: { $in: args.garageIds.map((gId) => new ObjectID(gId)) } },
          }
        );
        if (customContentId) {
          await app.models.AutomationCampaignsCustomContent.getMongoConnector().updateOne(
            {
              _id: new ObjectID(customContentId),
            },
            {
              $addToSet: {
                activeGarageIds: { $each: args.garageIds.map((gId) => new ObjectID(gId)) },
                allTimeGarageIds: { $each: args.garageIds.map((gId) => new ObjectID(gId)) },
              },
            }
          );
        }
        return args.garageIds;
      } catch (error) {
        log.error(FED, error);
        return error;
      }
    },
  },
};
