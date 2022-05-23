const { AuthenticationError, ForbiddenError, gql } = require('apollo-server-express');

const { log, JON } = require('../../../../../common/lib/util/log');
const {
  GarageTypes: { DEALERSHIP, AGENT, CAR_REPAIRER, CAR_RENTAL, UTILITY_CAR_DEALERSHIP, CARAVANNING, OTHER },
  UserAuthorization: { ACCESS_TO_COCKPIT },
  DataTypes,
  KpiTypes,
} = require('../../../../../frontend/utils/enumV2');
const KpiDictionary = require('../../../../../common/lib/garagescore/kpi/KpiDictionary');
const KpiPeriod = require('../../../../../common/lib/garagescore/kpi/KpiPeriods');

//// HELPERS

// Mongo $IfNull
function mIfNull(array) {
  return {
    $ifNull: array,
  };
}

// Mongo $Add
function mAdd(array) {
  const finalArray = array.map((x) => {
    return mIfNull([x, 0]);
  });
  return {
    $add: finalArray,
  };
}

// Mongo $Cond
function mCond(cond, thenCond, elseCond) {
  return {
    $cond: [cond, thenCond, elseCond],
  };
}

// Mongo $divide
function mDivide(first, second) {
  return {
    $cond: [{ $or: [{ $eq: [first, 0] }, { $eq: [second, 0] }] }, 0, { $divide: [first, second] }],
  };
}

// Mongo $multiply
function mMultiply(array) {
  return { $multiply: array };
}

// Mongo $subtract
function mSubtract(first, second) {
  return { $subtract: [first, second] };
}

// Mongo $Sum
const mSum = (field) => ({
  $sum: {
    $ifNull: [field, 0],
  },
});

// Mongo $toObjectId
function mToObjectId(value) {
  return {
    $toObjectId: value,
  };
}

function isEmpty(strValue) {
  return !strValue || strValue.trim() === '' || strValue.trim().length === 0;
}

function equalsObjectIds(first, second) {
  return first.toString() === second.toString();
}

const suffixes = {
  [DataTypes.MAINTENANCE]: 'Apv',
  [DataTypes.NEW_VEHICLE_SALE]: 'Vn',
  [DataTypes.USED_VEHICLE_SALE]: 'Vo',
};

// ( Collection garages )
// INDEX _id && type
async function getGaragesIdsByType(garagesCollection, garagesIds, types) {
  const filters = {
    _id: { $in: garagesIds },
    type: { $in: types },
  };
  const res = await garagesCollection.find(filters, { projection: { _id: 1 } }).toArray();
  return res.map((x) => x._id);
}

// ( Collection garages )
// INDEX publicDisplayName && externalId && type && _id
async function getGaragesIdsByName(garagesCollection, text, types, userGarageIds, requestGarageIds) {
  const filteredPotentialGaragesIds = requestGarageIds ? userGarageIds.filter((potentialGarageId) =>
    requestGarageIds.some((document) => equalsObjectIds(document, potentialGarageId))
  ) : null;

  const filters = {
    $or: [{ publicDisplayName: { $regex: text, $options: 'i' } }, { externalId: { $regex: text, $options: 'i' } }],
    ...(requestGarageIds && { _id: { $in: filteredPotentialGaragesIds } }),
    ...(userGarageIds && !requestGarageIds && { _id: { $in: userGarageIds } }),
    ...(types && types.length > 0 && { type: { $in: types } }),
  };
  const res = await garagesCollection.find(filters, { projection: { _id: 1 } }).toArray();
  return res.map((x) => x._id);
}

