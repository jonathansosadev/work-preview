const { ObjectID } = require('mongodb');
const moment = require('moment');
const {
  fillUpData,
  getHashFromExternalReview,
  getHashFromData,
  updateLastFetch,
  processFirstReplyDataUpdate,
  processDataUpdate,
  processReplyDataUpdate,
  sendAlertExogenousReview,
  _deleteMissingReviews,
} = require('./reviews/add-reviews-utils');
const {
  shouldRunAutomaticReplyJob,
  upsertAutomaticReplyJob,
  cancelAutomaticReplyJob,
} = require('../../../../models/data/data-methods');
const DataTypes = require('../../../../models/data/type/data-types.js');
const GarageTypes = require('../../../../models/garage.type');
// Internal events
const EventsEmitter = require('../../monitoring/internal-events/events-emitter');
const internalEventsReviewContext = require('../../monitoring/internal-events/contexts/review-context');

const { TIBO, log } = require('../../../util/log');
const methods = ['FULL', 'LAST_HOUR'];

const dataProjection = {
  'source.sourceId': true,
  'source.type': true,
  'source.checksum': true,
  'service.providedAt': true,
  'review.rating.id': true,
  'review.rating.value': true,
  'review.comment.text': true,
  'review.comment.updatedAt': true,
  'review.comment.approvedAt': true,
  'review.shareWithPartners': true,
  'review.reply': true,
  'review.rating.original': true,
  'review.rating.originalScale': true,
  'review.rating.recommend': true,
  'review.createdAt': true,
};

// ---------------- HELPING / TOOL FUNCTIONS ---------------- //

function _addGarageToConfiguration(result, garage) {
  const services = ['Google', 'Facebook', 'PagesJaunes'];
  const v = 'exogenousReviewsConfigurations';
  const spiderConfiguration = {};
  let conf = null;

  // 1. For each external service, we look if the garage is correctly configured
  for (const service of services) {
    if (garage[v] && garage[v][service] && garage[v][service].token && garage[v][service].externalId) {
      conf = garage[v][service];
      spiderConfiguration[service] = {
        name: service,
        token: conf.token,
        externalId: conf.externalId,
        lastFetch: conf.lastFetch,
      };
    }
  }

  // 2. We add the spiderConfiguration only if the garage had at least one of the service configured
  if (Object.keys(spiderConfiguration).length > 0) {
    result.push({ garageId: garage.id.toString(), garageName: garage.publicDisplayName, spiderConfiguration });
  }

  return result;
}

