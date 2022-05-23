const { ObjectID } = require('mongodb');

const { AuthenticationError } = require('apollo-server-express');
const mutations = require('../../../../frontend/api/graphql/definitions/mutations.json');
const { FED, log } = require('../../../../common/lib/util/log');

const typePrefix = 'AutomationCampaignsDeleteCustomContent';

module.exports.typeDef = `
  extend type Mutation {
    ${mutations.AutomationCampaignsDeleteCustomContent.type}: ${typePrefix}Result
  }
  type ${typePrefix}Result {
    result: String
  }
`;

module.exports.resolvers = {
  Mutation: {
    AutomationCampaignsDeleteCustomContent: async (obj, args, context) => {
      try {
        const {
          app,
          scope: { logged, authenticationError, garageIds, godMode, user },
        } = context;

        const { customContentId } = args;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }

        // aggregate to $out the custom content (backup)
        await app.models.AutomationCampaignsCustomContent.getMongoConnector().aggregate([
          {
            $match: {
              _id: new ObjectID(customContentId),
            },
          },
          { $out: 'automationCampaignsCustomContentDeleted' },
        ]);
        // Remove association of the content on campaigns
        await app.models.AutomationCampaign.getMongoConnector().updateMany(
          { customContentId: new ObjectID(customContentId) },
          { $set: { customContentId: null } }
        );
        // Delete the said custom content
        await app.models.AutomationCampaignsCustomContent.getMongoConnector().remove({
          _id: new ObjectID(customContentId),
        });

        log.info(
          FED,
          `AutomationCampaignsDeleteCustomContent : ${customContentId} deleted by ${user.email} (${user.id})`
        );
      } catch (error) {
        log.error(FED, error);
        return error;
      }
    },
  },
};