// ( Collection cockpitTopFilters )
// INDEX frontDeskUserName && type && garageType && garageId
async function getFrontDeskGaragesIdsByName(
  cockpitTopFiltersCollection,
  text,
  garageTypes,
  types,
  requestGarageIds,
  garageIds
) {
  const filters = {
    frontDeskUserName: { $regex: text, $options: 'i' },
    // ...(types && types.length > 0 && { type: { $in: types } }), MAYBE IN FUTUR TO PRECISE FOR COPCKITFILTER
    ...(garageTypes && garageTypes.length > 0 && { garageType: { $in: garageTypes } }),
    ...(requestGarageIds && { garageId: { $in: requestGarageIds } }),
    ...(!requestGarageIds &&
      garageIds && {
        garageId: {
          $in: garageIds.map((x) => x.toString()),
        },
      }),
  };
  const pipeline = [
    { $match: filters },
    {
      $group: {
        _id: {
          garageId: '$garageId',
          frontDesk: '$frontDeskUserName',
        },
      },
    },
    {
      $project: {
        _id: 0,
        garageId: mToObjectId('$_id.garageId'),
        frontDesk: '$_id.frontDesk',
      },
    },
  ];
  const res = await cockpitTopFiltersCollection.aggregate(pipeline).toArray();
  return {
    garageIds: [...new Set(res.map((x) => x.garageId))],
    frontDeskNames: [...new Set(res.map((x) => x.frontDesk))],
  };
}

// ( Collection garagesHistories )
// INDEX periodToken
// INDEX periodToken && garageId
// INDEX periodToken && frontDesk
// INDEX periodToken && frontDesk && garageId
async function generateFilters(garagesCollection, cockpitTopFiltersCollection, queryFields, sortParams) {
  const {
    frontDeskUserName,
    allUsers,
    periodId,
    requestGarageIds,
    userGarageIds,
    cockpitType,
    search,
    kpiType,
  } = queryFields;

  const { type } = sortParams;

  // If cockpitType was DealerShip other types than MOTORBIKE_DEALERSHIP, VEHICLE_INSPECTION
  let finalCockpitType = null;
  if (cockpitType) {
    finalCockpitType =
      cockpitType === DEALERSHIP
        ? [DEALERSHIP, AGENT, CAR_REPAIRER, CAR_RENTAL, UTILITY_CAR_DEALERSHIP, CARAVANNING, OTHER]
        : [cockpitType];
  }

  const similarityGarageIds = requestGarageIds && userGarageIds.filter((x) => requestGarageIds.includes(x.toString()));
  const garageIdField =
    similarityGarageIds && similarityGarageIds.length > 0
      ? {
          [KpiDictionary.garageId]: {
            $in: similarityGarageIds,
          },
        }
      : null;
  const existValueGarageId = requestGarageIds && similarityGarageIds;
  const unauthorizedGarageId = () => similarityGarageIds.length === requestGarageIds.length;
  if (existValueGarageId && !unauthorizedGarageId()) {
    throw new ForbiddenError('Not authorized garageId');
  }

  // search
  // const activeSearch = search && (!requestGarageIds || allUsers);
  const potentialGarageSearch = search && (requestGarageIds && requestGarageIds.length > 1 || !requestGarageIds);
  const potentialFrontDeskSearch = search && allUsers;
  const activeSearch = potentialGarageSearch || potentialFrontDeskSearch;
  const valuesPotentialFrontDeskSearch = potentialFrontDeskSearch
    ? await getFrontDeskGaragesIdsByName(
        cockpitTopFiltersCollection,
        search,
        finalCockpitType,
        type && [type],
        requestGarageIds,
        userGarageIds && userGarageIds
      )
    : { garageIds: [], frontDeskNames: [] };

  const valuesPotentialGaragesIdsByName = potentialGarageSearch
    ? await getGaragesIdsByName(garagesCollection, search, finalCockpitType, userGarageIds, requestGarageIds)
    : [];
  const allPotentialGarageIds = [...valuesPotentialGaragesIdsByName, ...valuesPotentialFrontDeskSearch.garageIds];
  const filteredPotentialGaragesIds = allPotentialGarageIds.filter((potentialGarageId) =>
    userGarageIds.some((document) => equalsObjectIds(document, potentialGarageId))
  );
  const finalFilteredPotentialGaragesIds = {
    [KpiDictionary.garageId]: {
      $in: filteredPotentialGaragesIds,
    },
  };

  // kpiType
  const findKpiType = kpiType && Object.values(KpiTypes).includes(kpiType) ? kpiType : KpiTypes.GARAGE_KPI;
  const kpiTypeIsGarageKpi = findKpiType === KpiTypes.GARAGE_KPI;
  const finalKpiType = { [KpiDictionary.kpiType]: findKpiType };

  // frontDesk
  const frontDeskField = frontDeskUserName &&
    !kpiTypeIsGarageKpi &&
    frontDeskUserName !== 'ALL_USERS' && { [KpiDictionary.userId]: frontDeskUserName };
  const frontDeskFieldAllUsers = !frontDeskField &&
    !kpiTypeIsGarageKpi && {
      [KpiDictionary.userId]: allUsers ? { $ne: 'ALL_USERS' } : 'ALL_USERS',
    };
  const finalFrontDeskField =
    activeSearch && allUsers
      ? potentialFrontDeskSearch && userGarageIds
        ? { [KpiDictionary.userId]: { $in: valuesPotentialFrontDeskSearch.frontDeskNames } }
        : null
      : frontDeskField || frontDeskFieldAllUsers;

  // periodToken
  const KpiPeriodToken = KpiPeriod.fromGhPeriodToKpiPeriod(periodId, { convertToMonthlyList: true });
  const periodTokenField = periodId && {
    [KpiDictionary.period]: Array.isArray(KpiPeriodToken) ? { $in: KpiPeriodToken } : KpiPeriodToken,
  };

  // garageIds
  const getGaragesIdsFinal = () => {
    return getGaragesIdsByType(garagesCollection, userGarageIds, finalCockpitType);
  };
  const garageIdsField = !activeSearch && !garageIdField && userGarageIds;
  const garageIdsWithType = garageIdsField && finalCockpitType;
  const garageIdsWithTypeGenerated = garageIdsWithType && (await getGaragesIdsFinal());
  const finalGarageIdsField = garageIdsField && {
    [KpiDictionary.garageId]: {
      $in: finalCockpitType ? garageIdsWithTypeGenerated : userGarageIds,
    },
  };

  // Special Case satisfaction/team Need Filter on Garage Or FrontDeskNames
  if (activeSearch && !finalFrontDeskField && !requestGarageIds) {
    const defaultFilters = {
      ...periodTokenField,
      ...finalKpiType,
    };

    return {
      $or: [
        {
          ...{ [KpiDictionary.garageId]: { $in: valuesPotentialGaragesIdsByName } },
          ...defaultFilters,
        },
        {
          ...{ [KpiDictionary.userId]: { $in: valuesPotentialFrontDeskSearch.frontDeskNames } },
          ...{ [KpiDictionary.garageId]: { $in: valuesPotentialFrontDeskSearch.garageIds } },
          ...defaultFilters,
        },
      ],
    };
  }

  return {
    ...finalKpiType,
    ...(!kpiTypeIsGarageKpi && finalFrontDeskField),
    ...periodTokenField,
    ...(garageIdField || finalGarageIdsField),
    ...(activeSearch && finalFilteredPotentialGaragesIds),
  };
}

