const { AuthenticationError, ForbiddenError } = require('apollo-server-express');
const { ObjectID } = require('mongodb');

const { dataSetUpdateReply } = require('../../../../frontend/api/graphql/definitions/mutations.json');
const UserAuthorization = require('../../../../common/models/user-autorization');
const { cancelAutomaticReplyJob } = require('../../../../common/models/data/data-methods');
const { updateReply } = require('../../../../common/lib/erep/data-review-replies');
const { IZAD, log } = require('../../../../common/lib/util/log');

const prefix = 'dataSetUpdateReply';

module.exports.typeDef = `
  extend type Mutation {
    ${dataSetUpdateReply.type}: ${prefix}Result
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
        const { reviewId, exogenous, comment, commentId, replyId } = args;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        } else if (!user.hasAuthorization(UserAuthorization.ACCESS_TO_COCKPIT)) {
          throw new ForbiddenError('Not authorized to access this resource');
        }

        const data = await app.models.Data.getMongoConnector().findOne(
          { _id: ObjectID(reviewId) },
          { projection: { source: true, garageId: true, review: true } }
        );

        if (!data) {
          return {
            status: false,
            message: `Data ${reviewId} not found`,
            publicReviewCommentRejectionReason: `Data ${reviewId} not found`,
          };
        }

        source = data.source && data.source.type;

        const sendReplyToUpdate = await updateReply(
          app,
          { ...data, commentId, replyId },
          comment,
          {
            authorId: user.id.toString(),
          },
          exogenous
        );
        if (!sendReplyToUpdate || sendReplyToUpdate.modifiedCount !== 1) {
          throw new Error(`an error occured with ${source.type} services`);
        }

        const updatedData = await app.models.Data.getMongoConnector().findOne(
          { _id: ObjectID(reviewId) },
          { projection: { 'review.reply': true } }
        );

        const {
          review: {
            reply: { status, rejectedReason, text, approvedAt, thread },
          },
        } = updatedData;

        cancelAutomaticReplyJob({ id: reviewId });

        return {
          status: true,
          message: 'Reply created',
          reviewReplyStatus: status,
          reviewReplyRejectedReason: rejectedReason,
          publicReviewComment: text,
          publicReviewCommentStatus: status,
          publicReviewCommentRejectionReason: rejectedReason,
          publicReviewCommentApprovedAt: approvedAt ? approvedAt.toISOString() : null,
          updatedThread: thread,
        };
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
