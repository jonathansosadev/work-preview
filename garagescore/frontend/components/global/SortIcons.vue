
<template>
  <div v-if="!disabled" class="sort-icons">
    <i
      class="sort-icons__icon sort-icons__icon--up icon-gs-up-caret"
      :class="classBindingUpSortIcon"
    />
    <i
      class="sort-icons__icon sort-icons__icon--down icon-gs-down-caret"
      :class="classBindingDownSortIcon"
    />
  </div>
</template>

<script>
export default {
  props: {
    order: String,
    disabled: { type: Boolean, default: false }
  },

  computed: {
    classBindingUpSortIcon() {
      return {
        "sort-icons__icon--active": this.order === "ASC"
      };
    },

    classBindingDownSortIcon() {
      return {
        "sort-icons__icon--active": this.order === "DESC"
      };
    }
  }
};
</script>

<style lang="scss" scoped>
.sort-icons {
  position: relative;
  height: 1.2rem;
  width: 0.71rem;

  &__icon {
    position: absolute;
    color: #000;
    left: 0;
    font-size: 0.5rem;

    &--active {
      color: $blue;
    }

    &--up {
      top: 2px;
    }

    &--down {
      bottom: 0;
    }
  }
}
</style>

