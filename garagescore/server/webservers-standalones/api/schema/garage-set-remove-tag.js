const { ForbiddenError } = require('apollo-server-express');
const { garageRemoveTag } = require('../../../../frontend/api/graphql/definitions/mutations.json');
const { ObjectId } = require('mongodb');

const { SAMAN, log } = require('../../../../common/lib/util/log');

const prefix = 'garageRemoveTag';

module.exports.typeDef = `
  extend type Mutation {
    ${garageRemoveTag.type}: ${prefix}Result
  }
  type ${prefix}Result {
    status: String,
    message: String
  }
`;
module.exports.resolvers = {
  Mutation: {
    [prefix]: async (obj, args, context) => {
      try {
        const {
          app,
          scope: { logged, garageIds },
        } = context;
        const { tag } = args;
        if (!logged) {
          throw new ForbiddenError('Not authorized to access this resource');
        }
        if (!tag.trim().length) {
          throw new Error("Tag can't be empty")
        }
        const garageConnector = app.models.Garage.getMongoConnector()

        //Remove the tag
        const result = await garageConnector.updateMany({ _id: { $in: garageIds }, tags: tag }, { $pull: { tags: tag } });

        if (result.result.ok === 1) {
          return {
            status: "OK",
            message: "Tag removed correctly"
          }
        }
      } catch (error) {
        log.error(SAMAN, error);
        return {
          status: "FAILED",
          message: error.message
        };
      }
    },
  },
};
