const unsatisfiedFollowupStatus = require('./type/unsatisfied-followup-status');
const reviewDetailedCriteria = require('./type/review-detailed-criterias');
const reviewDetailedSubCriteria = require('./type/review-detailed-subcriterias');
const moderationStatus = require('./type/moderation-status');
const rejectedReasons = require('./type/rejected-reasons');
const gsPublicReviewValidator = require('../../lib/garagescore/data-review/review-validator');
/**
 * Unsatisfaction data
 */
const model = () => ({
  properties: {
    /* when was the unsatisfaction detected */
    detectedAt: {
      type: 'date',
    },
    /* followupUnsatisfied status (résolu, en cours, non résolu)*/
    // followupStatus: { IF YOU ADD THAT, YOU CAN'T do unsatisfied.followupStatus: { exists: false }...
    //   type: unsatisfiedFollowupStatus.type
    // },
    /* was the customer recontacted after the unsatisfaction */
    isRecontacted: {
      type: 'boolean',
    },
    /* when was the contact send */
    contactedAt: {
      type: 'date',
    },
    /* criteria of unsatisfied */
    criteria: [
      {
        label: reviewDetailedCriteria.type,
        values: [{ type: reviewDetailedSubCriteria.type }], // array of review-detailed-subcriterias (array of strings)
      },
    ],
    /* if after followupUnsatisfied the customer is still unsatisfied, he may write a comment to the garage */
    /* it's not the same with 'review.followupUnsatisfiedComment'. the followupUnsatisfiedComment is given only if the customer become satisfied */
    comment: {
      text: { type: 'string' },
      moderated: { type: 'string' },
      status: moderationStatus.type,
      updatedAt: { type: 'date' },
      approvedAt: { type: 'date' },
      rejectedReason: rejectedReasons.type,
    },
    /* when was the problem resolved*/
    resolvedAt: {
      type: 'date',
    },
  },
});

// moderate the current comment
const moderateComment = function moderateComment() {
  return gsPublicReviewValidator
    .shouldApprove(this.get('unsatisfied.comment.text'), this.get('customer.fullName'))
    .then((autoStatus) => {
      this.set('unsatisfied.comment.status', autoStatus.approvableStatus);
      this.set(
        'unsatisfied.comment.approvedAt',
        autoStatus.approvableStatus === moderationStatus.APPROVED ? new Date() : null
      );
      this.set('unsatisfied.comment.rejectedReason', autoStatus.rejectedReason || null);
    });
};
const prototypeMethods = {
  moderateComment,
};

module.exports = { model, prototypeMethods };
