const GarageTypes = require('./garages/garageTypes.json');

const {
  MOTORBIKE_DEALERSHIP: {
    value: MOTORBIKE_DEALERSHIP_VALUE
  }
} = GarageTypes;

const IconsTypes = {
  MAINTENANCE: {
    value: "icon-gs-repair",
    properties: {}
  },
  NEWVEHICLESALE: {
    value: "icon-gs-car",
    properties: {
      [MOTORBIKE_DEALERSHIP_VALUE]: "icon-gs-moto",
    }
  },
  USEDVEHICLESALE: {
    value: "icon-gs-car-old",
    properties: {
      [MOTORBIKE_DEALERSHIP_VALUE]: "icon-gs-moto-old",
    }
  },
  VEHICLEPLUS: {
    value: "icon-gs-car-checked",
    properties: {
      [MOTORBIKE_DEALERSHIP_VALUE]: "icon-gs-moto-checked",
    }
  },
};

module.exports = IconsTypes;
