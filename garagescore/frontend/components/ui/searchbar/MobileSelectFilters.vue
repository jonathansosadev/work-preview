<template>
  <div class="mobile-select-filters">
    <div class="mobile-select-filters__title">
      {{ $t_locale('components/ui/searchbar/MobileSelectFilters')('filterBy') }}
    </div>
    <div class="mobile-select-filters__content">
      <div class="mobile-select-filters__item" v-for="option in options" :key="option.key">
        <MobileSelectFiltersItem
          :items="option.values"
          :valueActive="value[option.key]"
          @change="(value) => onChange(option.key, value)"
        >
          <template slot="icon">
            <i :class="option.icon" />
          </template>
          <template slot="title">{{ option.label }}</template>
        </MobileSelectFiltersItem>
      </div>
    </div>
  </div>
</template>

<script>
import MobileSelectFiltersItem from "./MobileSelectFiltersItem";

export default {
  components: {
    MobileSelectFiltersItem
  },

  props: {
    filters: Object,
    value: Object,
    options: Array
  },

  methods: {
    onChange(key, value) {
      if (value === undefined) {
        const { [key]: value, ...valueExcludeKey } = this.value;
        this.$emit("input", valueExcludeKey);
      } else {
        this.$emit("input", { ...this.value, [key]: value });
      }
    }
  }
};
</script>


<style lang="scss" scoped>
.mobile-select-filters {
  &__title {
    font-size: 12px;
    font-weight: bold;
    text-transform: uppercase;
  }

  &__content {
    margin-top: 10px;
  }

  &__item {
    & + & {
      margin-top: 10px;
    }
  }
}
</style>
