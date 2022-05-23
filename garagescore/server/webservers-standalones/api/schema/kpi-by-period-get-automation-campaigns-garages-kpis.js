const { ObjectId } = require('mongodb');
const { AuthenticationError } = require('apollo-server-express');
const queries = require('../../../../frontend/api/graphql/definitions/queries.json');
const AutomationCampaignTypes = require('../../../../common/models/automation-campaign.type');
const GarageTypes = require('../../../../common/models/garage.type');
const GarageSubscriptionTypes = require('../../../../common/models/garage.subscription.type');
const KpiDictionary = require('../../../../common/lib/garagescore/kpi/KpiDictionary');
const KpiPeriods = require('../../../../common/lib/garagescore/kpi/KpiPeriods');
const KpiTypes = require('../../../../common/models/kpi-type');
const { searchGarages } = require('../_common/search-garages');
const { ANASS, log } = require('../../../../common/lib/util/log');
const AutomationCampaignChannel = require('../../../../common/models/automation-campaign-channel.type');
const { isSubscribed } = require('../../../../common/models/garage/garage-methods');
const { AutomationCampaignStatuses } = require('../../../../frontend/utils/enumV2');
const { isGarageScoreUserByEmail } = require('../../../../common/lib/garagescore/custeed-users');
const {
  getSubscriptionsHistoryPrice,
  periodRange,
  checkLastToggledDate,
  checkIsConsolidate,
} = require('../../../../common/lib/garagescore/cockpit-exports/queries/query-common-automation');

const typePrefix = 'kpiByPeriodGetAutomationCampaignsGaragesKpis';

const getGarages = async (app, garageIds, cockpitType, garageFields) => {
  return app.models.Garage.getMongoConnector()
    .find({
      _id: { $in: garageIds.map((gId) => ObjectId(gId.toString())) },
      type: { $in: cockpitType },
    })
    .project(garageFields)
    .toArray();
};

const countCampaignsByGarage = async (app, garageIds, type) => {
  const $match = {
    garageId: { $in: garageIds.map((gId) => ObjectId(gId.toString())) },
    hidden: false,
    type,
    contactType: AutomationCampaignChannel.EMAIL,
  };
  const $project = {
    garageId: true,
    status: true,
    running: {
      $cond: { if: { $eq: ['$status', AutomationCampaignStatuses.RUNNING] }, then: 1, else: 0 },
    },
    firstRunDayNumber: true,
    lastToggledDate: true,
  };
  const $group = {
    _id: '$garageId',
    automationCountCampaigns: { $sum: 1 },
    automationRunningCampaigns: {
      $sum: '$running',
    },
    firstRunDayNumber: { $push: '$firstRunDayNumber' },
    lastToggled: { $push: { date: '$lastToggledDate', status: '$status' } },
  };

  const campaigns = await app.models.AutomationCampaign.getMongoConnector()
    .aggregate([{ $match }, { $project }, { $group }])
    .toArray();

  const result = {};
  for (const campaign of campaigns) {
    result[campaign._id.toString()] = campaign;
  }

  return result;
};

const getKpi = async (app, aggregate) => {
  const kpis = await app.models.KpiByPeriod.getMongoConnector().aggregate(aggregate).toArray();
  const result = {};
  for (const kpi of kpis) {
    result[kpi._id.toString()] = kpi;
  }
  return result;
};

