const translate = require('../../common/lib/garagescore/languages')('garage.type.js');
const Enum = require('../lib/util/enum.js');
const dataTypes = require('../../common/models/data/type/data-types.js');

module.exports = new Enum(
  {
    DEALERSHIP: 'Dealership',
    MOTORBIKE_DEALERSHIP: 'MotorbikeDealership',
    CARAVANNING: 'Caravanning',
    AGENT: 'Agent',
    CAR_REPAIRER: 'CarRepairer',
    VEHICLE_INSPECTION: 'VehicleInspection',
    CAR_RENTAL: 'CarRental',
    UTILITY_CAR_DEALERSHIP: 'UtilityCarDealership',
    OTHER: 'Other',
  },
  {
    hasAccessToCrossLeads(garageType) {
      return [this.DEALERSHIP, this.MOTORBIKE_DEALERSHIP, this.CARAVANNING, this.AGENT].includes(garageType);
    },
    hasAccessToAutomation(garageType) {
      return [
        this.DEALERSHIP,
        this.MOTORBIKE_DEALERSHIP,
        this.CARAVANNING,
        this.AGENT,
        this.CAR_REPAIRER,
        this.UTILITY_CAR_DEALERSHIP,
      ].includes(garageType);
    },
    getCockpitType(garageType) {
      if ([this.DEALERSHIP, this.MOTORBIKE_DEALERSHIP, this.VEHICLE_INSPECTION].includes(garageType)) return garageType;
      return this.DEALERSHIP; // fallback for others
    },
    getGarageTypesFromCockpitType(cockpitType) {
      switch (cockpitType) {
        case this.VEHICLE_INSPECTION:
          return [this.VEHICLE_INSPECTION];
        case this.MOTORBIKE_DEALERSHIP:
          return [this.MOTORBIKE_DEALERSHIP];
        case this.DEALERSHIP:
        default:
          return [
            this.DEALERSHIP,
            this.CARAVANNING,
            this.AGENT,
            this.CAR_REPAIRER,
            this.CAR_RENTAL,
            this.UTILITY_CAR_DEALERSHIP,
            this.OTHER,
          ];
      }
    },
    displayName(value, language = 'fr', prefix = null) {
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
    getSlug(value) {
      if (value === this.VEHICLE_INSPECTION) return 'controle-technique';
      return 'garage';
    },
    getCorrespondingDataTypeQuery(garageType = null) {
      if (garageType === this.VEHICLE_INSPECTION) return dataTypes.VEHICLE_INSPECTION;
      return {
        inq: [
          dataTypes.MAINTENANCE,
          dataTypes.NEW_VEHICLE_SALE,
          dataTypes.USED_VEHICLE_SALE,
          dataTypes.VEHICLE_INSPECTION,
        ],
      };
    },
    getDataTypesFromGarageType(garageType = null) {
      if (garageType === this.VEHICLE_INSPECTION) return [dataTypes.VEHICLE_INSPECTION];
      return [
        dataTypes.MAINTENANCE,
        dataTypes.NEW_VEHICLE_SALE,
        dataTypes.USED_VEHICLE_SALE,
        dataTypes.VEHICLE_INSPECTION,
      ];
    },
    getCorrespondingDataTypeQueryMongo(garageType = null) {
      if (garageType === this.VEHICLE_INSPECTION) return dataTypes.VEHICLE_INSPECTION;
      return {
        $in: [
          dataTypes.MAINTENANCE,
          dataTypes.NEW_VEHICLE_SALE,
          dataTypes.USED_VEHICLE_SALE,
          dataTypes.VEHICLE_INSPECTION,
        ],
      };
    },
    getVehicleName(type) {
      if (this.MOTORBIKE_DEALERSHIP === type || this.INT_MOTORBIKE_DEALERSHIP === type) return 'deux-roues';
      return 'véhicule';
    },
    getIntegerVersion(type) {
      const integerVersions = {
        // We need the integer version for peculiar models like KPI because we don't want any strings in the document saved in database
        INT_DEALERSHIP: 0,
        INT_MOTORBIKE_DEALERSHIP: 1,
        INT_AGENT: 2,
        INT_CAR_REPAIRER: 3,
        INT_VEHICLE_INSPECTION: 4,
        INT_CAR_RENTAL: 5,
        INT_UTILITY_CAR_DEALERSHIP: 6,
        INT_OTHER: 7,
        INT_CARAVANNING: 8
      };

      if (typeof type === 'number') return type;
      for (const key of Object.keys(this)) {
        if (this[key] === type) {
          return integerVersions[`INT_${key}`] || 0;
        }
      }
      return 0;
    },
  }
);
