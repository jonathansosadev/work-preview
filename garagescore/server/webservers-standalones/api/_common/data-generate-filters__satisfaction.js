const UnsatisfiedFollowupStatus = require('../../../../common/models/data/type/unsatisfied-followup-status');

module.exports = {
  // Basics
  setBasicFilterForSatisfactionList() {
    this.filters = {
      shouldSurfaceInStatistics: true,
      'review.rating.value': { $gte: 0 },
    };
    return this;
  },

  setSurveySatisfactionLevelForSatisfaction(surveySatisfactionLevel) {
    if (surveySatisfactionLevel) {
      if (surveySatisfactionLevel === 'Promoter') {
        this.filters['review.rating.value'] = { $gte: 9 };
      } else if (surveySatisfactionLevel === 'Detractor') {
        this.filters['review.rating.value'] = { $lte: 6 };
      } else if (surveySatisfactionLevel === 'Neutral') {
        this.filters.$and = [
          ...(this.filters.$and || []),
          { 'review.rating.value': { $gt: 6 } },
          { 'review.rating.value': { $lt: 9 } },
        ];
      }
    }
    return this;
  },

  setFollowupUnsatisfiedStatus(followupUnsatisfiedStatus) {
    if (followupUnsatisfiedStatus) {
      if (followupUnsatisfiedStatus === UnsatisfiedFollowupStatus.NEW_UNSATISFIED) {
        this.filters.$and = [
          ...(this.filters.$and || []),
          { 'review.rating.value': { $lte: 6 } },
          { 'surveyFollowupUnsatisfied.sendAt': { $ne: 'undefined' } },
          { 'surveyFollowupUnsatisfied.sendAt': { $ne: null } },
        ];
      } else if (followupUnsatisfiedStatus === UnsatisfiedFollowupStatus.UNSATISFIED_WITHOUT_ANSWER) {
        this.filters.$and = [
          ...(this.filters.$and || []),
          { 'unsatisfied.followupStatus': { $ne: 'undefined' } },
          { 'unsatisfied.followupStatus': { $ne: null } },
          { 'surveyFollowupUnsatisfied.sendAt': { $gte: new Date(0) } },
        ];
      } else if ([
        UnsatisfiedFollowupStatus.RESOLVED,
        UnsatisfiedFollowupStatus.NOT_RESOLVED,
        UnsatisfiedFollowupStatus.IN_PROGRESS
      ].includes(followupUnsatisfiedStatus)) {
        this.filters['unsatisfied.followupStatus'] = followupUnsatisfiedStatus;
      }
    }
    return this;
  },

  setPublicReviewStatus(publicReviewStatus) {
    if (publicReviewStatus) {
      this.filters['review.comment.status'] = publicReviewStatus;
    }
    return this;
  },

  setPublicReviewCommentStatus(publicReviewCommentStatus) {
    if (publicReviewCommentStatus) {
      if (publicReviewCommentStatus === 'NoResponse') {
        this.filters.$or = [
          ...(this.filters.$or || []),
          { 'review.reply.status': { $eq: 'undefined' } },
          { 'review.reply.status': { $eq: null } },
        ];
      } else {
        this.filters['review.reply.status'] = { $in: ['Rejected', 'Approved'] };
      }
    }
    return this;
  },

  setSource(source) {
    if (source) {
      this.filters['source.type'] = Array.isArray(source) ? { $in: source } : source;
    }
    return this;
  },
};
