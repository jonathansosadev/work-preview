const { reportGetData } = require('../../../../frontend/api/graphql/definitions/queries.json');
const { MOMO, log } = require('../../../../common/lib/util/log');
const { ObjectId } = require('mongodb');
const KpiDailyPeriods = require('../../../../frontend/utils/models/kpi-daily-periods');
const { remove: removeDiacritics } = require('diacritics');
const { groupBy, sortBy } = require('lodash');
const GarageSubscriptionTypes = require('../../../../common/models/garage.subscription.type');
const GarageHistoryPeriod = require('../../../../common/models/garage-history.period');
const commonTicket = require('../../../../common/models/data/_common-ticket');
const GarageTypes = require('../../../../common/models/garage.type');
const UnsatisfiedFollowupStatus = require('../../../../common/models/data/type/unsatisfied-followup-status');
const KpiDictionary = require('../../../../common/lib/garagescore/kpi/KpiDictionary');

const typePrefix = 'reportGetData';
module.exports.typeDef = `
  extend type Query {
    ${reportGetData.type}: ${typePrefix}Result
  }

  type ${typePrefix}Result {
    status: String
    message: String
    data: [${typePrefix}DataByGarage]
  }

  type ${typePrefix}DataByGarage {
    garageId: String
    garagePublicDisplayName: String
    garagePublicSearchName: String
    garageType: String
    garageRatingType: String
    garagePublicSubscriptions: ${typePrefix}garagePublicSubscription
    countSurveyLead: Int
    countSurveyUnsatisfied: Int
    countSurveysResponded: Int
    countSurveysRespondedAPV: Int
    countSurveysRespondedVN: Int
    countSurveysRespondedVO: Int
    countSurveyPromotor: Int
    countSurveyDetractor: Int
    countSurveySatisfied: Int
    score: Float
    scoreAPV: Float
    scoreVN: Float
    scoreVO: Float
    scoreNPS: Float
    surveysLead: [${typePrefix}SurveyLead]
    surveysUnsatisfied: [${typePrefix}SurveyUnsatisfied]
    surveysUnsatisfiedFollowup: [${typePrefix}SurveyUnsatisfiedFollowup]
    surveysSatisfied: [${typePrefix}SurveySatisfied]
  }

  type ${typePrefix}garagePublicSubscription {
    subscribed: [String]
    notSubscribed: [String]
  }

  type ${typePrefix}SurveyLead {
    garageId: String
    dataId: String
    completedAt: Date
    customerFullName: String
    customerEmail: String
    customerPhone: String
    surveyUpdatedAt: Date
    vehiculeRegistrationPlate: String
    vehiculeRegistrationDate: Date
    vehiculeModel: String
    vehiculeMake: String
    leadTiming: String
    leadType: String
    leadSaleType: String
    leadKnowVehicle: Boolean
    leadVehicle: String 
    leadTradeIn: String
    leadBrands: String
    leadEnergyType: [String]
    leadBodyType: [String]
    leadFinancing: String
  }

  type ${typePrefix}SurveyUnsatisfied {
    garageId: String
    dataId: String
    completedAt: Date
    customerFullName: String
    customerCity: String
    surveyUpdatedAt: Date
    surveyScore: Float
    type: String
    surveyComment: String
    vehicleMakePublicDisplayName: String
    vehicleModelPublicDisplayName: String
    publicReviewStatus: String
    publicReviewCommentStatus: String
  }

  type ${typePrefix}SurveyUnsatisfiedFollowup {
    garageId: String
    dataId: String
    completedAt: Date
    customerFullName: String
    garageProvidedFrontDeskUserName: String
    type: String
    surveyUpdatedAt: Date
    followupSurveyUpdatedAt: Date
    unsatisfactionIsRecontacted: Boolean
    unsatisfactionIsResolved: Boolean
    unsatisfactionIsResolutionInProgress: Boolean
    unsatisfiedIsEvaluationChanged: Boolean
    followupUnsatisfiedComment: String
  }

  type ${typePrefix}SurveySatisfied {
    completedAt: Date
    customerFullName: String
    customerCity: String
    surveyUpdatedAt: Date
    surveyScore: Int
    type: String
    surveyComment: String
    vehicleMakePublicDisplayName: String
    vehicleModelPublicDisplayName: String
    transactionPublicDisplayName: String
    publicReviewStatus: String
    publicReviewCommentStatus: String
  }
`;

/*
  The report is public, so no need to check if the user is logged in.
*/

