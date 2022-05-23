import DropdownCockpitTypes from '~/components/global/DropdownCockpitTypes.vue'
import GarageTypes from "~/utils/models/garage.type.js";

export default {
    component: DropdownCockpitTypes,
    props: [
      {
        label: "availableCockpitTypes",
        value: [
          GarageTypes.DEALERSHIP,
          GarageTypes.MOTORBIKE_DEALERSHIP,
          GarageTypes.CARAVANNING,
          GarageTypes.AGENT,
          GarageTypes.CAR_REPAIRER,
          GarageTypes.VEHICLE_INSPECTION,
          GarageTypes.CAR_RENTAL,
          GarageTypes.UTILITY_CAR_DEALERSHIP,
          GarageTypes.OTHER,
        ],
        inputType: 'json'
      },
      {
        label: 'currentCockpitType',
        value: GarageTypes.DEALERSHIP,
        inputType: 'select',
        inputOptions: [
          GarageTypes.DEALERSHIP,
          GarageTypes.MOTORBIKE_DEALERSHIP,
          GarageTypes.CARAVANNING,
          GarageTypes.AGENT,
          GarageTypes.CAR_REPAIRER,
          GarageTypes.VEHICLE_INSPECTION,
          GarageTypes.CAR_RENTAL,
          GarageTypes.UTILITY_CAR_DEALERSHIP,
          GarageTypes.OTHER,
        ]    
      },
      {
        label: 'setCurrentCockpitType',
        value: (selection) => (alert(`Type Seleted ${selection}`)),
        inputType: 'function'
      }
    ],
  }
  