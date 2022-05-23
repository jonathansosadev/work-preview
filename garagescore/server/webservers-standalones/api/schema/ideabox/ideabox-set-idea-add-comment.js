const { AuthenticationError } = require('apollo-server-express');
const mutations = require('../../../../../frontend/api/graphql/definitions/mutations.json');
const ObjectId = require('mongodb').ObjectId;
const slackClient = require('../../../../../common/lib/slack/client');
const crypto = require('crypto');
const { log, JS } = require('../../../../../common/lib/util/log');

const sendToSlack = require('util').promisify(slackClient.postMessage);

const _postSlack = async (user, id, idea, comment, commentAuthor, ideaAuthor) => {
  try {
    const link = `${process.env.APP_URL}/grey-bo/ideabox?id=${id}`;
    const text = `💬 *${commentAuthor}* a commenté l'idée de *${ideaAuthor}*\n${'```\n'}${idea}${'\n```'}`;

    const channel = process.env.APP_URL.includes('app.custeed.com') ? 'brainstorm-idea_box' : 'test';
    await sendToSlack({
      username: user,
      icon_url: `http://www.gravatar.com/avatar/${crypto
        .createHash('md5')
        .update(user)
        .digest('hex')}?s=256&d=identicon`,
      channel: channel,
      text,
      attachments: [
        {
          fallback: link,
          actions: [
            {
              type: 'button',
              text: 'Voir le commentaire',
              url: `${link}&comment=open`,
            },
          ],
        },
      ],
    });
  } catch (e) {
    log.error(JS, `_postSlack error: ${e.message}`);
  }
};

const typePrefix = 'IdeaboxSetIdeaAddComment';
module.exports.typeDef = `
  extend type Mutation {
    ${mutations.IdeaboxSetIdeaAddComment.type}: ${typePrefix}Vote
  }
  type ${typePrefix}Vote {
    status: String
    error: String
  }
`;
module.exports.resolvers = {
  Mutation: {
    IdeaboxSetIdeaAddComment: async (obj, args, context) => {
      const { app } = context;
      const { logged, authenticationError } = context.scope;

      if (!logged) {
        throw new AuthenticationError(authenticationError);
      }
      const { user, ideaId, newComment } = args;
      try {
        const res = await app.models.Idea.getMongoConnector().updateOne(
          { _id: new ObjectId(ideaId) },
          {
            $addToSet: {
              comments: {
                author: user,
                comment: newComment,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            },
          }
        );

        if (!res.modifiedCount) {
          return { status: 'KO', error: 'Nothing updated' };
        }
        const idea = await app.models.Idea.getMongoConnector().findOne(
          { _id: new ObjectId(ideaId) },
          { projection: { title: 1, author: 1 } }
        );
        _postSlack(user, ideaId, idea.title, newComment, user, idea.author);
        return { status: 'OK' };
      } catch (e) {
        return { status: 'KO', error: e.message };
      }
    },
  },
};
