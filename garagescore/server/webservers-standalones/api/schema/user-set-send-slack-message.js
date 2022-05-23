const { AuthenticationError, ForbiddenError } = require('apollo-server-express');
const { userSetSendSlackMessage } = require('../../../../frontend/api/graphql/definitions/mutations.json');
const UserAuthorization = require('../../../../common/models/user-autorization');
const slackClient = require('../../../../common/lib/slack/client');

const { IZAD, log } = require('../../../../common/lib/util/log');

const prefix = 'userSetSendSlackMessage';

module.exports.typeDef = `
  extend type Mutation {
    ${userSetSendSlackMessage.type}: ${prefix}Result
  }
  type ${prefix}Result {
    status: Boolean
  }
`;
module.exports.resolvers = {
  Mutation: {
    [prefix]: async (obj, args, context) => {
      try {
        const {
          scope: { logged, authenticationError, user },
        } = context;
        const { message } = args;
        let { channel } = args;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        } else if (!user.hasAuthorization(UserAuthorization.ACCESS_TO_GREYBO)) {
          throw new ForbiddenError('Not authorized to access this resource');
        }
        channel = channel || 'test';
        return await new Promise((res) => {
          slackClient.postMessage(
            {
              text: message,
              channel: `#${channel}`,
              username: user.firstName || user.lastName ? `${user.firstName} ${user.lastName}` : user.email,
            },
            (slackError) => {
              if (slackError) {
                res({ status: false }); // eslint-disable-line max-len
                return;
              }
              res({ status: true }); // eslint-disable-line max-len
            }
          );
        });
      } catch (error) {
        log.error(IZAD, error);
        return { status: false };
      }
    },
  },
};
