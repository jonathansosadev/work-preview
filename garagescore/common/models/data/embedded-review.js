const rejectedReasons = require('./type/rejected-reasons');
const subRatingLabels = require('./type/subrating-labels');
const moderationStatus = require('./type/moderation-status');
const gsPublicReviewValidator = require('../../lib/garagescore/data-review/review-validator');
const SourceTypes = require('./type/source-types');
const { createReply } = require('../../lib/erep/data-review-replies');
const app = require('../../../server/server');
const { ObjectId } = require('mongodb');

/**
 * A review (from surveygiwmo, Google, Facebook...)
 */
const model = () => ({
  properties: {
    /* timestamps */
    createdAt: {
      type: 'date',
      required: true,
    },
    updatedAt: {
      type: 'date',
    },
    /* neither promotor or detractor */
    isNeutral: {
      type: 'boolean',
    },
    /* Was the review updated after a followupUnsatisfied survey */
    isEvaluationRevisedAfterFollowup: {
      type: 'boolean',
    },
    recommend: {
      type: 'boolean',
    },
    /* Original rating */
    rating: {
      value: { type: 'number' },
      original: { type: 'number' },
      originalScale: { type: 'number' },
      recommend: { type: 'boolean' },
    },
    /* Its a rating may be given by customer after changing his mind  */
    followupUnsatisfiedRating: {
      value: { type: 'number' },
      original: { type: 'number' },
      originalScale: { type: 'number' },
      updatedAt: { type: 'date' },
    },
    /* Comment (moderated) */
    comment: {
      text: { type: 'string' },
      moderated: { type: 'string' },
      status: moderationStatus.type,
      updatedAt: { type: 'date' },
      approvedAt: { type: 'date' },
      rejectedReason: rejectedReasons.type,
      isReported: { type: 'boolean' },
      reports: [
        {
          date: { type: 'date' },
          channel: { type: 'string' },
          reporterId: { type: 'string' },
          reason: { type: 'string' },
        },
      ],
    },
    /* Garage reply */
    reply: {
      text: { type: 'string' },
      status: { type: 'string' },
      approvedAt: { type: 'date' },
      rejectedReason: rejectedReasons.type,
      followingReplies: { type: 'array' },
    },
    /* Its a comment may be given by customer after changing his mind (moderated) */
    followupUnsatisfiedComment: {
      text: { type: 'string' },
      status: { type: 'string' },
      approvedAt: { type: 'date' },
      rejectedReason: rejectedReasons.type,
    },
    /* rating of sub categories */
    subRatings: [
      {
        label: subRatingLabels.type,
        value: { type: 'number' },
      },
    ],
    /* display on yellowpages, ...*/
    shareWithPartners: {
      type: 'boolean',
    },
    /* customer when responding to survey clicked on share on google button */
    sharedOnGoogleClicked: {
      type: 'boolean',
    },
    /* When was it autorized to be shared*/
    sharedWithPartnersAt: {
      type: 'date',
    },
  },
});

const isSensitive = function isSensitive(garage) {
  if (!garage) {
    return false;
  }
  const rating = this.get('review.rating.value');
  const sensitiveThreshold = garage.getSensitiveThreshold(this.type);
  if (sensitiveThreshold <= 6) {
    return false;
  }
  return !!(rating && rating > 6 && rating <= sensitiveThreshold);
};

// moderate the current comment
const moderateComment = function moderateComment() {
  return gsPublicReviewValidator
    .shouldApprove(this.get('review.comment.text'), this.get('customer.fullName.value'))
    .then((autoStatus) => {
      this.set('review.comment.status', autoStatus.approvableStatus);
      this.set(
        'review.comment.approvedAt',
        autoStatus.approvableStatus === moderationStatus.APPROVED ? new Date() : null
      );
      this.set('review.comment.rejectedReason', autoStatus.rejectedReason || null);
    });
};

