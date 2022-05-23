<template>
  <div
    class="c-icon-label-filter"
    @click="changeOption(false)"
    :class="classBinding"
    @click.right.prevent="changeOption(true)"
  >
    <div class="c-icon-label-filter__icons">
      <slot name="icon"></slot>
    </div>
    <label class="c-icon-label-filter__label">{{ label }}</label>
  </div>
</template>

<script>
export default {
  props: {
    options: {
      type: Array,
      default: () => [],
      required: true
    },
    overrideFunction: Function,
    value: String
  },

  data() {
    return {
      currentIndex: 0
    };
  },

  watch: {
    value: {
      handler() {
        const index = this.options.findIndex(e => e.value === this.value);
        this.currentIndex = index === -1 ? 0 : index;
      },
      immediate: true
    }
  },

  computed: {
    label() {
      return this.options[this.currentIndex].label || "Aucun label défini...";
    },

    classBinding() {
      return {
        "c-icon-label-filter--header":
          this.options[this.currentIndex].type === "header",
        "c-icon-label-filter--primary":
          this.options[this.currentIndex].type === "primary",
        "c-icon-label-filter--success":
          this.options[this.currentIndex].type === "success",
        "c-icon-label-filter--warning":
          this.options[this.currentIndex].type === "warning",
        "c-icon-label-filter--danger":
          this.options[this.currentIndex].type === "danger",
        "c-icon-label-filter--muted":
          this.options[this.currentIndex].type === "muted",
        "c-icon-label-filter--orange":
          this.options[this.currentIndex].type === "orange"
      };
    }
  },

  methods: {
    changeOption(back) {
      if (this.overrideFunction) {
        this.overrideFunction();
      } else {
        if (back) {
          this.currentIndex - 1 === -1
            ? (this.currentIndex = this.options.length - 1)
            : (this.currentIndex -= 1);
        } else {
          this.currentIndex + 1 > this.options.length - 1
            ? (this.currentIndex = 0)
            : (this.currentIndex += 1);
        }
        this.$emit("input", this.options[this.currentIndex].value);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.c-icon-label-filter {
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  padding: 0.5rem;

  &__icons {
    color: $light-grey;
    padding-bottom: 0.2rem;
    border-radius: 10px;

    display: flex;
    align-items: center;
    justify-content: center;

    & > * {
      font-size: 1.25rem;
      &:not(:last-child) {
        margin-right: 0.5rem;
      }
    }
  }

  &__label {
    font-size: 0.85714286rem;
    color: $black;
    font-weight: normal;
    cursor: inherit;
    user-select: none;
    text-align: center;
    display: none;
  }

  &--header {
    .c-icon-label-filter__label {
      color: $white;
    }

    .c-icon-label-filter__icons {
      color: $white;
    }
  }

  &--muted {
    .c-icon-label-filter__label {
      color: $black-grey;
    }

    .c-icon-label-filter__icons {
      color: $black-grey;
    }
  }

  &--primary {
    .c-icon-label-filter__label {
      color: $blue;
    }

    .c-icon-label-filter__icons {
      color: $blue;
    }
  }

  &--success {
    .c-icon-label-filter__label {
      color: $green;
    }

    .c-icon-label-filter__icons {
      color: $green;
    }
  }

  &--warning {
    .c-icon-label-filter__label {
      color: $yellow;
    }

    .c-icon-label-filter__icons {
      color: $yellow;
    }
  }

  &--danger {
    .c-icon-label-filter__label {
      color: $red;
    }

    .c-icon-label-filter__icons {
      color: $red;
    }
  }

  &--orange {
    .c-icon-label-filter__label {
      color: $orange;
    }

    .c-icon-label-filter__icons {
      color: $orange;
    }
  }
}

@media (min-width: $breakpoint-min-md) {
  .c-icon-label-filter {
    &__label {
      display: block;
    }
  }
}
</style>
