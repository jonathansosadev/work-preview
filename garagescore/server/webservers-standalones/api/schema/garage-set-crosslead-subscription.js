/**
 * Query KPIs source list, aggregate created by Simon/keysim
 */
const { AuthenticationError } = require('apollo-server-express');
const mutations = require('../../../../frontend/api/graphql/definitions/mutations.json');
const { BANG, log } = require('../../../../common/lib/util/log');
const GarageSubscriptionTypes = require('../../../../common/models/garage.subscription.type');
const GarageTypes = require('../../../../common/models/garage.type');

const typePrefix = 'garageSetCrossLeadsSubscription';

module.exports.typeDef = `
  extend type Mutation {
    ${mutations.garageSetCrossLeadsSubscription.type}: ${typePrefix}Request
  }

  type ${typePrefix}Request {
    message: String
    status: String
  }
`;

module.exports.resolvers = {
  Mutation: {
    garageSetCrossLeadsSubscription: async (obj, args, context) => {
      try {
        const {
          app,
          scope: { logged, authenticationError, user },
        } = context;
        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }
        if (user.isGarageScoreUser()) throw new Error('GarageScore users should not click on this button');
        // re-active sources if exist
        const promises = user.garageIds.map(async (id) => {
          const garage = await app.models.Garage.findById(id, {
            fields: {
              id: 1,
              publicDisplayName: 1,
              crossLeadsConfig: 1,
            },
          });
          if (garage.crossLeadsConfig) {
            garage.enableAllSourcesCrossLeads();
            await garage.updateFromObject({
              crossLeadsConfig: garage.crossLeadsConfig,
            });
          }
        });
        // add crossLeads subscription
        promises.push(
          user.subscribeTo(
            GarageSubscriptionTypes.CROSS_LEADS,
            {
              price: 0,
              included: 0,
              unitPrice: 0,
              restrictMobile: false,
              minutePrice: 0.15, // default price
            },
            (g) => GarageTypes.hasAccessToCrossLeads(g.type) && g.locale === 'fr_FR' // TODO CROSS-LEADS TEMP filter
          )
        );
        // execute all
        await Promise.all(promises);
        return { message: '', status: 'OK' };
      } catch (error) {
        log.error(BANG, error);
        return { message: error.message, status: 'KO' };
      }
    },
  },
};
