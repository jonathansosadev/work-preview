<template>
  <div class="table-filters-label" :class="{ active }">
    <span class="table-filters-label__text">{{ label }}</span>
    <i class="icon-gs-filter-solid" v-if="active" />
  </div>
</template>

<script>
export default {
  props: {
    filterOptions: Array,
    filters: Object,
    filterKey: String
  },

  computed: {
    active() {
      return this.filters[this.filterKey] !== undefined;
    },

    label() {
      try {
        if (this.filters[this.filterKey]) {
          return this.filterOptions
            .find(o => o.key === this.filterKey)
            .values.find(v => v.value === this.filters[this.filterKey]).label;
        }

        return this.filterOptions.find(o => o.key === this.filterKey).label;
      } catch (err) {
        return "";
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.table-filters-label {
  display: flex;
  justify-content: center;
  align-items: center;

  &__text {
    white-space: nowrap;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    overflow: hidden;
    padding: 0 0.25rem;
    display: inline-block;
  }

  i {
    margin-left: 3px;
  }

  &.active {
    color: $blue;
    font-weight: bold;

    i {
      font-size: 10px;
    }
  }
}
</style>