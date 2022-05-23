const { AuthenticationError } = require('apollo-server-express');
const GraphQLDate = require('graphql-date');
const { reviewReplyTemplateGetTemplates } = require('../../../../frontend/api/graphql/definitions/queries.json');
const { getTemplatesByPage } = require('../../../../common/models/review-reply-template/review-reply-template-methods');
const { ObjectId } = require('mongodb');
const { SAMAN, log } = require('../../../../common/lib/util/log');
const typePrefix = 'reviewReplyTemplateGetTemplates';

const resolveFunctions = {
  Date: GraphQLDate,
};
module.exports.typeDef = `
  extend type Query {
    ${reviewReplyTemplateGetTemplates.type}:${typePrefix}Result

  }
  type ${typePrefix}Result {
    templates: [${typePrefix}ReviewReplyTemplate]
    hasMore: Boolean
  }
  type ${typePrefix}ReviewReplyTemplate {
    _id: ID
    sources: [String]
    ratingCategories: [String]
    title: String
    content: String
    garageIds: [ID]!
    automated: Boolean
    createdAt: Date
    createdBy: String
    createdById: ID
    updatedBy: String
    updatedAt: Date
    updatedById: ID
  }
`;
module.exports.resolvers = {
  Query: {
    [typePrefix]: async (obj, args, context) => {
      try {
        const {
          app,
          scope: { logged, authenticationError, garageIds },
        } = context;
        const { page, queryText, ratingCategory, source, limit = 20, garageId } = args;
        let query = {};
        let actualLimit = 0;
        if (limit > 100 || limit <= 0) {
          throw new Error("Invalid limit")
        }
        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }
        // A default of 20 templates will be returned each page

        if (garageId) {
          const garagesString = garageIds.map((garage) => garage.toString())
          if (!garagesString.includes(garageId)) {
            return []
          }
          query["garageIds"] = ObjectId(garageId)
        } else {
          query["garageIds"] = { $in: garageIds }
        }
        if (queryText) {
          query["$text"] = { $search: queryText }
        }
        if (ratingCategory && ratingCategory.length) {
          query["ratingCategories"] = ratingCategory
        }
        if (source && source.length) {
          query["sources"] = source
        }

        return getTemplatesByPage(app, query, limit, page);

      } catch (error) {
        log.error(SAMAN, error);
        return error;
      }
    },
  },
};
