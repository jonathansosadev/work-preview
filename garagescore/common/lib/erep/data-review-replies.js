const facebookUtil = require('../util/facebook');
const googleUtil = require('../util/google');
const SourceTypes = require('../../models/data/type/source-types');
const { ObjectID } = require('mongodb');

const checkErrorFromSourceModule = (sourceReponse) => {
  if (sourceReponse && sourceReponse.error) {
    throw new Error(sourceReponse.error);
  }
};

const fetchGarageExogenousReviewsConfigurations = async (app, garageId, source, exogenous) => {
  if (
    (source.type !== SourceTypes.GOOGLE && source.type !== SourceTypes.DATAFILE) ||
    (exogenous && source.type === SourceTypes.GOOGLE)
  ) {
    const garage = await app.models.Garage.getMongoConnector().findOne(
      { _id: ObjectID(garageId) },
      { projection: { [`exogenousReviewsConfigurations.${source.type}`]: true } }
    );
    console.log(
      'SEND_AUTOMATIC_REPLY : garage exists : ',
      !!garage,
      'configs exists :',
      !!garage.exogenousReviewsConfigurations,
      ' and for source ? ',
      !!garage.exogenousReviewsConfigurations[source.type]
    );
    if (SourceTypes.isExogenous(source.type)) {
      if (
        !garage ||
        !garage.exogenousReviewsConfigurations ||
        (garage.exogenousReviewsConfigurations && !garage.exogenousReviewsConfigurations[source.type])
      ) {
        throw new Error(`Garage ${garageId} not found or exogenousReviewsConfigurations not configured`);
      }
      return garage.exogenousReviewsConfigurations[source.type];
    }
  }
  return { token: null, externalId: null };
};

const sendReplyToExogenousSource = async (replyText, sourceType, { token, sourceId, externalId } = {}) => {
  switch (sourceType) {
    case SourceTypes.DATAFILE:
    case SourceTypes.MANUAL_UNSATISFIED:
    case SourceTypes.MANUAL_LEAD: {
      return;
    }
    case SourceTypes.GOOGLE: {
      if (!token) {
        throw new TypeError('token is missing!');
      }
      if (!sourceId) {
        throw new TypeError('sourceId is missing!');
      }
      const googleFetch = await googleUtil.reply(token, sourceId, replyText);
      checkErrorFromSourceModule(googleFetch);
      return googleFetch;
    }
    case SourceTypes.FACEBOOK: {
      if (!token) {
        throw new TypeError('token is missing!');
      }
      if (!sourceId) {
        throw new TypeError('sourceId is missing!');
      }
      if (!externalId) {
        throw new TypeError('ExternalId is missing!');
      }
      const facebookFetch = await facebookUtil.postComment(externalId, token, sourceId, replyText);
      checkErrorFromSourceModule(facebookFetch);
      return facebookFetch;
    }
    default:
      throw new Error('Unknown source supplied');
  }
};

const updateReviewWithReply = async (
  app,
  { _id, source, review, commentId, replyId, automated = false  },
  { replyText, exogenousResponse, authorId }
) => {
  let update = {};
  switch (source.type) {
    case SourceTypes.DATAFILE:
    case SourceTypes.MANUAL_UNSATISFIED:
    case SourceTypes.MANUAL_LEAD: {
      const reviewReplyToWrite = googleUtil.getReplyToSave(replyText, authorId);
      if (!reviewReplyToWrite) {
        throw new Error(`An error happen with ${source.type}`);
      }
      update = { $set: { 'review.reply': reviewReplyToWrite, 'review.reply.automatedReply': automated  } };
      break;
    }
    case SourceTypes.GOOGLE: {
      const reviewReplyToWrite = googleUtil.getReplyToSave(replyText, authorId);
      if (!reviewReplyToWrite) {
        throw new Error(`An error happen with ${source.type}`);
      }
      update = { $set: { 'review.reply': reviewReplyToWrite , 'review.reply.automatedReply': automated } };
      break;
    }

    case SourceTypes.FACEBOOK: {
      const { replyStatus, thread } = facebookUtil.getReplyToSave({ review, commentId, replyId }, exogenousResponse);
      if (!replyStatus || !thread) {
        throw new Error(`An error happen with ${source.type}`);
      }
      update = { $set: { 'review.reply.status': replyStatus, 'review.reply.thread': thread, 'review.reply.automatedReply': automated } };
    }
  }
  if (!update.$set) {
    throw new Error(`An error happen with ${source.type}`);
  }
  _id = typeof _id === 'string' ? new ObjectID(_id) : _id;

  // !hack: update data object updatedAt so that it will listed as an updatedReview
  update.$set.updatedAt = new Date();

  return await app.models.Data.getMongoConnector().updateOne({ _id }, [update]);
};

const createReply = async (
  app,
  { _id, source, review, garageId, automated = false },
  replyText,
  { sourceId, authorId, commentId, replyId } = {},
  exogenous
) => {
  if (!source.type || !SourceTypes.hasValue(source.type)) {
    throw new TypeError('sourceType is missing or invalid !');
  }
  if (!replyText) {
    throw new TypeError('replyText is missing!');
  }

  const { token, externalId } = await fetchGarageExogenousReviewsConfigurations(app, garageId, source, exogenous);
  const exogenousResponse = await sendReplyToExogenousSource(replyText, source.type, { token, sourceId, externalId });
  return updateReviewWithReply(
    app,
    { _id, source, review, commentId, replyId, automated },
    { replyText, authorId, exogenousResponse }
  );
};

