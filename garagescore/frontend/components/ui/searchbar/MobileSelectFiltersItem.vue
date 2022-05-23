<template>
  <div class="mobile-select-filters-item">
    <div class="mobile-select-filters-item__title">
      <slot name="icon" />
      <span>
        <slot name="title" />
      </span>
    </div>
    <div class="mobile-select-filters-item__items">
      <button
        class="mobile-select-filters-item__item"
        v-for="item in items"
        :key="item.value"
        @click="onItemClick(item.value)"
      >
        <div class="mobile-select-filters-item__label">{{ item.label }}</div>
        <div class="mobile-select-filters-item__icon-active" v-if="valueActive === item.value">
          <i class="icon-gs-validation-check-circle" />
        </div>
      </button>
    </div>
  </div>
</template>


<script>
export default {
  props: {
    items: Array,
    valueActive: String
  },

  methods: {
    onItemClick(value) {
      this.$emit("change", this.valueActive === value ? undefined : value);
      this.$emit("onAccordionItemClick");
    }
  }
};
</script>

<style lang="scss" scoped>
.mobile-select-filters-item {
  background-color: $white;

  padding: 1rem;
  box-sizing: border-box;

  &__title {
    display: flex;
    align-items: center;
    margin-bottom: 7px;

    i {
      font-size: 1rem;
      margin-right: 7px;
      color: $black;
    }

    span {
      display: block;
      font-size: 12px;
      font-weight: bold;
      color: $black;
      text-transform: uppercase;
    }
  }

  &__items {
    display: flex;
    flex-direction: column;
  }

  &__item {
    font-size: 12px;
    border: none;
    background-color: transparent;
    display: flex;
    flex-direction: row;
    padding: 1rem 0px;
    box-sizing: border-box;
    cursor: pointer;

    &:last-child {
      padding-bottom: 0px;
    }

    &:hover,
    &:focus {
      background-color: $very-light-grey;
    }
  }

  &__label {
    font-size: inherit;
    font-weight: 300;
    flex: 1;
    text-align: left;
  }

  &__icon-active {
    margin-left: 7px;
    color: $blue;

    i {
      font-size: 10px;
    }
  }
}
</style>