const hasAnApprovedReply = function hasAnApprovedReply() {
  return this.get('review.reply.status') === moderationStatus.APPROVED && this.get('review.reply.text') !== '';
};

/* score >=9 */
const isEvaluationChanged = function isPromoter() {
  return this.get('review.followupUnsatisfiedRating') || this.get('review.followupUnsatisfiedComment');
};

const isPromoter = function isPromoter() {
  /*
  WARNING, for ereputation some ratings are equals to 42 and are promotors
  do NOT change this condition without thinking about consequences
   */
  let rating = this.get('review.rating.value');

  return typeof rating !== 'undefined' && rating >= 9;
};
/* score <=6 */
const isDetractor = function isDetractor() {
  /*
WARNING, for ereputation some ratings are equals to -42 and are detractors
do NOT change this condition without thinking about consequences
 */
  let rating = this.get('review.rating.value');

  if (typeof rating === 'undefined' || rating === null) {
    return false;
  }
  return rating <= 6;
};

const isDetractorContactTicket = function isDetractorContactTicket() {
  let rating = this.get('contactTicket.score');

  if (typeof rating === 'undefined' || rating === null) {
    return false;
  }
  return rating <= 6;
};

const isSensitiveContactTicket = function isSensitiveContactTicket(garage) {
  if (!garage) {
    return false;
  }
  const rating = this.get('contactTicket.score');
  const sensitiveThreshold = garage.getSensitiveThreshold(this.type);
  if (sensitiveThreshold <= 6) {
    return false;
  }
  return !!(rating && rating > 6 && rating <= sensitiveThreshold);
};

/**
 * countApprovedReviewByType still include exogenous reviews, should we remove it ?
 * @param where
 * @param cb
 */
const countApprovedReviewByType = function countApprovedReviewByType(where, cb) {
  const Data = this;
  const DataCollection = Data.getMongoConnector();
  const source = Data.getDataSource().connector.name;

  if (DataCollection.aggregate && source === 'mongodb') {
    DataCollection.aggregate([
      { $match: where },
      {
        $group: {
          _id: { type: '$type' },
          total: { $sum: 1 },
        },
      },
    ]).toArray(cb);
  } else if (source === 'memory') {
    const reviewSorted = {};
    Data.find(where, (err, results) => {
      results.forEach((data) => {
        if (!reviewSorted[data.type]) reviewSorted[data.type] = 0;
        reviewSorted[data.type]++;
      });
      cb(err, reviewSorted);
    });
  } else {
    cb(new Error('Unsupported data source in countApprouvedReviewByType'));
  }
};
const getSatisfactionCategory = function getSatisfactionCategory() {
  const review = this.get('review');
  if (!review || !review.rating) {
    return undefined;
  }
  if (review.rating.value >= 9) {
    return 'promoter';
  }
  if (review.rating.value <= 8 && review.rating.value > 6) {
    return 'passive';
  }
  if (review.rating.value <= 6) {
    return 'detractor';
  }
  return undefined;
};

