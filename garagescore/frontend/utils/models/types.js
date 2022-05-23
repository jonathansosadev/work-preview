/**
 * This file is here to help all enumerations / configuration by jobs
 * Please refer to common/models/garage.type.js to add a new job
 */
const configs = {}

const basics = ['Maintenance', 'NewVehicleSale', 'UsedVehicleSale']

configs.Dealership = {
  prefix: '',
  jobs: basics
}
configs.VehicleInspection = {
  prefix: '',
  jobs: ['VehicleInspection']
}
const smallToFat = (s) => s.replace(/(.)([A-Z])/g, '$1_$2').toUpperCase()

const getEnums = (...filters) => {
  const output = {}
  for (const type of Object.keys(configs)) {
    for (const job of configs[type].jobs) {
      const prefix = configs[type].prefix || ''
      if (!filters || !filters.length || filters.includes(job)) {
        output[`${smallToFat(prefix + job)}`] =
          (prefix ? `${prefix}-` : '') + job
      }
    }
  }
  return output
}
export const jobsEnum = getEnums()
// With automation, a Lead can be about APV, VN or VO
export const salesEnum = getEnums('Maintenance', 'NewVehicleSale', 'UsedVehicleSale')