module.exports.typeDef = `
  extend type Query {
    ${queries.AutomationGaragesList.type}: [${typePrefix}AutomationGaragesList]
  }
  type ${typePrefix}AutomationGaragesList {
    garageSlug: String,
    hideDirectoryPage: Boolean,
    garageId: String,
    externalId: String,
    garagePublicDisplayName: String,
    garageHasSubscription: Boolean,
    automationCountCampaigns: Int,
    KPI_automationCountSentMaintenances: Int,
    KPI_automationCountOpenedMaintenances: Int,
    KPI_automationCountConvertedMaintenances: Int,
    KPI_automationCountSentSales: Int,
    KPI_automationCountConvertedSales: Int,
    KPI_automationCountLeadSales: Int,
    KPI_automationCountConverted: Int,
    automationCountRunningCampaigns: Int,
    automationCost: Float,
    isConsolidate: Boolean,
    isLastToggledDate: Boolean,
    contactCost: Float,
  }
`;
module.exports.resolvers = {
  Query: {
    AutomationGaragesList: async (obj, args, context) => {
      try {
        const { cockpitType, period, type, garageId, search, orderBy, order, limit, skip } = args;
        const { app } = context;
        const { logged, authenticationError, user } = context.scope;
        let { garageIds } = context.scope;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }
        // TODO: add automationCost
        const garageTypesToMatch = GarageTypes.getGarageTypesFromCockpitType(cockpitType || GarageTypes.DEALERSHIP);
        // Preparing cockpit type filter
        const getGarageTypeFilter = () => {
          return garageTypesToMatch.length === 1
            ? GarageTypes.getIntegerVersion(cockpitType)
            : { $in: garageTypesToMatch.map((t) => GarageTypes.getIntegerVersion(t)) };
        };
        const garageTypesFilter = getGarageTypeFilter();

        if (search) {
          const foundGarageIds = await searchGarages(app, search, garageIds);
          if (foundGarageIds) {
            garageIds = [...foundGarageIds];
          }
        }
        if (garageId) {
          garageIds = garageId;
        }

        const periods = KpiPeriods.fromGhPeriodToKpiPeriod(period, { convertToMonthlyList: true });
        const getPeriodFilter = () => {
          return Array.isArray(periods) ? { $in: periods } : periods;
        };
        // As per the training we had concerning Mongo, I ordered the queried fields so as $in is mostly in first positions (with probabilities)
        const $match = {
          // filter by cockpit type
          ...(garageTypesFilter ? { [KpiDictionary.garageType]: garageTypesFilter } : {}),
          [KpiDictionary.garageId]: { $in: garageIds.map((gId) => ObjectId(gId)) },
          [KpiDictionary.period]: getPeriodFilter(),
          // filters specific to this query
          [KpiDictionary.kpiType]: KpiTypes.AUTOMATION_CAMPAIGN_KPI,
          $or: [
            { [KpiDictionary.KPI_automationCountTargetedMaintenances]: { $gt: 0 } },
            { [KpiDictionary.KPI_automationCountTargetedSales]: { $gt: 0 } },
          ],
        };

        // project only necessary fields
        const $project = {
          [KpiDictionary.garageId]: true,
          [KpiDictionary.automationCampaignId]: true,
          ...(type === AutomationCampaignTypes.AUTOMATION_MAINTENANCE || !type
            ? {
                [KpiDictionary.KPI_automationCountTargetedMaintenances]: true,
                [KpiDictionary.KPI_automationCountSentMaintenances]: true,
                [KpiDictionary.KPI_automationCountOpenedMaintenances]: true,
                [KpiDictionary.KPI_automationCountConvertedMaintenances]: true,
              }
            : {}),
          ...(type === AutomationCampaignTypes.AUTOMATION_VEHICLE_SALE || !type
            ? {
                [KpiDictionary.KPI_automationCountTargetedSales]: true,
                [KpiDictionary.KPI_automationCountSentSales]: true,
                [KpiDictionary.KPI_automationCountConvertedSales]: true,
                [KpiDictionary.KPI_automationCountLeadSales]: true,
              }
            : {}),
        };

        const $group = {
          _id: `$${KpiDictionary.garageId}`,
          KPI_automationCountTargetedMaintenances: {
            $sum: `$${KpiDictionary.KPI_automationCountTargetedMaintenances}`,
          },
          KPI_automationCountSentMaintenances: {
            $sum: `$${KpiDictionary.KPI_automationCountSentMaintenances}`,
          },
          KPI_automationCountOpenedMaintenances: {
            $sum: `$${KpiDictionary.KPI_automationCountOpenedMaintenances}`,
          },
          KPI_automationCountConvertedMaintenances: {
            $sum: `$${KpiDictionary.KPI_automationCountConvertedMaintenances}`,
          },
          KPI_automationCountTargetedSales: {
            $sum: `$${KpiDictionary.KPI_automationCountTargetedSales}`,
          },
          KPI_automationCountSentSales: {
            $sum: `$${KpiDictionary.KPI_automationCountSentSales}`,
          },
          KPI_automationCountConvertedSales: {
            $sum: `$${KpiDictionary.KPI_automationCountConvertedSales}`,
          },
          KPI_automationCountLeadSales: {
            $sum: `$${KpiDictionary.KPI_automationCountLeadSales}`,
          },
          ...(type === AutomationCampaignTypes.AUTOMATION_MAINTENANCE || !type
            ? { KPI_automationCountConverted: { $sum: `$${KpiDictionary.KPI_automationCountConvertedMaintenances}` } }
            : { KPI_automationCountConverted: { $sum: `$${KpiDictionary.KPI_automationCountConvertedSales}` } }),
        };

        const $project2 = {
          KPI_automationCountSentMaintenances: true,
          KPI_automationCountOpenedMaintenances: true,
          KPI_automationCountConvertedMaintenances: true,
          KPI_automationCountSentSales: true,
          KPI_automationCountConvertedSales: true,
          KPI_automationCountLeadSales: true,
          KPI_automationCountConverted: true,
        };
        // our aggregate for Kpis
        const $skip = skip;
        const aggregate = [{ $match }, { $project }, { $group }, { $project: $project2 }, { $skip }];

        const garageFields = {
          _id: 1,
          slug: 1,
          hideDirectoryPage: 1,
          publicDisplayName: 1,
          'subscriptions.Automation': 1,
          'subscriptions.active': 1,
          subscriptionsHistory: 1,
        };

        const [kpis, garages, campaigns] = await Promise.all([
          getKpi(app, aggregate),
          getGarages(app, garageIds, garageTypesToMatch, garageFields),
          countCampaignsByGarage(app, garageIds, type),
        ]);
        const { lte } = periodRange(periods);
        const campaignType = type === AutomationCampaignTypes.AUTOMATION_MAINTENANCE ? 'Maintenances' : 'Sales';
        // remove isGarageScoreUser later when the feature is available for our customer
        const isGarageScoreUser = !!isGarageScoreUserByEmail(user.email);

        return garages
          .map((garage) => {
            const kpi = kpis[garage._id.toString()];
            const campaign = campaigns[garage._id.toString()];
            // Formula Apv : (targeted customers * contact cost) / nb of conversions
            // Formula Sales : (targeted customers * contact cost) / nb of leads
            const contactCost = isGarageScoreUser ? getSubscriptionsHistoryPrice(garage, lte) : 0;
            const targetedCustomers = (kpi && kpi[`KPI_automationCountSent${campaignType}`]) || 0;
            const divisor =
              type === AutomationCampaignTypes.AUTOMATION_MAINTENANCE
                ? (kpi && kpi.KPI_automationCountConverted) || 1
                : (kpi && kpi.KPI_automationCountLeadSales) || 1;
            const automationCost = isGarageScoreUser ? (targetedCustomers * contactCost) / divisor : 0;
            const isConsolidate = isGarageScoreUser ? checkIsConsolidate(campaign) : false;
            const isLastToggledDate = isGarageScoreUser ? checkLastToggledDate(campaign) : false;
            const hasAutomation = isSubscribed(garage.subscriptions, GarageSubscriptionTypes.AUTOMATION);
            return {
              ...kpi,
              ...{
                garageId: garage._id.toString(),
                garageSlug: garage.slug || '',
                hideDirectoryPage: garage.hideDirectoryPage || false,
                garagePublicDisplayName: garage.publicDisplayName || '',
                garageHasSubscription: hasAutomation || false,
                automationCountCampaigns: (hasAutomation && campaign && campaign.automationCountCampaigns) || 0,
                automationCountRunningCampaigns:
                  (hasAutomation && campaign && campaign.automationRunningCampaigns) || 0,
                automationCost,
                isConsolidate,
                isLastToggledDate,
                contactCost,
              },
            };
          })
          .sort((a, b) => {
            const bValue = b[orderBy] || 0;
            const aValue = a[orderBy] || 0;
            if (order === 'DESC') return bValue - aValue;
            return aValue - bValue;
          })
          .slice(skip, skip + limit);
      } catch (error1) {
        log.error(ANASS, error1);
        return [];
      }
    },
  },
};
