const { ObjectId } = require('mongodb');
const { AuthenticationError, ForbiddenError, UserInputError } = require('apollo-server-express');
const { userGetUserTemporaryPassword } = require('../../../../frontend/api/graphql/definitions/queries.json');
const { SIMON, log } = require('../../../../common/lib/util/log');
const passwords = require('../../../../server/passport-bdoor/lib/passwords.js');

const typePrefix = 'userGetUserTemporaryPassword';

module.exports.typeDef = `
  extend type Query {
    ${userGetUserTemporaryPassword.type}: ${typePrefix}User
  }
  type ${typePrefix}User {
    password: String!
  }
`;

module.exports.resolvers = {
  Query: {
    [typePrefix]: async (obj, args, context) => {
      try {
        const {
          app,
          scope: { logged, authenticationError, garageIds, user },
        } = context;
        const { id } = args;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }
        if (!user.isGarageScoreUser()) {
          throw new ForbiddenError('Not authorized');
        }

        if (!id) return null;
        if (!ObjectId.isValid(id)) {
          throw new UserInputError('ObjectId not valid');
        }
        const userToConnectAs = await app.models.User.getMongoConnector().findOne(
          {
            _id: ObjectId(id),
          },
          {
            projection: {
              email: true,
              role: true,
              garageIds,
            },
          }
        );
        if (!userToConnectAs || !userToConnectAs.email) {
          throw new UserInputError(`User ${id} not found.`);
        }
        const password = await passwords.generate(userToConnectAs.email);
        return { password };
      } catch (error) {
        log.error(SIMON, error);
        return error;
      }
    },
  },
};
