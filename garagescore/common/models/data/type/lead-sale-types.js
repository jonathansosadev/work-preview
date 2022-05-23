const Enum = require('../../../lib/util/enum.js');
const { salesEnum } = require('../../types.js');

module.exports = new Enum(
  {
    ...salesEnum,
    // NEW_VEHICLE_SALE: 'NewVehicleSale',
    // USED_VEHICLE_SALE: 'UsedVehicleSale',
    UNKNOWN: 'Unknown',
  },
  {
    getAcronym(value) {
      if (value === this.UNKNOWN) return 'Unknown';
      if (value === this.NEW_VEHICLE_SALE) return 'Vn';
      if (value === this.USED_VEHICLE_SALE) return 'Vo';
      if (value === this.MAINTENANCE) return 'Apv';

      return '';
    },
  }
);
