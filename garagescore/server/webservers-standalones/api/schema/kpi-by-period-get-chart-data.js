const { AuthenticationError } = require('apollo-server-express');
const queries = require('../../../../frontend/api/graphql/definitions/queries.json');
const { ObjectId } = require('mongodb');
const { MOMO, log } = require('../../../../common/lib/util/log');
const KpiTypes = require('../../../../common/models/kpi-type');
const KpiEncoder = require('../../../../common/lib/garagescore/kpi/KpiEncoder');
const GarageTypes = require('../../../../common/models/garage.type');
const KpiDictionary = require('../../../../common/lib/garagescore/kpi/KpiDictionary');
const computePercentKeys = require('../../../../common/lib/garagescore/kpi/kpiPercent');
const LeadSaleTypes = require('../../../../common/models/data/type/lead-sale-types');
const DataTypes = require('../../../../common/models/data/type/data-types');
const { fromGhPeriodToChartKpiPeriods } = require('../_common/chart-generate-periods');
const CampaignTypes = require('../../../../common/models/automation-campaign.type');
const { match: buildMatchkpiByPeriod } = require('../_common/kpi-by-period');
const { m_divide } = require('../../../../common/lib/util/mongo-helper');

const typePrefix = 'kpiByPeriodGetChartData';

function getKpiFields(dataType = null, type = null) {
  const fields = {
    lead: ['countLeads', 'countLeadsUntouched', 'countLeadsTouched', 'countLeadsClosedWithSale'],
    unsatisfied: [
      'countUnsatisfied',
      'countUnsatisfiedUntouched',
      'countUnsatisfiedTouched',
      'countUnsatisfiedClosedWithResolution',
    ],
    satisfaction: ['satisfactionCountReviews', 'satisfactionCountPromoters', 'satisfactionCountDetractors'],
    contacts: [
      'contactsCountSurveysResponded',
      'contactsCountReceivedSurveys',
      'contactsCountValidEmails',
      'contactsCountNotContactable',
      'contactsCountTotalShouldSurfaceInCampaignStats',
      'contactsCountScheduledContacts',
      'contactsCountBlockedLastMonthEmail',
      'contactsCountUnsubscribedByEmail',
      'contactsCountBlockedByEmail',
      'contactsCountWrongEmails',
      'contactsCountNotPresentEmails',
    ],
  };

  const requiredFields = fields[type].map((field) => {
    if (type === 'lead' && LeadSaleTypes.values().includes(dataType)) {
      return `${field}${LeadSaleTypes.getAcronym(dataType)}` || field;
    }
    if (type === 'unsatisfied' && dataType && DataTypes.getAcronymPartial(dataType)) {
      return `${field}${DataTypes.getAcronymPartial(dataType)}` || field;
    }
    if (type === 'satisfaction' && dataType && DataTypes.getAcronymPartial(dataType)) {
      return `${field}${DataTypes.getAcronymPartial(dataType)}` || field;
    }
    if (type === 'contacts' && dataType && DataTypes.getAcronymPartial(dataType)) {
      return `${field}${DataTypes.getAcronymPartial(dataType)}` || field;
    }
    return field;
  });

  return requiredFields.reduce((acc, cv) => {
    acc[cv] = KpiDictionary[cv];
    return acc;
  }, {});
}

function buildGroup(fields = {}) {
  const group = {
    _id: '$4',
  };
  for (const key in fields) {
    group[key] = { $sum: `$${fields[key]}` };
  }
  return group;
}

function buildAddFields(fields = {}, baseDenominator = '', excludeList = []) {
  const $pct = (num, den) => ({ $cond: [{ $ne: [den, 0] }, { $divide: [num, den] }, null] });
  const res = {};
  for (const key in fields) {
    /* dont add Percent for all fields */
    if (key !== baseDenominator && !excludeList.includes(key)) {
      res[`${key}Percent`] = $pct(`$${key}`, `$${baseDenominator}`);
    }
  }
  return res;
}

function buildProjection(fields = {}, baseDenominator = '') {
  const res = {
    _id: 0,
    period: '$_id',
  };
  for (const key in fields) {
    res[key] = 1;
    /* dont add Percent for baseDenominator */
    if (key !== baseDenominator) {
      res[`${key}Percent`] = 1;
    }
  }

  return res;
}

