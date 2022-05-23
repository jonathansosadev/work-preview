const KpiPeriod = require('../../../../common/lib/garagescore/kpi/KpiPeriods');
const kpiEncoder = require('../../../../common/lib/garagescore/kpi/KpiEncoder');
const GarageTypes = require('../../../../common/models/garage.type');
const KpiTypes = require('../../../../common/models/kpi-type');
const { ObjectID } = require('mongodb');
const KpiDictionary = require('../../../../common/lib/garagescore/kpi/KpiDictionary');

const $t = (key) => `$${KpiDictionary[key]}`;
const $sum = (f) => ({ $sum: $t(f) });
const sumSuffixedKeys = (keys, suffix = '') =>
  Object.fromEntries(keys.map((key) => [key + suffix, $sum(key + suffix)]));

const $groups = (garageOrUser) => {
  let leadsKeys = [
    'countLeads',
    'countLeadsUntouched',
    'countLeadsTouched',
    'countLeadsClosedWithSale',
    'countLeadsUnassigned',
    'countLeadsAssigned',
    'countLeadsWaitingForContact',
    'countLeadsContactPlanned',
    'countLeadsWaitingForMeeting',
    'countLeadsMeetingPlanned',
    'countLeadsWaitingForProposition',
    'countLeadsPropositionPlanned',
    'countLeadsWaitingForClosing',
    'countLeadsClosedWithoutSale',
  ];
  let unsatisfiedKeys = [
    'countUnsatisfiedUntouched',
    'countUnsatisfied',
    'countUnsatisfiedTouched',
    'countUnsatisfiedClosedWithResolution',
    'countUnsatisfiedTouchedClosed',
    'countUnsatisfiedOpenUnassigned',
    'countUnsatisfiedAssigned',
    'countUnsatisfiedWaitingForContact',
    'countUnsatisfiedContactPlanned',
    'countUnsatisfiedWaitingForVisit',
    'countUnsatisfiedVisitPlanned',
    'countUnsatisfiedWaitingForClosing',
    'countUnsatisfiedClosedWithoutResolution',
  ];
  if (garageOrUser === 'garage') {
    leadsKeys = ['countLeads', 'countLeadsUntouched', 'countLeadsTouched', 'countLeadsClosedWithSale'];
    unsatisfiedKeys = [
      'countUnsatisfiedUntouched',
      'countUnsatisfied',
      'countUnsatisfiedTouched',
      'countUnsatisfiedClosedWithResolution',
      'countUnsatisfiedTouchedClosed',
    ];
  }
  return {
    _id: 1,
    // leads
    ...sumSuffixedKeys(leadsKeys),
    ...sumSuffixedKeys(leadsKeys, 'Apv'),
    ...sumSuffixedKeys(leadsKeys, 'Vn'),
    ...sumSuffixedKeys(leadsKeys, 'Vo'),
    ...sumSuffixedKeys(leadsKeys, 'Unknown'),
    // unsat
    ...sumSuffixedKeys(unsatisfiedKeys),
    ...sumSuffixedKeys(unsatisfiedKeys, 'Apv'),
    ...sumSuffixedKeys(unsatisfiedKeys, 'Vn'),
    ...sumSuffixedKeys(unsatisfiedKeys, 'Vo'),
  };
};

function match(kpiType, isGodLike, cockpitType, periodId, selectedUserId, requestGarageIds, userGarageIds) {
  let periods = KpiPeriod.fromGhPeriodToKpiPeriod(periodId, { convertToMonthlyList: true });
  if (periods.length > 12) {
    // not sure it's really an optimisation (use of $ne), we should store LAST_90_DAYS in another collection
    periods = { $ne: KpiPeriod.LAST_90_DAYS };
  }
  // kpiType, userid and requestGarageIds
  const $match = {};
  $match.kpiType = kpiType;
  if (kpiType === KpiTypes.USER_KPI && selectedUserId) {
    $match.userId = selectedUserId;
  }

  let allGaragesAvailable = Array.from(userGarageIds).map((e) => e.toString());
  if (
    Array.isArray(requestGarageIds) &&
    requestGarageIds.length > 0 &&
    requestGarageIds.every((element) => {
      return allGaragesAvailable.includes(element);
    })
  ) {
    if (requestGarageIds.length === 1) {
      $match.garageId = new ObjectID(requestGarageIds[0].toString());
    } else {
      $match.garageId = { $in: requestGarageIds.map((g) => new ObjectID(g)) };
    }
  } else if (requestGarageIds && userGarageIds.map((e) => e.toString()).includes(requestGarageIds)) {
    if (requestGarageIds.length <= 1) {
      $match.garageId = new ObjectID(requestGarageIds[0].toString());
    } else {
      $match.garageId = { $in: requestGarageIds.map((g) => new ObjectID(g)) };
    }
  } else {
    $match.garageId = { $in: userGarageIds.map((g) => new ObjectID(g)) };
  }
  // godmode === avoid $in
  if (isGodLike && !requestGarageIds) {
    delete $match.garageId;
  }
  if (isGodLike && !selectedUserId) {
    delete $match.userId;
  }
  // cockpitType
  const garageTypesToMatch = GarageTypes.getGarageTypesFromCockpitType(cockpitType || GarageTypes.DEALERSHIP);
  $match.garageType =
    garageTypesToMatch.length === 1
      ? GarageTypes.getIntegerVersion(cockpitType)
      : { $in: garageTypesToMatch.map((t) => GarageTypes.getIntegerVersion(t)) };
  // period
  if (Array.isArray(periods)) {
    $match.period = { $in: periods };
  } else {
    $match.period = periods;
  }
  kpiEncoder.encodeObject($match);
  return $match;
}

module.exports = {
  match,
  $groups,
};
