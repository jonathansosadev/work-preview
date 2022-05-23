const { ObjectID } = require('mongodb');
const { AuthenticationError } = require('apollo-server-express');
const GarageTypes = require('../../../../common/models/garage.type');
const GarageSubscriptionTypes = require('../../../../common/models/garage.subscription.type');

const { isSubscribed, isEreputationSourceConnected } = require('../../../../common/models/garage/garage-methods');
const { ErepConnections } = require('../../../../frontend/api/graphql/definitions/queries.json');

const typePrefix = 'garageGetErepGaragesConnection';
module.exports.typeDef = `
  extend type Query {
    ${ErepConnections.type}: ${typePrefix}
  }
  type ${typePrefix} {
    totalGarages: Int
    sources: [${typePrefix}Source]
    garages: [${typePrefix}Garages]
  }

  type ${typePrefix}Source {
    name: String
    countConnectedGarages: Int
    connectedGarages: [ID]
    unsubscribeGarages: [ID]
    disconnectedGarages: [ID]
  }

  type ${typePrefix}Garages {
    garageId: ID
    garagePublicDisplayName: String
    hasSubscription: Boolean
    connectedSources: [${typePrefix}ConnectionToSource]
  }

  type ${typePrefix}ConnectionToSource {
    name: String
    externalId: String
  }
`;

const SOURCE_LIST = ['Google', 'Facebook', 'PagesJaunes'];

module.exports.resolvers = {
  Query: {
    ErepConnections: async (obj, args, context) => {
      const { logged, authenticationError, garageIds } = context.scope;
      const { cockpitType, garageId } = args;
      if (!logged) {
        throw new AuthenticationError(authenticationError);
      }
      const { app } = context;
      const garageTypes = GarageTypes.getGarageTypesFromCockpitType(cockpitType);

      const projection = {
        publicDisplayName: true,
        subscriptions: {
          active: true,
          EReputation: {
            enabled: true,
          },
        },
        // For each source project the token & externalId
        exogenousReviewsConfigurations: Object.fromEntries(
          SOURCE_LIST.map((sourceName) => [sourceName, { token: true, externalId: true }])
        ),
      };

      let _id = { $in: garageIds };
      if(garageId) {
        if(garageId.length <=1 && ObjectID.isValid(garageId[0])) {
          _id = ObjectID(garageId[0]);
        } else {
          _id = { $in: garageId.map((t) => ObjectID(t))};
        }
      }
      const garageList = await app.models.Garage.getMongoConnector()
        .find({ _id, type: { $in: garageTypes } }, { projection })
        .toArray();
      // context.garageList = garageList;

      return {
        totalGarages: garageList.length,
        garages: garageList,
      };
    },
  },
  [typePrefix]: {
    sources: ({ garages }, args, context) => {
      return SOURCE_LIST.map((sourceName) => {
        const garagesForSource = garages
          .filter(({ subscriptions, exogenousReviewsConfigurations }) => {
            const isSubscribedToErep = isSubscribed(subscriptions, GarageSubscriptionTypes.E_REPUTATION);
            const isSourceConnected = isEreputationSourceConnected(exogenousReviewsConfigurations, sourceName);
            return isSubscribedToErep && isSourceConnected;
          })
          .map(({ _id }) => _id.toString());

        return {
          name: sourceName,
          countConnectedGarages: garagesForSource.length,
          connectedGarages: garagesForSource,
        };
      });
    },
    garages: async ({ garages }, args, context) => {
      return garages.map(({ _id, publicDisplayName, subscriptions, exogenousReviewsConfigurations }) => ({
        garageId: _id.toString(),
        garagePublicDisplayName: publicDisplayName,
        hasSubscription: isSubscribed(subscriptions, GarageSubscriptionTypes.E_REPUTATION),
        connectedSources: SOURCE_LIST.filter((source) =>
          isEreputationSourceConnected(exogenousReviewsConfigurations, source)
        ).map((source) => ({
          name: source,
          externalId:
            isEreputationSourceConnected(exogenousReviewsConfigurations, source) &&
            exogenousReviewsConfigurations[source].externalId,
        })),
      }));
    },
  },
};