function generateSortField(sortParams) {
  const { kpiOrderBy, kpiOrder } = sortParams;
  const sortDict = {};
  const sortField = `${kpiOrderBy}`;
  sortDict[sortField] = kpiOrder === 'ASC' ? 1 : -1;
  sortDict['garageId'] = 1;
  sortDict['frontDesk'] = 1;
  return sortDict;
}

function generateProjection(sortParams) {
  const { type } = sortParams;

  const suffix = suffixes[type] || '';

  // rootOrSubType : read in subObject of collection
  function rOrST(element, activeSuffix = true) {
    const pathElement = `${element}${activeSuffix ? suffix : ''}`;
    return `$${KpiDictionary[pathElement]}`;
  }

  // final Projection
  return {
    id: '$_id',
    garageId: `$${KpiDictionary.garageId}`,
    frontDesk: `$${KpiDictionary.userId}`,

    // satisfaction
    scoreNPS: mCond(
      mIfNull([rOrST('satisfactionCountReviews'), false]),
      mMultiply([
        mDivide(
          mSubtract(rOrST('satisfactionCountPromoters'), rOrST('satisfactionCountDetractors')),
          rOrST('satisfactionCountReviews')
        ),
        100,
      ]),
      null
    ),
    scoreAPV: mDivide(rOrST('satisfactionSumRatingApv', false), rOrST('satisfactionCountReviewsApv', false)),
    scoreVN: mDivide(rOrST('satisfactionSumRatingVn', false), rOrST('satisfactionCountReviewsVn', false)),
    scoreVO: mDivide(rOrST('satisfactionSumRatingVo', false), rOrST('satisfactionCountReviewsVo', false)),
    countSurveyPromotor: rOrST('satisfactionCountPromoters'), // countSurveyPromotor: 1, // same value as countSurveySatisfied
    countSurveyDetractor: rOrST('satisfactionCountDetractors'), // countSurveyDetractor: 1, // same value as countSurveyUnsatisfied
    countSurveysResponded: rOrST('satisfactionCountReviews'),
    countSurveyRespondedAll: rOrST('satisfactionCountReviews'),

    // contacts
    countValidEmails: rOrST('contactsCountValidEmails'),
    countValidPhones: rOrST('contactsCountValidPhones'),
    countNotContactable: rOrST('contactsCountNotContactable'),
    countBlockedByEmail: rOrST('contactsCountBlockedByEmail'),
    countWrongEmails: rOrST('contactsCountWrongEmails'),
    countNotPresentEmails: rOrST('contactsCountNotPresentEmails'),
    countBlockedByPhone: rOrST('contactsCountBlockedByPhone'),
    countWrongPhones: rOrST('contactsCountWrongPhones'),
    countNotPresentPhones: rOrST('contactsCountNotPresentPhones'),

    countPromotorsPercent: mMultiply([
      mDivide(rOrST('satisfactionCountPromoters'), rOrST('satisfactionCountReviews')),
      100,
    ]),
    countDetractorsPercent: mMultiply([
      mDivide(rOrST('satisfactionCountDetractors'), rOrST('satisfactionCountReviews')),
      100,
    ]),
    countSurveysRespondedPercent: mMultiply([
      mDivide(
        rOrST('contactsCountSurveysResponded'),
        mAdd([rOrST('contactsCountReceivedSurveys'), rOrST('contactsCountScheduledContacts')])
      ),
      100,
    ]),
    countNotContactablePercent: mMultiply([
      mDivide(rOrST('contactsCountNotContactable'), rOrST('contactsCountTotalShouldSurfaceInCampaignStats')),
      100,
    ]),
    countValidEmailsPercent: mMultiply([
      mDivide(
        mAdd([rOrST('contactsCountValidEmails'), rOrST('contactsCountBlockedByEmail')]),
        mAdd([
          rOrST('contactsCountValidEmails'),
          rOrST('contactsCountBlockedByEmail'),
          rOrST('contactsCountWrongEmails'),
          rOrST('contactsCountNotPresentEmails'),
        ])
      ),
      100,
    ]),
    countValidPhonesPercent: mMultiply([
      mDivide(
        mAdd([rOrST('contactsCountValidPhones'), rOrST('contactsCountBlockedByPhone')]),
        mAdd([
          rOrST('contactsCountValidPhones'),
          rOrST('contactsCountBlockedByPhone'),
          rOrST('contactsCountWrongPhones'),
          rOrST('contactsCountNotPresentPhones'),
        ])
      ),
      100,
    ]),
    countReceivedAndScheduledSurveys: mCond(
      mIfNull([rOrST('contactsCountScheduledContacts'), false]),
      mCond(
        mIfNull([rOrST('contactsCountReceivedSurveys'), false]),
        mAdd([rOrST('contactsCountScheduledContacts'), rOrST('contactsCountReceivedSurveys')]),
        rOrST('contactsCountScheduledContacts')
      ),
      mCond(mIfNull([rOrST('contactsCountReceivedSurveys'), false]), rOrST('contactsCountReceivedSurveys'), 0)
    ), // formula: contactsCountReceivedSurveys + contactsCountScheduledContacts || contactsCountReceivedSurveys || 0
  };
}

