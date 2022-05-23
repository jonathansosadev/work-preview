<template>
  <button class="searchbar-accordion-item" v-on="$listeners" :class="classBinding">
    <div class="searchbar-accordion-item__content">{{ label }}</div>
    <div class="searchbar-accordion-item__status" v-if="active">
      <i class="icon-gs-validation-check-circle"></i>
    </div>
  </button>
</template>


<script>
export default {
  props: {
    label: {
      type: String,
      required: true
    },

    active: {
      type: Boolean,
      required: false,
      default: false
    },

    value: {
      type: String,
      required: true
    }
  },

  computed: {
    classBinding() {
      return { "searchbar-accordion-item--active": this.active };
    }
  }
};
</script>

<style lang="scss" scoped>
.searchbar-accordion-item {
  width: 100%;
  padding-left: 32px;
  padding-right: 14px;
  height: 31px;
  background-color: #fff;
  color: $dark-grey;

  display: flex;
  flex-direction: row;
  border: none;
  outline: none;
  align-items: center;

  &:hover,
  &:focus {
    background-color: #f2f2f2;
    cursor: pointer;
  }

  &--active {
    .searchbar-accordion-item {
      &__content {
        color: $blue;
        font-weight: bold;
      }
    }
  }

  &__content {
    flex: 1;
    display: flex;
  }

  &__status {
    align-self: flex-end;
    font-size: 10px;
    color: $blue;
  }
}
</style>