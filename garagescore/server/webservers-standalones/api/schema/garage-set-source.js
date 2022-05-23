const { AuthenticationError } = require('apollo-server-express');
const { garageSetSource } = require('../../../../frontend/api/graphql/definitions/mutations.json');

const { IZAD, log } = require('../../../../common/lib/util/log');

const prefix = 'garageSetSource';

module.exports.typeDef = `
  extend type Mutation {
    ${garageSetSource.type}: ${prefix}Result
  }
  type ${prefix}Result {
    enabled: Boolean!
    garageId: String!
    garagePublicDisplayName: String!
    type: String!
    phone: String!
    email: String!
    followed_phones: [String!]!
    followed_email: String!
  }
`;
module.exports.resolvers = {
  Mutation: {
    [prefix]: async (obj, args, context) => {
      try {
        const {
          app,
          scope: { logged, authenticationError, user },
        } = context;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }
        args.followed_phones = args.followed_phones.map((phone) => decodeURIComponent(phone));
        return app.models.Garage.setSource(args, user.id.toString());
      } catch (error) {
        log.error(IZAD, error);
        return error;
      }
    },
  },
};