function generateLookupGarages() {
  return [
    {
      $lookup: {
        from: 'garages',
        let: { garageId: '$garageId' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$garageId'] } } },
          { $project: { hideDirectoryPage: 1, slug: 1, publicDisplayName: 1, externalId: 1 } },
        ],
        as: 'garage',
      },
    },
    {
      $unwind: {
        path: '$garage',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        hideDirectoryPage: '$garage.hideDirectoryPage',
        garageSlug: '$garage.slug',
        garagePublicDisplayName: '$garage.publicDisplayName',
        externalId: '$garage.externalId',
      },
    },
  ];
}

function generateGroup(queryFields, sortParams) {
  const { type } = sortParams;
  const { kpiType } = queryFields;

  const suffix = suffixes[type] || '';

  // rootOrSubType : read in subObject of collection
  function rOrST(element, activePath = true, activeSuffix = true) {
    const pathElement = `${element}${activeSuffix ? suffix : ''}`;
    return `${activePath ? '$' : ''}${KpiDictionary[pathElement]}`;
  }

  const fieldsKeys = [
    'satisfactionCountPromoters',
    'satisfactionCountDetractors',
    'contactsCountValidEmails',
    'contactsCountValidPhones',
    'contactsCountNotContactable',
    'contactsCountBlockedByEmail',
    'contactsCountWrongEmails',
    'contactsCountNotPresentEmails',
    'contactsCountBlockedByPhone',
    'contactsCountWrongPhones',
    'contactsCountNotPresentPhones',
    'contactsCountSurveysResponded',
    'contactsCountReceivedSurveys',
    'contactsCountScheduledContacts',
    'contactsCountTotalShouldSurfaceInCampaignStats',
  ];

  const fieldsKeysIgnoreSuffix = [
    'satisfactionSumRatingApv',
    'satisfactionCountReviewsApv',
    'satisfactionSumRatingVn',
    'satisfactionCountReviewsVn',
    'satisfactionSumRatingVo',
    'satisfactionCountReviewsVo',
    'satisfactionCountReviews',
    'satisfactionSumRating',
  ];

  const processedFields = {};
  const projectFields = {};
  -fieldsKeys.forEach((key) => {
    processedFields[rOrST(key, false)] = mSum(rOrST(key));
    projectFields[rOrST(key, false)] = rOrST(key);
  });

  fieldsKeysIgnoreSuffix.forEach((key) => {
    processedFields[rOrST(key, false, false)] = mSum(rOrST(key, true, false));
    projectFields[rOrST(key, false, false)] = rOrST(key, true, false);
  });

  return [
    {
      $group: {
        _id:
          kpiType === KpiTypes.GARAGE_KPI
            ? { garageId: `$${KpiDictionary.garageId}` }
            : { garageId: `$${KpiDictionary.garageId}`, userId: `$${KpiDictionary.userId}` },
        ...processedFields,
      },
    },
    {
      $project: {
        _id: '$_id.garageId',
        [KpiDictionary.garageId]: '$_id.garageId',
        [KpiDictionary.userId]: '$_id.userId',
        ...projectFields,
      },
    },
  ];
}

