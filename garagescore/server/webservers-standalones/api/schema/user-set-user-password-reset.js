const { ObjectId } = require('mongodb');
const { AuthenticationError, ForbiddenError, UserInputError } = require('apollo-server-express');

const { userSetUserPasswordReset } = require('../../../../frontend/api/graphql/definitions/mutations.json');
const { SIMON, log } = require('../../../../common/lib/util/log');

const typePrefix = 'userSetUserPasswordReset';

module.exports.typeDef = `
  extend type Mutation {
    ${userSetUserPasswordReset.type}: ${typePrefix}Status
  }
  type ${typePrefix}Status {
    status: String
    statusMessage: String
  }
`;

module.exports.resolvers = {
  Mutation: {
    [typePrefix]: async (obj, args, context) => {
      try {
        const {
          app,
          scope: { logged, authenticationError },
        } = context;
        const { id } = args;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }
        if (!ObjectId.isValid(id)) {
          throw new UserInputError(`Invalid argument: id(${id})`);
        }
        const userToSendPasswordTo = await app.models.User.getMongoConnector().findOne(
          { _id: ObjectId(id) },
          { projection: { _id: true, resetPassword: true, email: true, firstName: true, lastName: true } }
        );
        if (!userToSendPasswordTo) {
          throw new UserInputError(`User with id: ${id} not found.`);
        }
        await app.models.User.resetPasswordAndSendEmailWithMongo(userToSendPasswordTo);
        return { status: 'OK', statusMessage: 'Email sent with success' };
      } catch (error) {
        log.error(SIMON, error);
        return { status: 'KO', statusMessage: error.message };
      }
    },
  },
};
