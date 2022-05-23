// const GarageTypes = require('../../common/models/garage.type.js'); DO NOT INCLUDE THAT CAUSE THE UNIT TEST FAILS

/**
 * This file is here to help all enumerations / configuration by jobs
 * Please refer to common/models/garage.type.js to add a new job
 */
const configs = {};

const basics = ['Maintenance', 'NewVehicleSale', 'UsedVehicleSale'];

// _____________________________ GARAGE TYPES CONFIGURATIONS _____________________________ //
configs.Dealership = {
  prefix: '',
  jobs: basics,
};
configs.VehicleInspection = {
  prefix: '',
  jobs: ['VehicleInspection'],
};
// configs.MotorbikeDealership = {
//   prefix: 'Motorbike',
//   jobs: basics
// };
// _______________________________________________________________________________________ //

// _______________________________ Functions _______________________________ //
const smallToFat = (s) => s.replace(/(.)([A-Z])/g, '$1_$2').toUpperCase();

const getEnums = (...filters) => {
  const output = {};
  for (const type of Object.keys(configs)) {
    for (const job of configs[type].jobs) {
      const prefix = configs[type].prefix || '';
      if (!filters || !filters.length || filters.includes(job)) {
        output[`${smallToFat(prefix + job)}`] = (prefix ? `${prefix}-` : '') + job;
      }
    }
  }
  return output;
};
// _________________________________________________________________________ //

// _________________________________ TESTS _________________________________ //

// console.log(getEnums()); // Uncomment to see if all the jobs are correctly written
// console.log(getEnums('NewVehicleSale', 'UsedVehicleSale'));
// console.log(smallToFat('TestToSeeIfItsWorking')); 'TestToSeeIfItsWorking' => TEST_TO_SEE_IF_ITS_WORKING

// _________________________________________________________________________ //

module.exports = {
  jobsEnum: getEnums(),
  // With automation, a Lead can be about APV, VN or VO
  salesEnum: getEnums('Maintenance', 'NewVehicleSale', 'UsedVehicleSale'),
};