async function _handleNewReview(review, app, garageId, changes, sourceType, isFirstBatch, eventsEmitter) {
  // 1. If the external review does not have any id we have to skip it
  if (!review || !review.id) {
    changes.skipped.push('UnknownExternalID');
    log.error(
      TIBO,
      `[GsAPI - AddReview] Skipping Review (UnknownExternalID) For Garage ${garageId} : ${sourceType} @ ${review.date} $From$ ${review.author}`
    );
    return false;
  }

  const mongoConnector = await app.models.Data.getMongoConnector();

  let data = await mongoConnector.findOne(
    { garageId: garageId.toString(), 'source.type': sourceType, 'source.sourceId': review.id.toString() },
    { projection: dataProjection }
  );

  const isdataSavedInThisBack = changes.saved.find((change) => change.sourceId === review.id);

  // 2. If we don't know this external review it means it's new, so we simply insert it in database
  if (!data && !isdataSavedInThisBack) {
    const garage = await app.models.Garage.getMongoConnector().findOne({ _id: garageId });
    const garageType = garage && garage.type;

    const data = await app.models.Data.init(garageId, {
      type: DataTypes.EXOGENOUS_REVIEW,
      garageType: garageType || GarageTypes.DEALERSHIP,
      raw: review,
      sourceType,
      sourceId: review.id,
    });

    const reviewDate = review.date ? new Date(review.date) : new Date();
    const notifyContributors = moment(reviewDate).isSameOrAfter(moment().subtract(1, 'day'), 'day');
    let hash = '';

    // 2.1 We update local information
    fillUpData(data, review); // TODO: Do that operation in Data.init fct
    hash = getHashFromData(data);

    // 2.2 We persist local information in database first to give data an id
    data.set('source.checksum', hash);
    await data.save();
    if (notifyContributors && !isFirstBatch) {
      await sendAlertExogenousReview(app, data);
    }

    // 2.3 Create Job AUTOMATIC_REPLY
    if (shouldRunAutomaticReplyJob(data)) {
      const queryGarage = { _id: new ObjectID(garageId) };
      const projection = { automaticReviewResponseDelay: true };
      const garage = await app.models.Garage.getMongoConnector().findOne(queryGarage, { projection });
      eventsEmitter.accumulatorAdd(internalEventsReviewContext.EVENTS.ADD_REVIEW, { review: true });
      await upsertAutomaticReplyJob({ app }, garage, data, eventsEmitter);
    }

    changes.saved.push({ dataId: data.getId().toString(), sourceId: review.id });
    log.info(
      TIBO,
      `[GsAPI - AddReview] - Inserting New Review For Garage ${garageId} : ${sourceType} @ ${review.date} $From$ ${review.author}`
    );
    return true;
  }

  // 3. If we already know the review then we process it only if we detect changes since the last time
  if (isdataSavedInThisBack) {
    data = await mongoConnector.findOne(
      { 'source.sourceId': review.id },
      {
        projection: dataProjection,
      }
    );
  }
  const hash = getHashFromExternalReview(review);
  if (hash !== data.source.checksum) {
    const updates = {};

    // 3.2 Calculate which fields must be updated
    processDataUpdate(review, data, updates);

    // 3.3 calculate which fields must be updated for replies
    if (review.replies && review.replies.length > 0) {
      review.replies.forEach((reply, index) => {
        if (index === 0) {
          processFirstReplyDataUpdate(reply, data, updates);
        }
        let root = 'review.reply.thread';
        updates[root] = [];
        processReplyDataUpdate(reply, data, updates, root, index);
        if (reply.replies && reply.replies.length > 0) {
          reply.replies.forEach((subReply, subReplyIndex) => {
            root = `review.reply.thread.${index}.replies`;
            updates[root] = [];
            processReplyDataUpdate(subReply, data, updates, root, subReplyIndex);
          });
        }
      });
    }

    // 3.3 Make the update of the data on the DB
    updates['source.checksum'] = hash;
    const { value: newData } = await mongoConnector.findOneAndUpdate(
      { 'source.sourceId': review.id.toString() },
      { $set: updates },
      { returnOriginal: false }
    );

    // 3.4 under some conditions, CANCEL JOB
    if (!shouldRunAutomaticReplyJob(newData, review)) {
      eventsEmitter.accumulatorAdd(internalEventsReviewContext.EVENTS.REPLY_TO_REVIEW, { manualReply: true });
      await cancelAutomaticReplyJob(newData);
    }

    changes.updated.push(data._id.toString());
    log.info(
      TIBO,
      `[GsAPI - AddReview] - Updating Review For Garage ${garageId} : ${sourceType} @ ${review.date} $From$ ${review.author}`
    );
    return true;
  }

  // 4. Well, if we are here it's because we did not detect any change so we skip it
  changes.skipped.push(data._id.toString());
  return false;
}

// ---------------- API REVIEWS FUNCTION ---------------- //

