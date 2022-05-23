const { AuthenticationError } = require('apollo-server-express');
const queries = require('../../../../../frontend/api/graphql/definitions/queries.json');
const ObjectId = require('mongodb').ObjectId;

const typePrefix = 'Ideabox';
module.exports.typeDef = `
  extend type Query {
    ${queries.IdeaboxGetIdeas.type}: ${typePrefix}GetIdeas
  }
  type ${typePrefix}GetIdeas {
    ideas: [${typePrefix}Idea]
    hasMore: Boolean
  }

  type ${typePrefix}Idea {
	  id: String
	  title: String
    author: String
    category: String
    likes: [String]
    comments: [${typePrefix}Comment]
    open: Boolean
    isNew: Boolean
    createdAt: Date
    updatedAt: Date
    }
  type ${typePrefix}Comment {
	  author: String
    comment: String
    createdAt: Date
    }
`;
module.exports.resolvers = {
  Query: {
    IdeaboxGetIdeas: async (obj, args, context) => {
      const { after, ideaId } = args;
      const { app } = context;
      const { logged, authenticationError } = context.scope;

      if (!logged) {
        throw new AuthenticationError(authenticationError);
      }
      const oneWeekAgo = new Date(new Date(new Date().setDate(new Date().getDate() - 7)).setHours(00, 00, 00));
      const $project = {
        _id: 1,
        title: 1,
        author: 1,
        category: 1,
        likes: 1,
        comments: 1,
        open: 1,
        isNew: 1,
        createdAt: 1,
        updatedAt: 1,
      };

      let $skip = 0;
      if (after) {
        /** Dynamic score is killing pagination perfs :( */
        const ids = await app.models.Idea.getMongoConnector()
          .aggregate([
            { $match: { open: true } },
            {
              $addFields: {
                score: { $sum: [{ $size: '$likes' }, { $cond: [{ $gte: ['$updatedAt', oneWeekAgo] }, 100, 0] }] },
              },
            },
            { $project: { _id: 1, score: 1 } },
            { $sort: { score: -1, createdAt: -1, _id: 1 } },
            { $project: { _id: 1 } },
          ])
          .toArray();
        for (; $skip < ids.length; $skip++) {
          if (ids[$skip]._id.toString() === after) {
            $skip += 1;
            break;
          }
        }
      }
      let ideas = ideaId
        ? await app.models.Idea.getMongoConnector()
            .aggregate([{ $match: { _id: new ObjectId(ideaId) } }, { $project }])
            .toArray()
        : await app.models.Idea.getMongoConnector()
            .aggregate([
              { $match: { open: true } },
              { $project },
              {
                $addFields: {
                  isNew: { $gte: ['$updatedAt', oneWeekAgo] },
                  score: { $sum: [{ $size: '$likes' }, { $cond: [{ $gte: ['$updatedAt', oneWeekAgo] }, 100, 0] }] },
                },
              },
              { $sort: { score: -1, createdAt: -1, _id: 1 } }, // _id for consistent sort
              { $skip },
              { $limit: 26 },
            ])
            .toArray();
      const hasMore = ideas.length === 26;
      if (ideas.length === 0) {
        return { hasMore };
      }
      ideas = ideas.slice(0, 25);
      ideas.forEach((i) => {
        i.id = i._id.toString();
      });
      return { ideas: ideas, hasMore };
    },
  },
};
