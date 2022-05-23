<template>
  <div class="table__header-item" v-if="isDisplay">
    <div class="table__header-content" :class="classBinding">
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
    display: {
      type: Array
    }
  },

  computed: {
    isDisplay() {
      return !this.display || this.display.includes(this.$mq);
    },

    classBinding() {
      return [ 
          {"table__header-content--center": this.center},
          {"table__header-content--right": this.right}
        ];
    }
  }
};
</script>

<style lang="scss" scoped>
.table {
  &__header-item {
    flex: 1;
    color: $dark-grey;
    text-align: left;
    font-weight: 700;
    box-sizing: border-box;
    font-size: 0.92rem;
    min-width: 0px;
    padding: 1rem 0;

    &--center {
      display: flex;
      text-align: center;
    }

    &--display-lg {
      display: none;
    }

    &--display-md {
      display: none;
    }

    &:first-child {
      .table__header-content {
        padding-left: 1rem;
      }
    }

    &:last-child {
      .table__header-content {
        padding-right: 1rem;
      }
    }
  }

  .input {
    border: 0;
  }

  &__header-content {
    display: flex;
    width: 100%;
    box-sizing: border-box;

    &--center {
      justify-content: center;
      text-align: center;
      margin-top: 1px;
      flex-direction: column;
    }
    &--right {
      justify-content: end;
      margin-top: 1px;
    }
  }
}

@media (min-width: $breakpoint-min-md) {
  .table {
    &__header-item {
      &:first-child {
        .table__header-content {
          padding-left: 0rem;
        }
      }

      &:last-child {
        .table__header-content {
          padding-right: 0px;
        }
      }
    }
  }
}
@media (max-width: $breakpoint-min-md) {
  .table {
    &__header-item {
      &:first-child {
        .table__header-content {
          padding-left: 0rem;
        }
      }

      &:last-child {
        .table__header-content {
          padding-right: 0px;
        }
      }
    }
  }
}
</style>

