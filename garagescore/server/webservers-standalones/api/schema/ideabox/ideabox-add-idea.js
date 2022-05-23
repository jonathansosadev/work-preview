const { AuthenticationError } = require('apollo-server-express');
const mutations = require('../../../../../frontend/api/graphql/definitions/mutations.json');
const ObjectId = require('mongodb').ObjectId;
const slackClient = require('../../../../../common/lib/slack/client');
const crypto = require('crypto');
const { log, JS } = require('../../../../../common/lib/util/log');

const sendToSlack = require('util').promisify(slackClient.postMessage);

const _postSlack = async (user, title, author, category, id) => {
  try {
    const link = `${process.env.APP_URL}/grey-bo/ideabox?id=${id}`;
    const text = `:bulb: *Nouvelle idée de ${author} dans la catégorie "${category}"*\n${'```\n'}${title}${'\n```'}`;

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
              text: 'Commenter 💬 ',
              url: `${link}&comment=open`,
            },
            {
              type: 'button',
              text: 'Voter pour 👍 ou contre 👎 ',
              url: link,
            },
          ],
        },
      ],
    });
  } catch (e) {
    log.error(JS, `_postSlack error: ${e.message}`);
  }
};

const typePrefix = 'IdeaboxAddIdea';
module.exports.typeDef = `
  extend type Mutation {
    ${mutations.IdeaboxAddIdea.type}: ${typePrefix}Result
  }
  type ${typePrefix}Result {
    status: String
    error: String
  }
`;
module.exports.resolvers = {
  Mutation: {
    IdeaboxAddIdea: async (obj, args, context) => {
      const { app } = context;
      const { logged, authenticationError } = context.scope;

      if (!logged) {
        throw new AuthenticationError(authenticationError);
      }
      const { user, title, category } = args;
      try {
        const res = await app.models.Idea.getMongoConnector().insertOne({
          author: user,
          title,
          category,
          open: true,
          updatedAt: new Date(),
          createdAt: new Date(),
          comments: [],
          likes: [],
        });
        const id = res && res.ops && res.ops[0]._id;
        if (!id) {
          return { status: 'KO', error: 'Nothing updated' };
        }
        await _postSlack(user, title, user, category, id);
        return { status: 'OK' };
      } catch (e) {
        return { status: 'KO', error: e.message };
      }
    },
  },
};
