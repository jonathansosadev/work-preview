<template>
  <Dropdown class="dropdown-datatype" :dropdown-open.sync="dropdownOpen" :class="classBinding" 
            :mode="mode" :displayCarat="enabled" :disabled="!enabled">
    <template slot="label">
      <span class="dropdown-datatype__selected-item">{{ $t_locale('components/report/common/DropdownDataTypes')(currentDataType) }}</span>
    </template>
    <div class="dropdown-content">
      <div class="dropdown-datatype__name--blue">
        {{ $t_locale('components/report/common/DropdownDataTypes')(currentDataType) }}
      </div>
      <div class="dropdown-datatype__name" v-if="'allServices' !== currentDataType && enableSelectAll" @click="setCurrentDataTypeId(null)">
        {{ $t_locale('components/report/common/DropdownDataTypes')('allServices') }}
      </div>
      <div class="dropdown-datatype__name" :key="dataType" v-for="dataType in availableDataTypes" @click="setCurrentDataTypeId(dataType)">
        {{ $t_locale('components/report/common/DropdownDataTypes')(dataType) }}
      </div>
    </div>
  </Dropdown>
</template>

<script>
import DataTypes from '~/utils/models/data/type/data-types';
export default {
  name: 'DropdownDataTypes',
  data() {
    return {
      dropdownOpen: false
    }
  },
  props: {
    mode: { type: String },
    forcedDataType: { type: String, required: false },
    enableSelectAll: { type: Boolean, default:true },
  },

  computed: {
    currentDataType() {
      return this.forcedDataType || this.$store.getters['report/getCurrentDataType'] || 'allServices';
    },
    classBinding() {
      if (true) return { 'dropdown-datatype--active': true };
      return {
        'dropdown-datatype--mobile': this.mode === 'mobile',
        'dropdown-datatype--active': this.currentDataType !== null,
      }
    },
    availableDataTypes() {
      return this.$store.getters['report/getAvailableDataTypes'].filter((type) => type && type !== this.currentDataType);
    },
    enabled() {
      return this.$store.getters['report/getAvailableDataTypes'].length > 1 
    }
  },

  methods: {
    setCurrentDataTypeId(dataTypeId) {
      this.$store.dispatch('report/changeCurrentDataTypeId', { dataTypeId });
      this.dropdownOpen = false;
    }
  }
}
</script>

<style lang="scss">
.dropdown-datatype {
  &--active {
    .dropdown-datatype {
      &__selected-item {
        color: $black;
      }
    }
  }

  .dropdown__label {
    font-weight: 700;
    margin-right: 0.5rem !important;
  }
  .dropdown__icon {
    color: $black !important;
  }

  .dropdown-content {
    max-height: 22rem;
    overflow: auto;
    min-width: 12.86rem;
  }
  .dropdown__dropdown {
    box-shadow: 0 2px 10px 0 rgba($black, 0.15) !important;
    background: white;
  }
  
  &__name {
    padding: 0.5rem 1rem;
    font-weight: 300;
    &:hover {
      background-color: rgba($grey, 0.2);
      cursor: pointer;
    }
    &--blue {
      padding: 0.5rem 1rem;
      font-weight: 300;
      color: $blue;
      &:hover {
        background-color: rgba($grey, 0.1);
      }
    }
  }
}

@media print {
  .dropdown__icon {
    display: none !important;
  }
}
</style>
