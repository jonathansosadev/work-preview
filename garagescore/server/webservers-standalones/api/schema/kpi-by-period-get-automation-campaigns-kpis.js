const { ObjectId } = require('mongodb');
const { AuthenticationError } = require('apollo-server-express');
const queries = require('../../../../frontend/api/graphql/definitions/queries.json');
const GarageTypes = require('../../../../common/models/garage.type');
const GarageHistoryPeriods = require('../../../../common/models/garage-history.period');
const KpiDictionary = require('../../../../common/lib/garagescore/kpi/KpiDictionary');
const KpiTypes = require('../../../../common/models/kpi-type');
const KpiPeriods = require('../../../../common/lib/garagescore/kpi/KpiPeriods');
const AutomationCampaignTypes = require('../../../../common/models/automation-campaign.type');
const { BANG, log } = require('../../../../common/lib/util/log');
const { AutomationCampaignTargets } = require('../../../../frontend/utils/enumV2');
const { isGarageScoreUserByEmail } = require('../../../../common/lib/garagescore/custeed-users');
const {
  getAverageContactPrice,
  periodRange,
  getGarages,
  checkLastToggledDate,
  checkIsConsolidate,
} = require('../../../../common/lib/garagescore/cockpit-exports/queries/query-common-automation');

const typePrefix = 'automationCampaignGetAutomationCampaigns';
module.exports.typeDef = `
  extend type Query {
    ${queries.AutomationCampaignsList.type}: [${typePrefix}AutomationCampaignsList]
  }
  type ${typePrefix}AutomationCampaignsList {
    _id: String,
    campaignId: String,
    garageId: String,
    KPI_automationTotalConverted: Int,
    KPI_automationTotalOpened: Int,
    KPI_automationTotalLead: Int,
    KPI_automationTotalSent: Int,
    KPI_automationCountSentEmail: Int,
    KPI_automationCountSentSms: Int,
    KPI_automationCountOpenedEmail: Int,
    KPI_automationCountOpenedSms: Int,
    KPI_automationCountConvertedEmail: Int,
    KPI_automationCountConvertedSms: Int,
    KPI_automationCountLeadEmail: Int,
    KPI_automationCountLeadSms: Int,
    runningEmail: Int,
    runningSms: Int,
    idleEmail: Int,
    idleSms: Int,
    totalCampaignsEmail: Int,
    totalCampaignsSms: Int,
    automationCost: Float,
    isConsolidate: Boolean,
    isLastToggledDate: Boolean,
    averageContactCost: Float,
  }
`;
/**
 *
 * @param {String} status like RUNNING or IDLE
 * @param {String} contactType like MOBILE or EMAIL
 * @returns object
 */
const createCampaignCond = (status, contactType) => {
  return {
    if: { $and: [{ $eq: ['$status', status] }, { $eq: ['$contactType', contactType] }] },
    then: 1,
    else: 0,
  };
};
/**
 *
 * @param {Function} app function use by mongo
 * @param {Array} garageIds array of garageIds
 * @returns Array
 */
const getCampaigns = (app, garageIds) => {
  const aggregate = [
    {
      $match: {
        garageId: {
          $in: garageIds.map((id) => ObjectId(id.toString())),
        },
        hidden: false,
      },
    },
    {
      $project: {
        '_id:': true,
        target: true,
        status: true,
        contactType: true,
        firstRunDayNumber: true,
        lastToggledDate: true,
        runningEmail: {
          $cond: createCampaignCond('RUNNING', 'EMAIL'),
        },
        runningSms: {
          $cond: createCampaignCond('RUNNING', 'MOBILE'),
        },
        idleEmail: {
          $cond: createCampaignCond('IDLE', 'EMAIL'),
        },
        idleSms: {
          $cond: createCampaignCond('IDLE', 'MOBILE'),
        },
        totalCampaignsEmail: {
          $cond: {
            if: {
              $and: [
                { $or: [{ $eq: ['$status', 'IDLE'] }, { $eq: ['$status', 'RUNNING'] }] },
                { $eq: ['$contactType', 'EMAIL'] },
              ],
            },
            then: 1,
            else: 0,
          },
        },
        totalCampaignsSms: {
          $cond: {
            if: {
              $and: [
                { $or: [{ $eq: ['$status', 'IDLE'] }, { $eq: ['$status', 'RUNNING'] }] },
                { $eq: ['$contactType', 'MOBILE'] },
              ],
            },
            then: 1,
            else: 0,
          },
        },
      },
    },
    {
      $group: {
        _id: '$target',
        runningEmail: { $sum: '$runningEmail' },
        runningSms: { $sum: '$runningSms' },
        idleEmail: { $sum: '$idleEmail' },
        idleSms: { $sum: '$idleSms' },
        totalCampaignsEmail: { $sum: '$totalCampaignsEmail' },
        totalCampaignsSms: { $sum: '$totalCampaignsSms' },
        firstRunDayNumber: { $push: '$firstRunDayNumber' },
        lastToggled: { $push: { date: '$lastToggledDate', status: '$status' } },
      },
    },
  ];

  return app.models.AutomationCampaign.getMongoConnector().aggregate(aggregate).toArray();
};
/**
 *
 * @param {"EMAIL" | "MOBILE"} contactType EMAIL or MOBILE
 * @param {String} kpiName like KpiDictionary.KPI_automationCountTargetedSales
 * @returns {{if : object, then : string, else : 0}} object with if statement for mongo aggregate $cond: { if: {...}, then: {...}, else: {...} }
 */
