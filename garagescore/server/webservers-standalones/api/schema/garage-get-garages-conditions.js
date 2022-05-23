const { AuthenticationError, ForbiddenError, UserInputError } = require('apollo-server-express');
const { garageGetGaragesConditions } = require('../../../../frontend/api/graphql/definitions/queries.json');
const UserAuthorization = require('../../../../common/models/user-autorization');
const { getUserGarages } = require('../../../../common/models/user/user-mongo');
const garageSubscriptionTypes = require('../../../../common/models/garage.subscription.type.js');
const { ANASS, log } = require('../../../../common/lib/util/log');

const typePrefix = 'garageGetGaragesConditions';

module.exports.typeDef = `
  extend type Query {
    ${garageGetGaragesConditions.type}: ${typePrefix}UserGaragesConditions
  }
  type ${typePrefix}UserGaragesConditions {
    hasMaintenanceAtLeast: Boolean!,
    hasVnAtLeast: Boolean!,
    hasVoAtLeast: Boolean!,
    hasViAtLeast: Boolean!,
    hasLeadAtLeast: Boolean!,
    hasAutomationAtLeast: Boolean!,
    hasCrossLeadsAtLeast: Boolean!,
    hasEReputationAtLeast: Boolean!
  }
`;
module.exports.resolvers = {
  Query: {
    [typePrefix]: async (obj, args, context) => {
      try {
        const {
          app,
          scope: { logged, authenticationError, user },
        } = context;
        const { id } = args;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }

        if (!user.hasAuthorization(UserAuthorization.ACCESS_TO_COCKPIT)) {
          throw new ForbiddenError('Not authorized');
        }

        const additionalStages = [{ $project: { subscriptions: {} } }, { $group: { _id: 1 } }];
        const { $project } = additionalStages[0];
        const { $group } = additionalStages[1];
        garageSubscriptionTypes.values().forEach((garageSubscriptionType) => {
          $project.subscriptions[garageSubscriptionType] = {
            $and: ['$subscriptions.active', `$subscriptions.${garageSubscriptionType}.enabled`],
          };
          $group[garageSubscriptionType] = { $sum: { $cond: [`$subscriptions.${garageSubscriptionType}`, 1, 0] } };
        });

        let garageCounter = await getUserGarages(app, id, { subscriptions: 1 }, additionalStages);
        if (!garageCounter || !garageCounter.length) {
          throw new UserInputError(`User with id: ${id} not found.`);
        }
        [garageCounter] = garageCounter;

        return {
          hasMaintenanceAtLeast: garageCounter.Maintenance > 0,
          hasVnAtLeast: garageCounter.NewVehicleSale > 0,
          hasVoAtLeast: garageCounter.UsedVehicleSale > 0,
          hasViAtLeast: garageCounter.VehicleInspection > 0,
          hasLeadAtLeast: garageCounter.Lead > 0,
          hasEReputationAtLeast: garageCounter.EReputation > 0,
          hasCrossLeadsAtLeast: garageCounter.CrossLeads > 0,
          hasAutomationAtLeast: garageCounter.Automation > 0,
        };
      } catch (error) {
        log.error(ANASS, error);
        return error;
      }
    },
  },
};