async function getGaragesHistories(
  garagesCollection,
  kpiByPeriodCollection,
  cockpitTopFiltersCollection,
  queryFields,
  sortParams,
  limit,
  skip
) {
  const filters = await generateFilters(garagesCollection, cockpitTopFiltersCollection, queryFields, sortParams);
  const group = generateGroup(queryFields, sortParams);
  const projection = generateProjection(sortParams);
  const sort = generateSortField(sortParams);
  const joinGarageInfos = generateLookupGarages();
  const finalPipeline = [
    { $match: filters },
    ...group,
    { $project: projection },
    { $sort: sort },
    { $skip: skip },
    { $limit: limit + 1 },
    ...joinGarageInfos,
  ];

  const kpis = await kpiByPeriodCollection.aggregate(finalPipeline).toArray();
  return kpis ? kpis : [];
}

const typePrefix = 'kpiByPeriodGetKpis';

module.exports.typeDef = gql`
  extend type Query {
    kpiByPeriodGetKpis(
      periodId: String!
      kpiOrderBy: String!
      kpiOrder: String!
      cockpitType: String
      garageIds: [String]
      search: String
      type: String
      frontDeskUserName: String
      allUsers: Boolean
      limit: Int
      skip: Int
      kpiType: Int
    ): kpiByPeriodGetKpisGlobalReturn
  }

  type kpiByPeriodGetKpisGlobalReturn {
    list: [kpiByPeriodGetKpis]
    hasMore: Boolean
  }

  type kpiByPeriodGetKpis {
    id: ID!
    frontDesk: String
    hideDirectoryPage: Boolean
    garageId: ID
    garageSlug: String
    garagePublicDisplayName: String
    externalId: String

    # satisfaction needs
    scoreNPS: Float
    scoreVN: Float
    scoreVO: Float
    scoreAPV: Float
    countSurveysResponded: Int
    countSurveyPromotor: Int # same value as countSurveySatisfied
    countSurveyDetractor: Int # same value as countSurveyUnsatisfied
    # contacts needs
    countSurveys: Int
    countSurveyResponded: Int
    countValidEmails: Int
    countWrongEmails: Int
    countBlockedByEmail: Int
    countNotPresentEmails: Int
    countValidPhones: Int
    countWrongPhones: Int
    countBlockedByPhone: Int
    countNotPresentPhones: Int
    countNotContactable: Int
    countSurveysRespondedPercent: Float
    countNotContactablePercent: Float
    totalShouldSurfaceInCampaignStats: Int

    # Resolvers Fields
    countSurveyRespondedAll: Int # countSurveyRespondedAll || countSurveysResponded
    countReceivedAndScheduledSurveys: Int # countReceivedSurveys + countScheduledContacts || countReceivedSurveys || 0
  }
`;

