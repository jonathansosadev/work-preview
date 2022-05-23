const { AuthenticationError, ForbiddenError, gql } = require('apollo-server-express');
const UserAuthorization = require('../../../../common/models/user-autorization');

const typePrefix = 'garageGetGarages';

module.exports.typeDef = gql`
  type ${typePrefix}BillingAccount {
    id: ID
    name: String
  }

  type ${typePrefix}Garage {
    id: ID!
    publicDisplayName: String
    slug: String
    type: String
    status: String
    bizDevId: String
    performerId: String
    subscriptions: ${typePrefix}Subscriptions
    billingAccount: ${typePrefix}BillingAccount
  }

  type ${typePrefix}Subscriptions {
    active: Boolean
    Maintenance: ${typePrefix}SubscriptionDetails
    NewVehicleSale: ${typePrefix}SubscriptionDetails
    UsedVehicleSale: ${typePrefix}SubscriptionDetails
    Lead: ${typePrefix}SubscriptionDetails
    EReputation: ${typePrefix}SubscriptionDetails
    VehicleInspection: ${typePrefix}SubscriptionDetails
    Analytics: ${typePrefix}SubscriptionDetails
    Coaching: ${typePrefix}SubscriptionDetails
    Connect: ${typePrefix}SubscriptionDetails
    CrossLeads: ${typePrefix}SubscriptionDetails
    Automation: ${typePrefix}SubscriptionDetails
    setup: ${typePrefix}SubscriptionDetails
    users: ${typePrefix}SubscriptionDetails
    contacts: ${typePrefix}SubscriptionDetails
    AutomationApv: ${typePrefix}SubscriptionDetails
    AutomationVn: ${typePrefix}SubscriptionDetails
    AutomationVo: ${typePrefix}SubscriptionDetails
  }

  type ${typePrefix}SubscriptionDetails {
    enabled: Boolean
  }

  extend type Query {
    ${typePrefix}: [${typePrefix}Garage]
  }
`;

module.exports.resolvers = {
  Query: {
    [typePrefix]: async (root, args, { app, scope: { logged, authenticationError, user } }) => {
      if (!logged) {
        throw new AuthenticationError(authenticationError);
      } else if (!user.hasAuthorization(UserAuthorization.ACCESS_TO_GREYBO)) {
        throw new ForbiddenError();
      }

      // why not using 'billingAccounts' for the collection name ?
      // because during the tests this collection is prefixed with 'test_' cf :
      // common/lib/garagescore/automatic-billing/billing-api/interfaces/configuration/api.interface.model.js
      const BillingAccountCollection = app.models.BillingAccount.getMongoConnector();

      // optimize this query it return all garages
      const pipeline = [
        {
          $lookup: {
            from: BillingAccountCollection.collectionName,
            localField: '_id',
            foreignField: 'garageIds',
            as: 'billingAccount',
          },
        },
        {
          $unwind: {
            path: '$billingAccount',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            id: '$_id',
            publicDisplayName: 1,
            slug: 1,
            type: 1,
            status: 1,
            bizDevId: 1,
            performerId: 1,
            subscriptions: {
              active: 1,
              Maintenance: {
                enabled: 1,
              },
              NewVehicleSale: {
                enabled: 1,
              },
              UsedVehicleSale: {
                enabled: 1,
              },
              Lead: {
                enabled: 1,
              },
              EReputation: {
                enabled: 1,
              },
              VehicleInspection: {
                enabled: 1,
              },
              Analytics: {
                enabled: 1,
              },
              Coaching: {
                enabled: 1,
              },
              Connect: {
                enabled: 1,
              },
              CrossLeads: {
                enabled: 1,
              },
              Automation: {
                enabled: 1,
              },
            },
            billingAccount: {
              id: '$billingAccount._id',
              name: 1,
            },
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ];

      const res = await app.models.Garage.getMongoConnector().aggregate(pipeline).toArray();

      return res;
    },
  },
};
