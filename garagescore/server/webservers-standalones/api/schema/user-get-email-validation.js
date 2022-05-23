const { AuthenticationError, ForbiddenError } = require('apollo-server-express');
const { userGetEmailValidation } = require('../../../../frontend/api/graphql/definitions/queries.json');
const UserAuthorization = require('../../../../common/models/user-autorization');
const Mailgun = require('../../../../common/lib/mailgun/api');

const { IZAD, log } = require('../../../../common/lib/util/log');

const typePrefix = 'userGetEmailValidation';

module.exports.typeDef = `
  extend type Query {
    ${userGetEmailValidation.type}: ${typePrefix}Result
  }
  type ${typePrefix}Result {
    message: String
    error: String
    email: String
  }
`;
module.exports.resolvers = {
  Query: {
    [typePrefix]: async (obj, args, context) => {
      try {
        const {
          scope: { logged, authenticationError, user },
        } = context;
        const { email } = args;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        } else if (!user.hasAuthorization(UserAuthorization.ACCESS_TO_COCKPIT)) {
          throw new ForbiddenError('Not authorized to access this resource');
        }

        const MailgunApi = Mailgun.initFromDomainKey('default');
        let res;
        if (!MailgunApi.isLocalUse) {
          res = await new Promise((resolve) => {
            MailgunApi.validate(email, (err, body) => {
              resolve(body);
            });
          });
        }

        return {
          message: (res && res.is_valid) || MailgunApi.isLocalUse ? 'Email valid !' : 'Not valid',
          error: (res && res.reason) || '',
          email,
        };
      } catch (error) {
        log.error(IZAD, error);
        return {
          error: (error && error.message) || error,
        };
      }
    },
  },
};
