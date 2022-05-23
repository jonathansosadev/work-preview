const moment = require('moment');
const { JobTypes } = require('../../../frontend/utils/enumV2');
const SourceTypes = require('./type/source-types');
const ModerationStatuses = require('./type/moderation-status');
const { areAutomatedTemplatesAvailable } = require('../../models/review-reply-template/review-reply-template-methods');
const internalEventsReviewContext = require('../../lib/garagescore/monitoring/internal-events/contexts/review-context');
const Scheduler = require('../../lib/garagescore/scheduler/scheduler');
const { SAMAN, log } = require('../../lib/util/log');

const shouldRunAutomaticReplyJob = ({ source, review, service }) => {
  const sourceName = source && source.type;
  // If the review has been written too long ago, don't answer
  if (source.type !== SourceTypes.DATAFILE && moment().diff(moment(service.providedAt), 'day') > 1) {
    return false;
  }
  if (sourceName === SourceTypes.FACEBOOK) {
    // If approved reply comes from owner => cancel job
    const replies = review && review.reply && review.reply.thread;
    if (!replies) {
      return true;
    }
    const hasRelevantReply = replies.filter(
      ({ isFromOwner, status }) => isFromOwner && status === ModerationStatuses.APPROVED
    );
    return !hasRelevantReply.length;
  }
  // Other sources: Easy, if there's an approved reply => cancel job
  const { reply } = review;
  if (reply && reply.text && reply.status === ModerationStatuses.APPROVED) {
    return false;
  }
  return true;
};

const upsertAutomaticReplyJob = async ({ app }, { _id, id, automaticReviewResponseDelay = 0 }, data, eventsEmitter) => {
  // Stop the insertion of a reply job if there's no available templates
  try {
    const dataId = data.id;
    const garageId = (_id || id).toString();
    const source = data.get('source').toObject();
    const review = data.get('review').toObject();
    const ratingCategory = data.review_getSatisfactionCategory();
    const payload = { garageId, dataId, source, review };
    const targetDate = new Date(Date.now() + automaticReviewResponseDelay);
    const constraints = { workingHours: true };
    const check = await areAutomatedTemplatesAvailable(app, { garageId: _id || id, source, ratingCategory });
    if (!check) {
      return;
    }
    await Scheduler.upsertJob(JobTypes.SEND_AUTOMATIC_REPLY, payload, targetDate, constraints);
    const counters = {
      reviewAutomaticReplyJobCreated: 1,
      reviewShouldReplyAutomatically: 1,
    };
    if (eventsEmitter) {
      eventsEmitter.accumulatorAdd(internalEventsReviewContext.EVENTS.ADD_REVIEW, counters);
    }
  } catch (err) {
    log.warn(SAMAN, err);
  }
};

const cancelAutomaticReplyJob = ({ _id, id }) => {
  const dataId = (_id || id).toString();
  return Scheduler.cancelJob(JobTypes.SEND_AUTOMATIC_REPLY, { dataId });
};

module.exports = {
  shouldRunAutomaticReplyJob,
  upsertAutomaticReplyJob,
  cancelAutomaticReplyJob,
};
