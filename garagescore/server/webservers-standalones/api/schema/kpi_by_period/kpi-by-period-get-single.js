const { AuthenticationError, ForbiddenError, UserInputError, gql } = require('apollo-server-express');
const UserAuthorization = require('../../../../../common/models/user-autorization');
const { match } = require('../../_common/kpi-by-period');
const { DataTypes, KpiTypes, GarageTypes } = require('../../../../../frontend/utils/enumV2');
const KpiDictionary = require('../../../../../common/lib/garagescore/kpi/KpiDictionary');
const { log, JEAN } = require('../../../../../common/lib/util/log');

module.exports.typeDef = gql`
  extend type Query {
    kpiByPeriodGetSingle(
      cockpitType: String!
      garageIds: [String]
      periodId: String!
      type: String
      frontDesk: String
    ): kpiByPeriodGetSingleResponse
  }
  type kpiByPeriodGetSingleResponse {
    totalShouldSurfaceInCampaignStats: Int
    countEmails: Int
    countSurveys: Int
    countReceivedSurveys: Int
    countSurveysResponded: Int
    countSurveySatisfied: Int
    countSurveyUnsatisfied: Int
    countSurveyLead: Int
    countSurveyLeadVo: Int
    countSurveyLeadVn: Int
    countLeads: Int
    countLeadsApv: Int
    countLeadsVn: Int
    countLeadsVo: Int
    countLeadsUnknown: Int
    countValidEmails: Int
    countBlockedByEmail: Int
    countBlockedLastMonthEmail: Int
    countUnsubscribedByEmail: Int
    countWrongEmails: Int
    countNotPresentEmails: Int
    countValidPhones: Int
    countBlockedByPhone: Int
    countWrongPhones: Int
    countNotPresentPhones: Int
    countBlocked: Int
    countNotContactable: Int
    countSurveyRespondedAPV: Int
    countSurveyRespondedVN: Int
    countSurveyRespondedVO: Int
    countScheduledContacts: Int
  }
`;

const emptyResponse = {
  totalShouldSurfaceInCampaignStats: 0,
  countEmails: 0,
  countSurveys: 0,
  countReceivedSurveys: 0,
  countSurveysResponded: 0,
  countSurveySatisfied: 0,
  countSurveyUnsatisfied: 0,
  countSurveyLead: 0,
  countSurveyLeadVo: 0,
  countSurveyLeadVn: 0,
  countLeads: 0,
  countLeadsApv: 0,
  countLeadsVn: 0,
  countLeadsVo: 0,
  countLeadsUnknown: 0,
  countValidEmails: 0,
  countBlockedByEmail: 0,
  countBlockedLastMonthEmail: 0,
  countUnsubscribedByEmail: 0,
  countWrongEmails: 0,
  countNotPresentEmails: 0,
  countValidPhones: 0,
  countBlockedByPhone: 0,
  countWrongPhones: 0,
  countNotPresentPhones: 0,
  countBlocked: 0,
  countNotContactable: 0,
  countSurveyRespondedAPV: 0,
  countSurveyRespondedVN: 0,
  countSurveyRespondedVO: 0,
  countScheduledContacts: 0,
};

const sum = (field) => ({
  $sum: {
    $ifNull: [`$${KpiDictionary[field]}`, 0],
  },
});

const sumMultipleFields = (fields) => ({
  $sum: {
    $add: fields.map((field) => ({
      $ifNull: [`$${KpiDictionary[field]}`, 0],
    })),
  },
});

// Fields that does not need to be suffixed no mater the type (apv vn vo) that is sent to the request
const noSuffixFields = [
  'contactsCountSurveysRespondedApv',
  'contactsCountSurveysRespondedVn',
  'contactsCountSurveysRespondedVo',
  'countLeadsPotentialSales',
  'countLeadsPotentialSalesVo',
  'countLeadsPotentialSalesVn',
];

const generateTypeSuffix = (type) => {
  return (
    {
      [DataTypes.MAINTENANCE]: 'Apv',
      [DataTypes.NEW_VEHICLE_SALE]: 'Vn',
      [DataTypes.USED_VEHICLE_SALE]: 'Vo',
    }[type] || ''
  );
};

const generateMatch = (requestArgs, userAllowedGarageIds, isGod) => {
  const { cockpitType, garageIds, periodId, frontDesk } = requestArgs;
  const $match = match(KpiTypes.GARAGE_KPI, isGod, cockpitType, periodId, null, garageIds, userAllowedGarageIds);

  if (frontDesk) {
    $match[KpiDictionary.userId] = frontDesk;
    $match[KpiDictionary.kpiType] = KpiTypes.FRONT_DESK_USER_KPI;
  }

  return $match;
};

const generateProject = (typeSuffix = '') => {
  return [
    'contactsCountTotalShouldSurfaceInCampaignStats',
    'contactsCountValidEmails',
    'contactsCountSurveysResponded',
    'contactsCountReceivedSurveys',
    'satisfactionCountPromoters',
    'satisfactionCountDetractors',
    'satisfactionCountPassives',
    'countLeadsPotentialSales',
    'countLeadsPotentialSalesVo',
    'countLeadsPotentialSalesVn',
    'countLeads',
    'countLeadsApv',
    'countLeadsVn',
    'countLeadsVo',
    'countLeadsUnknown',
    'contactsCountValidEmails',
    'contactsCountBlockedByEmail',
    'contactsCountBlockedLastMonthEmail',
    'contactsCountUnsubscribedByEmail',
    'contactsCountWrongEmails',
    'contactsCountNotPresentEmails',
    'contactsCountValidPhones',
    'contactsCountBlockedByPhone',
    'contactsCountWrongPhones',
    'contactsCountNotPresentPhones',
    'contactsCountBlockedByPhone',
    'contactsCountBlockedByEmail',
    'contactsCountNotContactable',
    'contactsCountSurveysRespondedApv',
    'contactsCountSurveysRespondedVn',
    'contactsCountSurveysRespondedVo',
    'contactsCountScheduledContacts',
  ].reduce((project, field) => {
    const fieldToProject = `${field}${noSuffixFields.includes(field) ? '' : typeSuffix}`;
    if (KpiDictionary[fieldToProject] === null || KpiDictionary[fieldToProject] === undefined) {
      throw new Error(`Field ${fieldToProject} is not defined in KpiDictionary`);
    }
    return { ...project, [KpiDictionary[fieldToProject]]: true };
  }, {});
};