module.exports.resolvers = {
  Query: {
    [typePrefix]: async (obj, args, context) => {
      const {
        app,
        scope: { logged, authenticationError, user, garageIds: userGarageIds },
      } = context;
      const {
        search,
        frontDeskUserName,
        allUsers,
        periodId,
        garageIds: requestGarageIds,
        cockpitType,
        kpiOrderBy,
        kpiOrder,
        type,
        limit,
        skip,
        kpiType,
      } = args;

      if (!userGarageIds || userGarageIds.length === 0) {
        return {
          list: [],
          hasMore: false,
        };
      }

      const garagesCollection = app.models.Garage.getMongoConnector();
      const kpiByPeriodCollection = app.models.KpiByPeriod.getMongoConnector();
      const cockpitTopFiltersCollection = app.models.CockpitTopFilter.getMongoConnector();

      if (!logged) {
        throw new AuthenticationError(authenticationError);
      } else if (!user.hasAuthorization(ACCESS_TO_COCKPIT)) {
        throw new ForbiddenError('Not authorized');
      }

      try {
        const queryFields = {
          search: !isEmpty(search) ? search.trim() : null,
          frontDeskUserName,
          periodId,
          cockpitType,
          allUsers,
          requestGarageIds: requestGarageIds && requestGarageIds.length > 0 ? requestGarageIds : null,
          userGarageIds, // req.user.garageIds
          kpiType,
        };

        const sortParams = {
          kpiOrderBy,
          kpiOrder,
          type: DataTypes.hasValue(type) ? type : null,
        };

        const limitField = !limit || limit < 1 || limit > 100 ? 100 : limit;
        const skipField = !skip || skip < 0 ? 0 : skip;

        const kpis = await getGaragesHistories(
          garagesCollection,
          kpiByPeriodCollection,
          cockpitTopFiltersCollection,
          queryFields,
          sortParams,
          limitField,
          skipField
        );

        const kpisSize = kpis.length;
        return {
          list: limitField + 1 === kpisSize ? kpis.slice(0, -1) : kpis,
          hasMore: kpisSize > limitField,
        };
      } catch (error) {
        log.error(JON, error);
        return error;
      }
    },
  },
};