const ERROR_MESSAGES = {
  REPORT_NOT_FOUND: 'reportNotFound',
  NO_GARAGES: 'noConfiguredGarage',
  FALLBACK_ERROR: 'fallbackError',
};

module.exports.resolvers = {
  Query: {
    [typePrefix]: async (obj, args, context) => {
      try {
        const { app } = context;
        const { reportId } = args;

        if (!reportId || !ObjectId.isValid(reportId)) {
          throw new Error(ERROR_MESSAGES.REPORT_NOT_FOUND);
        }

        const report = await app.models.Report.getMongoConnector().findOne({
          _id: new ObjectId(reportId),
          reportConfigId: {
            $in: ['daily', 'weekly', 'monthly'],
          },
        });
        if (!report) {
          throw new Error(ERROR_MESSAGES.REPORT_NOT_FOUND);
        }

        const user = await app.models.User.getMongoConnector().findOne({ _id: new ObjectId(report.userId) });

        if (!user || !user.garageIds || !user.garageIds.length) {
          throw new Error(ERROR_MESSAGES.NO_GARAGES);
        }

        const statsByGarages = await app.models.KpiByDailyPeriod.getMongoConnector()
          .aggregate([{ $match: buildMatch(user, report) }, { $group: buildGroup() }, { $project: buildProject() }])
          .toArray();

        // retrieve garages infos
        const garages = await app.models.Garage.getMongoConnector()
          .find({ _id: { $in: user.garageIds } })
          .project({
            type: true,
            ratingType: true,
            publicDisplayName: true,
            subscriptions: true,
          })
          .toArray();

        if (!garages.length) {
          throw new Error(ERROR_MESSAGES.NO_GARAGES);
        }

        const garagesById = groupBy(garages, '_id');

        // in order to always display a garage, even if there is no data associated
        const statsByGaragesGrouped = groupBy(statsByGarages, '_id');
        // we add all the garage stats with a value of 0
        const $project = buildProject();
        for (const garageId in garagesById) {
          if (garageId in statsByGaragesGrouped) {
            continue;
          }
          const emptyGarageResult = Object.keys($project).reduce((acc, key) => {
            acc[key] = key === '_id' ? garageId : 0;
            return acc;
          }, {});

          statsByGarages.push(emptyGarageResult);
        }

        // fetch the details for the report
        const [surveysLead, surveysUnsatisfied, surveysUnsatisfiedFollowup, surveysSatisfied] = await Promise.all([
          getGaragesLeadsDetails(app, {
            garageIds: user.garageIds,
            reportPeriodId: report.period,
          }),
          getGaragesUnsatisfiedDetails(app, {
            garageIds: user.garageIds,
            reportPeriodId: report.period,
          }),
          getGaragesUnsatisfiedFollowupDetails(app, {
            garageIds: user.garageIds,
            reportPeriodId: report.period,
          }),
          getGaragesSatisfiedDetails(app, {
            garageIds: user.garageIds,
            reportPeriodId: report.period,
          }),
        ]);

        const result = statsByGarages.map((stat) => {
          const garage = garagesById[stat._id][0];
          return {
            ...stat,
            garageId: stat._id,
            garagePublicDisplayName: garage.publicDisplayName,
            garagePublicSearchName: removeDiacritics(garage.publicDisplayName),
            garageType: garage.type,
            garageRatingType: garage.ratingType,
            garagePublicSubscriptions:
              /* subscriptionsByGarage is a new field added to the report document, old ones doesn't have it*/
              'subscriptionsByGarage' in report
                ? formatGarageSubscriptions({
                    subscriptions: report.subscriptionsByGarage[stat._id],
                    type: garage.type,
                  })
                : formatGarageSubscriptions(garage),
            surveysLead: surveysLead[stat._id] || [],
            surveysUnsatisfied: surveysUnsatisfied[stat._id] || [],
            surveysUnsatisfiedFollowup: surveysUnsatisfiedFollowup[stat._id] || [],
            surveysSatisfied: surveysSatisfied[stat._id] || [],
          };
        });

        return { status: 'success', message: '', data: sortBy(result, 'garagePublicSearchName') };
      } catch (error) {
        log.error(MOMO, error);
        const errorMessage = Object.values(ERROR_MESSAGES).includes(error.message)
          ? error.message
          : ERROR_MESSAGES.FALLBACK_ERROR;
        return { status: 'error', message: errorMessage, data: [] };
      }
    },
  },
};

