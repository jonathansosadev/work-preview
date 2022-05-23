const { AuthenticationError } = require('apollo-server-express');
const mutations = require('../../../../../frontend/api/graphql/definitions/mutations.json');
const ObjectId = require('mongodb').ObjectId;

const typePrefix = 'IdeaboxSetIdeaVote';
module.exports.typeDef = `
  extend type Mutation {
    ${mutations.IdeaboxSetIdeaVote.type}: ${typePrefix}Vote
  }
  type ${typePrefix}Vote {
    status: String
    error: String
  }
`;
module.exports.resolvers = {
  Mutation: {
    IdeaboxSetIdeaVote: async (obj, args, context) => {
      const { app } = context;
      const { logged, authenticationError } = context.scope;

      if (!logged) {
        throw new AuthenticationError(authenticationError);
      }
      const { user, ideaId, isLike } = args;
      try {
        const res = isLike
          ? await app.models.Idea.getMongoConnector().updateOne(
              { _id: new ObjectId(ideaId) },
              { $addToSet: { likes: user } }
            )
          : await app.models.Idea.getMongoConnector().updateOne(
              { _id: new ObjectId(ideaId) },
              { $pull: { likes: user } }
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