//Gets a random reply matching the satisfaction category and source
const getAutomaticReplyToReview = async function getAutomaticReplyToReview() {
  const satisfactionCategory = this.review_getSatisfactionCategory();
  if (!satisfactionCategory) {
    return undefined;
  }
  const garageId = this.get('garageId');
  const source = this.get('source');
  const templateConnector = app.models.ReviewReplyTemplate.getMongoConnector();
  const templates = await templateConnector
    .find({ garageIds: ObjectId(garageId), ratingCategories: satisfactionCategory, sources: source.type })
    .toArray();
  if (!templates.length) {
    return undefined;
  }
  const randomSelection = templates[Math.floor(Math.random() * templates.length)].content;
  // Now replace all the labels with something meaningful
  const tags = [
    'InitialName',
    'LastNameClient',
    'GarageName',
    'LastName',
    'FirstName',
    'Sign',
    'Collaborator',
    'GroupName',
  ];
  const garageConnector = app.models.Garage.getMongoConnector();
  const customer = this.get('customer');
  const service = this.get('service');

  const garageFetch = await garageConnector.findOne(
    { _id: ObjectId(garageId) },
    { projection: { publicDisplayName: 1, group: 1, surveySignature: 1 } }
  );

  let tempText = randomSelection;

  for (let tag of tags) {
    if (tempText.includes(tag)) {
      let replacement = '';
      switch (tag) {
        case 'InitialName':
          if (
            customer &&
            customer.firstName &&
            customer.firstName.value &&
            customer.lastName &&
            customer.lastName.value
          ) {
            replacement = `${customer.firstName.value[0].toUpperCase()}${customer.lastName.value[0].toUpperCase()}`;
          }
          break;
        case 'LastNameClient':
          if (customer && customer.lastName && customer.lastName.value) {
            replacement = `${customer.lastName.value}`;
          }
          break;
        case 'GarageName':
          if (garageFetch && garageFetch.publicDisplayName) {
            replacement = `${garageFetch.publicDisplayName}`;
          }
          break;
        case 'LastName':
          if (garageFetch && garageFetch.surveySignature && garageFetch.surveySignature.defaultSignature) {
            replacement = `${
              garageFetch.surveySignature.defaultSignature.lastName
                ? garageFetch.surveySignature.defaultSignature.lastName
                : ''
            }`;
          }
          break;
        case 'FirstName':
          if (garageFetch && garageFetch.surveySignature && garageFetch.surveySignature.defaultSignature) {
            replacement = `${
              garageFetch.surveySignature.defaultSignature.firstName
                ? garageFetch.surveySignature.defaultSignature.firstName
                : ''
            }`;
          }
          break;
        case 'Sign':
          if (garageFetch && garageFetch.surveySignature && garageFetch.surveySignature.defaultSignature) {
            replacement = `${
              garageFetch.surveySignature.defaultSignature.firstName
                ? garageFetch.surveySignature.defaultSignature.firstName
                : ''
            } ${
              garageFetch.surveySignature.defaultSignature.lastName
                ? garageFetch.surveySignature.defaultSignature.lastName
                : ''
            }, ${
              garageFetch.surveySignature.defaultSignature.job ? garageFetch.surveySignature.defaultSignature.job : ''
            }`;
          }
          break;
        case 'Collaborator':
          if (service) {
            replacement = `${
              service.frontDeskUserName && service.frontDeskUserName !== 'UNDEFINED' ? service.frontDeskUserName : ''
            }`;
          }
          break;
        case 'GroupName':
          if (garageFetch && garageFetch.group) {
            replacement = `${garageFetch.group}`;
          }
          break;
      }
      const regExp = new RegExp(`@${tag}`, 'g');
      tempText = tempText.replace(regExp, replacement);
    }
  }
  return tempText;
};

const replyAutomaticallyToReview = async function replyAutomaticallyToReview() {
  const _id = this.get('id');
  const source = this.get('source');
  const review = this.get('review');
  const garageId = this.get('garageId');
  // Find a text to reply with
  const textToReply = await this.review_getAutomaticReplyToReview();
  if (!textToReply) {
    return;
  }
  const exogenous = source.type !== SourceTypes.DATAFILE;
  return createReply(app, { _id, source, review, garageId, automated: true }, textToReply, source, exogenous);
};
const prototypeMethods = {
  moderateComment,
  isPromoter,
  isDetractor,
  isDetractorContactTicket,
  isEvaluationChanged,
  hasAnApprovedReply,
  isSensitive,
  isSensitiveContactTicket,
  replyAutomaticallyToReview,
  getAutomaticReplyToReview,
  getSatisfactionCategory,
};

const staticMethods = {
  countApprovedReviewByType,
};

module.exports = { model, prototypeMethods, staticMethods };
