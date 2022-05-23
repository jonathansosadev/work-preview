const { AuthenticationError, ForbiddenError, gql } = require('apollo-server-express');
const UserAuthorization = require('../../../../common/models/user-autorization');

const typePrefix = 'billingAccountGetBillingAccounts';

module.exports.typeDef = gql`
  type ${typePrefix}BillingAccount {
    id: ID
    name: String
    billingDate: Int
    dateNextBilling: Date
    email: String
    billingType: String
    garageIds: [ID]
    companyName: String
  }

  extend type Query {
    ${typePrefix}: [${typePrefix}BillingAccount]
  }
`;

module.exports.resolvers = {
  [`${typePrefix}BillingAccount`]: {
    id: (billingAccount) => billingAccount._id,
  },
  Query: {
    [typePrefix]: async (root, args, { app, scope: { logged, authenticationError, user } }) => {
      if (!logged) {
        throw new AuthenticationError(authenticationError);
      } else if (!user.hasAuthorization(UserAuthorization.ACCESS_TO_GREYBO)) {
        throw new ForbiddenError();
      }

      return app.models.BillingAccount.getMongoConnector()
        .find(
          {},
          {
            projection: {
              _id: 1,
              name: 1,
              billingDate: 1,
              dateNextBilling: 1,
              email: 1,
              billingType: 1,
              garageIds: 1,
              companyName:1
            },
            sort: {
              createdAt: -1,
            }
          }
        )
        .toArray();
    },
  },
};