function formatGarageSubscriptions({ subscriptions = {}, type = '' } = {}) {
  const reportAvailableSubscriptions = [
    GarageSubscriptionTypes.MAINTENANCE,
    GarageSubscriptionTypes.LEAD,
    GarageSubscriptionTypes.NEW_VEHICLE_SALE,
    GarageSubscriptionTypes.USED_VEHICLE_SALE,
    GarageSubscriptionTypes.E_REPUTATION,
    ...(type === GarageTypes.VEHICLE_INSPECTION ? [GarageSubscriptionTypes.VEHICLE_INSPECTION] : []),
  ];

  return reportAvailableSubscriptions.reduce(
    (acc, subscriptionType) => {
      if (subscriptions[subscriptionType] && subscriptions[subscriptionType].enabled) {
        acc.subscribed.push(subscriptionType);
      } else {
        acc.notSubscribed.push(subscriptionType);
      }
      return acc;
    },
    {
      subscribed: [],
      notSubscribed: [],
    }
  );
}

function buildMatch(user, report) {
  const computedPeriod = KpiDailyPeriods.getMinMaxFromReportPeriodToken(report.period, report.reportConfigId);

  if (!computedPeriod) {
    throw new Error(`Invalid Period ${report.period}`);
  }

  const { min, max } = computedPeriod;
  const $match = {
    [KpiDictionary.garageId]: {
      $in: user.garageIds.map(ObjectId),
    },
    [KpiDictionary.kpiType]: 10,
    [KpiDictionary.period]: min === max ? min : { $gte: min, $lte: max },
  };

  return $match;
}

function buildGroup() {
  const $group = {
    _id: '$0',
    countSurveysResponded: {
      $sum: `$${KpiDictionary.contactsCountSurveysResponded}`,
    },
    countSurveysRespondedAPV: {
      $sum: `$${KpiDictionary.contactsCountSurveysRespondedApv}`,
    },
    countSurveysRespondedVN: {
      $sum: `$${KpiDictionary.contactsCountSurveysRespondedVn}`,
    },
    countSurveysRespondedVO: {
      $sum: `$${KpiDictionary.contactsCountSurveysRespondedVo}`,
    },
    satisfactionCountReviews: {
      $sum: `$${KpiDictionary.satisfactionCountReviews}`,
    },
    satisfactionCountReviewsAPV: {
      $sum: `$${KpiDictionary.satisfactionCountReviewsApv}`,
    },
    satisfactionCountReviewsVN: {
      $sum: `$${KpiDictionary.satisfactionCountReviewsVn}`,
    },
    satisfactionCountReviewsVO: {
      $sum: `$${KpiDictionary.satisfactionCountReviewsVo}`,
    },
    satisfactionCountPromoters: {
      $sum: `$${KpiDictionary.satisfactionCountPromoters}`,
    },
    satisfactionCountDetractors: {
      $sum: `$${KpiDictionary.satisfactionCountDetractors}`,
    },
    satisfactionCountPassives: {
      $sum: `$${KpiDictionary.satisfactionCountPassives}`,
    },
    satisfactionSumRating: {
      $sum: `$${KpiDictionary.satisfactionSumRating}`,
    },
    satisfactionSumRatingAPV: {
      $sum: `$${KpiDictionary.satisfactionSumRatingApv}`,
    },
    satisfactionSumRatingVN: {
      $sum: `$${KpiDictionary.satisfactionSumRatingVn}`,
    },
    satisfactionSumRatingVO: {
      $sum: `$${KpiDictionary.satisfactionSumRatingVo}`,
    },
    countLeads: {
      $sum: `$${KpiDictionary.countLeads}`,
    },
    countUnsatisfied: {
      $sum: `$${KpiDictionary.countUnsatisfied}`,
    },
  };

  return $group;
}

function buildProject() {
  const $safeDivide = (num, den) => ({ $cond: [{ $gt: [den, 0] }, { $divide: [num, den] }, null] });

  const $project = {
    _id: 1,
    countSurveyLead: '$countLeads',
    countSurveyUnsatisfied: '$countUnsatisfied',
    countSurveysResponded: 1,
    countSurveysRespondedAPV: 1,
    countSurveysRespondedVN: 1,
    countSurveysRespondedVO: 1,
    countSurveyPromotor: '$satisfactionCountPromoters',
    countSurveyDetractor: '$satisfactionCountDetractors',
    countSurveySatisfied: { $sum: ['$satisfactionCountPromoters', '$satisfactionCountPassives'] },
    score: $safeDivide('$satisfactionSumRating', '$satisfactionCountReviews'),
    scoreAPV: $safeDivide('$satisfactionSumRatingAPV', '$satisfactionCountReviewsAPV'),
    scoreVN: $safeDivide('$satisfactionSumRatingVN', '$satisfactionCountReviewsVN'),
    scoreVO: $safeDivide('$satisfactionSumRatingVO', '$satisfactionCountReviewsVO'),
    scoreNPS: {
      $multiply: [
        $safeDivide(
          { $subtract: ['$satisfactionCountPromoters', '$satisfactionCountDetractors'] },
          '$satisfactionCountReviews'
        ),
        100,
      ],
    },
  };

  return $project;
}