const generateGroup = (typeSuffix = '') => {
  return {
    _id: null,
    totalShouldSurfaceInCampaignStats: sum(`contactsCountTotalShouldSurfaceInCampaignStats${typeSuffix}`),
    countEmails: sum(`contactsCountValidEmails${typeSuffix}`),
    countSurveys: sumMultipleFields([
      `contactsCountReceivedSurveys${typeSuffix}`,
      `contactsCountScheduledContacts${typeSuffix}`,
    ]),
    countReceivedSurveys: sum(`contactsCountReceivedSurveys${typeSuffix}`),
    countSurveysResponded: sum(`contactsCountSurveysResponded${typeSuffix}`),
    countSurveySatisfied: sum(`satisfactionCountPromoters${typeSuffix}`),
    countSurveyUnsatisfied: sum(`satisfactionCountDetractors${typeSuffix}`),
    countSurveyLead: sum('countLeadsPotentialSales'),
    countSurveyLeadVo: sum('countLeadsPotentialSalesVo'),
    countSurveyLeadVn: sum('countLeadsPotentialSalesVn'),
    countLeads: sum('countLeads'),
    countLeadsApv: sum('countLeadsApv'),
    countLeadsVn: sum('countLeadsVn'),
    countLeadsVo: sum('countLeadsVo'),
    countLeadsUnknown: sum('countLeadsUnknown'),
    countValidEmails: sum(`contactsCountValidEmails${typeSuffix}`),
    countBlockedByEmail: sum(`contactsCountBlockedByEmail${typeSuffix}`),
    countBlockedLastMonthEmail: sum(`contactsCountBlockedLastMonthEmail${typeSuffix}`),
    countUnsubscribedByEmail: sum(`contactsCountUnsubscribedByEmail${typeSuffix}`),
    countWrongEmails: sum(`contactsCountWrongEmails${typeSuffix}`),
    countNotPresentEmails: sum(`contactsCountNotPresentEmails${typeSuffix}`),
    countValidPhones: sum(`contactsCountValidPhones${typeSuffix}`),
    countBlockedByPhone: sum(`contactsCountBlockedByPhone${typeSuffix}`),
    countWrongPhones: sum(`contactsCountWrongPhones${typeSuffix}`),
    countNotPresentPhones: sum(`contactsCountNotPresentPhones${typeSuffix}`),
    countBlocked: sumMultipleFields([
      `contactsCountBlockedByEmail${typeSuffix}`,
      `contactsCountBlockedByPhone${typeSuffix}`,
    ]),
    countNotContactable: sum(`contactsCountNotContactable${typeSuffix}`),
    countSurveyRespondedAPV: sum('contactsCountSurveysRespondedApv'),
    countSurveyRespondedVN: sum('contactsCountSurveysRespondedVn'),
    countSurveyRespondedVO: sum('contactsCountSurveysRespondedVo'),
    countScheduledContacts: sum(`contactsCountScheduledContacts${typeSuffix}`),
  };
};

const checkRequestArgs = (requestArgs) => {
  const allowedTypes = [DataTypes.MAINTENANCE, DataTypes.NEW_VEHICLE_SALE, DataTypes.USED_VEHICLE_SALE];
  if (requestArgs.type && !allowedTypes.includes(requestArgs.type)) {
    throw new UserInputError(`Type ${requestArgs.type} is not allowed`);
  }
  const allowedCockpitType = [GarageTypes.DEALERSHIP, GarageTypes.MOTORBIKE_DEALERSHIP, GarageTypes.VEHICLE_INSPECTION];
  if (requestArgs.cockpitType && !allowedCockpitType.includes(requestArgs.cockpitType)) {
    throw new UserInputError(`CockpitType ${requestArgs.cockpitType} is not allowed`);
  }
};

const executeMongoAggregation = async (mongoModel, requestArgs, userAllowedGarageIds, isGod) => {
  const mongo = mongoModel.getMongoConnector();

  const aggregationResult = await mongo
    .aggregate([
      { $match: generateMatch(requestArgs, userAllowedGarageIds, isGod) },
      { $project: generateProject(generateTypeSuffix(requestArgs.type)) },
      { $group: generateGroup(generateTypeSuffix(requestArgs.type)) },
    ])
    .toArray();

  return aggregationResult && aggregationResult.length ? aggregationResult[0] : emptyResponse;
};

module.exports.resolvers = {
  Query: {
    kpiByPeriodGetSingle: async (obj, args, context) => {
      try {
        const {
          app,
          scope: { logged, authenticationError, user, godMode },
        } = context;

        checkRequestArgs(args);

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        } else if (!user.hasAuthorization(UserAuthorization.ACCESS_TO_COCKPIT)) {
          throw new ForbiddenError('Not authorized');
        }

        return executeMongoAggregation(app.models.KpiByPeriod, args, user.garageIds, godMode);
      } catch (error) {
        log.error(JEAN, error);
        return error;
      }
    },
  },
};
