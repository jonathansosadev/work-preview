<template>
  <div class="list-item">
    <div class="list-item__header" :class="headerClassBindings" @click="$listeners.click">
      <slot name="header"></slot>

      <div class="list-item__header__icon-container">
        <i :class="iconClassBindings"></i>
      </div>
    </div>
    <div class="list-item__content custom-scrollbar" :class="contentClassBindings">
      <div class="list-item__content__footer">
        <slot name="footer"></slot>
      </div>
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    firstItem: Boolean,
    open: Boolean
  },

  computed: {
    headerClassBindings() {
      return {
        "list-item__header--open": this.open,
        "list-item__header--first-item": this.firstItem
      };
    },
    contentClassBindings() {
      return {
        "list-item__content--open": this.open
      };
    },
    iconClassBindings() {
      return {
        "icon-gs-down": !this.open,
        "icon-gs-up": this.open
      };
    }
  }
};
</script>

<style lang="scss" scoped>
.list-item {
  &__header {
    cursor: pointer;
    padding: 0 1rem;
    height: 50px;
    border-bottom: 1px solid rgba($grey, .5);
    display: flex;
    align-items: center;
    &--first-item {
      border-top: 1px solid rgba($grey, .5);
    }
    &--open {
      background-color: #f2f2f2;
    }
    &__icon-container {
      margin-left: auto;
      color: $dark-grey;
    }
  }

  &__content {
    overflow: hidden;
    height: 0;
    &--open {
      height: auto;
      max-height: 40vh;
      overflow-x: hidden;
      overflow-y: auto;
      border-bottom: 1px solid rgba($grey, .5);
    }
    &__footer {
      padding: 10px 16px;
    }
  }
}
</style>
