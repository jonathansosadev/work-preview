const { AuthenticationError } = require('apollo-server-express');
const mutations = require('../../../../../frontend/api/graphql/definitions/mutations.json');
const ObjectId = require('mongodb').ObjectId;

const typePrefix = 'IdeaboxSetIdeaUpdateComment';
module.exports.typeDef = `
  extend type Mutation {
    ${mutations.IdeaboxSetIdeaUpdateComment.type}: ${typePrefix}Vote
  }
  type ${typePrefix}Vote {
    status: String
    error: String
  }
`;
module.exports.resolvers = {
  Mutation: {
    IdeaboxSetIdeaUpdateComment: async (obj, args, context) => {
      const { app } = context;
      const { logged, authenticationError } = context.scope;

      if (!logged) {
        throw new AuthenticationError(authenticationError);
      }
      const { user, ideaId, commentId, newComment } = args;
      try {
        const idea = await app.models.Idea.getMongoConnector().findOne({}, { projection: { comments: 1 } });
        let res = {};
        if (idea && idea.comments && idea.comments.length + 1 >= commentId) {
          idea.comments[commentId].comment = newComment;
          idea.comments[commentId].updatedAt = new Date();
          idea.comments[commentId].updatedBy = user;
          res = await app.models.Idea.getMongoConnector().updateOne(
            { _id: new ObjectId(ideaId) },
            {
              $set: {
                comments: idea.comments,
              },
            }
          );
        }
        if (!res.modifiedCount) {
          return { status: 'KO', error: 'Nothing updated' };
        }
        return { status: 'OK' };
      } catch (e) {
        return { status: 'KO', error: e.message };
      }
    },
  },
};
