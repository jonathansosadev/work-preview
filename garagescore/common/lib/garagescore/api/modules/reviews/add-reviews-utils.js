const crypto = require('crypto');
const { getDeepFieldValue } = require('../../../../util/object');
const ContactTypes = require('../../../../../models/contact.type.js');
const AlertTypes = require('../../../../../models/alert.types');
const contactService = require('../../../contact/service.js');
const SourceTypes = require('../../../../../models/data/type/source-types');

const fillUpData = (data, review) => {
  /** This is a quick and clean way to go through parameters without sending review.'fieldName' or '' every time **/
  const customerFields = [
    'email',
    'mobilePhone',
    'gender',
    'title',
    'firstName',
    'lastName',
    'author',
    'street',
    'postalCode',
    'authorCity',
    'countryCode',
    'optOutMailing',
    'optOutSMS',
  ];
  const reviewFields = [
    'score',
    'text',
    'date',
    'date',
    'shareWithPartners',
    'replyText',
    'replyDate',
    'rawScore',
    'rawScoreScale',
    'recommend',
  ];
  return data
    .addCustomer(...customerFields.map((f) => review[f] || ''))
    .addReview(...reviewFields.map((f) => (typeof review[f] === 'boolean' ? review[f] : review[f] || '')))
    .addReviewReplies(review.replies);
};

const _normalizeReplies = (replies) => {
  if (!replies || !replies.length) {
    return [];
  }
  return replies.map((subReply) => ({
    text: subReply.text || '',
    status: 'Approved',
    approvedAt: new Date(subReply.approvedAt || subReply.date || null),
    rejectedReason: null,
    author: subReply.author || '',
    id: subReply.id || '',
    authorId: subReply.authorId || '',
    attachment: subReply.attachment || '',
    isFromOwner: subReply.isFromOwner || false,
  }));
};
const _normalizeThread = (thread) => {
  if (thread && thread.length > 0) {
    return thread.map((reply) => ({
      text: reply.text || '',
      status: 'Approved',
      approvedAt: new Date(reply.approvedAt || reply.date || null),
      rejectedReason: null,
      author: reply.author || '',
      id: reply.id || '',
      authorId: reply.authorId || '',
      attachment: reply.attachment || '',
      isFromOwner: reply.isFromOwner || false,
      replies: _normalizeReplies(reply.replies),
    }));
  }
  return [];
};
const getHashFromExternalReview = (review) => {
  const payload = {
    score: review.score,
    date: new Date(review.date || null),
    replyText: (review.replies && review.replies[0] && review.replies[0].text) || null,
    replyDate: new Date((review.replies && review.replies[0] && review.replies[0].date) || null),
    recommend: review.recommend,
    text: review.text,
    author: review.author,
    replies: _normalizeThread(review.replies),
  };
  return crypto.createHash('sha256').update(JSON.stringify(payload), 'utf8').digest('hex');
};
const getHashFromData = (data) => {
  const obj = data.toObject();
  const payload = {
    score: data.get('review.rating.value'),
    date: new Date(data.get('service.providedAt') || null),
    replyText: data.get('review.reply.text') || null,
    replyDate: new Date(data.get('review.reply.approvedAt') || null),
    recommend: data.get('review.rating.recommend'),
    text: data.get('review.comment.text'),
    author: data.get('customer.fullName.value'),
    // Bit more complex since it's a big array, we want to avoid loopback garbage for the hash
    replies: _normalizeThread((obj.review && obj.review.reply && obj.review.reply.thread) || []),
  };
  return crypto.createHash('sha256').update(JSON.stringify(payload), 'utf8').digest('hex');
};

const updateLastFetch = async (app, garageId, sourceType) => {
  const garage = await app.models.Garage.findById(garageId);
  // 1. We make sure the object exists
  if (!garage.exogenousReviewsConfigurations) {
    garage.exogenousReviewsConfigurations = { Google: {}, Facebook: {}, PagesJaunes: {} };
  }
  if (!garage.exogenousReviewsConfigurations[sourceType]) {
    garage.exogenousReviewsConfigurations[sourceType] = {
      token: '',
      error: '',
      lastRefresh: null,
      externalId: '',
      lastError: null,
      lastFetch: null,
    };
  }
  // 2. We update the lastRefresh date
  garage.exogenousReviewsConfigurations[sourceType].lastFetch = new Date();
  // 3. We clean the last error if it was a crawling error, everything went fine
  const { error } = garage.exogenousReviewsConfigurations[sourceType];
  if (error && error.includes('SpiderScore')) {
    garage.exogenousReviewsConfigurations[sourceType].error = '';
  }
  return garage.save();
};