const createKpiCond = (contactType, kpiName) => {
  return {
    if: { $eq: ['$campaign.contactType', contactType] },
    then: '$' + kpiName,
    else: 0,
  };
};
/**
 *
 * @param {String} type enum like AUTOMATION_MAINTENANCE
 * @param {Array} garageIds array of garageIds
 * @param {Number} kpiType like AUTOMATION_CAMPAIGN_KPI: 30
 * @param {Array} kpiPeriods array of number
 * @returns
 */
const buildAggregate = (type, garageIds, kpiType, kpiPeriods, cockpitType) => {
  const garageTypesToMatch = GarageTypes.getGarageTypesFromCockpitType(cockpitType || GarageTypes.DEALERSHIP);
  const aggregate = [
    {
      $match: {
        [KpiDictionary.garageId]: { $in: garageIds.map((id) => ObjectId(id.toString())) },
        [KpiDictionary.garageType]: { $in: garageTypesToMatch.map((t) => GarageTypes.getIntegerVersion(t)) },
        [KpiDictionary.kpiType]: kpiType,
        [KpiDictionary.period]: Array.isArray(kpiPeriods) ? { $in: kpiPeriods } : kpiPeriods,
      },
    },
    {
      $project: {
        [KpiDictionary.garageId]: true,
        [KpiDictionary.automationCampaignId]: true,
        [KpiDictionary.KPI_automationCountTargetedSales]: true,
        [KpiDictionary.KPI_automationCountTargetedMaintenances]: true,
        [KpiDictionary.KPI_automationCountSentSales]: true,
        [KpiDictionary.KPI_automationCountSentMaintenances]: true,
        [KpiDictionary.KPI_automationCountOpenedSales]: true,
        [KpiDictionary.KPI_automationCountOpenedMaintenances]: true,
        [KpiDictionary.KPI_automationCountConvertedSales]: true,
        [KpiDictionary.KPI_automationCountConvertedMaintenances]: true,
        [KpiDictionary.KPI_automationCountLeadSales]: true,
        [KpiDictionary.KPI_automationCountLeadMaintenances]: true,
      },
    },
    {
      $lookup: {
        from: 'automationCampaign',
        localField: `${KpiDictionary.automationCampaignId}`,
        foreignField: '_id',
        as: 'campaign',
      },
    },
    {
      $unwind: '$campaign',
    },
    {
      $project: {
        campaignId: '$' + KpiDictionary.automationCampaignId,
        garageId: '$' + KpiDictionary.garageId,
        contactType: '$campaign.contactType',
        target: '$campaign.target',
        KPI_automationTotalConvertedSales: '$' + KpiDictionary.KPI_automationCountConvertedSales,
        KPI_automationTotalConvertedMaintenances: '$' + KpiDictionary.KPI_automationCountConvertedMaintenances,
        KPI_automationTotalOpenedSales: '$' + KpiDictionary.KPI_automationCountOpenedSales,
        KPI_automationTotalOpenedMaintenances: '$' + KpiDictionary.KPI_automationCountOpenedMaintenances,
        KPI_automationCountLeadSales: '$' + KpiDictionary.KPI_automationCountLeadSales,
        KPI_automationTotalSendSales: '$' + KpiDictionary.KPI_automationCountSentSales,
        KPI_automationTotalSentMaintenances: '$' + KpiDictionary.KPI_automationCountSentMaintenances,
        KPI_automationCountSentSalesEmail: {
          $cond: createKpiCond('EMAIL', KpiDictionary.KPI_automationCountSentSales),
        },
        KPI_automationCountSentSalesSms: {
          $cond: createKpiCond('MOBILE', KpiDictionary.KPI_automationCountSentSales),
        },
        KPI_automationCountSentMaintenancesEmail: {
          $cond: createKpiCond('EMAIL', KpiDictionary.KPI_automationCountSentMaintenances),
        },
        KPI_automationCountSentMaintenancesSms: {
          $cond: createKpiCond('MOBILE', KpiDictionary.KPI_automationCountSentMaintenances),
        },
        KPI_automationCountOpenedSalesEmail: {
          $cond: createKpiCond('EMAIL', KpiDictionary.KPI_automationCountOpenedSales),
        },
        KPI_automationCountOpenedSalesSms: {
          $cond: createKpiCond('MOBILE', KpiDictionary.KPI_automationCountOpenedSales),
        },
        KPI_automationCountOpenedMaintenancesEmail: {
          $cond: createKpiCond('EMAIL', KpiDictionary.KPI_automationCountOpenedMaintenances),
        },
        KPI_automationCountOpenedMaintenancesSms: {
          $cond: createKpiCond('MOBILE', KpiDictionary.KPI_automationCountOpenedMaintenances),
        },
        KPI_automationCountConvertedSalesEmail: {
          $cond: createKpiCond('EMAIL', KpiDictionary.KPI_automationCountConvertedSales),
        },
        KPI_automationCountConvertedSalesSms: {
          $cond: createKpiCond('MOBILE', KpiDictionary.KPI_automationCountConvertedSales),
        },
        KPI_automationCountConvertedMaintenancesEmail: {
          $cond: createKpiCond('EMAIL', KpiDictionary.KPI_automationCountConvertedMaintenances),
        },
        KPI_automationCountConvertedMaintenancesSms: {
          $cond: createKpiCond('MOBILE', KpiDictionary.KPI_automationCountConvertedMaintenances),
        },
        KPI_automationCountLeadSalesEmail: {
          $cond: createKpiCond('EMAIL', KpiDictionary.KPI_automationCountLeadSales),
        },
        KPI_automationCountLeadSalesSms: {
          $cond: createKpiCond('MOBILE', KpiDictionary.KPI_automationCountLeadSales),
        },
        KPI_automationCountLeadMaintenancesEmail: {
          $cond: createKpiCond('EMAIL', KpiDictionary.KPI_automationCountLeadMaintenances),
        },
        KPI_automationCountLeadMaintenancesSms: {
          $cond: createKpiCond('MOBILE', KpiDictionary.KPI_automationCountLeadMaintenances),
        },
      },
    },
  ];
  if (type === AutomationCampaignTypes.AUTOMATION_MAINTENANCE) {
    return [
      ...aggregate,
      {
        $group: {
          _id: '$target',
          campaignId: { $first: '$campaignId' },
          garageId: { $first: '$garageId' },
          KPI_automationTotalConverted: { $sum: '$KPI_automationTotalConvertedMaintenances' },
          KPI_automationTotalOpened: { $sum: '$KPI_automationTotalOpenedMaintenances' },
          KPI_automationTotalSent: { $sum: '$KPI_automationTotalSentMaintenances' },
          KPI_automationCountSentEmail: { $sum: '$KPI_automationCountSentMaintenancesEmail' },
          KPI_automationCountSentSms: { $sum: '$KPI_automationCountSentMaintenancesSms' },
          KPI_automationCountOpenedEmail: { $sum: '$KPI_automationCountOpenedMaintenancesEmail' },
          KPI_automationCountOpenedSms: { $sum: '$KPI_automationCountOpenedMaintenancesSms' },
          KPI_automationCountConvertedEmail: { $sum: '$KPI_automationCountConvertedMaintenancesEmail' },
          KPI_automationCountConvertedSms: { $sum: '$KPI_automationCountConvertedMaintenancesSms' },
          KPI_automationCountLeadEmail: { $sum: '$KPI_automationCountLeadMaintenancesEmail' },
          KPI_automationCountLeadSms: { $sum: '$KPI_automationCountLeadMaintenancesSms' },
        },
      },
    ];
  }
  return [
    ...aggregate,
    {
      $group: {
        _id: '$target',
        campaignId: { $first: '$campaignId' },
        garageId: { $first: '$garageId' },
        KPI_automationTotalConverted: { $sum: '$KPI_automationTotalConvertedSales' },
        KPI_automationTotalOpened: { $sum: '$KPI_automationTotalOpenedSales' },
        KPI_automationTotalLead: { $sum: '$KPI_automationCountLeadSales' },
        KPI_automationTotalSent: { $sum: '$KPI_automationTotalSendSales' },
        KPI_automationCountSentEmail: { $sum: '$KPI_automationCountSentSalesEmail' },
        KPI_automationCountSentSms: { $sum: '$KPI_automationCountSentSalesSms' },
        KPI_automationCountOpenedEmail: { $sum: '$KPI_automationCountOpenedSalesEmail' },
        KPI_automationCountOpenedSms: { $sum: '$KPI_automationCountOpenedSalesSms' },
        KPI_automationCountConvertedEmail: { $sum: '$KPI_automationCountConvertedSalesEmail' },
        KPI_automationCountConvertedSms: { $sum: '$KPI_automationCountConvertedSalesSms' },
        KPI_automationCountLeadEmail: { $sum: '$KPI_automationCountLeadSalesEmail' },
        KPI_automationCountLeadSms: { $sum: '$KPI_automationCountLeadSalesSms' },
      },
    },
  ];
};

