//@ts-nocheck
const { ObjectId } = require('mongodb');
const DataFilters = require('../../../../../server/webservers-standalones/api/_common/data-generate-filters');
const KpiDictionary = require('../../kpi/KpiDictionary');
const KpiTypes = require('../../../../models/kpi-type');

const {
  DataTypes,
  ExportTypes,
  ExportPeriods,
  AutomationCampaignsEventsType,
} = require('../../../../../frontend/utils/enumV2');
const computePercentKeys = require('../../kpi/kpiPercent');
const GarageTypes = require('../../../../models/garage.type');
const { periodsHelper, frontDeskUsersHelper } = require('./query-generators-helpers');
const { getSingleFilter } = require('../../api/cockpit-top-filters');
const querySearch = require('../../api/graphql/queries/_common');
const { addDaysToDate } = require('../../../util/time-helper');
const ExportHelper = require('../../../../../frontend/utils/exports/helper');

const $safeDivide = (num, den) => ({ $cond: [{ $gt: [den, 0] }, { $divide: [num, den] }, null] });

module.exports = {
  generate: async function ({ app = {}, args = {}, userGarageIds = [], user = {} }) {
    const processedArgs = { ...args, ...ExportHelper.fromExportPeriodsToGhCustomPeriods(args.periodId) };

    let query = null;
    switch (processedArgs.exportType) {
      case ExportTypes.GARAGES:
        query = this.garagesQueryGenerator(processedArgs, userGarageIds);
        break;
      case ExportTypes.FRONT_DESK_USERS_DMS:
        query = await this.frontDeskUsersDmsQueryGenerator(app, processedArgs, userGarageIds);
        break;
      case ExportTypes.FRONT_DESK_USERS_CUSTEED:
        query = this.frontDeskUsersCusteedQueryGenerator(processedArgs, userGarageIds);
        break;
      case ExportTypes.SATISFACTION:
        query = this.satisfactionQueryGenerator(processedArgs, userGarageIds);
        break;
      case ExportTypes.CONTACTS:
        query = this.contactsQueryGenerator(processedArgs, userGarageIds);
        break;
      case ExportTypes.CONTACTS_MODIFIED:
        query = this.contactsModifiedQueryGenerator(processedArgs, userGarageIds);
        break;
      case ExportTypes.UNSATISFIED:
        query = this.unsatisfiedQueryGenerator(processedArgs, userGarageIds);
        break;
      case ExportTypes.LEADS:
        query = this.leadsQueryGenerator(processedArgs, userGarageIds);
        break;
      case ExportTypes.FORWARDED_LEADS:
        query = this.forwardedLeadsQueryGenerator(processedArgs, userGarageIds);
        break;
      case ExportTypes.EREPUTATION:
        query = this.ereputationQueryGenerator(processedArgs, userGarageIds);
        break;
      case ExportTypes.ADMIN_USERS:
        query = this.adminUsersQueryGenerator(processedArgs, userGarageIds);
        break;
      case ExportTypes.ADMIN_GARAGES:
        query = this.adminGaragesQueryGenerator(processedArgs, userGarageIds);
        break;
      case ExportTypes.AUTOMATION_RGPD:
        query = this.automationRgpdQueryGenerator(args, userGarageIds, user);
        break;
      case ExportTypes.AUTOMATION_CAMPAIGN:
        query = this.automationCampaignQueryGenerator(args, userGarageIds, user);
        break;
      default:
        throw new Error(`Unkown ExportType ${processedArgs.exportType}`);
    }

    return query;
  },
  //----------------------------------------------------
  //----------------------GARAGES-----------------------
  //----------------------------------------------------
  garagesQueryGenerator(args, currentGarageIds) {
    const { periodId, startPeriodId, endPeriodId } = args;
    const periods = periodsHelper.getPeriodsList({ periodId, startPeriodId, endPeriodId });
    let { garageIds } = args;

    if (garageIds && garageIds.includes('All')) {
      garageIds = currentGarageIds;
    }

    const res = [
      {
        $match: {
          [KpiDictionary.garageId]: { $in: garageIds.map(ObjectId) },
          [KpiDictionary.kpiType]: KpiTypes.GARAGE_KPI,
          [KpiDictionary.period]: Array.isArray(periods) ? { $in: periods } : periods,
        },
      },
      {
        $project: {
          ...KpiDictionary.keysAsArray.reduce((acc, key) => ({ ...acc, [key]: `$${KpiDictionary[key]}` }), {}),
        },
      },
      {
        $group: {
          _id: `$garageId`,
          ...KpiDictionary.accumulativeKeys.reduce((acc, key) => ({ ...acc, [key]: { $sum: `$${key}` } }), {}),
        },
      },
      {
        $addFields: {
          ...computePercentKeys([
            'satisfactionCountPromotersPercent',
            'satisfactionCountDetractorsPercent',
            'satisfactionCountPromotersPercentApv',
            'satisfactionCountDetractorsPercentApv',
            'satisfactionCountPromotersPercentVn',
            'satisfactionCountDetractorsPercentVn',
            'satisfactionCountPromotersPercentVo',
            'satisfactionCountDetractorsPercentVo',

            'respondentsPercent',
            'validEmailsPercent',
            'validPhonesPercent',
            'unreachablesPercent',
            'respondentsPercentApv',
            'validEmailsPercentApv',
            'validPhonesPercentApv',
            'unreachablesPercentApv',
            'respondentsPercentVn',
            'validEmailsPercentVn',
            'validPhonesPercentVn',
            'unreachablesPercentVn',
            'respondentsPercentVo',
            'validEmailsPercentVo',
            'validPhonesPercentVo',
            'unreachablesPercentVo',

            'countUnsatisfiedTouchedPercent',
            'countUnsatisfiedUntouchedPercent',
            'countUnsatisfiedClosedWithResolutionPercent',
            'countUnsatisfiedReactivePercent',
            'countUnsatisfiedUntouchedPercentApv',
            'countUnsatisfiedTouchedPercentApv',
            'countUnsatisfiedClosedWithResolutionPercentApv',
            'countUnsatisfiedReactivePercentApv',
            'countUnsatisfiedUntouchedPercentVo',
            'countUnsatisfiedTouchedPercentVo',
            'countUnsatisfiedClosedWithResolutionPercentVo',
            'countUnsatisfiedReactivePercentVo',
            'countUnsatisfiedUntouchedPercentVn',
            'countUnsatisfiedTouchedPercentVn',
            'countUnsatisfiedClosedWithResolutionPercentVn',
            'countUnsatisfiedReactivePercentVn',

            'countLeadsUntouchedPercent',
            'countLeadsTouchedPercent',
            'countConvertedLeadsPercent',
            'countLeadsReactivePercent',
            'countLeadsClosedWithSalePercent',
            'countLeadsUntouchedPercentApv',
            'countLeadsTouchedPercentApv',
            'countConvertedLeadsPercentApv',
            'countLeadsReactivePercentApv',
            'countLeadsClosedWithSalePercentApv',
            'countLeadsUntouchedPercentVn',
            'countLeadsTouchedPercentVn',
            'countConvertedLeadsPercentVn',
            'countLeadsReactivePercentVn',
            'countLeadsClosedWithSalePercentVn',
            'countLeadsUntouchedPercentVo',
            'countLeadsTouchedPercentVo',
            'countConvertedLeadsPercentVo',
            'countLeadsReactivePercentVo',
            'countLeadsClosedWithSalePercentVo',

            'erepCountRecommendPercent',
            'erepCountPromotersPercent',
            'erepCountPassivesPercent',
            'erepCountDetractorsPercent',
          ]),
          erepNPS: {
            $multiply: [
              $safeDivide({ $subtract: ['$erepCountPromoters', '$erepCountDetractors'] }, '$erepCountReviews'),
              100,
            ],
          },
          satisfactionRating: $safeDivide('$satisfactionSumRating', '$satisfactionCountReviews'),
          satisfactionNPS: {
            $multiply: [
              $safeDivide(
                { $subtract: ['$satisfactionCountPromoters', '$satisfactionCountDetractors'] },
                '$satisfactionCountReviews'
              ),
              100,
            ],
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ];

    return res;
  },

  //----------------------------------------------------
  //-----------------FRONT DESK USERS-------------------
  //----------------------------------------------------
  async frontDeskUsersDmsQueryGenerator(app, args, currentGarageIds) {
    const { periodId, startPeriodId, endPeriodId } = args;
    const periods = periodsHelper.getPeriodsList({ periodId, startPeriodId, endPeriodId });
    const {
      garageIds = ['All'],
      dataTypes = ['All'],
      frontDeskUsers = [{ frontDeskUserName: 'All', garageId: null }],
      cockpitType = 'Dealership',
    } = args;

    // has the user requested all the dataTypes
    const allDataTypesRequested = frontDeskUsersHelper.areAllDataTypesRequested(dataTypes);

    // has the user requested all the frontDeskUsers
    const allFrontDeskUsersRequested = frontDeskUsersHelper.areAllFrontDeskUsersRequested(frontDeskUsers);

    // has the user requested all the garageIds
    const allGarageIdsRequested = frontDeskUsersHelper.areAllGarageIdsRequested(garageIds);

    // user's available garageIds from context.scope converted to strings
    const userAvailableGarageIds = currentGarageIds.map((gId) => gId.toString());

    // retrieve the list of garageIds for the query
    const garageIdsToQuery = frontDeskUsersHelper.getGarageIdsToQuery(
      userAvailableGarageIds,
      garageIds,
      frontDeskUsers,
      allGarageIdsRequested,
      allFrontDeskUsersRequested
    );

    // small optimization, if both all dataTypes and all frontDeskUsers are requested
    let userIdQueryFilter = { $ne: 'ALL_USERS' };

    // otherwise we need to fetch the available frontDeskUsers
    if (!allDataTypesRequested || !allFrontDeskUsersRequested) {
      const { values = [] } = await getSingleFilter(
        app,
        'frontDeskUserName',
        [
          {
            label: 'garageId',
            values: garageIdsToQuery,
          },
          {
            label: 'garageType',
            values: GarageTypes.getGarageTypesFromCockpitType(cockpitType),
          },
        ],
        null,
        true
      );
      // All dataTypes were requested by the user
      if (allDataTypesRequested) {
        const frontDeskUserNamesToQuery = [
          ...new Set(
            values
              .filter(
                (fetchedUser) =>
                  frontDeskUsersHelper.isValidFrontDeskUserName(fetchedUser.frontDeskUserName) &&
                  frontDeskUsers.find((e) => e.frontDeskUserName === fetchedUser.frontDeskUserName)
              )
              .map((fetchedUser) => fetchedUser.frontDeskUserName)
          ),
        ];
        // if frontDeskUserNames are asked, query only the ones that are available for the user
        userIdQueryFilter = { $in: frontDeskUserNamesToQuery };
      }
      // One or multiple dataTypes were requested by the user
      else {
        const frontDeskUserNamesToQuery = [
          ...new Set(
            values
              .filter(
                (fetchedUser) =>
                  frontDeskUsersHelper.isValidFrontDeskUserName(fetchedUser.frontDeskUserName) &&
                  dataTypes.includes(fetchedUser.type) &&
                  (allFrontDeskUsersRequested
                    ? true
                    : Boolean(frontDeskUsers.find((e) => e.frontDeskUserName === fetchedUser.frontDeskUserName)))
              )
              .map((fetchedUser) => fetchedUser.frontDeskUserName)
          ),
        ];

        userIdQueryFilter = { $in: frontDeskUserNamesToQuery };
      }
    }

    return [
      {
        $match: {
          [KpiDictionary.garageId]: { $in: garageIdsToQuery.map(ObjectId) },
          [KpiDictionary.kpiType]: KpiTypes.FRONT_DESK_USER_KPI,
          [KpiDictionary.period]: Array.isArray(periods) ? { $in: periods } : periods,
          [KpiDictionary.userId]: userIdQueryFilter,
        },
      },
      {
        $project: {
          ...KpiDictionary.keysAsArray.reduce((acc, key) => ({ ...acc, [key]: `$${KpiDictionary[key]}` }), {}),
        },
      },
      {
        $group: {
          _id: {
            garageId: '$garageId',
            userId: '$userId',
          },
          ...KpiDictionary.accumulativeKeys.reduce((acc, key) => ({ ...acc, [key]: { $sum: `$${key}` } }), {}),
        },
      },
      {
        $addFields: {
          ...computePercentKeys([
            'satisfactionCountPromotersPercent',
            'satisfactionCountDetractorsPercent',
            'satisfactionCountPromotersPercentApv',
            'satisfactionCountDetractorsPercentApv',
            'satisfactionCountPromotersPercentVn',
            'satisfactionCountDetractorsPercentVn',
            'satisfactionCountPromotersPercentVo',
            'satisfactionCountDetractorsPercentVo',

            'respondentsPercent',
            'validEmailsPercent',
            'unreachablesPercent',
            'respondentsPercentApv',
            'validEmailsPercentApv',
            'unreachablesPercentApv',
            'respondentsPercentVn',
            'validEmailsPercentVn',
            'unreachablesPercentVn',
            'respondentsPercentVo',
            'validEmailsPercentVo',
            'unreachablesPercentVo',
            'validPhonesPercent',
            'validPhonesPercentApv',
            'validPhonesPercentVn',
            'validPhonesPercentVo',

            'countUnsatisfiedTouchedPercent',
            'countUnsatisfiedUntouchedPercent',
            'countUnsatisfiedReactivePercent',

            'countUnsatisfiedUntouchedPercentApv',
            'countUnsatisfiedTouchedPercentApv',
            'countUnsatisfiedClosedWithResolutionPercentApv',
            'countUnsatisfiedReactivePercentApv',

            'countUnsatisfiedUntouchedPercentVo',
            'countUnsatisfiedClosedWithResolutionPercentVo',
            'countUnsatisfiedReactivePercentVo',

            'countUnsatisfiedUntouchedPercentVn',
            'countUnsatisfiedTouchedPercentVn',
            'countUnsatisfiedClosedWithResolutionPercentVn',
            'countUnsatisfiedReactivePercentVn',

            'countLeadsUntouchedPercent',
            'countLeadsTouchedPercent',
            'countConvertedLeadsPercent',
            'countLeadsReactivePercent',

            'countLeadsUntouchedPercentApv',
            'countLeadsTouchedPercentApv',
            'countConvertedLeadsPercentApv',
            'countLeadsReactivePercentApv',

            'countLeadsUntouchedPercentVn',
            'countLeadsTouchedPercentVn',
            'countConvertedLeadsPercentVn',
            'countLeadsReactivePercentVn',

            'countLeadsUntouchedPercentVo',
            'countLeadsTouchedPercentVo',
            'countConvertedLeadsPercentVo',
            'countLeadsReactivePercentVo',
          ]),
          satisfactionRating: $safeDivide('$satisfactionSumRating', '$satisfactionCountReviews'),
          satisfactionNPS: {
            $multiply: [
              $safeDivide(
                { $subtract: ['$satisfactionCountPromoters', '$satisfactionCountDetractors'] },
                '$satisfactionCountReviews'
              ),
              100,
            ],
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ];
  },

  //----------------------------------------------------
  //-------------------FRONT DESK USERS CUSTEED---------
  //----------------------------------------------------
  frontDeskUsersCusteedQueryGenerator(args, currentGarageIds) {
    const {
      periodId,
      startPeriodId,
      endPeriodId,
      garageIds = ['All'],
      dataTypes = ['All'],
      frontDeskUsers = [{ id: 'All', frontDeskUserName: 'All', garageId: null }],
    } = args;

    const periods = periodsHelper.getPeriodsList({ periodId, startPeriodId, endPeriodId });

    // has the user requested all the frontDeskUsers
    const allFrontDeskUsersRequested = frontDeskUsersHelper.areAllFrontDeskUsersRequested(frontDeskUsers);

    // has the user requested all the garageIds
    const allGarageIdsRequested = frontDeskUsersHelper.areAllGarageIdsRequested(garageIds);

    // user's available garageIds from context.scope converted to strings
    const userAvailableGarageIds = currentGarageIds.map((gId) => gId.toString());

    // retrieve the list of garageIds for the query
    const garageIdsToQuery = frontDeskUsersHelper.getGarageIdsToQuery(
      userAvailableGarageIds,
      garageIds,
      frontDeskUsers,
      allGarageIdsRequested,
      allFrontDeskUsersRequested
    );

    const aggregate = [
      {
        $match: {
          [KpiDictionary.period]: Array.isArray(periods) ? { $in: periods } : periods,
          [KpiDictionary.kpiType]: KpiTypes.USER_KPI,
          [KpiDictionary.garageId]: { $in: garageIdsToQuery.map(ObjectId) },
          ...(!allFrontDeskUsersRequested && {
            [KpiDictionary.userId]: { $in: [...frontDeskUsers.map((f) => ObjectId(f.id))] },
          }),
        },
      },
      {
        $project: {
          ...KpiDictionary.keysAsArray.reduce((acc, key) => ({ ...acc, [key]: `$${KpiDictionary[key]}` }), {}),
        },
      },
      {
        $group: {
          _id: {
            garageId: '$garageId',
            userId: '$userId',
          },
          ...KpiDictionary.accumulativeKeys.reduce((acc, key) => ({ ...acc, [key]: { $sum: `$${key}` } }), {}),
        },
      },
      {
        $addFields: {
          ...computePercentKeys([
            // unsatisfied
            'countUnsatisfiedUntouchedPercent',
            'countUnsatisfiedUntouchedPercentApv',
            'countUnsatisfiedUntouchedPercentVn',
            'countUnsatisfiedUntouchedPercentVo',

            'countUnsatisfiedTouchedPercent',
            'countUnsatisfiedTouchedPercentApv',
            'countUnsatisfiedTouchedPercentVn',
            'countUnsatisfiedTouchedPercentVo',

            'countUnsatisfiedReactivePercent',
            'countUnsatisfiedReactivePercentApv',
            'countUnsatisfiedReactivePercentVn',
            'countUnsatisfiedReactivePercentVo',

            'countUnsatisfiedClosedWithResolutionPercent',
            'countUnsatisfiedClosedWithResolutionPercentApv',
            'countUnsatisfiedClosedWithResolutionPercentVn',
            'countUnsatisfiedClosedWithResolutionPercentVo',

            // lead
            'countLeadsUntouchedPercent',
            'countLeadsUntouchedPercentApv',
            'countLeadsUntouchedPercentVn',
            'countLeadsUntouchedPercentVo',
            'countLeadsUntouchedPercentUnknown',

            'countLeadsTouchedPercent',
            'countLeadsTouchedPercentApv',
            'countLeadsTouchedPercentVn',
            'countLeadsTouchedPercentVo',
            'countLeadsTouchedPercentUnknown',

            'countLeadsClosedWithSalePercent',
            'countLeadsClosedWithSalePercentApv',
            'countLeadsClosedWithSalePercentVn',
            'countLeadsClosedWithSalePercentVo',
            'countLeadsClosedWithSalePercentUnknown',

            'countLeadsReactivePercent',
            'countLeadsReactivePercentApv',
            'countLeadsReactivePercentVn',
            'countLeadsReactivePercentVo',
            'countLeadsReactivePercentUnknown',
          ]),
          satisfactionRating: $safeDivide('$satisfactionSumRating', '$satisfactionCountReviews'),
          satisfactionNPS: {
            $multiply: [
              $safeDivide(
                { $subtract: ['$satisfactionCountPromoters', '$satisfactionCountDetractors'] },
                '$satisfactionCountReviews'
              ),
              100,
            ],
          },
        },
      },
    ];

    return aggregate;
  },

  //----------------------------------------------------
  //-------------------SATISFACTION---------------------
  //----------------------------------------------------
  satisfactionQueryGenerator(args, currentGarageIds) {
    const { periodId, startPeriodId, endPeriodId } = args;
    let { dataTypes, garageIds } = args;

    if (garageIds && garageIds.includes('All')) {
      garageIds = currentGarageIds.map((e) => e.toString());
    }

    if (dataTypes && dataTypes.includes('All')) {
      dataTypes = [
        DataTypes.MAINTENANCE,
        DataTypes.NEW_VEHICLE_SALE,
        DataTypes.USED_VEHICLE_SALE,
        DataTypes.VEHICLE_INSPECTION,
      ];
    }

    const where = new DataFilters()
      .setBasicFilterForSatisfactionList()
      .setGarageId(garageIds)
      .setPeriodIdOrIntervalPeriods({ periodId, startPeriodId, endPeriodId }, { dateField: 'service.providedAt' })
      .setType(dataTypes)
      .generateMatch();

    const sort = {
      'service.providedAt': -1,
    };

    return { where, sort };
  },

  //----------------------------------------------------
  //---------------------CONTACTS-----------------------
  //----------------------------------------------------
  contactsQueryGenerator(args, currentGarageIds) {
    const { periodId, startPeriodId, endPeriodId } = args;
    let { dataTypes, garageIds } = args;

    if (garageIds && garageIds.includes('All')) {
      garageIds = currentGarageIds.map((e) => e.toString());
    }

    if (dataTypes && dataTypes.includes('All')) {
      dataTypes = null;
    }

    const where = new DataFilters()
      .setBasicFilterForContactList()
      .setGarageId(garageIds)
      .setPeriodIdOrIntervalPeriods({ periodId, startPeriodId, endPeriodId }, { dateField: 'service.providedAt' })
      .setType(dataTypes)
      .generateMatch();

    const sort = {
      'service.providedAt': -1,
    };

    return { where, sort };
  },

  //----------------------------------------------------
  //----------------CONTACTS MODIFIED-------------------
  //----------------------------------------------------
  contactsModifiedQueryGenerator(args, currentGarageIds) {
    const { periodId, startPeriodId, endPeriodId } = args;
    let { dataTypes, garageIds } = args;

    if (garageIds && garageIds.includes('All')) {
      garageIds = currentGarageIds.map((e) => e.toString());
    }

    if (dataTypes && dataTypes.includes('All')) {
      dataTypes = null;
    }

    const where = new DataFilters()
      .setBasicFilterForContactList()
      .setGarageId(garageIds)
      .setPeriodIdOrIntervalPeriods({ periodId, startPeriodId, endPeriodId }, { dateField: 'service.providedAt' })
      .setType(dataTypes)
      .setRevisionStatus('Revised')
      .generateMatch();

    const sort = {
      'service.providedAt': -1,
    };

    return { where, sort };
  },

  //----------------------------------------------------
  //-------------------UNSATISFIED----------------------
  //----------------------------------------------------
  unsatisfiedQueryGenerator(args, currentGarageIds) {
    const { periodId, startPeriodId, endPeriodId } = args;
    let { dataTypes, garageIds } = args;

    if (garageIds && garageIds.includes('All')) {
      garageIds = currentGarageIds.map((e) => e.toString());
    }

    if (dataTypes && dataTypes.includes('All')) {
      dataTypes = null;
    }

    const where = new DataFilters()
      .setBasicFilterForUnsatisfiedList()
      .setGarageId(garageIds)
      .setPeriodIdOrIntervalPeriods(
        { periodId, startPeriodId, endPeriodId },
        { dateField: 'unsatisfiedTicket.createdAt', filterDefaultDate: true }
      )
      .setType(dataTypes)
      .generateMatch();

    const sort = {
      'unsatisfiedTicket.createdAt': -1,
    };

    return { where, sort };
  },

  //----------------------------------------------------
  //-----------------------LEADS------------------------
  //----------------------------------------------------
  leadsQueryGenerator(args, currentGarageIds) {
    const { periodId, startPeriodId, endPeriodId } = args;
    let { dataTypes, garageIds } = args;

    if (garageIds && garageIds.includes('All')) {
      garageIds = currentGarageIds.map((e) => e.toString());
    }

    if (dataTypes && dataTypes.includes('All')) {
      dataTypes = null;
    }

    const where = new DataFilters()
      .setBasicFilterForLeadsList()
      .setGarageId(garageIds)
      .setPeriodIdOrIntervalPeriods(
        { periodId, startPeriodId, endPeriodId },
        { dateField: 'leadTicket.createdAt', filterDefaultDate: true }
      )
      .setLeadSaleType(dataTypes)
      .generateMatch();

    const sort = {
      'leadTicket.createdAt': -1,
    };

    return { where, sort };
  },

  //----------------------------------------------------
  //------------------ FORWARDEDLEADS-------------------
  //----------------------------------------------------
  forwardedLeadsQueryGenerator(args, currentGarageIds) {
    const { periodId, startPeriodId, endPeriodId } = args;
    let { dataTypes, garageIds } = args;

    if (garageIds && garageIds.includes('All')) {
      garageIds = currentGarageIds.map((e) => e.toString());
    }

    if (dataTypes && dataTypes.includes('All')) {
      dataTypes = null;
    }

    const where = new DataFilters()
      .setBasicFilterForLeadsList()
      .setGarageId(garageIds, null, { followed: true })
      .setPeriodIdOrIntervalPeriods(
        { periodId, startPeriodId, endPeriodId },
        { dateField: 'leadTicket.createdAt', filterDefaultDate: true }
      )
      .setLeadSaleType(dataTypes)
      .generateMatch();

    const sort = {
      'leadTicket.createdAt': -1,
    };

    return { where, sort };
  },

  //----------------------------------------------------
  //-------------------EREPUTATION----------------------
  //----------------------------------------------------
  ereputationQueryGenerator(args, currentGarageIds) {
    const { periodId, startPeriodId, endPeriodId } = args;
    let { garageIds } = args;

    if (garageIds && garageIds.includes('All')) {
      garageIds = currentGarageIds.map((e) => e.toString());
    }

    const where = new DataFilters()
      .setBasicFilterForEreputationList()
      .setGarageId(garageIds)
      .setPeriodIdOrIntervalPeriods({ periodId, startPeriodId, endPeriodId }, { dateField: 'review.createdAt' })
      .generateMatch();

    const sort = {
      'review.createdAt': -1,
    };

    return { where, sort };
  },
  //----------------------------------------------------
  //-------------------ADMIN USERS----------------------
  //----------------------------------------------------
  adminUsersQueryGenerator(args, currentUserGarageIds = []) {
    const { adminSearch, adminFilterRole, adminFilterJob, adminFilterLastCockpitOpenAt } = args;

    let $match = {
      garageIds: {
        $in: [...currentUserGarageIds.map((id) => ObjectId(id))],
      },
      job: { $ne: 'Custeed' },
    };

    // filter on role
    if (adminFilterRole) {
      $match.role = adminFilterRole;
    }

    // filter on job
    if (adminFilterJob && adminFilterJob !== 'Custeed') {
      $match.job = adminFilterJob;
    }

    // filter on lastCockpitOpenAt
    if (adminFilterLastCockpitOpenAt) {
      // mapping of period filters
      const lastCockpitOpenAtPeriods = {
        recent: {
          $gte: addDaysToDate(new Date(), -30),
        },
        intermediate: {
          $lt: addDaysToDate(new Date(), -30),
          $gte: addDaysToDate(new Date(), -60),
        },
        longTime: {
          $lt: addDaysToDate(new Date(), -60),
        },
        never: {
          $eq: null,
        },
      };

      $match.lastCockpitOpenAt = lastCockpitOpenAtPeriods[adminFilterLastCockpitOpenAt];
    }

    if (adminSearch) {
      $match = {
        ...$match,
        ...querySearch.addTextSearchToFiltersForUsers(adminSearch),
      };
    }
    return [
      {
        $match: $match,
      },
      {
        $project: {
          _id: false,
          civility: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          mobilePhone: true,
          job: true,
          role: true,
          garageIds: true,
          address: true,
          postCode: true,
          city: true,
          address2: true,
          lastCockpitOpenAt: true,
          createdAt: true,
          authorization: true,
          allGaragesAlerts: true,
          reportConfigs: true,
        },
      },
    ];
  },

  //----------------------------------------------------
  //-------------------ADMIN GARAGES--------------------
  //----------------------------------------------------
  adminGaragesQueryGenerator(args, currentUserGarageIds = []) {
    // We want all users who are managers in the listed currentUserGarageIds
    const { adminSearch = '' } = args;
    return [
      {
        $match: {
          _id: {
            $in: currentUserGarageIds.map((id) => ObjectId(id)),
          },
          ...{ $or: querySearch.addTextSearchToFiltersForGarages(null, adminSearch) },
        },
      },
      {
        $project: {
          _id: false,
          garageId: '$_id',
          externalId: true,
          publicDisplayName: true,
          ticketsConfiguration: {
            $objectToArray: '$ticketsConfiguration',
          },
        },
      },
      {
        $unwind: {
          path: '$ticketsConfiguration',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          garageId: true,
          externalId: true,
          publicDisplayName: true,
          ticketType: '$ticketsConfiguration.k',
          ticketManagerId: '$ticketsConfiguration.v',
        },
      },
      {
        $group: {
          _id: '$garageId',
          publicDisplayName: {
            $first: '$publicDisplayName',
          },
          externalId: { $first: '$externalId' },
          ticketsConfiguration: {
            $addToSet: {
              ticketType: '$ticketType',
              ticketManagerId: '$ticketManagerId',
            },
          },
        },
      },
    ];
  },

  //----------------------------------------------------
  //-------------------AUTOMATION RGPD------------------
  //----------------------------------------------------
  automationRgpdQueryGenerator(args, currentGarageIds, user = {}) {
    const { periodId, startPeriodId, endPeriodId } = args;
    const periods = periodsHelper.getPeriodsList({ periodId, startPeriodId, endPeriodId });
    const runDayNumber = periodsHelper.convertPeriodToDayNumber(periodId, periods);
    let { garageIds } = args;
    const isGarageScoreUser = user.isCusteed;
    const isAllGarages = garageIds.includes('All');

    if (garageIds && isAllGarages) {
      garageIds = currentGarageIds;
    }

    const res = [
      {
        $match: {
          garageId: { $in: garageIds.map(ObjectId) },
          $and: [{ campaignRunDay: { $gt: runDayNumber.gt } }, { campaignRunDay: { $lt: runDayNumber.lt } }],
          type: AutomationCampaignsEventsType.TARGETED,
        },
      },
      {
        $unwind: '$samples',
      },
      {
        $addFields: {
          'customer.customerId': '$samples.customerId',
          'customer.campaignId': '$campaignId',
          'customer.garageId': '$garageId',
        },
      },
      {
        $replaceRoot: {
          newRoot: '$customer',
        },
      },
      {
        $group: {
          _id: null,
          customerIds: { $addToSet: '$customerId' },
          garageIds: { $addToSet: '$garageId' },
          isGaragescoreFullScope: { $first: isAllGarages && isGarageScoreUser },
        },
      },
    ];

    return res;
  },

  //----------------------------------------------------
  //-------------------AUTOMATION CAMPAIGN--------------
  //----------------------------------------------------
  automationCampaignQueryGenerator(args, currentGarageIds, user = {}) {
    const { periodId, startPeriodId, endPeriodId, cockpitType, selectedAutomationCampaigns } = args;
    let { garageIds } = args;
    const garageTypesToMatch = GarageTypes.getGarageTypesFromCockpitType(cockpitType || GarageTypes.DEALERSHIP);
    const periods = periodsHelper.getPeriodsList({ periodId, startPeriodId, endPeriodId });
    const runDayNumber = periodsHelper.convertPeriodToDayNumber(periodId, periods);
    const matchPeriod = periodId && periodId === ExportPeriods.LAST_QUARTER ? [10] : periods;
    const aggregate = [];
    const isGarageScoreUser = user.isCusteed;
    const isAllGarages = garageIds.includes('All');
    if (garageIds && isAllGarages) {
      garageIds = currentGarageIds;
    }

    aggregate.push({
      $match: {
        [KpiDictionary.garageId]: { $in: garageIds.map((id) => ObjectId(id.toString())) },
        [KpiDictionary.garageType]: { $in: garageTypesToMatch.map((t) => GarageTypes.getIntegerVersion(t)) },
        [KpiDictionary.kpiType]: 30,
        [KpiDictionary.period]: { $in: matchPeriod },
      },
    });
    aggregate.push({
      $lookup: {
        from: 'automationCampaign',
        localField: `${KpiDictionary.automationCampaignId}`,
        foreignField: '_id',
        as: 'campaign',
      },
    });
    aggregate.push({
      $unwind: '$campaign',
    });
    if (!selectedAutomationCampaigns.includes('All')) {
      aggregate.push({
        $match: {
          'campaign.target': { $in: selectedAutomationCampaigns },
        },
      });
    }
    aggregate.push({
      $group: {
        _id: null,
        automationCampaigns: {
          $addToSet: `$${KpiDictionary.automationCampaignId}`,
        },
        garageIds: {
          $addToSet: `$${KpiDictionary.garageId}`,
        },
        campaignType: {
          $addToSet: '$campaign.type',
        },
        runDayNumber: {
          $first: runDayNumber,
        },
        isGaragescoreFullScope: {
          $first: isAllGarages && isGarageScoreUser,
        },
      },
    });

    return aggregate;
  },
};
