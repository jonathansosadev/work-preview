<template>
  <div class="c-icon-label-sort" :class="classBinding" @click="changeOrder">
    <label class="c-icon-label-sort__label">
      <span class="c-icon-label-sort__text">
        <slot />
      </span>
      <SortIcons
        v-if="$mq !== 'sm' || isActive"
        class="c-icon-label-sort__sort-icons"
        :order="getOrder"
        :disabled="disabled"
      />
    </label>
  </div>
</template>

<script>
import SortIcons from "./SortIcons";

export default {
  components: {
    SortIcons
  },
  props: {
    type: String,
    value: {
      type: Object,
      default: () => {
        return {
          column: undefined,
          order: "ASC"
        };
      }
    },
    field: String,
    overrideFunction: Function,
    disabled: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    classBinding() {
      return {
        "c-icon-label-sort--header": this.type === "header",
        "c-icon-label-sort--primary": this.type === "primary",
        "c-icon-label-sort--success": this.type === "success",
        "c-icon-label-sort--warning": this.type === "warning",
        "c-icon-label-sort--danger": this.type === "danger",
        "c-icon-label-sort--muted": this.type === "muted",
        "c-icon-label-sort--active": this.isActive,
        "c-icon-label-sort--disabled": this.disabled
      };
    },

    getOrder() {
      return this.isActive ? this.value.order : "";
    },

    classBindingSortIcon() {
      return {
        "fa-rotate-180": this.value.order && this.value.order === "DESC"
      };
    },

    isActive() {
      return !this.disabled && this.value.column === this.field;
    }
  },

  methods: {
    changeOrder() {
      if (!this.disabled) {
        if (this.overrideFunction) {
          this.overrideFunction();
        } else {
          this.$emit("input", {
            column: this.field,
            order: this.isActive
              ? this.value.order === "ASC"
                ? "DESC"
                : "ASC"
              : "DESC"
          });
        }
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.c-icon-label-sort {
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  width: 100%;

  &__label {
    font-size: 0.85rem;
    color: $black;
    font-weight: 400;
    max-width: 100%;
    height: 30px;
    box-sizing: border-box;

    cursor: inherit;
    user-select: none;
    text-align: center;
    display: none;
  }

  &__text {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

    box-sizing: border-box;
    padding: 0.25rem;
  }

  &--active {
    .c-icon-label-sort__label {
      background-color: #e3e2e0;
      border-radius: 5px;
      box-shadow: 0 3px 6px 0 rgba(0, 0, 0, 0.16);
      padding: 0.5rem;
    }

    &.c-icon-label-sort--header {
      .c-icon-label-sort__label {
        color: $blue;
        font-weight: bold;
      }
    }
  }

  &--header {
    .c-icon-label-sort__label {
      font-size: 0.92rem;
      color: $dark-grey;
      font-weight: 700;
      display: flex;
      align-items: center;
    }

    .c-icon-label-sort__icons {
      color: $white;
    }
  }

  &__sort-icons {
    margin-left: 3px;
    font-weight: normal;
  }

  &__icons {
    color: $light-grey;

    & > * {
      font-size: 1.25rem;
      &:not(:last-child) {
        margin-right: 0.5rem;
      }
    }
  }

  &--muted {
    .c-icon-label-sort__label {
      color: $black-grey;
    }

    .c-icon-label-sort__icons {
      color: $black-grey;
    }
  }

  &--primary {
    .c-icon-label-sort__label {
      color: $blue;
    }

    .c-icon-label-sort__icons {
      color: $blue;
    }
  }

  &--success {
    .c-icon-label-sort__label {
      color: $green;
    }

    .c-icon-label-sort__icons {
      color: $green;
    }
  }

  &--warning {
    .c-icon-label-sort__label {
      color: $yellow;
    }

    .c-icon-label-sort__icons {
      color: $yellow;
    }
  }

  &--danger {
    .c-icon-label-sort__label {
      color: $red;
    }

    .c-icon-label-sort__icons {
      color: $red;
    }
  }

  &--disabled {
    cursor: default;
  }
}

@media (min-width: $breakpoint-min-md) {
  .c-icon-label-sort {
    &__label {
      display: block;
    }
  }
}
</style>