module.exports.typeDef = `
  extend type Query {
    ${queries.kpiByPeriodGetChartData.type}: ${typePrefix}
  }
  type ${typePrefix} {
    lead: ${typePrefix}Lead
    unsatisfied: ${typePrefix}Unsatisfied
    satisfaction: ${typePrefix}Satisfaction
    contacts: ${typePrefix}Contacts
    ereputation: ${typePrefix}Ereputation
    automation: ${typePrefix}Automation
  }
  type ${typePrefix}Lead {
    data : [${typePrefix}LeadData]
  },
  type ${typePrefix}Unsatisfied {
    data : [${typePrefix}UnsatisfiedData]
  },
  type ${typePrefix}Satisfaction {
    data : [${typePrefix}SatisfactionData]
  },
  type ${typePrefix}Contacts {
    data : [${typePrefix}ContactsData]
  },
  type ${typePrefix}Ereputation {
    data : [${typePrefix}EreputationData]
  },
  type ${typePrefix}Automation {
    data : [${typePrefix}AutomationData]
  },
  type ${typePrefix}LeadData {
    period: Int

    countLeadsUntouchedPercent: Float
    countLeadsUntouchedPercentApv: Float
    countLeadsUntouchedPercentVn: Float
    countLeadsUntouchedPercentVo: Float
    countLeadsUntouchedPercentUnknown: Float

    countLeadsTouchedPercent: Float
    countLeadsTouchedPercentApv: Float
    countLeadsTouchedPercentVn: Float
    countLeadsTouchedPercentVo: Float
    countLeadsTouchedPercentUnknown: Float

    countLeadsClosedWithSalePercent: Float
    countLeadsClosedWithSalePercentApv: Float
    countLeadsClosedWithSalePercentVn: Float
    countLeadsClosedWithSalePercentVo: Float
    countLeadsClosedWithSalePercentUnknown: Float
  },
  type ${typePrefix}UnsatisfiedData {
    period: Int

    countUnsatisfiedUntouchedPercent: Float
    countUnsatisfiedUntouchedPercentApv: Float
    countUnsatisfiedUntouchedPercentVn: Float
    countUnsatisfiedUntouchedPercentVo: Float

    countUnsatisfiedTouchedPercent: Float
    countUnsatisfiedTouchedPercentApv: Float
    countUnsatisfiedTouchedPercentVn: Float
    countUnsatisfiedTouchedPercentVo: Float

    countUnsatisfiedClosedWithResolutionPercent: Float
    countUnsatisfiedClosedWithResolutionPercentApv: Float
    countUnsatisfiedClosedWithResolutionPercentVn: Float
    countUnsatisfiedClosedWithResolutionPercentVo: Float
  },
  type ${typePrefix}SatisfactionData {
    period: Int
    satisfactionCountReviews: Int

    satisfactionNPS: Float
    satisfactionNPSApv: Float
    satisfactionNPSVn: Float
    satisfactionNPSVo: Float

    satisfactionCountPromotersPercent: Float
    satisfactionCountPromotersPercentApv: Float
    satisfactionCountPromotersPercentVn: Float
    satisfactionCountPromotersPercentVo: Float

    satisfactionCountDetractorsPercent: Float
    satisfactionCountDetractorsPercentApv: Float
    satisfactionCountDetractorsPercentVn: Float
    satisfactionCountDetractorsPercentVo: Float

  },
  type ${typePrefix}ContactsData {
    period: Int

    respondentsPercent: Float
    respondentsPercentApv: Float
    respondentsPercentVn: Float
    respondentsPercentVo: Float

    validEmailsPercent: Float
    validEmailsPercentApv: Float
    validEmailsPercentVn: Float
    validEmailsPercentVo: Float

    unreachablesPercent: Float
    unreachablesPercentApv: Float
    unreachablesPercentVn: Float
    unreachablesPercentVo: Float
  },
  type ${typePrefix}EreputationData {
    period: Int
    erepRatingGaragescore: Float
    erepRatingGoogle: Float
    erepRatingPagesJaunes: Float
    erepRatingFacebook: Float
  },
  type ${typePrefix}AutomationData {
    period: Int
    countSent : Int
    countOpened: Int
    countConverted: Int
    countLeadSales: Int
  }
`;

