const { garageGetB2CSiteIndex } = require('../../../../frontend/api/graphql/definitions/queries.json');

const { ANASS, log } = require('../../../../common/lib/util/log');

const typePrefix = 'garageGetB2CSiteIndex';
module.exports.typeDef = `
  extend type Query {
    ${garageGetB2CSiteIndex.type}: [${typePrefix}Garage]
  }

  type ${typePrefix}Garage {
    slug: String
    publicDisplayName: String
    type: String
    locale: String
  }
`;

module.exports.resolvers = {
  Query: {
    [typePrefix]: async (obj, args, context) => {
      try {
        const {
          app,
        } = context;
        const { locale } = args;

        return await app.models.Garage.garagesToIndex(locale);
      } catch (error) {
        log.error(ANASS, error);
        return error;
      }
    },
  },
};
