<template>
  <div class="table__row-cell" v-if="isDisplay">
    <div class="table__row-content" :class="classBinding">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    center: {
      type: Boolean,
      default: false
    },
    right: {
      type: Boolean,
      default: false
    },
    flow: {
      type: String,
      default: "row"
    },

    background: {
      type: String,
      default: "normal"
    },

    display: {
      type: Array
    }
  },

  computed: {
    classBinding() {
      return {
        "table__row-content--center": this.center,
        "table__row-content--right": this.right,
        "table__row-content--row": this.flow === "row",
        "table__row-content--column": this.flow === "column"
      };
    },

    isDisplay() {
      return !this.display || this.display.includes(this.$mq);
    }
  }
};
</script>

<style lang="scss" scoped>
.table {
  &__row-cell {
    display: block;
    width: 0px;
    padding: 1rem 0px;
    font-size: 0.92rem;
  }

  // @TODO Wrong place
  &__link {
    color: $black;
    text-decoration: none;
    font-weight: bold;
    cursor: pointer;

    // @TODO Wrong modifier
    &.grey {
      color: $dark-grey;

      &:hover {
        color: darken($dark-grey, 20);
      }
    }

    &.danger {
      color: $red;

      &:hover {
        color: darken($red, 20);
      }
    }

    &:hover {
      color: $blue;
    }
  }

  &__row-content {
    height: 100%;
    width: 100%;
    box-sizing: border-box;

    &--column {
      display: flex;
      flex-flow: column;
    }

    &--center {
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: .92rem;
      line-height: 1.5;
    }
    &--right {
      display: flex;
      justify-content: right;
      align-items: center;
      font-size: 1rem;
      line-height: 1rem;
    }
  }
}

@media (min-width: $breakpoint-min-md) {
  .table {
    &__row-cell {
      flex: 1;

      &:last-child {
        .table__row-content {
          padding-right: 0px;
        }
      }
    }
  }
}

@media (max-width: $breakpoint-max-sm) {
  .table {
    &__row-cell {
      flex: 1;
      width: auto;
      overflow: initial;
    } 
  }
}
</style>
