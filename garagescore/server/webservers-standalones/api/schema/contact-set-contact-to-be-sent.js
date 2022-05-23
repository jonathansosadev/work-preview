const { AuthenticationError, ForbiddenError } = require('apollo-server-express');
const { contactSetContactToBeSent } = require('../../../../frontend/api/graphql/definitions/mutations.json');
const UserAuthorization = require('../../../../common/models/user-autorization');
const ContactType = require('../../../../common/models/contact.type');
const ContactService = require('../../../../common/lib/garagescore/contact/service');

const { IZAD, log } = require('../../../../common/lib/util/log');

const prefix = 'contactSetContactToBeSent';

async function getDestinationEmail(user) {
  const gsEmail = user ? 'customer_success@custeed.com' : 'commerce@custeed.com';
  return { email: gsEmail, name: user ? 'Customer Success GarageScore' : 'Contact GarageScore' };
}

module.exports.typeDef = `
  extend type Mutation {
    ${contactSetContactToBeSent.type}: ${prefix}Result
  }
  type ${prefix}Result {
    error: String
    status: Boolean
  }
`;
module.exports.resolvers = {
  Mutation: {
    [prefix]: async (obj, args, ctx) => {
      try {
        const {
          scope: { logged, authenticationError, user },
        } = ctx;
        const { firstName, lastName, email, phone, message, context, name, raisonsociale } = args;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        } else if (!user.hasAuthorization(UserAuthorization.ACCESS_TO_COCKPIT)) {
          throw new ForbiddenError('Not authorized to access this resource');
        }

        const recipient = await getDestinationEmail(user);
        const isUserAccessRequest = user && context.includes('user-access-request_');
        let contact = {};

        if (!isUserAccessRequest) {
          contact = {
            to: recipient.email,
            recipient: recipient.name,
            from: 'no-reply@custeed.com',
            sender: 'GarageScore',
            type: ContactType.USER_MESSAGE_EMAIL,
            payload: {
              name,
              raisonsociale,
              firstName,
              lastName,
              email,
              phone,
              context: context || 'contact-me',
              message,
              emailConnectedUser: user ? user.email : null,
            },
          };
        } else {
          contact = {
            to: recipient.email,
            recipient: recipient.name,
            from: 'no-reply@custeed.com',
            sender: 'GarageScore',
            type: ContactType.USER_ACCESS_REQUEST,
            payload: {
              requestSenderName: `${user.firstName} ${user.lastName}`,
              requestSenderJob: user.job,
              featureName: context.replace('user-access-request_', ''),
              baseUrl: process.env.APP_URL,
              message: message,
              userId: user.id.toString(),
            },
          };
        }
        await new Promise((resolve, reject) => {
          ContactService.prepareForSend(contact, (err) => {
            if (err) {
              throw new Error(err);
            }
            resolve();
          });
        });
        return { status: true };
      } catch (error) {
        log.error(IZAD, error);
        return { status: false, error: error & error.message || 'an error occured' };
      }
    },
  },
};
