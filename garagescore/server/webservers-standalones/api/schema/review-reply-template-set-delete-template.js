const { AuthenticationError } = require('apollo-server-express');
const { reviewReplyTemplateSetDeleteTemplate } = require('../../../../frontend/api/graphql/definitions/mutations.json');
const { ObjectId } = require('mongodb')
const { SAMAN, log } = require('../../../../common/lib/util/log');
const prefix = 'reviewReplyTemplateSetDeleteTemplate';

module.exports.typeDef = `
  extend type Mutation {
    ${reviewReplyTemplateSetDeleteTemplate.type}: ${prefix}Result
  }
  type ${prefix}Result {
    message: String,
    status: String
  }
`;
module.exports.resolvers = {
  Mutation: {
    [prefix]: async (obj, args, context) => {
      try {
        const {
          app,
          scope: { logged, authenticationError, garageIds },
        } = context;
        const { templateId } = args;
        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }
        // gets the template and checks if it belongs to a user's garage

        const mongo = app.models.ReviewReplyTemplate.getMongoConnector();
        const template = await mongo.findOne({ _id: ObjectId(templateId) });
        if (!template) {
          throw new Error("Template not found");
        }
        const garageStringArray = garageIds.map(g => g.toString())
        const templateStringArray = template.garageIds.map(t => t.toString())


        if (!garageStringArray.some(garage => templateStringArray.includes(garage))) {
          throw new Error("This template doesn't belong to you")
        }
        await mongo.deleteOne({ _id: ObjectId(templateId) });
        return {
          message: 'Template deleted',
          status: 'OK',
        }
      } catch (error) {
        log.error(SAMAN, error);
        return { status: 'FAILED', message: error.message };
      }
    },
  },
};
