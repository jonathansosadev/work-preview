<template>
  <div class="options-content">
    <div class="options-content__items">
      <Button
        class="options-content__item"
        type="options"
        v-for="(dataType, id) in availableDataTypes"
        :key="id"
        :disabled="!enabled"
        :active="isActive"
        :class="{'button--options__active':(dataType.id === currentDataType.id)}"
        v-model="activeDataType"
        @click="setCurrentDataTypeId(dataType.id)"
        track-id="topfilter-datatype"
      >
        {{ $t_locale('components/global/OptionsDataTypes')(dataType.label) }}
      </Button>
    </div>
  </div>
</template>

<script>
import DataTypes from "~/utils/models/data/type/data-types";

export default {
  name: 'OptionsDataTypes',
  props: {
    availableDataTypes: Array
  },

  computed: {
    activeDataType: {
      get() {
        const selectedDataTypeId = this.currentDataType.id || 'allServices';
        return {
          key: selectedDataTypeId,
          label: this.labelHelper(selectedDataTypeId),
          value: this.currentDataType
        };
      },

      set(item) {
        this.setCurrentDataTypeId(item.id);
        return item;
      }
    },

    isActive() {
      return this.$store.state.cockpit.current.dataTypeId !== null;
    },

    currentDataType() {
      return (
        this.availableDataTypes.find(
          e => e.id === this.$store.state.cockpit.current.dataTypeId
        ) || { id: null, value: this.$t_locale('components/global/OptionsDataTypes')("allServices") }
      );
    },
    iconClass() {
      if (this.currentDataType.id === 'allServices') return 'icon-gs-repair';
      if (this.currentDataType.id === DataTypes.MAINTENANCE) return 'icon-gs-repair';
      if (this.currentDataType.id === DataTypes.NEW_VEHICLE_SALE) return 'icon-gs-car';
      if (this.currentDataType.id === DataTypes.USED_VEHICLE_SALE) return 'icon-gs-car-old';
      return 'icon-gs-repair';
    },

    enabled() {
      return this.availableDataTypes.length >= 2;
    }
  },
  methods: {
    formatScore(value) {
      if (isNaN(value) || value === null) return "--";
      if (!value) return 0;
      if (value >= 10 || value <= -10) return Math.floor(value);

      return Number.parseFloat(Number.parseFloat(value).toFixed(1));
    },

    labelHelper(dataTypeId) {
      return this.$t_locale('components/global/OptionsDataTypes')(dataTypeId || 'allServices');
    },

    setCurrentDataTypeId(dataTypeId) {
      this.$store.dispatch("cockpit/changeCurrentDataTypeId", dataTypeId);
      this.$store.dispatch("cockpit/refreshRouteParameters");
    },

    getScoreField(dataType) {
      switch (dataType) {
        case DataTypes.MAINTENANCE:
          return "scoreAPV";
        case DataTypes.NEW_VEHICLE_SALE:
          return "scoreVN";
        case DataTypes.USED_VEHICLE_SALE:
          return "scoreVO";
        default:
          return "score";
      }
    },

    getCountRespondedField(dataType) {
      switch (dataType) {
        case DataTypes.MAINTENANCE:
          return "countSurveyRespondedAPV";
        case DataTypes.NEW_VEHICLE_SALE:
          return "countSurveyRespondedVN";
        case DataTypes.USED_VEHICLE_SALE:
          return "countSurveyRespondedVO";
        default:
          return "countSurveysResponded";
      }
    }
  }
};
</script>

<style lang="scss" scoped>
  .options-content {
    &__items {
      display: flex;
    }
  }
</style>
