const { AuthenticationError, ForbiddenError } = require('apollo-server-express');
const { dataSetDeleteReply } = require('../../../../frontend/api/graphql/definitions/mutations.json');
const UserAuthorization = require('../../../../common/models/user-autorization');
const { deleteReply } = require('../../../../common/lib/erep/data-review-replies');
const { IZAD, log } = require('../../../../common/lib/util/log');
const { ObjectID } = require('mongodb');

const prefix = 'dataSetDeleteReply';

module.exports.typeDef = `
  extend type Mutation {
    ${dataSetDeleteReply.type}: ${prefix}Result
  }
  type ${prefix}Result {
    status: Boolean
    message: String
    reviewReplyStatus: String
    reviewReplyRejectedReason: String
    publicReviewComment: String
    publicReviewCommentStatus: String
    publicReviewCommentRejectionReason: String
    publicReviewCommentApprovedAt: String
    updatedThread: [${prefix}Thread]
  }

  type ${prefix}Thread {
    text: String
    approvedAt: String
    author: String
    id: String
    attachment: String
    isFromOwner: String
    replies: [${prefix}Replies]
  }

  type ${prefix}Replies {
    text: String
    approvedAt: String
    author: String
    id: String
    attachment: String
    isFromOwner: String
  }
`;
module.exports.resolvers = {
  Mutation: {
    [prefix]: async (obj, args, context) => {
      let source;
      try {
        const {
          app,
          scope: { logged, authenticationError, user },
        } = context;
        const { reviewId, exogenous, commentId, replyId } = args;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        } else if (!user.hasAuthorization(UserAuthorization.ACCESS_TO_COCKPIT)) {
          throw new ForbiddenError('Not authorized to access this resource');
        }

        const data = await app.models.Data.getMongoConnector().findOne(
          { _id: ObjectID(reviewId) },
          { projection: { _id: true, source: true, garageId: true, review: true } }
        );

        if (!data) {
          return {
            status: false,
            message: `Data ${reviewId} not found`,
            publicReviewCommentRejectionReason: `Data ${reviewId} not found`,
          };
        }

        const {
          source: { type },
        } = data;
        source = type;

        const garageId = typeof data.garageId === 'string' ? ObjectID(data.garageId) : data.garageId;
        const sendRequestToDeleteReply = await deleteReply(app, { ...data, garageId, commentId, replyId }, exogenous);

        if (sendRequestToDeleteReply) {
          const updatedData = await app.models.Data.getMongoConnector().findOne(
            { _id: ObjectID(reviewId) },
            { projection: { 'review.reply': true } }
          );

          return {
            status: true,
            updatedThread: (updatedData.review.reply && updatedData.review.reply.thread) || [],
          };
        }
      } catch (error) {
        log.error(IZAD, error);
        return {
          status: false,
          message: error.message,
          publicReviewCommentStatus: 'Rejected',
          publicReviewCommentRejectionReason: `${source} a rencontré un problème. Veuillez réesayer plus tard. Si le problème persiste n'hésitez pas à nous solliciter.`,
        };
      }
    },
  },
};
