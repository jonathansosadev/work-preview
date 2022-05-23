/* eslint-disable no-restricted-syntax */
const ObjectId = require('mongodb').ObjectId;
const dataTypes = require('../../../models/data/type/data-types');
const leadTradInTypes = require('../../../models/data/type/lead-trade-in-types');
const SourceTypes = require('../../../models/data/type/source-types');
const timeHelper = require('../../util/time-helper');
const leadTypes = require('../../../models/data/type/lead-types');
const garageTypes = require('../../../models/garage.type');

const KpiPeriods = require('../kpi/KpiPeriods');
const KpiTypes = require('../../../models/kpi-type');
const KpiDictionary = require('../kpi/KpiDictionary');
const { GaragesTest } = require('../../../../frontend/utils/enumV2');
const { CLOSED_WITH_SALE } = require('../../../models/data/type/lead-ticket-status');


// Reset conversion related KPIs
async function resetKpis(app) {
  const filter = {};
  const updates = KpiDictionary.conversionKeys.reduce((res, readableKey) => {
    if (KpiDictionary[readableKey]) {
      res[KpiDictionary[readableKey]] = '';
    }
    return res;
  }, {});
  // Only unsetting conversion related fields, that way we preserve other KPIs
  const byPeriodRes = await app.models.KpiByPeriod.getMongoConnector().updateMany(filter, { $unset: updates });
  console.log(`Reseted conversion keys in ${byPeriodRes.modifiedCount} KPI entities`);
}

function incrementKeys(kpiObj, leadType, keyPrefix, keySuffix) {
  kpiObj[`${keyPrefix}`] = ++kpiObj[`${keyPrefix}`] || 1;
  kpiObj[`${keyPrefix}${keySuffix}`] = ++kpiObj[`${keyPrefix}${keySuffix}`] || 1;
  if ([leadTypes.INTERESTED, leadTypes.OBLIGATION_AND_RENEWAL, leadTypes.SELLING_WITH_RENEWAL].includes(leadType)) {
    kpiObj[`${keyPrefix}NewProjects`] = ++kpiObj[`${keyPrefix}NewProjects`] || 1;
    kpiObj[`${keyPrefix}NewProjects${keySuffix}`] = ++kpiObj[`${keyPrefix}NewProjects${keySuffix}`] || 1;
  }
  if (
    [
      leadTypes.ALREADY_PLANNED,
      leadTypes.IN_CONTACT_WITH_VENDOR,
      leadTypes.OBLIGATION_AND_IN_CONTACT_WITH_VENDOR,
    ].includes(leadType)
  ) {
    kpiObj[`${keyPrefix}KnownProjects`] = ++kpiObj[`${keyPrefix}KnownProjects`] || 1;
    kpiObj[`${keyPrefix}KnownProjects${keySuffix}`] = ++kpiObj[`${keyPrefix}KnownProjects${keySuffix}`] || 1;
  }
  if ([leadTypes.ALREADY_PLANNED_OTHER_BUSINESS].includes(leadType)) {
    kpiObj[`${keyPrefix}WonFromCompetition`] = ++kpiObj[`${keyPrefix}WonFromCompetition`] || 1;
    kpiObj[`${keyPrefix}WonFromCompetition${keySuffix}`] = ++kpiObj[`${keyPrefix}WonFromCompetition${keySuffix}`] || 1;
  }
}