const sendAlertExogenousReview = async (app, data) => {
  const subscribers = await app.models.Garage.getRealTimeSubscribers(data.garageId, AlertTypes.EXOGENOUS_NEW_REVIEW);

  const _disableForPagesJaunes = () => {
    const reviewDate = data.source && data.source.raw && data.source.raw.date;
    return reviewDate && new Date(reviewDate) < new Date('01-03-2022') && data.source.type === SourceTypes.PAGESJAUNES;
  };

  if (!subscribers || _disableForPagesJaunes()) {
    return 0;
  }
  // 1. We loop through our contributors object and send the notification
  for (const subscriber of subscribers) {
    const commonContact = { from: 'no-reply@custeed.com', sender: 'GarageScore', type: ContactTypes.ALERT_EMAIL };
    const contact = {
      ...commonContact,
      to: subscriber.email,
      recipient: subscriber.fullName,
      payload: {
        alertType: AlertTypes.EXOGENOUS_NEW_REVIEW,
        garageId: data.garageId,
        addresseeId: subscriber.getId().toString(),
        dataId: data.getId().toString(),
      },
    };
    await new Promise((res, rej) => contactService.prepareForSend(contact, (e, r) => (e ? rej(e) : res(r))));
  }

  return subscribers.length;
};

// Delete all datas for this garage and source that doesn't correspond to any review
async function _deleteMissingReviews(app, reviews, changes, garageId, sourceType) {
  const result = await app.models.Data.getMongoConnector().deleteMany({
    garageId: garageId.toString(),
    'source.type': sourceType,
    'source.sourceId': { $exists: true, $nin: reviews.map((r) => r.id) },
  });
  changes.deletedCount = (result && result.deletedCount) || 0;
}

/** will build an object containing all the updates to be made on a Data in the database compared to the current
 * version of the corresponding review
 * ex: {[keytoUpdate]: newValueToSet}
 */
const processUpdate = (fieldsMaping, review, data, updates) => {
  Object.keys(fieldsMaping).forEach((field) => {
    fieldsMaping[field].dataFields.forEach((dataField) => {
      const dataValue = getDeepFieldValue(data, dataField);
      let reviewValue = getDeepFieldValue(review, field) || fieldsMaping[field].defaultValue || null;
      if (dataValue instanceof Date) {
        reviewValue = new Date(reviewValue);
        if (dataValue.getTime() !== reviewValue.getTime()) {
          const valueToSet = reviewValue;
          updates[dataField] = valueToSet;
        }
      } else if (dataValue !== reviewValue) {
        const valueToSet = reviewValue;
        updates[dataField] = valueToSet;
      }
    });
  });
};

/** will build an object containing all the updates to be made on a Data in the database compared to the current
 * version of the corresponding review update
 * ex: {[keytoUpdate]: newValueToSet}
 */
const processReplyDataUpdate = (reply, data, updates, root, index) => {
  const fieldsMaping = {
    id: {
      dataFields: ['id'],
    },
    text: {
      dataFields: ['text'],
    },
    author: {
      dataFields: ['author'],
    },
    date: {
      dataFields: ['approvedAt'],
    },
    isFromOwner: {
      dataFields: ['isFromOwner'],
    },
    authorId: {
      dataFields: ['authorId'],
    },
    attachment: {
      dataFields: ['attachment'],
    },
    default: {
      dataFields: ['status'],
      defaultValue: 'Approved',
    },
  };

  let obj = {};

  Object.keys(fieldsMaping).forEach((field) => {
    fieldsMaping[field].dataFields.forEach((dataField) => {
      let dataValue = getDeepFieldValue(data, root);
      dataValue = dataValue && dataValue[index] && dataValue[index].dataField;
      let replyValue = getDeepFieldValue(reply, field) || fieldsMaping[field].defaultValue || null;
      if (dataValue instanceof Date) {
        replyValue = new Date(replyValue);
        if (dataValue.getTime() !== replyValue.getTime()) {
          obj = { ...obj, [fieldsMaping[field].dataFields]: replyValue };
        }
      } else if (dataValue !== replyValue) {
        obj = { ...obj, [dataField]: replyValue };
      }
    });
  });
  updates[`${root}`].push(obj);
};

const processDataUpdate = (review, data, updates) => {
  const reviewFields = {
    score: {
      dataFields: ['review.rating.value'],
    },
    text: {
      dataFields: ['review.comment.text'],
    },
    date: {
      dataFields: ['review.createdAt', 'review.comment.updatedAt', 'review.comment.approvedAt', 'service.providedAt'],
    },
    shareWithPartners: {
      dataFields: ['review.shareWithPartners'],
    },

    rawScore: {
      dataFields: ['review.rating.original'],
    },
    rawScoreScale: {
      dataFields: ['review.rating.originalScale'],
    },
    recommend: {
      dataFields: ['review.rating.recommend'],
    },
    default: {
      dataFields: ['review.reply.status'],
      defaultValue: 'Approved',
    },
  };
  processUpdate(reviewFields, review, data, updates);
};

const processFirstReplyDataUpdate = (review, data, updates) => {
  const reviewReplyFields = {
    text: {
      dataFields: ['review.reply.text'],
    },
    date: {
      dataFields: ['review.reply.approvedAt'],
    },
  };
  processUpdate(reviewReplyFields, review, data, updates);
};

module.exports = {
  fillUpData,
  getHashFromExternalReview,
  getHashFromData,
  updateLastFetch,
  sendAlertExogenousReview,
  processReplyDataUpdate,
  processFirstReplyDataUpdate,
  processDataUpdate,
  _deleteMissingReviews,
};