module.exports = (API, app) => {
  /**
   * Add exogenous reviews into the database, used by SpiderScore to send reviews from Google, Facebook, etc.
   * @param garageId Garage for which you want to add reviews
   * @param params The body of your request
   * @returns {Promise<>} A cool promise
   */
  API.addReviews = async (garageId, params) => {
    // 1. We perform some basic checks
    if (!garageId || !ObjectID.isValid(garageId)) {
      return Promise.reject(new Error('ERROR - API.addReviews: GarageId must be valid.'));
    }
    if (!params || typeof params !== 'object') {
      return Promise.reject(new Error('ERROR - API.addReviews: Params must be an object.'));
    }
    if (!params.review && !params.reviews) {
      return Promise.reject(new Error('ERROR - API.addReviews: Missing reviews in the params object.'));
    }
    if (!params.method && !methods.includes(params.method)) {
      return Promise.reject(new Error('ERROR - API.addReviews: Missing method or bad method in the params object.'));
    }

    // 2. We prepare our cute little variables
    const reviews = params.review ? [params.review] : params.reviews;
    const changes = { updated: [], saved: [], skipped: [], deletedCount: 0 };
    const sourceType = params.sourceType || 'unknown';
    const method = params.method;
    const start = moment.utc();
    let duration = null;

    // 4. We process each received review
    log.info(
      TIBO,
      `[GsAPI - AddReview] Starting For Garage ${garageId} $From$ ${sourceType}, ${reviews.length} Reviews To Process`
    );

    const mongoConnectorData = await app.models.Data.getMongoConnector();

    const datasCount = await mongoConnectorData.count({ garageId: garageId.toString(), 'source.type': sourceType });

    const isFirstBatch = datasCount === 0;

    const eventsEmitterContext = internalEventsReviewContext.create(garageId, sourceType);
    const eventsEmitter = new EventsEmitter(eventsEmitterContext);
    for (const review of reviews) {
      await _handleNewReview(review, app, garageId, changes, sourceType, isFirstBatch, eventsEmitter);
    }
    eventsEmitter.accumulatorEmit();

    // 5. If we have more data in local, it means we need to delete some
    if (method === 'FULL' && reviews && datasCount > reviews.length) {
      await _deleteMissingReviews(app, reviews, changes, garageId, sourceType);
      log.info(
        TIBO,
        `[GsAPI - AddReview] - Deleted ${changes.deletedCount} Reviews For Garage ${garageId} From ${sourceType}`
      );
    }

    // 6. We update the lastFetch field
    await updateLastFetch(app, garageId, sourceType);

    duration = moment.duration(moment.utc().valueOf() - start.valueOf());
    log.info(
      TIBO,
      `[GsAPI - AddReview] Finished For Garage ${garageId} $From$ ${sourceType} In ${duration.asMilliseconds()} Milliseconds: ${
        changes.saved.length
      } Saved, ${changes.updated.length} Updated, ${changes.skipped.length} Skipped, ${changes.deletedCount} Deleted`
    );
    return changes;
  };

  /**
   * Fetch exogenous configurations for each garage, used by SpiderScore
   * @returns {Promise<[]>} A cool promise containing our list
   */
  API.getGaragesExogenousConfigurations = async () => {
    const result = [];

    // Fetch garages
    const garages = await app.models.Garage.getMongoConnector()
      .find(
        {
          'subscriptions.active': true,
          'subscriptions.EReputation.enabled': true,
          exogenousReviewsConfigurations: { $exists: true },
        },
        {
          projection: {
            id: '$_id',
            subscriptions: true,
            exogenousReviewsConfigurations: true,
            publicDisplayName: true,
          },
        }
      )
      .toArray();

    // Format the response we are going to send
    await Promise.all(
      garages.map(async (garage) => {
        _addGarageToConfiguration(result, garage);
      })
    );

    return result;
  };

  API.signalExogenousReviewError = async (appId, garageId, params) => {
    try {
      const garage = await new Promise((resolve, reject) =>
        app.models.Garage.findById(garageId, (e, d) => (e ? reject(e) : resolve(d)))
      );

      if (!garage) {
        return Promise.reject(new Error(`Unable to find garage ${garageId}`));
      } else if (!params.message) {
        return Promise.reject(new Error('Error message is missing from the request body'));
      } else if (!params.sourceType) {
        return Promise.reject(new Error('Source type is missing from the request body'));
      } else if (
        garage.exogenousReviewsConfigurations &&
        garage.exogenousReviewsConfigurations[params.sourceType] &&
        garage.exogenousReviewsConfigurations[params.sourceType].token &&
        garage.exogenousReviewsConfigurations[params.sourceType].externalId
      ) {
        garage.exogenousReviewsConfigurations[params.sourceType].error = params.message;
        garage.exogenousReviewsConfigurations[params.sourceType].lastError = new Date();
        await garage.save();
        return Promise.resolve('Ok');
      }
      return Promise.reject(new Error('No effect'));
    } catch (error) {
      return Promise.reject(error);
    }
  };
};
