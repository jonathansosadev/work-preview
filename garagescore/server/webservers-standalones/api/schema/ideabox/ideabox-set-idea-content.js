const { AuthenticationError } = require('apollo-server-express');
const mutations = require('../../../../../frontend/api/graphql/definitions/mutations.json');
const ObjectId = require('mongodb').ObjectId;

const typePrefix = 'IdeaboxSetIdeaContent';
module.exports.typeDef = `
  extend type Mutation {
    ${mutations.IdeaboxSetIdeaContent.type}: ${typePrefix}Vote
  }
  type ${typePrefix}Vote {
    status: String
    error: String
  }
`;
module.exports.resolvers = {
  Mutation: {
    IdeaboxSetIdeaContent: async (obj, args, context) => {
      const { app } = context;
      const { logged, authenticationError } = context.scope;

      if (!logged) {
        throw new AuthenticationError(authenticationError);
      }
      const { user, ideaId, newTitle, newCategory, newStatus } = args;
      try {
        const res = await app.models.Idea.getMongoConnector().updateOne(
          { _id: new ObjectId(ideaId) },
          {
            $set: { title: newTitle, category: newCategory, open: newStatus, updatedAt: new Date(), updatedBy: user },
          }
        );
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
