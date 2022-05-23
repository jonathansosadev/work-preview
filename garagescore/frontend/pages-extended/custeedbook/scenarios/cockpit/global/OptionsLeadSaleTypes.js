import OptionsLeadSaleTypes from "~/components/global/OptionsLeadSaleTypes";
import DataTypes from "../../../../../utils/models/data/type/data-types";

export default {
  component: OptionsLeadSaleTypes,
  props: [
    {
      label: 'currentLeadSaleType',
      value: null,
      inputType: 'select',
      inputOptions: [
        null,
        DataTypes.MAINTENANCE,
        DataTypes.NEW_VEHICLE_SALE,
        DataTypes.USED_VEHICLE_SALE,
        DataTypes.UNKNOWN,
      ]
    },
    {
      label: 'availableLeadSaleTypes',
      value: [
        { id: null, key: 'allServices', label: 'allServices' },
        { key: DataTypes.MAINTENANCE, id: DataTypes.MAINTENANCE, label: DataTypes.MAINTENANCE },
        { key: DataTypes.NEW_VEHICLE_SALE, id: DataTypes.NEW_VEHICLE_SALE, label: DataTypes.NEW_VEHICLE_SALE },
        { key: DataTypes.USED_VEHICLE_SALE, id: DataTypes.USED_VEHICLE_SALE, label: DataTypes.USED_VEHICLE_SALE },
        { key: DataTypes.UNKNOWN, id: DataTypes.UNKNOWN, label: DataTypes.UNKNOWN }
      ],
      inpuType: 'json',
    },
    {
      label: 'setCurrentLeadSaleType',
      value: (leadSaleType) => {
        alert(`dispatch to store ${leadSaleType} ok`)
      }
    },
  ]
}