const moment = require('moment');
require('moment-timezone');
const { getDataImportStartedAt } = require('../../../models/garage/garage-methods');
const GarageHistoryPeriod = require('../../../models/garage-history.period');

const getCockpitAvailablePeriodsForUser = (user, garages) => {
  if (!user) throw new Error('NO USER GIVEN: getCockpitAvailablePeriodsForUser');

  if (garages.length === 0) {
    return GarageHistoryPeriod.getCockpitAvailablePeriods(new Date('1970-01-01'));
  }
  if (garages.length === 1) {
    return GarageHistoryPeriod.getCockpitAvailablePeriods(getDataImportStartedAt(garages[0]));
  }
  const oldestImportedGarage = garages.reduce((garageA, garageB) =>
    moment(getDataImportStartedAt(garageA)).isBefore(getDataImportStartedAt(garageB)) ? garageA : garageB
  );
  return GarageHistoryPeriod.getCockpitAvailablePeriods(getDataImportStartedAt(oldestImportedGarage));
};

module.exports = { getCockpitAvailablePeriodsForUser };