const getAutomationKpi = (app, aggregate) => {
  return app.models.KpiByPeriod.getMongoConnector().aggregate(aggregate).toArray();
};

const searchGarage = (app, search, garageIds) => {
  const regExp = new RegExp(search, 'i');
  return app.models.Garage.getMongoConnector()
    .aggregate([
      {
        $match: {
          _id: { $in: garageIds.map((id) => ObjectId(id.toString())) },
        },
      },
      {
        $match: { publicDisplayName: regExp },
      },
      {
        $project: { _id: true },
      },
    ])
    .toArray();
};

module.exports.resolvers = {
  Query: {
    AutomationCampaignsList: async (obj, args, context) => {
      try {
        const {
          cockpitType = GarageTypes.DEALERSHIP,
          period = GarageHistoryPeriods.LAST_QUARTER,
          type,
          garageId,
          search,
          orderBy,
          order,
        } = args;
        const { app } = context;
        const { logged, authenticationError, user } = context.scope;
        let { garageIds } = context.scope;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }
        if (search) {
          const results = await searchGarage(app, search, garageIds);
          garageIds = (results && results.map(({ _id }) => _id)) || [];
        }

        const garagesIdsList = garageId ? garageId : garageIds;
        const kpiPeriods = KpiPeriods.fromGhPeriodToKpiPeriod(period, { convertToMonthlyList: true });
        const aggregate = buildAggregate(
          type,
          garagesIdsList,
          KpiTypes.AUTOMATION_CAMPAIGN_KPI,
          kpiPeriods,
          cockpitType
        );

        const [resultCampaigns, resutKpi, garages] = await Promise.all([
          getCampaigns(app, garagesIdsList),
          getAutomationKpi(app, aggregate),
          getGarages(app, garagesIdsList),
        ]);
        const { lte } = periodRange(kpiPeriods);
        // remove isGarageScoreUser later when the feature is available for our customer
        // large scope disable tooltip consolidate for custeed user
        const isLargeScope = garagesIdsList.length > 100;
        const isGarageScoreUser = !!isGarageScoreUserByEmail(user.email);
        const averageContactCost = isGarageScoreUser ? getAverageContactPrice(garages, lte) : 0;
        // resultCampaigns should alwais have a result,
        // resutKpi result could be null when the campaign are never active or run
        return resultCampaigns
          .filter((result) => type === AutomationCampaignTargets.getPropertyFromValue(result._id, 'leadDataType'))
          .map((result) => {
            const kpi = resutKpi.find(({ _id }) => _id === result._id);
            // Formula : (targeted customers * average contact cost) / nb of conversions
            const targetedCustomers = (kpi && kpi.KPI_automationTotalSent) || 0;
            const divisor =
              type === AutomationCampaignTypes.AUTOMATION_MAINTENANCE
                ? (kpi && kpi.KPI_automationTotalConverted) || 1
                : (kpi && kpi.KPI_automationTotalLead) || 1;
            const automationCost = isGarageScoreUser ? (targetedCustomers * averageContactCost) / divisor : 0;
            const isConsolidate = isGarageScoreUser ? checkIsConsolidate(result) : false;
            const isLastToggledDate = isGarageScoreUser ? checkLastToggledDate(result) : false;
            return {
              ...result,
              ...kpi,
              automationCost,
              isConsolidate: isLargeScope && isGarageScoreUser ? false : isConsolidate,
              isLastToggledDate,
              averageContactCost: isGarageScoreUser ? parseFloat(averageContactCost.toFixed(2)) : 0,
            };
          })
          .sort((a, b) => {
            const bValue = b[orderBy] || 0;
            const aValue = a[orderBy] || 0;
            if (order === 'DESC') return bValue - aValue;
            return aValue - bValue;
          });
      } catch (error1) {
        log.error(BANG, error1);
        return [];
      }
    },
  },
};
