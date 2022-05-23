import Enum from '~/utils/enum.js'
// import lang from '../lang.js'
// const translate = lang('garage.subscription.type.js')

export default new Enum(
  {
    MAINTENANCE: 'Maintenance',
    NEW_VEHICLE_SALE: 'NewVehicleSale',
    USED_VEHICLE_SALE: 'UsedVehicleSale',
    VEHICLE_INSPECTION: 'VehicleInspection',
    LEAD: 'Lead',
    E_REPUTATION: 'EReputation',
    ANALYTICS: 'Analytics',
    CROSS_LEADS: 'CrossLeads',
    AUTOMATION: 'Automation',
    COACHING: 'Coaching',
    CONNECT: 'Connect',
  },
  {
    displayName(value, language = 'fr', prefix) {
      if (typeof value === 'undefined') {
        console.error('The given value is undefined')
        return ''
      }
      if (!this.hasValue(value)) {
        console.error(`Value '${value}' is not supported by this Enum`)
        return value
      }
      return value // translate(value, language, prefix)
    }
  }
)
