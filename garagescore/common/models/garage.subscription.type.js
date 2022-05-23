const translate = require('../../common/lib/garagescore/languages')('garage.subscription.type.js');
const Enum = require('../lib/util/enum.js');

module.exports = new Enum(
  {
    MAINTENANCE: 'Maintenance',
    NEW_VEHICLE_SALE: 'NewVehicleSale',
    USED_VEHICLE_SALE: 'UsedVehicleSale',
    VEHICLE_INSPECTION: 'VehicleInspection',
    LEAD: 'Lead',
    ANALYTICS: 'Analytics',
    E_REPUTATION: 'EReputation',
    AUTOMATION: 'Automation',
    CROSS_LEADS: 'CrossLeads',
    COACHING: 'Coaching',
    CONNECT: 'Connect',
  },
  {
    displayName(value, language = 'fr', prefix) {
      if (typeof value === 'undefined') {
        console.error('The given value is undefined');
        return '';
      }
      if (!this.hasValue(value)) {
        console.error(`Value '${value}' is not supported by this Enum`);
        return value;
      }
      return translate(value, language, prefix);
    },
    getGarageScoreComponents() {
      // Do not modify, it's for vosFactures
      return [
        this.MAINTENANCE,
        this.NEW_VEHICLE_SALE,
        this.USED_VEHICLE_SALE,
        this.VEHICLE_INSPECTION,
        this.LEAD,
      ];
    },
  }
);
