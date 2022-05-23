const MongoObjectID = require('mongodb').ObjectID;
const { AuthenticationError } = require('apollo-server-express');
const queries = require('../../../../frontend/api/graphql/definitions/queries.json');
const GarageTypes = require('../../../../common/models/garage.type');
const CampaignTypes = require('../../../../common/models/automation-campaign.type');
const KpiDictionary = require('../../../../common/lib/garagescore/kpi/KpiDictionary');
const KpiPeriods = require('../../../../common/lib/garagescore/kpi/KpiPeriods');
const KpiEncoder = require('../../../../common/lib/garagescore/kpi/KpiEncoder');
const KpiTypes = require('../../../../common/models/kpi-type');

const typePrefix = 'automationCampaignGetKpis';
module.exports.typeDef = `
  extend type Query {
    ${queries.AutomationKpis.type}: ${typePrefix}AutomationKpis
  }
  type ${typePrefix}AutomationKpis {
    KPI_automationCountSentMaintenances: Int,
    KPI_automationCountOpenedMaintenances: Int,
    KPI_automationCountConvertedMaintenances: Int,
    KPI_automationCountCrossedMaintenances: Int,
    KPI_automationCountSentSales: Int,
    KPI_automationCountConvertedSales: Int,
    KPI_automationCountCrossedSales: Int,
    KPI_automationCountLeadSales: Int,
  }
`;
module.exports.resolvers = {
  Query: {
    AutomationKpis: async (obj, args, context) => {
      const { period, garageId, cockpitType, type } = args;
      const { app } = context;
      const { logged, authenticationError, garageIds, godMode } = context.scope;

      if (!logged) {
        throw new AuthenticationError(authenticationError);
      }

      const $match = {
        [KpiDictionary.kpiType]: KpiTypes.AUTOMATION_CAMPAIGN_KPI,
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
        $match[KpiDictionary.garageId] = (
          garageId.length === 1 ?
            new MongoObjectID(garageId[0]) :
            { $in: garageId.map((id) => new MongoObjectID(id)) }
        )
      } else if (godMode && !cockpitType) {
        const garageTypesToMatch = GarageTypes.getGarageTypesFromCockpitType(GarageTypes.DEALERSHIP);
        $match[KpiDictionary.garageType] =
          garageTypesToMatch.length === 1
            ? GarageTypes.getIntegerVersion(cockpitType)
            : { $in: garageTypesToMatch.map((t) => GarageTypes.getIntegerVersion(t)) };
      } else if (!godMode) {
        $match[KpiDictionary.garageId] = {
          $in: garageIds.map((id) => new MongoObjectID(id)),
        };
      }
      // filter by period
      if (period) {
        const periods = KpiPeriods.fromGhPeriodToKpiPeriod(period, { convertToMonthlyList: true });
        if (Array.isArray(periods)) {
          $match[KpiDictionary.period] = { $in: periods };
        } else {
          $match[KpiDictionary.period] = periods;
        }
      }

      // project only necessary fields
      const $project = {
        ...(type === CampaignTypes.AUTOMATION_MAINTENANCE || !type
          ? {
              [KpiDictionary.KPI_automationCountSentMaintenances]: true,
              [KpiDictionary.KPI_automationCountOpenedMaintenances]: true,
              [KpiDictionary.KPI_automationCountConvertedMaintenances]: true,
              [KpiDictionary.KPI_automationCountCrossedMaintenances]: true,
            }
          : {}),
        ...(type === CampaignTypes.AUTOMATION_VEHICLE_SALE || !type
          ? {
              [KpiDictionary.KPI_automationCountSentSales]: true,
              [KpiDictionary.KPI_automationCountConvertedSales]: true,
              [KpiDictionary.KPI_automationCountCrossedSales]: true,
              [KpiDictionary.KPI_automationCountLeadSales]: true,
            }
          : {}),
      };

      const $group = {
        _id: 'ALL',
        KPI_automationCountSentMaintenances: {
          $sum: `$${KpiDictionary.KPI_automationCountSentMaintenances}`,
        },
        KPI_automationCountOpenedMaintenances: {
          $sum: `$${KpiDictionary.KPI_automationCountOpenedMaintenances}`,
        },
        KPI_automationCountConvertedMaintenances: {
          $sum: `$${KpiDictionary.KPI_automationCountConvertedMaintenances}`,
        },
        KPI_automationCountCrossedMaintenances: {
          $sum: `$${KpiDictionary.KPI_automationCountCrossedMaintenances}`,
        },
        KPI_automationCountSentSales: {
          $sum: `$${KpiDictionary.KPI_automationCountSentSales}`,
        },
        KPI_automationCountConvertedSales: {
          $sum: `$${KpiDictionary.KPI_automationCountConvertedSales}`,
        },
        KPI_automationCountCrossedSales: {
          $sum: `$${KpiDictionary.KPI_automationCountCrossedSales}`,
        },
        KPI_automationCountLeadSales: {
          $sum: `$${KpiDictionary.KPI_automationCountLeadSales}`,
        },
      };

      // our aggregate
      const result = await app.models.KpiByPeriod.getMongoConnector()
        .aggregate([{ $match }, { $project }, { $group }])
        .toArray();

      return result[0] || {};
    },
  },
};