// For each conversion detected we run this function that increments the corresponding KPI fields
// Structure of my KPI object:  kpis --> garageId --> periodToken --> kpiField (eg. countConvertedLeads)
function incrementKPIs(kpis, sale, conversion, isTradeIn) {
  const keyPrefix = isTradeIn ? 'countConvertedTradeIns' : 'countConvertedLeads';
  const keySuffix = sale.type === dataTypes.NEW_VEHICLE_SALE ? 'Vn' : 'Vo';
  const affectedPeriods = KpiPeriods.getPeriodsAffectedByGivenDate(sale.service.providedAt);
  const leadType = isTradeIn ? conversion.tradeInSourceType : conversion.leadSourceType;
  const userId = isTradeIn ? conversion.tradeInSourceManagerId : conversion.leadSourceManagerId;

  affectedPeriods.forEach((period) => {
    kpis.byPeriod[sale.garageId] = kpis.byPeriod[sale.garageId] || {};
    kpis.byPeriod[sale.garageId][period.token] = kpis.byPeriod[sale.garageId][period.token] || {};
    if (userId && userId !== null && userId !== 'undefined') {
      kpis.byUser[sale.garageId] = kpis.byUser[sale.garageId] || {};
      kpis.byUser[sale.garageId][userId] = kpis.byUser[sale.garageId][userId] || {};
      kpis.byUser[sale.garageId][userId][period.token] = kpis.byUser[sale.garageId][userId][period.token] || {};
    }
    const garageKpiObj = kpis.byPeriod[sale.garageId][period.token];
    incrementKeys(garageKpiObj, leadType, keyPrefix, keySuffix);
    if (userId && userId !== null && userId !== 'undefined') {
      const userKpiObj = kpis.byUser[sale.garageId][userId][period.token];
      incrementKeys(userKpiObj, leadType, keyPrefix, keySuffix);
    }
  });
}

// Saving the KPIs we've just computed. Bulk save so as to save time
async function saveKPIs(app, garageKpis, userKpis) {
  const bulk = await app.models.KpiByPeriod.getMongoConnector().initializeUnorderedBulkOp();

  const garages = await app.models.Garage.getMongoConnector().find({});
  const garageTypeByGarageId = {};
  while (await garages.hasNext()) {
    const garage = await garages.next();
    garageTypeByGarageId[garage._id.toString()] = garageTypes.getIntegerVersion(garage.type);
  }

  Object.keys(garageKpis).forEach((garageId) => {
    Object.keys(garageKpis[garageId]).forEach((period) => {
      const filter = {};
      filter[KpiDictionary.garageId] = ObjectId(garageId); // eslint-disable-line
      filter[KpiDictionary.garageType] = garageTypeByGarageId[garageId];
      filter[KpiDictionary.period] = parseInt(period, 10);
      filter[KpiDictionary.kpiType] = KpiTypes.GARAGE_KPI;
      const update = Object.keys(garageKpis[garageId][period]).reduce((res, readableKey) => {
        if (KpiDictionary[readableKey]) {
          // Translating our readable keys (countConvertedLeads) to the key actually stored (2010)
          res[KpiDictionary[readableKey]] = garageKpis[garageId][period][readableKey];
        }
        return res;
      }, {});

      bulk.find(filter).upsert().updateOne({ $set: update });
    });
  });

  Object.keys(userKpis).forEach((garageId) => {
    Object.keys(userKpis[garageId]).forEach((userId) => {
      Object.keys(userKpis[garageId][userId]).forEach((period) => {
        if (
          [
            'UNDEFINED',
            'null',
            'a renseigner',
            'collaborateur',
            'a identifier ***',
            '* non precise',
            '0',
            ',',
            '0.00',
            '\\u0000',
            '.*** a affecter',
            '.',
            'autre',
            'autres',
            'divers',
          ].includes(userId)
        )
          return;
        const filter = {};
        filter[KpiDictionary.garageId] = ObjectId(garageId); // eslint-disable-line
        filter[KpiDictionary.garageType] = garageTypeByGarageId[garageId];
        filter[KpiDictionary.userId] = userId; // ObjectId(userId); // eslint-disable-line
        filter[KpiDictionary.period] = parseInt(period, 10);
        filter[KpiDictionary.kpiType] = KpiTypes.FRONT_DESK_USER_KPI;
        const update = Object.keys(userKpis[garageId][userId][period]).reduce((res, readableKey) => {
          if (KpiDictionary[readableKey]) {
            // Translating our readable keys (countConvertedLeads) to the key actually stored (2010)
            res[KpiDictionary[readableKey]] = userKpis[garageId][userId][period][readableKey];
          }
          return res;
        }, {});

        bulk.find(filter).upsert().updateOne({ $set: update });
      });
    });
  });
  if (bulk && bulk.length) {
    await bulk.execute();
  }
}

module.exports = {
  incrementKPIs,
  resetKpis,
  saveKPIs
}