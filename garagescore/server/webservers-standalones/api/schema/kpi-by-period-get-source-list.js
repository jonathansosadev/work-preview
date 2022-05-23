/**
 * Query KPIs source list, aggregate created by Simon/keysim
 */
const { ObjectID } = require('mongodb');
const { AuthenticationError } = require('apollo-server-express');
const queries = require('../../../../frontend/api/graphql/definitions/queries.json');
const DataTypes = require('../../../../common/models/data/type/data-types');
const GarageTypes = require('../../../../common/models/garage.type');
const KpiTypes = require('../../../../common/models/kpi-type');
const kpiDictionary = require('../../../../common/lib/garagescore/kpi/KpiDictionary');
const kpiPeriod = require('../../../../common/lib/garagescore/kpi/KpiPeriods');
const SourceTypes = require('../../../../common/models/data/type/source-types.js');
const { SIMON, log } = require('../../../../common/lib/util/log');

const suffixes = {
  [DataTypes.MAINTENANCE]: 'Apv',
  [DataTypes.NEW_VEHICLE_SALE]: 'Vn',
  [DataTypes.USED_VEHICLE_SALE]: 'Vo',
  [DataTypes.UNKNOWN]: 'Unknown',
};

const $t = (key) => `$${kpiDictionary[key]}`;
const $pct = (keyA, keyB) => ({
  $cond: { if: { $gt: [keyA, 0] }, then: { $multiply: [{ $divide: [keyA, keyB] }, 100] }, else: null },
});
const typePrefix = 'kpiByPeriodSourceList';

module.exports.typeDef = `
  extend type Query {
    ${queries.kpiByPeriodSourceList.type}: [${typePrefix}SourceList]
  }
  type ${typePrefix}SourceList {
    sourceType: String
    countLeads: Int
    countLeadsUntouched: Int
    countLeadsTouched: Int
    countLeadsClosedWithSale: Int
    countLeadsReactive: Int
  }`;

module.exports.resolvers = {
  Query: {
    kpiByPeriodSourceList: async (obj, args, context) => {
      try {
        const {
          app,
          scope: { logged, authenticationError, user },
        } = context;
        const { periodId, cockpitType, garageId, leadSaleType, sort, order } = args;
        const supportedSortKeys = [
          'countLeads',
          'countLeadsUntouchedPercent',
          'countLeadsTouchedPercent',
          'countLeadsClosedWithSalePercent',
          'countLeadsReactivePercent',
        ];
        if (!supportedSortKeys.includes(sort)) {
          return Promise.reject(new Error(`Can't sort by ${sort}`));
        }
        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }

        const suffix = suffixes[leadSaleType] || '';
        const { garageIds } = user;
        const period = kpiPeriod.fromGhPeriodToKpiPeriod(periodId, { convertToMonthlyList: true });
        const mongo = app.models.KpiByPeriod.getMongoConnector();

        let garagesIdsTemp = garageIds;
        if (garageId && garageId.length > 0){
          garagesIdsTemp = garageId.map(garage=>new ObjectID(garage.toString()));  
        }

        const garageTypesToMatch = GarageTypes.getGarageTypesFromCockpitType(cockpitType || GarageTypes.DEALERSHIP);
        const query = [
          {
            $match: {
              [kpiDictionary.period]: Array.isArray(period) ? { $in: period } : period,
              [kpiDictionary.kpiType]: KpiTypes.SOURCE_KPI,
              [kpiDictionary.garageId]: { $in: garagesIdsTemp },
              [kpiDictionary.garageType]:
                garageTypesToMatch.length === 1
                  ? GarageTypes.getIntegerVersion(cockpitType)
                  : { $in: garageTypesToMatch.map((t) => GarageTypes.getIntegerVersion(t)) },
            },
          },
          {
            $group: {
              _id: $t('sourceType'), // Group by sourceType
              sourceType: { $first: $t('sourceType') },
              countLeads: { $sum: $t(`countLeads${suffix}`) },
              countLeadsUntouched: { $sum: $t(`countLeadsUntouched${suffix}`) },
              countLeadsTouched: { $sum: $t(`countLeadsTouched${suffix}`) },
              countLeadsClosedWithSale: { $sum: $t(`countLeadsClosedWithSale${suffix}`) },
              countLeadsReactive: { $sum: $t(`countLeadsReactive${suffix}`) },
            },
          },
          {
            $project: {
              sourceType: '$sourceType',
              countLeads: '$countLeads',
              countLeadsUntouched: '$countLeadsUntouched',
              countLeadsTouched: '$countLeadsTouched',
              countLeadsClosedWithSale: '$countLeadsClosedWithSale',
              countLeadsReactive: '$countLeadsReactive',
              countLeadsUntouchedPercent: $pct('$countLeadsUntouched', '$countLeads'),
              countLeadsTouchedPercent: $pct('$countLeadsTouched', '$countLeads'),
              countLeadsClosedWithSalePercent: $pct('$countLeadsClosedWithSale', '$countLeads'),
              countLeadsReactivePercent: $pct('$countLeadsReactive', '$countLeads'),
            },
          },
          {
            $sort: { [sort]: order === 'DESC' ? -1 : 1 }, // Percent doesn't use dico
          },
        ];
        // Getting Aggregation Result Directly From MongoDB
        const sourceList = await mongo.aggregate(query).toArray();
        // eslint-disable-next-line no-restricted-syntax
        /*
        for (const source of sourceList) {
          source.sourceType = SourceTypes.intToType(source.sourceType || 0); // set sourceType to real value
        }
        */
        return sourceList.filter((s) => s.countLeads);
      } catch (error) {
        log.error(SIMON, error);
        return error;
      }
    },
  },
};