const deleteReplyFromExogenousSource = async (sourceType, token, sourceId, commentId, externalId) => {
  switch (sourceType) {
    case SourceTypes.DATAFILE:
    case SourceTypes.MANUAL_UNSATISFIED:
    case SourceTypes.MANUAL_LEAD: {
      return;
    }
    case SourceTypes.GOOGLE: {
      const response = await googleUtil.delete(token, sourceId);
      checkErrorFromSourceModule(response);
      break;
    }
    case SourceTypes.FACEBOOK: {
      if (!externalId) {
        throw new TypeError('externalId is missing!');
      }
      if (!commentId) {
        throw new TypeError('commentId is missing!');
      }
      const response = await facebookUtil.deleteComment(externalId, token, commentId);
      checkErrorFromSourceModule(response);
      break;
    }
    default:
      throw new TypeError('Unknown source supplied');
  }
};

const deleteReplyInDB = async (app, sourceType, commentId, dataId, thread, replyId) => {
  let update = {};
  switch (sourceType) {
    case SourceTypes.GOOGLE: {
      update = { $set: { 'review.reply': null } };
      break;
    }
    case SourceTypes.DATAFILE:
    case SourceTypes.MANUAL_UNSATISFIED:
    case SourceTypes.MANUAL_LEAD: {
      update = { $set: { 'review.reply': null } };
      break;
    }
    case SourceTypes.FACEBOOK: {
      const { status, updatedThread } = await facebookUtil.getFieldsToRemoveFromReviewReply(commentId, replyId, thread);
      if (!status || !updatedThread) {
        throw new Error(`An error happen with ${sourceType}`);
      }
      update = { $set: { 'review.reply.status': status, 'review.reply.thread': updatedThread } };
      break;
    }
  }
  if (!update.$set) {
    throw new Error(`An error happen with ${sourceType}`);
  }

  // !hack: update data object updatedAt so that it will listed as an updatedReview
  update.$set.updatedAt = new Date();

  await app.models.Data.getMongoConnector().updateOne({ _id: dataId }, update);
};

const deleteReply = async (
  app,
  {
    _id,
    source,
    review: {
      reply: { thread },
    },
    garageId,
    commentId = null,
    replyId = null,
  },
  exogenous = false
) => {
  if (!source.type || !SourceTypes.hasValue(source.type)) {
    throw new TypeError('sourceType is missing or invalid !');
  }
  const itemId = replyId ? replyId : commentId;
  const { externalId, token } = await fetchGarageExogenousReviewsConfigurations(app, garageId, source, exogenous);
  if (source.type !== SourceTypes.GOOGLE || (exogenous && source.type === SourceTypes.GOOGLE)) {
    await deleteReplyFromExogenousSource(source.type, token, source.sourceId, itemId, externalId);
  }
  await deleteReplyInDB(app, source.type, commentId, _id, thread, replyId);
  return true;
};

const updateReplyInExogenousSource = async (replyText, sourceType, commentId, { token, sourceId, externalId } = {}) => {
  switch (sourceType) {
    case SourceTypes.DATAFILE:
    case SourceTypes.MANUAL_UNSATISFIED:
    case SourceTypes.MANUAL_LEAD: {
      return;
    }
    case SourceTypes.GOOGLE: {
      if (!token) {
        throw new TypeError('token is missing!');
      }
      if (!sourceId) {
        throw new TypeError('sourceId is missing!');
      }
      const googleFetch = await googleUtil.reply(token, sourceId, replyText);
      checkErrorFromSourceModule(googleFetch);
      return googleFetch;
    }
    case SourceTypes.FACEBOOK: {
      if (!token) {
        throw new TypeError('token is missing!');
      }
      if (!sourceId) {
        throw new TypeError('sourceId is missing!');
      }
      if (!externalId) {
        throw new TypeError('ExternalId is missing!');
      }
      const facebookFetch = await facebookUtil.updateComment(externalId, token, commentId, replyText);
      checkErrorFromSourceModule(facebookFetch);
      return facebookFetch;
    }
    default:
      throw new Error('Unknown source supplied');
  }
};

const updateReply = async (
  app,
  { _id, source, review, garageId, commentId, replyId },
  replyText,
  { authorId } = {},
  exogenous
) => {
  if (!source.type || !SourceTypes.hasValue(source.type)) {
    throw new TypeError('sourceType is missing or invalid !');
  }
  if (!replyText) {
    throw new TypeError('replyText is missing!');
  }
  const itemId = replyId ? replyId : commentId;
  const { token, externalId } = await fetchGarageExogenousReviewsConfigurations(app, garageId, source, exogenous);
  const exogenousResponse = await updateReplyInExogenousSource(replyText, source.type, itemId, {
    token,
    sourceId: source.sourceId,
    externalId,
  });
  return updateReviewWithReply(
    app,
    { _id, source, review, commentId, replyId },
    { replyText, authorId, exogenousResponse }
  );
};

module.exports = {
  createReply,
  updateReply,
  deleteReply,
};
