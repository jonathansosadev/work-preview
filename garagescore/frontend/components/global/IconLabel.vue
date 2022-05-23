<template>
  <div class="c-icon-label" :class="classBinding" v-tooltip="{ content: title }">
    <div class="c-icon-label__icons">
      <slot name="icon"></slot>
    </div>
    <label class="c-icon-label__label">
      <slot />
    </label>
  </div>
</template>

<script>
export default {
  name: 'IconLabel',
  props: {
    type: String,
    bold: Boolean,
    title: String
  },

  computed: {
    classBinding() {
      return {
        "c-icon-label--bold": this.bold,
        "c-icon-label--header": this.type === "header",
        "c-icon-label--primary": this.type === "primary",
        "c-icon-label--success": this.type === "success",
        "c-icon-label--warning": this.type === "warning",
        "c-icon-label--danger": this.type === "danger",
        "c-icon-label--muted": this.type === "muted"
      };
    }
  }
};
</script>

<style lang="scss" scoped>
.c-icon-label {
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;

  &__label {
    color: $black;
    font-weight: 400;
    cursor: inherit;
    text-align: center;
    font-size: 1rem;
  }

  &--header {
    .c-icon-label__icons {
      color: $white;
    }
    .c-icon-label__label {
      color: $white;
    }
  }

  &--bold {
    .c-icon-label {
      &__label {
        font-weight: bold;
      }
    }
  }

  &__icons {
    color: $dark-grey;

    vertical-align: bottom;

    & > * {
      font-size: 1.25rem;
      &:not(:last-child) {
        margin-right: 0.5rem;
      }
    }
  }

  &--muted {
    .c-icon-label__label {
      color: $dark-grey;
    }

    .c-icon-label__icons {
      color: $dark-grey;
    }
  }
  &--primary {
    .c-icon-label__label {
      color: $blue;
    }

    .c-icon-label__icons {
      color: $blue;
    }
  }

  &--success {
    .c-icon-label__label {
      color: $green;
    }

    .c-icon-label__icons {
      color: $green;
    }
  }

  &--warning {
    .c-icon-label__label {
      color: $yellow;
    }

    .c-icon-label__icons {
      color: $yellow;
    }
  }

  &--danger {
    .c-icon-label__label {
      color: $red;
    }

    .c-icon-label__icons {
      color: $red;
    }
  }
}
</style>

