const moderationStatus = require('../../../models/data/type/moderation-status');

class ExogenousWriter {
  //
  // PUBLIC METHODS
  //

  static write(result, singleData) {
    this._fillAggregationResult(result, singleData.garageId, null, singleData);
    const type = singleData && singleData.source && singleData.source.type;
    switch (type) {
      case 'Google':
        this._fillAggregationResult(result, singleData.garageId, 'Google', singleData);
        break;
      case 'Facebook':
        this._fillAggregationResult(result, singleData.garageId, 'Facebook', singleData);
        break;
      case 'PagesJaunes':
        this._fillAggregationResult(result, singleData.garageId, 'PagesJaunes', singleData);
        break;
      default:
        break;
    }
    return result;
  }

  static getEmptyResultObject(garage, periodToken) {
    return {
      id: 'OnTheFly',
      periodToken,
      frontDesk: 'ALL_USERS',
      hasSubscription: !!(
        garage.subscriptions &&
        garage.subscriptions.EReputation &&
        garage.subscriptions.EReputation.enabled
      ),
      garageId: garage.id.toString(),
      garageSlug: garage.slug,
      garagePublicDisplayName: garage.publicDisplayName,
      countReviews: 0,
      countReviewsWithScore: 0,
      countReviewsWithRecommendation: 0,
      countPromotors: 0,
      countDetractors: 0,
      countDetractorsWithResponse: 0,
      countNeutrals: 0,
      countRecommend: 0,
      score: 0,
      scoreNPS: 0,
      promotorsPercent: 0,
      detractorsPercent: 0,
      neutralsPercent: 0,
      recommendPercent: 0,
      historyBySource: {
        Google: {
          connection: this._getConnection(garage, 'Google'),
          countReviews: 0,
          countReviewsWithScore: 0,
          countReviewsWithRecommendation: 0,
          countPromotors: 0,
          countDetractors: 0,
          countDetractorsWithResponse: 0,
          countNeutrals: 0,
          score: 0,
          scoreNPS: 0,
          promotorsPercent: 0,
          detractorsPercent: 0,
          neutralsPercent: 0,
          countRecommend: 0,
          recommendPercent: 0,
        },
        Facebook: {
          connection: this._getConnection(garage, 'Facebook'),
          countReviews: 0,
          countReviewsWithScore: 0,
          countReviewsWithRecommendation: 0,
          countPromotors: 0,
          countDetractors: 0,
          countDetractorsWithResponse: 0,
          countNeutrals: 0,
          score: 0,
          scoreNPS: 0,
          promotorsPercent: 0,
          detractorsPercent: 0,
          neutralsPercent: 0,
          countRecommend: 0,
          recommendPercent: 0,
        },
        PagesJaunes: {
          connection: this._getConnection(garage, 'PagesJaunes'),
          countReviews: 0,
          countReviewsWithScore: 0,
          countReviewsWithRecommendation: 0,
          countPromotors: 0,
          countDetractors: 0,
          countDetractorsWithResponse: 0,
          countNeutrals: 0,
          score: 0,
          scoreNPS: 0,
          promotorsPercent: 0,
          detractorsPercent: 0,
          neutralsPercent: 0,
          countRecommend: 0,
          recommendPercent: 0,
        },
      },
    };
  }

  //
  // PRIVATE METHODS
  //

  static _getConnection(garage, source) {
    const g = (garage.exogenousReviewsConfigurations ? garage.exogenousReviewsConfigurations[source] : {}) || {};

    return {
      token: g.token || '',
      error: g.error || '',
      lastRefresh: g.lastRefresh || null,
      externalId: g.externalId || '',
      connected: !!(
        g.token &&
        g.externalId &&
        garage.subscriptions &&
        garage.subscriptions.EReputation &&
        garage.subscriptions.EReputation.enabled
      ),
    };
  }

  static _promotorsPercent(stat) {
    if (isNaN(stat.countReviews) || isNaN(stat.countPromotors)) {
      return 0;
    }
    if (stat.countPromotors === 0) return 0;
    return (stat.countPromotors / stat.countReviews) * 100;
  }

  static _detractorsPercent(stat) {
    if (isNaN(stat.countReviews) || isNaN(stat.countDetractors)) {
      return 0;
    }
    if (stat.countDetractors === 0) return 0;
    return (stat.countDetractors / stat.countReviews) * 100;
  }

  static _neutralsPercent(stat) {
    if (isNaN(stat.promotorsPercent) || isNaN(stat.detractorsPercent) || stat.countReviews === 0) {
      return 0;
    }
    return 100 - stat.promotorsPercent - stat.detractorsPercent;
  }

  static _getNPS(stat) {
    if (typeof stat.promotorsPercent !== 'undefined' && typeof stat.detractorsPercent !== 'undefined') {
      return Math.round(stat.promotorsPercent - stat.detractorsPercent);
    }
    return 0;
  }

  static _recommendPercent(stat) {
    if (
      isNaN(stat.countReviewsWithRecommendation) ||
      isNaN(stat.countRecommend) ||
      stat.countRecommend === 0 ||
      stat.countReviewsWithRecommendation === 0
    ) {
      return 0;
    }
    return (stat.countRecommend / stat.countReviewsWithRecommendation) * 100;
  }

  static _meanScore(aggregationResult, singleData) {
    const score = singleData.review && singleData.review.rating && singleData.review.rating.value;
    if (score || score === 0) {
      if (aggregationResult.countReviews === 0) {
        aggregationResult.score = parseFloat(score, 10); /* eslint-disable-line */
      } else {
        aggregationResult.score =
          (parseFloat(score, 10) + aggregationResult.countReviews * aggregationResult.score) /* eslint-disable-line */ /
          (aggregationResult.countReviews + 1);
      }
    }
  }

  static _fillAggregationResult(result, garageId, source, singleData) {
    const aggregationResult = source ? result[garageId].historyBySource[source] : result[garageId];
    const ratingObj = singleData.review && singleData.review.rating;
    const score = ratingObj && singleData.review.rating.value;
    const recommend = ratingObj && singleData.review.rating.recommend;
    const reply = singleData.review && singleData.review.reply;
    const hasScore = (score || score === 0) && score >= 0 && score <= 10;
    const isPromoter = hasScore && score >= 9;
    const isDetractor = hasScore && score <= 6;
    const hasAnApprovedReply = (reply && reply.status) === moderationStatus.APPROVED && (reply && reply.text) !== '';

    if (hasScore) {
      this._meanScore(aggregationResult, singleData);
      aggregationResult.countReviewsWithScore++;
    }
    if (singleData.source && singleData.source.type === 'Facebook') {
      aggregationResult.countReviewsWithRecommendation++;
    }
    aggregationResult.countReviews++;
    if (isPromoter) {
      aggregationResult.countPromotors++;
      if (singleData.source && singleData.source.type === 'Facebook' && recommend) {
        aggregationResult.countRecommend++;
      }
    } else if (isDetractor) {
      aggregationResult.countDetractors++;
      if (hasAnApprovedReply) {
        aggregationResult.countDetractorsWithResponse++;
      }
    } else {
      aggregationResult.countNeutrals++;
    }
    aggregationResult.promotorsPercent = this._promotorsPercent(aggregationResult);
    aggregationResult.detractorsPercent = this._detractorsPercent(aggregationResult);
    aggregationResult.neutralsPercent = this._neutralsPercent(aggregationResult);
    aggregationResult.scoreNPS = this._getNPS(aggregationResult);
    aggregationResult.recommendPercent = this._recommendPercent(aggregationResult);
  }
}

module.exports = ExogenousWriter;