async function getGaragesLeadsDetails(app, { garageIds = [], reportPeriodId = '' }) {
  const aggregate = [
    {
      $match: {
        garageId: {
          $in: garageIds.map((g) => g.toString()),
        },
        type: {
          $ne: 'ManualLead',
        },
        'leadTicket.createdAt': {
          $gt: GarageHistoryPeriod.getPeriodMinDate(reportPeriodId),
          $lte: GarageHistoryPeriod.getPeriodMaxDate(reportPeriodId),
        },
      },
    },
    {
      $project: {
        _id: false,
        garageId: '$garageId',
        dataId: {
          $toString: '$_id',
        },
        completedAt: '$service.providedAt',
        customerFullName: '$customer.fullName.value',
        customerEmail: '$customer.contact.email.value',
        customerPhone: '$customer.contact.mobilePhone.value',
        surveyUpdatedAt: '$survey.firstRespondedAt',
        vehiculeRegistrationPlate: '$vehicle.plate.value',
        vehiculeRegistrationDate: '$vehicle.registrationDate.value',
        vehiculeModel: '$vehicle.model.value',
        vehiculeMake: '$vehicle.make.value',
        leadTiming: '$lead.timing',
        leadType: '$lead.type',
        leadSaleType: '$lead.saleType',
        leadKnowVehicle: '$lead.knowVehicle',
        leadVehicle: '$lead.vehicle',
        leadVehicleModel: '$lead.vehicleModel',
        leadTradeIn: '$lead.tradeIn',
        leadBrands: '$lead.brands',
        leadEnergyType: '$lead.energyType',
        leadBodyType: '$lead.bodyType',
        leadFinancing: '$lead.financing',
      },
    },
    {
      $group: {
        _id: '$garageId',
        surveysLead: {
          $push: '$$ROOT',
        },
      },
    },
  ];

  const res = await app.models.Data.getMongoConnector().aggregate(aggregate).toArray();

  return res.reduce((acc, { _id = '', surveysLead = [] }) => {
    acc[_id.toString()] = surveysLead.map((lead) => ({
      ...lead,
      leadBrands: Array.isArray(lead.leadBrands) ? commonTicket.formatBrandModel(lead.leadBrands, false) : 'undefined',
      leadBodyType: Array.isArray(lead.leadBodyType) ? lead.leadBodyType : [lead.leadBodyType],
      leadEnergyType: Array.isArray(lead.leadEnergyType) ? lead.leadEnergyType : [lead.leadEnergyType],
    }));

    return acc;
  }, {});
}

async function getGaragesUnsatisfiedDetails(app, { garageIds = [], reportPeriodId = '' }) {
  const aggregate = [
    {
      $match: {
        garageId: {
          $in: garageIds.map((g) => g.toString()),
        },
        type: {
          $ne: 'ManualUnsatisfied',
        },
        'unsatisfiedTicket.createdAt': {
          $gt: GarageHistoryPeriod.getPeriodMinDate(reportPeriodId),
          $lte: GarageHistoryPeriod.getPeriodMaxDate(reportPeriodId),
        },
      },
    },
    {
      $project: {
        _id: false,
        garageId: '$garageId',
        dataId: {
          $toString: '$_id',
        },
        completedAt: '$service.providedAt',
        customerFullName: '$customer.fullName.value',
        customerCity: '$customer.city.value',
        surveyUpdatedAt: '$survey.firstRespondedAt',
        surveyScore: '$review.rating.value',
        type: '$survey.type',
        surveyComment: '$review.comment.text',
        vehicleMakePublicDisplayName: '$vehicle.make.value',
        vehicleModelPublicDisplayName: '$vehicle.model.value',
        publicReviewStatus: '$review.comment.status',
        publicReviewCommentStatus: '$review.rightOfReply.status',
      },
    },
    {
      $group: {
        _id: '$garageId',
        surveysUnsatisfied: {
          $push: '$$ROOT',
        },
      },
    },
  ];

  const res = await app.models.Data.getMongoConnector().aggregate(aggregate).toArray();

  return res.reduce((acc, { _id = '', surveysUnsatisfied = [] }) => {
    acc[_id.toString()] = surveysUnsatisfied;

    return acc;
  }, {});
}

