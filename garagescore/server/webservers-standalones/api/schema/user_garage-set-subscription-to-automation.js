const { AuthenticationError } = require('apollo-server-express');
const mutations = require('../../../../frontend/api/graphql/definitions/mutations.json');
const GarageTypes = require('../../../../common/models/garage.type');
const GarageSubscriptionTypes = require('../../../../common/models/garage.subscription.type');
const UserAutorization = require('../../../../common/models/user-autorization');

const { ANASS, log } = require('../../../../common/lib/util/log');

const typePrefix = 'userGaragesSetSubscriptionToAutomation';
module.exports.typeDef = `
  extend type Mutation {
    ${mutations.SubscribeToAutomation.type}: ${typePrefix}AutomationSubscription
  }
  type ${typePrefix}AutomationSubscription {
    message: String
    status: String
  }
`;
module.exports.resolvers = {
  Mutation: {
    SubscribeToAutomation: async (obj, args, context) => {
      try {
        const { app } = context;
        const { logged, authenticationError, user } = context.scope;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }

        if (user.isGarageScoreUser()) {
          throw new Error(`GarageScore users (${user.email}) should not click on this button`);
        }
        const newlySubscribedGarages = await user.subscribeTo(
          GarageSubscriptionTypes.AUTOMATION,
          { price: 0, included: 0, every: 0 },
          (g) => GarageTypes.hasAccessToAutomation(g.type) && ['fr_FR', 'es_ES', 'ca_ES'].includes(g.locale)
        );
        app.models.User.giveAuthorizationToGaragesUsers(UserAutorization.ACCESS_TO_AUTOMATION, newlySubscribedGarages);
        return { message: '', status: 'OK' };
      } catch (error1) {
        log.error(ANASS, error1);
        return { message: error1.toString(), status: 'KO' };
      }
    },
  },
};
