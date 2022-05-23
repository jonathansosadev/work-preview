const { AuthenticationError, ForbiddenError } = require('apollo-server-express');
const { ObjectID } = require('mongodb');
const { promisify } = require('util');

const { dataSetCreateReply } = require('../../../../frontend/api/graphql/definitions/mutations.json');
const UserAuthorization = require('../../../../common/models/user-autorization');
const SourceTypes = require('../../../../common/models/data/type/source-types');

const { cancelAutomaticReplyJob } = require('../../../../common/models/data/data-methods');
const { createReply } = require('../../../../common/lib/erep/data-review-replies');
const sendContactNow = require('../../../../common/lib/garagescore/data-campaign/run/_send-contact-now');
const ContactsConfigs = require('../../../../common/lib/garagescore/data-campaign/contacts-config');
const EventsEmitter = require('../../../../common/lib/garagescore/monitoring/internal-events/events-emitter');
const internalEventsReviewContext = require('../../../../common/lib/garagescore/monitoring/internal-events/contexts/review-context');
const timeHelper = require('../../../../common/lib/util/time-helper');
const { IZAD, log } = require('../../../../common/lib/util/log');

const prefix = 'dataSetCreateReply';

module.exports.typeDef = `
  extend type Mutation {
    ${dataSetCreateReply.type}: ${prefix}Result
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
        let sourceIdArg;

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

        const {
          _id,
          garageId,
          source: { type, sourceId },
          review,
        } = data;
        source = type;
        sourceIdArg = commentId ? commentId : sourceId;

        const sendReply = await createReply(
          app,
          data,
          comment,
          {
            sourceId: sourceIdArg,
            authorId: user.id.toString(),
            commentId,
            replyId,
          },
          exogenous
        );

        if (!sendReply || sendReply.modifiedCount !== 1) {
          throw new Error(`an error occured with ${source.type} services`);
        }

        if (source === SourceTypes.GOOGLE) {
          const hasAlreadyReplied = review && review.reply && !!review.reply.text;
          if (!hasAlreadyReplied) await promisify(sendContactNow)({ _id }, ContactsConfigs.email_reply.key);
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
        const eventDay = timeHelper.dayNumber(review.createdAt);
        const eventsEmitterContext = internalEventsReviewContext.create(garageId, source.type, eventDay);
        const eventsEmitter = new EventsEmitter(eventsEmitterContext);
        eventsEmitter.accumulatorAdd(internalEventsReviewContext.EVENTS.REPLY_TO_REVIEW, { manualReply: true });
        eventsEmitter.accumulatorEmit();

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
          reviewReplyStatus: 'Rejected',
          reviewReplyRejectedReason: `${source} a rencontré un problème. Veuillez réesayer plus tard. Si le problème persiste n'hésitez pas à nous solliciter.`,
          message: (error && error.message) || error || '',
          publicReviewComment: (error && error.message) || error || '',
          publicReviewCommentStatus: 'Rejected',
          publicReviewCommentRejectionReason: `${source} a rencontré un problème. Veuillez réesayer plus tard. Si le problème persiste n'hésitez pas à nous solliciter.`,
        };
      }
    },
  },
};