async function getGaragesUnsatisfiedFollowupDetails(app, { garageIds = [], reportPeriodId = '' }) {
  const aggregate = [
    {
      $match: {
        garageId: {
          $in: garageIds.map((g) => g.toString()),
        },
        type: {
          $ne: 'ManualUnsatisfied',
        },
        'unsatisfiedTicket.createdAt': {
          $gt: GarageHistoryPeriod.getPeriodMinDate(reportPeriodId),
          $lte: GarageHistoryPeriod.getPeriodMaxDate(reportPeriodId),
        },
        'surveyFollowupUnsatisfied.firstRespondedAt': { $ne: null },
        'unsatisfied.isRecontacted': { $in: [false, null] },
        'unsatisfied.isResolved': { $in: [false, null] },
      },
    },
    {
      $project: {
        _id: false,
        garageId: '$garageId',
        dataId: {
          $toString: '$_id',
        },
        completedAt: '$service.providedAt',
        customerFullName: '$customer.fullName.value',
        garageProvidedFrontDeskUserName: '$service.frontDeskUserName',
        type: '$survey.type',
        surveyUpdatedAt: '$survey.firstRespondedAt',
        followupSurveyUpdatedAt: '$surveyFollowupUnsatisfied.firstRespondedAt',
        unsatisfactionIsRecontacted: '$unsatisfied.isRecontacted',
        unsatisfactionIsResolved: { $eq: ['$unsatisfied.followupStatus', UnsatisfiedFollowupStatus.RESOLVED] },
        unsatisfactionIsResolutionInProgress: {
          $eq: ['$unsatisfied.followupStatus', UnsatisfiedFollowupStatus.IN_PROGRESS],
        },
        unsatisfiedIsEvaluationChanged: { $gte: ['$review.followupUnsatisfiedRating', 0] },
        followupUnsatisfiedComment: '$review.followupUnsatisfiedComment.text',
      },
    },
    {
      $group: {
        _id: '$garageId',
        surveysUnsatisfiedFollowup: {
          $push: '$$ROOT',
        },
      },
    },
  ];

  const res = await app.models.Data.getMongoConnector().aggregate(aggregate).toArray();

  return res.reduce((acc, { _id = '', surveysUnsatisfiedFollowup = [] }) => {
    acc[_id.toString()] = surveysUnsatisfiedFollowup;

    return acc;
  }, {});
}

// for VI (satisfied !== promotor) => promotors + passives
async function getGaragesSatisfiedDetails(app, { garageIds = [], reportPeriodId = '' }) {
  const aggregate = [
    {
      $match: {
        garageId: {
          $in: garageIds.map((g) => g.toString()),
        },
        'review.rating.value': { $gt: 6 },
        'service.providedAt': {
          $gt: GarageHistoryPeriod.getPeriodMinDate(reportPeriodId),
          $lt: GarageHistoryPeriod.getPeriodMaxDate(reportPeriodId),
        },
      },
    },
    {
      $project: {
        _id: false,
        garageId: '$garageId',
        dataId: {
          $toString: '$_id',
        },
        completedAt: '$service.providedAt',
        customerFullName: '$customer.fullName.value',
        customerCity: '$customer.city.value',
        surveyUpdatedAt: '$survey.firstRespondedAt',
        surveyScore: '$review.rating.value',
        type: '$type',
        surveyComment: '$review.comment.text',
        vehicleMakePublicDisplayName: '$vehicle.make.value',
        vehicleModelPublicDisplayName: '$vehicle.model.value',
        transactionPublicDisplayName: '$service.transactions',
        publicReviewStatus: '$review.comment.status',
        publicReviewCommentStatus: '$review.rightOfReply.status',
      },
    },
    {
      $group: {
        _id: '$garageId',
        surveysSatisfied: {
          $push: '$$ROOT',
        },
      },
    },
  ];

  const res = await app.models.Data.getMongoConnector().aggregate(aggregate).toArray();

  return res.reduce((acc, { _id = '', surveysSatisfied = [] }) => {
    acc[_id.toString()] = surveysSatisfied;

    return acc;
  }, {});
}
