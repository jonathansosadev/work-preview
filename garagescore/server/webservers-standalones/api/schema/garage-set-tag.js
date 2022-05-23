const { AuthenticationError, ForbiddenError } = require('apollo-server-express');
const { garageSetTag } = require('../../../../frontend/api/graphql/definitions/mutations.json');
const { ObjectId } = require('mongodb');

const { SAMAN, log } = require('../../../../common/lib/util/log');

const prefix = 'garageSetTag';

module.exports.typeDef = `
  extend type Mutation {
    ${garageSetTag.type}: ${prefix}Result
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
        const { garageIds: incomingGarages, tag } = args;
        if (!logged ||
          !incomingGarages.every((g) => garageIds.map((g) => g.toString()).includes(g))) {
          throw new ForbiddenError('Not authorized to access this resource');
        }
        if (tag.trim().length === 0) {
          throw new Error("Tag can't be empty")
        }
        const garageConnector = app.models.Garage.getMongoConnector()

        const result = await garageConnector.updateMany({ _id: { $in: incomingGarages.map(g => ObjectId(g)) } }, { $addToSet: { tags: tag } });

        if (result.result.ok === 1) {
          return {
            status: "OK",
            message: "Tag added correctly"
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
