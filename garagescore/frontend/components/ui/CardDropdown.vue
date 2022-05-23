<template>
  <Card class="card-dropdown" :class="classBinding">
    <button class="card-dropdown__header" @click="toggle">
      <div class="card-dropdown__header-content">
        <slot name="header" />
      </div>
      <div class="card-dropdown__caret">
        <i class="icon-gs-down" />
      </div>
    </button>
    <div class="card-dropdown__body" v-if="open || disabled">
      <slot />
    </div>
  </Card>
</template>

<script>
export default {
  props: {
    openByDefault: Boolean,
    disabled: Boolean
  },

  data() {
    return {
      open: this.openByDefault || false
    };
  },

  methods: {
    toggle() {
      this.open = !this.open;
    }
  },

  computed: {
    classBinding() {
      return {
        "card-dropdown--open": this.open,
        "card-dropdown--disabled": this.disabled
      };
    }
  }
};
</script>

<style lang="scss" scoped>
.card-dropdown {
  &__header {
    display: flex;
    width: 100%;
    padding: 0;
    outline: 0px;
    cursor: pointer;

    box-sizing: border-box;

    border: none;
    background-color: transparent;
    flex-direction: row;

    align-items: center;
  }

  &__header-content {
    flex: 1;
  }

  &__body {
    border-top: 1px solid rgba($grey, .5);
    margin-top: 1rem;
    box-sizing: border-box;
  }

  &__caret {
    font-size: 1rem;
    color: $black;
    transition: transform 0.3s ease-in-out;
  }

  &--open {
    .card-dropdown {
      &__caret {
        transform: rotate(180deg);
      }
    }
  }

  &--disabled {
    .card-dropdown {
      &__header {
        cursor: initial;
      }

      &__caret {
        display: none;
      }
    }
  }
}
</style>
