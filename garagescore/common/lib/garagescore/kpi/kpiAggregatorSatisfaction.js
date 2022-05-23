const KpiTypes = require('../../../../common/models/kpi-type.js');
const {
  projectFields,
  projectMiddleMansAndCategoriesFields,
  finalProjectFields,
  groupFields,
  getSumRatingsFields,
} = require('./kpiAggregatorHelper');
const KpiPeriods = require('./KpiPeriods');
const { ServiceMiddleMans, ServiceCategories } = require('../../../../frontend/utils/enumV2');
const { addMatchOnGarageId } = require('./kpiAggregatorHelper');

const fields = [
  'satisfactionCountSurveys',
  'satisfactionCountReviews',
  'satisfactionCountPromoters',
  'satisfactionCountDetractors',
  'satisfactionCountPassives',
  'satisfactionSumRating',
  ...ServiceMiddleMans.keys().map((key) => ServiceMiddleMans.getProperty(key, 'kpiByPeriodKey')),
  ...ServiceCategories.keys().map((key) => ServiceCategories.getProperty(key, 'kpiByPeriodKey')),
];

module.exports = async function aggregateKpis(app, { period, kpiType = KpiTypes.GARAGE_KPI, garageIds = [] } = {}) {
  const timezonedPeriod = KpiPeriods.convertToTimezonePeriod(period);

  const hasBeenContacted = {
    $or: [
      {
        $eq: ['$campaign.contactStatus.hasBeenContactedByPhone', true],
      },
      {
        $eq: ['$campaign.contactStatus.hasBeenContactedByEmail', true],
      },
    ],
  };
  const hasResponded = {
    $and: [{ $gt: ['$survey.firstRespondedAt', new Date(0)] }, { $gte: ['$review.rating.value', 0] }],
  };
  const isPromoter = { $and: [hasResponded, { $gte: ['$review.rating.value', 9] }] };
  const isDetractor = { $and: [hasResponded, { $lte: ['$review.rating.value', 6] }] };
  const isPassive = {
    $and: [hasResponded, { $and: [{ $lte: ['$review.rating.value', 8] }, { $gte: ['$review.rating.value', 7] }] }],
  };

  const serviceMiddleManCondition = (serviceMiddleMan) => ({
    $in: [serviceMiddleMan, { $ifNull: ['$service.middleMans', []] }],
  });

  const serviceCategoryCondition = (serviceCategory) => ({
    $in: [serviceCategory, { $ifNull: ['$service.categories', []] }],
  });

  const $match = {
    ...addMatchOnGarageId(garageIds, 'string'),
    'service.providedAt': { $gte: timezonedPeriod.min, $lte: timezonedPeriod.max },
    shouldSurfaceInStatistics: true,
  };

  const $project = {
    garageId: 1,
    ...projectFields('satisfactionCountSurveys', hasBeenContacted),
    ...projectFields('satisfactionCountReviews', hasResponded),
    ...projectFields('satisfactionCountPromoters', isPromoter),
    ...projectFields('satisfactionCountDetractors', isDetractor),
    ...projectFields('satisfactionCountPassives', isPassive),
    ...getSumRatingsFields('satisfactionSumRating', hasResponded),
    ...(kpiType === KpiTypes.GARAGE_KPI && {
      ...projectMiddleMansAndCategoriesFields(ServiceMiddleMans, serviceMiddleManCondition),
      ...projectMiddleMansAndCategoriesFields(ServiceCategories, serviceCategoryCondition),
    }),
    ...(kpiType === KpiTypes.FRONT_DESK_USER_KPI && { userId: '$service.frontDeskUserName' }),
  };

  const $group = {
    _id:
      kpiType === KpiTypes.FRONT_DESK_USER_KPI
        ? {
            garageId: '$garageId',
            userId: { $toString: '$userId' },
          }
        : '$garageId',
    ...groupFields(fields),
  };

  const $finalProject = {
    periodId: { $literal: timezonedPeriod },
    ...finalProjectFields(fields),
  };

  return app.models.Data.getMongoConnector()
    .aggregate([{ $match }, { $project }, { $group }, { $project: $finalProject }], {
      allowDiskUse: kpiType === KpiTypes.FRONT_DESK_USER_KPI,
    })
    .toArray();
};
