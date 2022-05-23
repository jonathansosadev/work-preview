const { AuthenticationError } = require('apollo-server-express');
const { userSetAddUser } = require('../../../../frontend/api/graphql/definitions/mutations.json');
const { addEmailToWhitelist: mailgunAddEmailToWhiteList } = require('../../../../common/lib/mailgun/api');
const { addUser } = require('../../../../common/models/user/user-methods');

const { SIMON, log } = require('../../../../common/lib/util/log');
const prefix = 'userSetAddUser';

module.exports.typeDef = `
  extend type Mutation {
    ${userSetAddUser.type}: ${prefix}Result
  }
  type ${prefix}Result {
    message: String
    status: String
    emailSentTo: String
    user: ${prefix}User
  }

  type ${prefix}User {
    id: ID
    email: String
  }
`;
module.exports.resolvers = {
  Mutation: {
    [prefix]: async (obj, args, context) => {
      let newUserEmail;
      try {
        const {
          app,
          scope: { logged, authenticationError, user: userRequesting },
        } = context;
        const { garages, newUserFirstName, newUserLastName, newUserJob, newUserRole } = args;
        newUserEmail = args.newUserEmail;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }

        newUserEmail = newUserEmail.toLowerCase();
        let newUser = await app.models.User.getMongoConnector().findOne(
          { email: newUserEmail },
          { projection: { _id: true } }
        );
        if (newUser) {
          return { message: 'userAlreadyExists', status: 'OK', emailSentTo: newUserEmail };
        }
        const garageIds = !garages || !garages.length ? userRequesting.garageIds : garages;
        newUser = await addUser(app, {
          email: newUserEmail,
          lastName: newUserLastName,
          firstName: newUserFirstName,
          jobName: newUserJob,
          role: newUserRole,
          garageIds,
        });
        // to prevent emails from falling into bounces. Didn't put a await there so we can send a respond as quickly as possible
        mailgunAddEmailToWhiteList(newUserEmail, 'default');

        return {
          message: 'userAdded',
          status: 'OK',
          user: {
            email: newUser.email,
            id: newUser.getId().toString(),
          },
        };
      } catch (error) {
        log.error(SIMON, error);
        return { status: 'KO', message: error.message, emailSentTo: newUserEmail };
      }
    },
  },
};
