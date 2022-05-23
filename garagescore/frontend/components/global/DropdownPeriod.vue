<template>
  <DropdownBase
  class="dropdown-period"
  active ref="dropdown"
  track-id="topfilter-period"
  type="new-design"
  iconColor="blue"
  caretColor="blue">
    <template slot="icon">
      <i class="icon-gs-calendar"></i>
    </template>
    <template slot="label">{{ fromPeriodIdToString(currentPeriod.id) }}</template>
    <template>
      <DropdownContent :items="items" v-model="activePeriod" />
    </template>

    <template slot="dropdown-label">{{ $t_locale('components/global/DropdownPeriod')('dropdownLabel') }}</template>
    <template slot="modal-title">{{ $t_locale('components/global/DropdownPeriod')('placeHolder') }}</template>
    <template slot="mobile-content">
      <SelectList :items="items" v-model="activePeriod">
        <template slot="icon">
          <i class="icon-gs-calendar"></i>
        </template>
        <template slot="title">{{ $t_locale('components/global/DropdownPeriod')('listLabel') }}</template>
      </SelectList>
    </template>
  </DropdownBase>
</template>

<script>
import DropdownBase from "./DropdownBase";
import SelectList from "./SelectList";
import { periodIdToString } from '~/util/periods';

export default {
  name: "DropdownPeriod",
  components: {
    DropdownBase,
    SelectList
  },
  props:{
    availablePeriods:{
      type: Array,
      default: () => [],
    },
    setCurrentPeriod:{
      type: Function,
      default: () => ()=>({})
    },
    periodId:{
      type: String,
      default: ''
    }
  },
  computed: {
    currentPeriod() {
      const currentPeriod = this.availablePeriods.find(
        p => p.id === this.periodId
      );

      return currentPeriod;
    },

    items() {
      return [
        ...this.availablePeriods.map(period => ({
          key: period.id,
          label: this.fromPeriodIdToString(period.id),
          value: period
        }))
      ];
    },

    activePeriod: {
      get() {
        return {
          key: this.currentPeriod.id,
          label: this.currentPeriod.display,
          value: this.currentPeriod
        };
      },

      set(item) {
        // Close dropdown mobile on change
        this.$refs.dropdown &&
          this.$refs.dropdown.$refs.dropdownMobile &&
          this.$refs.dropdown.$refs.dropdownMobile.closeDropdown();

        // Close dropdown desktop on change
        this.$refs.dropdown &&
          this.$refs.dropdown.$refs.dropdown &&
          this.$refs.dropdown.$refs.dropdown.closeDropdown();

        this.setCurrentPeriod(item.value.id);
        return item;
      }
    }
  },

  methods: {
    fromPeriodIdToString(periodId) {
      return periodIdToString(periodId, (k) => this.$t_locale('components/global/DropdownPeriod')(k));
    }
  }
};
</script>
