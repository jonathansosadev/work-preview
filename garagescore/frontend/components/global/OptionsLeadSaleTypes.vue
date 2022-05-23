<template>
  <div class="options-content">
    <div class="options-content__items">
      <Button
        class="options-content__item"
        type="options"
        v-for="(leadSaleType, id) in availableLeadSaleTypes"
        :key="id"
        :disabled="!enabled"
        :active="isActive"
        :class="{'button--options__active':(leadSaleType.id === currentLeadSaleType)}"
        v-model="activeLeadSaleType"
        @click="setCurrentLeadSaleType(leadSaleType.id)"
        track-id="topfilter-leadsaletypes"
      >
        {{ $t_locale('components/global/OptionsLeadSaleTypes')(leadSaleType.label) }}
      </Button>
    </div>
  </div>
</template>

<script>
  import LeadSaleTypes from '../../utils/models/data/type/lead-sale-types';

  export default {
    name: 'OptionsLeadSaleTypes',

    data() {
      return {
        leadSaleTypesArray: LeadSaleTypes.values()
      }
    },
    props: {
      availableLeadSaleTypes: { type: Array, default: () => [] },
      currentLeadSaleType: { type: String, default: null },
      setCurrentLeadSaleType: { type: Function, required: true },
    },
    computed: {
      activeLeadSaleType: {
        get() {
          return {
            key: this.currentLeadSaleType || 'allServices',
            label: this.labelHelper(this.currentLeadSaleType),
            value: this.currentLeadSaleType
          };
        },

        set(item) {
          this.setCurrentLeadSaleType(item.id);
          return item.id;
        }
      },

      isActive() {
        return this.$store.state.cockpit.current.leadSaleType !== null;
      },

      labelHelper() {
        return (leadSaleType) => this.$t_locale('components/global/OptionsLeadSaleTypes')(leadSaleType || 'allServices');
      },

      enabled() {
        return this.availableLeadSaleTypes.length > 1
      },
    }
  }
</script>

<style lang="scss" scoped>
.options-content {
  &__items {
    display: flex;
  }
}
</style>