module.exports.resolvers = {
  Query: {
    [typePrefix]: async (obj, args, context) => {
      try {
        const {
          app,
          hasMore,
          scope: { logged, authenticationError, user, godMode, garageIds: userGarageIds },
        } = context;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }

        return {
          lead: { args },
          unsatisfied: { args },
          satisfaction: { args },
          contacts: { args },
          ereputation: { args },
          automation: { args },
        };
      } catch (error) {
        log.error(MOMO, error);
        return error;
      }
    },
  },
  [`${typePrefix}Lead`]: {
    data: async ({ args }, _, { app, scope: { user, garageIds: userGarageIds, godMode } }) => {
      const { periodId, cockpitType, kpiType, garageId, dataType } = args;
      let { userId: selectedUserId } = args;
      const mongoConnector = app.models.KpiByPeriod.getMongoConnector();
      const userId = user.id;
      const isManager = godMode || (await user.isManager());

      if (isManager && selectedUserId) {
        selectedUserId = new ObjectId(selectedUserId.toString());
      } else if (!isManager) {
        selectedUserId = userId;
      }
      /* we use the same match builder as KpiByPeriod query to avoid someone forgetting to also update this query */
      const $match = buildMatchkpiByPeriod(
        kpiType,
        godMode,
        cockpitType,
        periodId,
        selectedUserId,
        garageId,
        userGarageIds
      );
      const periods = fromGhPeriodToChartKpiPeriods(periodId);
      $match[KpiDictionary.period] = { $in: periods };

      const fields = getKpiFields(dataType, 'lead');
      const $group = buildGroup(fields);
      const suffix = dataType ? LeadSaleTypes.getAcronym(dataType) : '';
      const $addFields = {
        ...computePercentKeys([
          `countLeadsUntouchedPercent${suffix}`,
          `countLeadsTouchedPercent${suffix}`,
          `countLeadsClosedWithSalePercent${suffix}`,
        ]),
      };
      const $project = {
        _id: 0,
        period: '$_id',
        [`countLeadsUntouchedPercent${suffix}`]: 1,
        [`countLeadsTouchedPercent${suffix}`]: 1,
        [`countLeadsClosedWithSalePercent${suffix}`]: 1,
      };
      const $sort = {
        period: 1,
      };
      const aggregate = [{ $match }, { $group }, { $addFields }, { $project }, { $sort }];
      const res = await mongoConnector.aggregate(aggregate).toArray();

      return res;
    },
  },
  [`${typePrefix}Unsatisfied`]: {
    data: async ({ args }, _, { app, scope: { user, garageIds: userGarageIds, godMode } }) => {
      const { periodId, cockpitType, kpiType, garageId, dataType } = args;
      let { userId: selectedUserId } = args;
      const mongoConnector = app.models.KpiByPeriod.getMongoConnector();

      const userId = user.id;
      const isManager = godMode || (await user.isManager());

      if (isManager && selectedUserId) {
        selectedUserId = new ObjectId(selectedUserId.toString());
      } else if (!isManager) {
        selectedUserId = userId;
      }
      /* we use the same match builder as KpiByPeriod query to avoid someone forgetting to also update this query */
      const $match = buildMatchkpiByPeriod(
        kpiType,
        godMode,
        cockpitType,
        periodId,
        selectedUserId,
        garageId,
        userGarageIds
      );
      const periods = fromGhPeriodToChartKpiPeriods(periodId);
      $match[KpiDictionary.period] = { $in: periods };
      const fields = getKpiFields(dataType, 'unsatisfied');
      const $group = buildGroup(fields);
      const suffix = dataType ? DataTypes.getAcronymPartial(dataType) : '';
      const $addFields = {
        ...computePercentKeys([
          `countUnsatisfiedUntouchedPercent${suffix}`,
          `countUnsatisfiedTouchedPercent${suffix}`,
          `countUnsatisfiedClosedWithResolutionPercent${suffix}`,
        ]),
      };
      const $project = {
        _id: 0,
        period: '$_id',
        [`countUnsatisfiedUntouchedPercent${suffix}`]: 1,
        [`countUnsatisfiedTouchedPercent${suffix}`]: 1,
        [`countUnsatisfiedClosedWithResolutionPercent${suffix}`]: 1,
      };
      const $sort = {
        period: 1,
      };
      const aggregate = [{ $match }, { $group }, { $addFields }, { $project }, { $sort }];

      const res = await mongoConnector.aggregate(aggregate).toArray();

      return res;
    },
  },
  // garageHistory
  [`${typePrefix}Satisfaction`]: {
    data: async ({ args }, _, { app, scope: { user, garageIds: userGarageIds, godMode } }) => {
      const { periodId, garageId, cockpitType, kpiType, dataType, frontDeskUserName } = args;
      let { userId: selectedUserId } = args;
      const userId = user.id;
      const isManager = godMode || (await user.isManager());

      if (isManager && selectedUserId) {
        selectedUserId = new ObjectId(selectedUserId.toString());
      } else if (!isManager) {
        selectedUserId = userId;
      }
      const $match = buildMatchkpiByPeriod(
        kpiType,
        godMode,
        cockpitType,
        periodId,
        selectedUserId,
        garageId,
        userGarageIds
      );
      const periods = fromGhPeriodToChartKpiPeriods(periodId);
      $match[KpiDictionary.period] = { $in: periods };
      $match[KpiDictionary.userId] = frontDeskUserName || 'ALL_USERS';
      KpiEncoder.encodeObject($match);

      const fields = getKpiFields(dataType, 'satisfaction');
      const $group = buildGroup(fields);
      const suffix = dataType ? DataTypes.getAcronymPartial(dataType) : '';

      const $addFields = {
        ...computePercentKeys([
          `satisfactionCountPromotersPercent${suffix}`,
          `satisfactionCountDetractorsPercent${suffix}`,
        ]),
      };
      const $project = {
        _id: 0,
        period: '$_id',
        [`satisfactionNPS${suffix}`]: {
          $subtract: [`$satisfactionCountPromotersPercent${suffix}`, `$satisfactionCountDetractorsPercent${suffix}`],
        },
        [`satisfactionCountPromotersPercent${suffix}`]: 1,
        [`satisfactionCountDetractorsPercent${suffix}`]: 1,
      };

      const $sort = { period: 1 };

      const mongoConnector = app.models.KpiByPeriod.getMongoConnector();
      const res = await mongoConnector
        .aggregate([{ $match }, { $group }, { $addFields }, { $project }, { $sort }])
        .toArray();

      return res;
    },
  },
  [`${typePrefix}Contacts`]: {
    data: async ({ args }, _, { app, scope: { user, garageIds: userGarageIds, godMode } }) => {
      const { periodId, garageId, cockpitType, kpiType, dataType, frontDeskUserName } = args;
      let { userId: selectedUserId } = args;
      const userId = user.id;
      const isManager = godMode || (await user.isManager());

      if (isManager && selectedUserId) {
        selectedUserId = new ObjectId(selectedUserId.toString());
      } else if (!isManager) {
        selectedUserId = userId;
      }
      const $match = buildMatchkpiByPeriod(
        kpiType,
        godMode,
        cockpitType,
        periodId,
        selectedUserId,
        garageId,
        userGarageIds
      );
      const periods = fromGhPeriodToChartKpiPeriods(periodId);
      $match[KpiDictionary.period] = { $in: periods };
      $match[KpiDictionary.userId] = frontDeskUserName || 'ALL_USERS';
      KpiEncoder.encodeObject($match);
      const fields = getKpiFields(dataType, 'contacts');
      const $group = buildGroup(fields);
      const suffix = dataType ? DataTypes.getAcronymPartial(dataType) : '';
      const $addFields = {
        ...computePercentKeys([
          `respondentsPercent${suffix}`,
          `validEmailsPercent${suffix}`,
          `unreachablesPercent${suffix}`,
        ]),
      };
      const $project = {
        _id: 0,
        period: '$_id',
        [`respondentsPercent${suffix}`]: 1,
        [`validEmailsPercent${suffix}`]: 1,
        [`unreachablesPercent${suffix}`]: 1,
      };
      const $sort = { period: 1 };

      const aggregate = [{ $match }, { $group }, { $addFields }, { $project }, { $sort }];
      const mongoConnector = app.models.KpiByPeriod.getMongoConnector();
      const res = await mongoConnector.aggregate(aggregate).toArray();
      return res;
    },
  },
  [`${typePrefix}Ereputation`]: {
    data: async ({ args }, _, { app, scope: { garageIds, godMode } }) => {
      const { periodId, cockpitType, garageId } = args;
      const mongoConnector = app.models.KpiByPeriod.getMongoConnector();
      //match
      const $match = {};
      // filter by cockpit type
      if (cockpitType) {
        const garageTypesToMatch = GarageTypes.getGarageTypesFromCockpitType(cockpitType || GarageTypes.DEALERSHIP);
        $match[KpiDictionary.garageType] =
          garageTypesToMatch.length === 1
            ? GarageTypes.getIntegerVersion(cockpitType)
            : {
                $in: garageTypesToMatch.map((t) => GarageTypes.getIntegerVersion(t)),
              };
      }
      // filter by garageId
      if (garageId) {
        $match[KpiDictionary.garageId] = Array.isArray(garageId)
          ? { $in: garageId.map((id) => new ObjectId(id)) }
          : new ObjectId(garageId);
      } else if (godMode && !cockpitType) {
        const garageTypesToMatch = GarageTypes.getGarageTypesFromCockpitType(GarageTypes.DEALERSHIP);
        $match[KpiDictionary.garageType] =
          garageTypesToMatch.length === 1
            ? GarageTypes.getIntegerVersion(cockpitType)
            : {
                $in: garageTypesToMatch.map((t) => GarageTypes.getIntegerVersion(t)),
              };
      } else if (!godMode) {
        $match[KpiDictionary.garageId] = {
          $in: garageIds.map((id) => new ObjectId(id)),
        };
      }
      // periods
      const periods = fromGhPeriodToChartKpiPeriods(periodId);
      $match[KpiDictionary.period] = { $in: periods };

      const $group = {
        _id: '$4',
        [KpiDictionary.erepSumRating]: { $sum: `$${KpiDictionary.erepSumRating}` },
        [KpiDictionary.erepCountHasRating]: { $sum: `$${KpiDictionary.erepCountHasRating}` },
        [KpiDictionary.erepSumRatingGoogle]: { $sum: `$${KpiDictionary.erepSumRatingGoogle}` },
        [KpiDictionary.erepCountHasRatingGoogle]: { $sum: `$${KpiDictionary.erepCountHasRatingGoogle}` },
        [KpiDictionary.erepSumRatingPagesJaunes]: { $sum: `$${KpiDictionary.erepSumRatingPagesJaunes}` },
        [KpiDictionary.erepCountHasRatingPagesJaunes]: { $sum: `$${KpiDictionary.erepCountHasRatingPagesJaunes}` },
        [KpiDictionary.erepCountRecommendFacebook]: { $sum: `$${KpiDictionary.erepCountRecommendFacebook}` },
        [KpiDictionary.erepCountReviewsFacebook]: { $sum: `$${KpiDictionary.erepCountReviewsFacebook}` },
      };

      // projection
      const $project = {
        _id: 0,
        period: '$_id',
        erepRatingGaragescore: m_divide(
          `$${KpiDictionary['erepSumRating']}`,
          `$${KpiDictionary['erepCountHasRating']}`
        ),
        erepRatingGoogle: m_divide(
          `$${KpiDictionary['erepSumRatingGoogle']}`,
          `$${KpiDictionary['erepCountHasRatingGoogle']}`
        ),
        erepRatingFacebook: m_divide(
          `$${KpiDictionary['erepCountRecommendFacebook']}`,
          `$${KpiDictionary['erepCountReviewsFacebook']}`
        ),
        erepRatingPagesJaunes: m_divide(
          `$${KpiDictionary['erepSumRatingPagesJaunes']}`,
          `$${KpiDictionary['erepCountHasRatingPagesJaunes']}`
        ),
      };

      const $sort = {
        period: 1,
      };
      return mongoConnector.aggregate([{ $match }, { $group }, { $project }, { $sort }]).toArray();
    },
  },
  [`${typePrefix}Automation`]: {
    data: async ({ args }, _, { app, scope: { garageIds, godMode } }) => {
      const { periodId, garageId, campaignType, cockpitType } = args;
      const mongoConnector = app.models.KpiByPeriod.getMongoConnector();

      const $match = {
        [KpiDictionary.kpiType]: KpiTypes.GARAGE_KPI,
      };

      // filter by cockpit type
      if (cockpitType) {
        const garageTypesToMatch = GarageTypes.getGarageTypesFromCockpitType(cockpitType || GarageTypes.DEALERSHIP);
        $match[KpiDictionary.garageType] =
          garageTypesToMatch.length === 1
            ? GarageTypes.getIntegerVersion(cockpitType)
            : { $in: garageTypesToMatch.map((t) => GarageTypes.getIntegerVersion(t)) };
      }
      // filter by garageId
      if (garageId) {
        $match[KpiDictionary.garageId] = Array.isArray(garageId)
          ? { $in: garageId.map((id) => new ObjectId(id)) }
          : new ObjectId(garageId);
      } else if (godMode && !cockpitType) {
        const garageTypesToMatch = GarageTypes.getGarageTypesFromCockpitType(GarageTypes.DEALERSHIP);
        $match[KpiDictionary.garageType] =
          garageTypesToMatch.length === 1
            ? GarageTypes.getIntegerVersion(cockpitType)
            : { $in: garageTypesToMatch.map((t) => GarageTypes.getIntegerVersion(t)) };
      } else if (!godMode) {
        $match[KpiDictionary.garageId] = {
          $in: garageIds.map((id) => new ObjectId(id)),
        };
      }

      // periods
      const periods = fromGhPeriodToChartKpiPeriods(periodId);
      $match[KpiDictionary.period] = { $in: periods };

      // project only necessary fields
      const $project = {
        [KpiDictionary.period]: true,
        ...(campaignType === CampaignTypes.AUTOMATION_MAINTENANCE || !campaignType
          ? {
              [KpiDictionary.KPI_automationCountSentMaintenances]: true,
              [KpiDictionary.KPI_automationCountOpenedMaintenances]: true,
              [KpiDictionary.KPI_automationCountConvertedMaintenances]: true,
              [KpiDictionary.KPI_automationCountLeadMaintenances]: true,
            }
          : {}),
        ...(campaignType === CampaignTypes.AUTOMATION_VEHICLE_SALE || !campaignType
          ? {
              [KpiDictionary.KPI_automationCountSentSales]: true,
              [KpiDictionary.KPI_automationCountOpenedSales]: true,
              [KpiDictionary.KPI_automationCountConvertedSales]: true,
              [KpiDictionary.KPI_automationCountLeadSales]: true,
            }
          : {}),
      };

      const $group = {
        _id: '$4',
        KPI_automationCountSentMaintenances: {
          $sum: { $ifNull: [`$${KpiDictionary.KPI_automationCountSentMaintenances}`, 0] },
        },
        KPI_automationCountOpenedMaintenances: {
          $sum: { $ifNull: [`$${KpiDictionary.KPI_automationCountOpenedMaintenances}`, 0] },
        },
        KPI_automationCountConvertedMaintenances: {
          $sum: { $ifNull: [`$${KpiDictionary.KPI_automationCountConvertedMaintenances}`, 0] },
        },
        KPI_automationCountSentSales: {
          $sum: { $ifNull: [`$${KpiDictionary.KPI_automationCountSentSales}`, 0] },
        },
        KPI_automationCountOpenedSales: {
          $sum: { $ifNull: [`$${KpiDictionary.KPI_automationCountOpenedSales}`, 0] },
        },
        KPI_automationCountConvertedSales: {
          $sum: { $ifNull: [`$${KpiDictionary.KPI_automationCountConvertedSales}`, 0] },
        },
        KPI_automationCountLeadMaintenances: {
          $sum: { $ifNull: [`$${KpiDictionary.KPI_automationCountLeadMaintenances}`, 0] },
        },
        KPI_automationCountLeadSales: {
          $sum: { $ifNull: [`$${KpiDictionary.KPI_automationCountLeadSales}`, 0] },
        },
      };

      //compute necessary fields
      const $project2 = {
        _id: 0,
        period: '$_id',
        countSent: {
          $add: [
            { $ifNull: ['$KPI_automationCountSentMaintenances', 0] },
            { $ifNull: ['$KPI_automationCountSentSales', 0] },
          ],
        },
        countOpened: {
          $add: [
            { $ifNull: ['$KPI_automationCountOpenedMaintenances', 0] },
            { $ifNull: ['$KPI_automationCountOpenedSales', 0] },
          ],
        },
        countConverted: {
          $add: [
            { $ifNull: ['$KPI_automationCountConvertedMaintenances', 0] },
            { $ifNull: ['$KPI_automationCountConvertedSales', 0] },
          ],
        },
        countLeadSales: {
          $add: [
            { $ifNull: ['$KPI_automationCountLeadMaintenances', 0] },
            { $ifNull: ['$KPI_automationCountLeadSales', 0] },
          ],
        },
      };

      const $sort = { period: 1 };

      const res = await mongoConnector
        .aggregate([{ $match }, { $project }, { $group }, { $project: $project2 }, { $sort }])
        .toArray();

      return res;
    },
  },
};
