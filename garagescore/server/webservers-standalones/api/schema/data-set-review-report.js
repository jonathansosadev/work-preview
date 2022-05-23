const { AuthenticationError, ForbiddenError } = require('apollo-server-express');
const { dataSetReviewReport } = require('../../../../frontend/api/graphql/definitions/mutations.json');
const UserAuthorization = require('../../../../common/models/user-autorization');
const { ObjectID } = require('mongodb');
const config = require('config');
const slackClient = require('../../../../common/lib/slack/client'); // eslint-disable-line
const crypto = require('crypto');
const { saveReport } = require('../../../../common/models/data/data-mongo');
const { IZAD, log } = require('../../../../common/lib/util/log');

const prefix = 'dataSetReviewReport';

/**
 * Report a review on slack
 * @param app the app instance
 * @param data the data which will contain the newly created report
 * @param garage the garage associated to the data
 * @param channel the channel on slack to write the message example: `#report`
 * @param reporter String the username of the reporter
 * @param reason String A text message
 */
const sendSlackModeration = async (
  app,
  {
    _id: dataId,
    review: {
      rating: { value },
      comment,
    },
  },
  { _id: garageId, publicDisplayName: garagePublicDisplayName },
  channel,
  reporter,
  reason
) => {
  let slackText = `Signalement de l'avis de l'instance d'id '${dataId}'
    Raison annoncée : '${reason}'
    ${garagePublicDisplayName} - '${garageId}'`;

  if (!value && value !== 0) {
    slackText += '`[Aucune notation]`';
  } else {
    slackText += `\nNote: ${value}`;
    slackText += `\nAvis: ${comment.text}`;
    slackText += `\n${config.get('publicUrl.app_url').replace(/\/$/, '')}/backoffice/public-reviews?dataId=${dataId}`;
  }

  return new Promise((resolve, reject) => {
    const emailCrypto = crypto.createHash('md5').update(reporter.email).digest('hex');
    slackClient.postMessage(
      {
        username: reporter.email,
        icon_url: `http://www.gravatar.com/avatar/${emailCrypto}?s=256&d=identicon`,
        channel,
        text: slackText,
      },
      async (slackError) => {
        if (slackError) {
          reject(slackError);
        }

        resolve(true);
      }
    );
  });
};

module.exports.typeDef = `
  extend type Mutation {
    ${dataSetReviewReport.type}: ${prefix}Result
  }
  type ${prefix}Result {
    status: Boolean
    message: String
  }
`;
module.exports.resolvers = {
  Mutation: {
    [prefix]: async (obj, args, context) => {
      try {
        const {
          app,
          scope: { logged, authenticationError, user },
        } = context;
        const { id, comment } = args;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        } else if (!user.hasAuthorization(UserAuthorization.ACCESS_TO_COCKPIT)) {
          throw new ForbiddenError('Not authorized');
        }

        const data = await app.models.Data.getMongoConnector().findOne(
          { _id: ObjectID(id) },
          { projection: { garageId: true, review: true } }
        );
        if (!data || !data.garageId) {
          return { status: false, message: 'Publication introuvable' };
        }

        const garage = await app.models.Garage.getMongoConnector().findOne(
          { _id: ObjectID(data.garageId) },
          { projection: { publicDisplayName: true } }
        );
        if (!garage || !garage.publicDisplayName) {
          return { status: false, message: 'Garage lié à la publication introuvable' };
        }

        let channelName = '#report';
        if (config.util.getEnv('NODE_APP_INSTANCE') === 'review') {
          channelName = '#report_review';
        }

        await sendSlackModeration(app, data, garage, channelName, user, comment);
        const report = await saveReport(app, data, channelName, user, comment);

        if (!report) {
          throw new Error();
        }
        return { status: true };
      } catch (error) {
        log.error(IZAD, error);
        return { message: (error && error.message) || 'an error occured', status: false };
      }
    },
  },
};
