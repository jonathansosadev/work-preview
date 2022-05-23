const { AuthenticationError, ForbiddenError } = require('apollo-server-express');
const UserAuthorization = require('../../../../common/models/user-autorization');
const { userGetGarageScoreUsers } = require('../../../../frontend/api/graphql/definitions/queries.json');

const { IZAD, log } = require('../../../../common/lib/util/log');

const typePrefix = 'userGetGarageScoreUsers';
module.exports.typeDef = `
  extend type Query {
    ${userGetGarageScoreUsers.type}: [${typePrefix}Users]
  }
  type ${typePrefix}Users {    
    id: ID
    firstName: String
    lastName: String
    email: String
  }
`;
module.exports.resolvers = {
  Query: {
    [typePrefix]: async (obj, args, context) => {
      try {
        const {
          app,
          scope: { logged, authenticationError, user },
        } = context;
        const { perfManagers, bizDevs } = args;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        } else if (!user.hasAuthorization(UserAuthorization.ACCESS_TO_GREYBO)) {
          throw new ForbiddenError('Not authorized');
        }

        const query = {
          email: /(@g[aàáâãäå]r[aàáâãäå]g[eéèëê]s[cç][oòóôõö]r[eéèëê].[cç][oòóôõö]m)/i
        };
        if (perfManagers) query.isPerfMan = true;
        if (bizDevs) query.isBizDev = true;

        return await app.models.User.getMongoConnector()
          .find(
            query,
            { projection: { id: '$_id', firstName: true, lastName: true, email: true } },
          )
          .toArray();
      } catch (error) {
        log.error(IZAD, error);
        return error;
      }
    },
  },
};
