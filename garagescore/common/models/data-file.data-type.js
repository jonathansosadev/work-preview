const Enum = require('../lib/util/enum.js');

module.exports = new Enum({
  MAINTENANCES: 'Maintenances',
  NEW_VEHICLE_SALES: 'NewVehicleSales',
  USED_VEHICLE_SALES: 'UsedVehicleSales',
  VEHICLE_SALES: 'MixedVehicleSales',
  VEHICLE_INSPECTIONS: 'VehicleInspections',
  MIXED: 'Mixed',
});
