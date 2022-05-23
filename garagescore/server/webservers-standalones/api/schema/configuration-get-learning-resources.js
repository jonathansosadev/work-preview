/* Get a value from Configurations, stringify it before sending  */
const { AuthenticationError } = require('apollo-server-express');
const queries = require('../../../../frontend/api/graphql/definitions/queries.json');

const { ANASS, log } = require('../../../../common/lib/util/log');
const { promisify } = require('util');

const typePrefix = 'CGLR';

module.exports.typeDef = `
  extend type Query {
    ${queries.ConfigurationGetLearningResources.type}: ${typePrefix}Res
  }
  type ${typePrefix}Res {
    resourcesByProduct: [${typePrefix}ResourcesByProduct]
  }

  type ${typePrefix}ResourcesByProduct {
    product: String
    resources: [${typePrefix}Resources]
  }
  type ${typePrefix}Resources {
    title: String
    url: String
    description: String
    thumbnail: String
  }
`;

async function _getData(app) {
  const resources = await promisify(app.models.Configuration.getLearningResources)();
  return resources || {};
}
module.exports.resolvers = {
  Query: {
    ConfigurationGetLearningResources: async (obj, args, context) => {
      try {
        const {
          scope: { logged, authenticationError },
          app,
        } = context;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }
        const res = await _getData(app);
        return res;
      } catch (error) {
        log.error(ANASS, error);
        return error;
      }
    },
  },
};
