/** Aggregation for Erep */
const { addMatchOnGarageId } = require('./kpiAggregatorHelper');

module.exports = async function aggregateKpis(app, { period, garageIds = [] } = {}) {
  const $match = {
    ...addMatchOnGarageId(garageIds, 'string'),
    shouldSurfaceInStatistics: true,
    type: 'ExogenousReview',
    'review.createdAt': { $gte: period.min, $lte: period.max },
  };

  const hasRating = { $cond: [{ $ne: ['$source.type', 'Facebook'] }, 1, 0] };
  const hasRecommendation = { $cond: [{ $eq: ['$source.type', 'Facebook'] }, 1, 0] };
  const rating = { $cond: [{ $ne: ['$source.type', 'Facebook'] }, '$review.rating.value', 0] };
  const isPromoter = { $cond: [{ $gte: ['$review.rating.value', 9] }, 1, 0] }; // { $cond: [{ $gt: ['$rating', 4] }, 1, 0] };
  const isDetractor = { $cond: [{ $lte: ['$review.rating.value', 6] }, 1, 0] }; // { $cond: [{ $lt: ['$rating', 3] }, 1, 0] };
  const isPassive = {
    $cond: [{ $and: [{ $gt: ['$review.rating.value', 6] }, { $lt: ['$review.rating.value', 9] }] }, 1, 0],
  };
  const recommend = { $cond: [{ $and: [{ $eq: ['$review.rating.recommend', true] }, {}] }, 1, 0] };
  const notRecommend = { $cond: [{ $eq: ['$review.rating.recommend', false] }, 1, 0] };
  const withoutResponse = { $cond: [{ $eq: [{ $ifNull: ['$review.reply.text', 'empty'] }, 'empty'] }, 1, 0] };
  const detractorWithoutResponse = { $cond: [{ $and: [isDetractor, withoutResponse] }, 1, 0] };
  const notRecommendWithoutResponse = {
    $cond: [{ $and: [{ $not: ['$review.rating.recommend'] }, withoutResponse] }, 1, 0],
  };

  const ifSource = (source, valueYes, valueNo) => ({ $cond: [{ $eq: ['$source.type', source] }, valueYes, valueNo] });

  const $project = {
    garageId: true,
    source: '$source.type',
    hasRating,
    hasRecommendation,
    isPromoter,
    isDetractor,
    isPassive,
    recommend,
    detractorWithoutResponse,
    rating,
    // notRecommendWithoutResponse, // This one isn't in the Dictionary but I wonder why the above is and not this one
    // ERep KPIs by source
    // Google
    countGoogle: ifSource('Google', 1, 0),
    hasRatingGoogle: ifSource('Google', hasRating, 0),
    ratingGoogle: ifSource('Google', rating, 0),
    isPromoterGoogle: ifSource('Google', isPromoter, 0),
    isDetractorGoogle: ifSource('Google', isDetractor, 0),
    detractorWithoutResponseGoogle: ifSource('Google', detractorWithoutResponse, 0),
    // FaceBook
    countFacebook: ifSource('Facebook', 1, 0),
    hasRecommendationFacebook: ifSource('Facebook', hasRecommendation, 0),
    recommendFacebook: ifSource('Facebook', recommend, 0),
    isPromoterFacebook: ifSource('Facebook', recommend, 0),
    isDetractorFacebook: ifSource('Facebook', notRecommend, 0),
    detractorWithoutResponseFacebook: ifSource('Facebook', notRecommendWithoutResponse, 0),
    // Pages Jaunes
    countPagesJaunes: ifSource('PagesJaunes', 1, 0),
    hasRatingPagesJaunes: ifSource('PagesJaunes', hasRating, 0),
    ratingPagesJaunes: ifSource('PagesJaunes', rating, 0),
    isPromoterPagesJaunes: ifSource('PagesJaunes', isPromoter, 0),
    isDetractorPagesJaunes: ifSource('PagesJaunes', isDetractor, 0),
    detractorWithoutResponsePagesJaunes: ifSource('PagesJaunes', detractorWithoutResponse, 0),
  };

  // group and sums
  const $group = {
    _id: '$garageId', // { garageId: '$garageId', source: '$source' },
    erepCountReviews: { $sum: 1 },
    erepCountHasRating: { $sum: '$hasRating' },
    erepCountHasRecommendation: { $sum: '$hasRecommendation' },
    erepSumRating: { $sum: '$rating' },
    erepCountPromoters: { $sum: '$isPromoter' },
    erepCountDetractors: { $sum: '$isDetractor' },
    erepCountPassives: { $sum: '$isPassive' },
    erepCountRecommend: { $sum: '$recommend' },
    erepCountDetractorsWithoutResponse: { $sum: '$detractorWithoutResponse' },

    erepCountReviewsGoogle: { $sum: '$countGoogle' },
    erepCountHasRatingGoogle: { $sum: '$hasRatingGoogle' },
    erepSumRatingGoogle: { $sum: '$ratingGoogle' },
    erepCountPromotersGoogle: { $sum: '$isPromoterGoogle' },
    erepCountDetractorsGoogle: { $sum: '$isDetractorGoogle' },
    erepCountDetractorsWithoutResponseGoogle: { $sum: '$detractorWithoutResponseGoogle' },

    erepCountReviewsFacebook: { $sum: '$countFacebook' },
    erepCountHasRecommendationFacebook: { $sum: '$hasRecommendationFacebook' },
    erepCountRecommendFacebook: { $sum: '$recommendFacebook' },
    erepCountPromotersFacebook: { $sum: '$isPromoterFacebook' },
    erepCountDetractorsFacebook: { $sum: '$isDetractorFacebook' },
    erepCountDetractorsWithoutResponseFacebook: { $sum: '$detractorWithoutResponseFacebook' },

    erepCountReviewsPagesJaunes: { $sum: '$countPagesJaunes' },
    erepCountHasRatingPagesJaunes: { $sum: '$hasRatingPagesJaunes' },
    erepSumRatingPagesJaunes: { $sum: '$ratingPagesJaunes' },
    erepCountPromotersPagesJaunes: { $sum: '$isPromoterPagesJaunes' },
    erepCountDetractorsPagesJaunes: { $sum: '$isDetractorPagesJaunes' },
    erepCountDetractorsWithoutResponsePagesJaunes: { $sum: '$detractorWithoutResponsePagesJaunes' },
  };

  // avg rating and nps and add suffix erep
  const $finalProject = {
    garageId: '$garageId',

    erepCountReviews: true,
    erepCountHasRating: true,
    erepCountHasRecommendation: true,
    erepSumRating: true,

    erepCountPromoters: true,
    erepCountDetractors: true,
    erepCountPassives: true,
    erepCountRecommend: true,
    erepCountDetractorsWithoutResponse: true,

    erepCountReviewsGoogle: true,
    erepSumRatingGoogle: true,
    erepCountHasRatingGoogle: true,
    erepCountPromotersGoogle: true,
    erepCountDetractorsGoogle: true,
    erepCountDetractorsWithoutResponseGoogle: true,

    erepCountReviewsFacebook: true,
    erepCountHasRecommendationFacebook: true,
    erepCountRecommendFacebook: true,
    erepCountPromotersFacebook: true,
    erepCountDetractorsFacebook: true,
    erepCountDetractorsWithoutResponseFacebook: true,

    erepCountReviewsPagesJaunes: true,
    erepSumRatingPagesJaunes: true,
    erepCountHasRatingPagesJaunes: true,
    erepCountPromotersPagesJaunes: true,
    erepCountDetractorsPagesJaunes: true,
    erepCountDetractorsWithoutResponsePagesJaunes: true,
  };

  return app.models.Data.getMongoConnector()
    .aggregate([{ $match }, { $project }, { $group }, { $project: $finalProject }])
    .toArray();
};
