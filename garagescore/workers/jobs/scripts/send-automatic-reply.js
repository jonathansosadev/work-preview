const app = require('../../../server/server');
const timeHelper = require('../../../common/lib/util/time-helper');
// Internal events
const EventsEmitter = require('../../../common/lib/garagescore/monitoring/internal-events/events-emitter');
const internalEventsReviewContext = require('../../../common/lib/garagescore/monitoring/internal-events/contexts/review-context');
const { SAMAN, log } = require('../../../common/lib/util/log');

module.exports = async (job) => {
  const { jobId, garageId, dataId, source, review } = job.payload;
  let eventsEmitter;
  const eventDay = timeHelper.dayNumber(new Date(review.createdAt));
  const eventsEmitterContext = internalEventsReviewContext.create(garageId, source.type, eventDay);
  eventsEmitter = new EventsEmitter(eventsEmitterContext);
  const data = await app.models.Data.findById(dataId);
  if (data) {
    await data.review_replyAutomaticallyToReview();
    eventsEmitter.accumulatorAdd(internalEventsReviewContext.EVENTS.REPLY_TO_REVIEW, { automaticReplySuccess: true });
  } else {
    log.error(SAMAN, `[Automatic Reply] Failed sending with dataId:${dataId} & jobId:${jobId}`);
    if (eventsEmitter) {
      eventsEmitter.accumulatorAdd(internalEventsReviewContext.EVENTS.REPLY_TO_REVIEW, { automaticReplyFail: true });
    }
    throw new Error('Failed to send');
  }
  if (eventsEmitter) {
    eventsEmitter.accumulatorEmit();
  }
  return;
};
