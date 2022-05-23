import OptionsDataTypes from "~/components/global/OptionsDataTypes";
import DataTypes from "../../../../../utils/models/data/type/data-types";

export default {
  component: OptionsDataTypes,
  props: [
    {
      label: 'availableDataTypes',
      value: [
        { key: "allServices", id: null, label: "allServices" },
        { key: DataTypes.MAINTENANCE, id: DataTypes.MAINTENANCE, label: DataTypes.MAINTENANCE },
        { key: DataTypes.NEW_VEHICLE_SALE, id: DataTypes.NEW_VEHICLE_SALE, label: DataTypes.NEW_VEHICLE_SALE },
        { key: DataTypes.USED_VEHICLE_SALE, id: DataTypes.USED_VEHICLE_SALE, label: DataTypes.USED_VEHICLE_SALE }
      ],
      inpuType: 'json',
    },
  ]
}