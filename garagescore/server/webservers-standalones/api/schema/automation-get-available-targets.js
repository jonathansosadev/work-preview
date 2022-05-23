const { ObjectID } = require('mongodb');

const { AuthenticationError } = require('apollo-server-express');
const queries = require('../../../../frontend/api/graphql/definitions/queries.json');
const { TIBO, log } = require('../../../../common/lib/util/log');
const { AutomationCampaignTargets } = require('../../../../frontend/utils/enumV2');
const i18nRequire = require('../../../../common/lib/garagescore/i18n/i18n');

const typePrefix = 'automationGetAvailableTargets';

module.exports.typeDef = `
  extend type Query {
    ${queries.AutomationAvailableTargets.type}: [${typePrefix}AutomationTargetList]
  }
  type ${typePrefix}AutomationTargetList {
    name: String,
    id: String,
  }
`;

module.exports.resolvers = {
  Query: {
    AutomationAvailableTargets: async (obj, args, context) => {
      try {
        const { app } = context;
        const { logged, authenticationError, garageIds, godMode, locale = 'fr' } = context.scope;
        const { dataType } = args;
        let garages = [];

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }

        if (!dataType) {
          throw new Error('Automation-get-available-targets: dataType argument required');
        }

        const AutomationCampaignTargetNames = new i18nRequire('common/models/automation-campaign', { locale });

        if (!godMode) {
          garages = await app.models.Garage.getMongoConnector()
            .find({ _id: { $in: garageIds.map((id) => new ObjectID(id)) } }, { projection: { subscriptions: true } })
            .toArray();
        }

        return AutomationCampaignTargets.values()
          .filter((target) => {
            const subscriptionsNeeded = AutomationCampaignTargets.getProperty(target, 'subscriptionsNeeded');
            const active = AutomationCampaignTargets.getProperty(target, 'active');
            const hasSubscriptionsNeeded = garages.some(({ subscriptions: subs }) => {
              return (
                subscriptionsNeeded && subscriptionsNeeded.every((sub) => sub.some((s) => subs[s] && subs[s].enabled))
              );
            });

            return active && (godMode || hasSubscriptionsNeeded);
          })
          .map((key) => {
            return {
              name: AutomationCampaignTargetNames.$t(key),
              id: key,
            };
          });
      } catch (error1) {
        log.error(TIBO, error1);
        return [];
      }
    },
  },
};
