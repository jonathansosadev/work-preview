const { ObjectID } = require('mongodb');
const GarageTypes = require('../../../models/garage.type');
const KpiTypes = require('../../../models/kpi-type');
const kpiPeriod = require('./KpiPeriods');
const kpiEncoder = require('./KpiEncoder');

// ./kpi.js and ./list.js target the same documents in DB using aggregation pipelines
// this build the first $match used in both pipelines
async function match(
  kpiType,
  isGodLike,
  cockpitType,
  periodId,
  selectedUserId,
  selectedGarageId,
  garageIds,
  interface
) {
  // Periods
  let kpiPeriods = kpiPeriod.fromGhPeriodToKpiPeriod(periodId, { convertToMonthlyList: true });
  if (kpiPeriods.length > 12) {
    // When we got more than 12 periods it means ALL_HISTORY, i.e. all except LAST_90_DAYS
    kpiPeriods = { $ne: kpiPeriod.LAST_90_DAYS };
  }
  const period = Array.isArray(kpiPeriods) ? { $in: kpiPeriods } : kpiPeriods;

  // cockpitType
  const garageTypesToMatch = GarageTypes.getGarageTypesFromCockpitType(cockpitType || GarageTypes.DEALERSHIP);
  const garageType =
    garageTypesToMatch.length === 1
      ? GarageTypes.getIntegerVersion(cockpitType)
      : { $in: garageTypesToMatch.map((t) => GarageTypes.getIntegerVersion(t)) };

  let garageId;
  let allGargesAvailable = Array.from(garageIds).map((e) => e.toString());
  if(Array.isArray(selectedGarageId) && selectedGarageId.length > 0 && selectedGarageId.every(element => { return allGargesAvailable.includes(element) })) {
    garageId = { $in: selectedGarageId.map((g) => new ObjectID(g)) };
  } else if (selectedGarageId && garageIds.map((e) => e.toString()).includes(selectedGarageId)) {
    garageId = new ObjectID(selectedGarageId.toString());
  } else if (!isGodLike) {
    garageId = { $in: garageIds.map((g) => new ObjectID(g)) };
  }

  const $match = {
    kpiType,
    garageType,
    period,
    ...(garageId ? { garageId } : {}),
    ...(kpiType === KpiTypes.USER_KPI && selectedUserId ? { userId: selectedUserId } : {}),
    ...(interface === 'lead' ? { countLeads: { $gt: 0 } } : {}),
    ...(interface === 'unsatisfied' ? { countUnsatisfied: { $gt: 0 } } : {}),
  };

  kpiEncoder.encodeObject($match);
  return $match;
}

module.exports = { $match: match };
