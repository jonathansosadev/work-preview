<template>
  <button
    class="button-icon-label"
    v-on="$listeners"
    :class="classBinding"
    v-tooltip="{ content: title }"
  >
    <IconLabel class="button-icon-label__icon-label" :bold="bold" :type="type">
      <template slot="icon">
        <slot name="icon" />
      </template>
      <template>
        <slot />
      </template>
    </IconLabel>
    <i class="button-icon-label__chevron icon-gs-down" />
  </button>
</template>

<script>
import IconLabel from "~/components/global/IconLabel";

export default {
  props: {
    type: String,
    bold: Boolean,
    title: String,
    active: Boolean
  },

  components: {
    IconLabel
  },

  computed: {
    classBinding() {
      return {
        "button-icon-label--bold": this.bold,
        "button-icon-label--header": this.type === "header",
        "button-icon-label--primary": this.type === "primary",
        "button-icon-label--success": this.type === "success",
        "button-icon-label--warning": this.type === "warning",
        "button-icon-label--danger": this.type === "danger",
        "button-icon-label--muted": this.type === "muted",
        "button-icon-label--active": this.active
      };
    }
  }
};
</script>

<style lang="scss" scoped>
.button-icon-label {
  position: relative;
  border: none;
  background-color: transparent;
  outline: 0px;
  cursor: pointer;

  &--active {
    .button-icon-label__chevron {
      opacity: 1;
      transform: rotate(180deg);
    }
  }

  &__chevron {
    font-size: 0.7rem;

    position: absolute;
    top: calc(50% - 0.4rem);
    left: calc(100% + 0.2rem);

    opacity: 0;
    transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
  }

  &:hover {
    .button-icon-label {
      &__chevron {
        opacity: 1;
      }
    }
  }

  &--muted {
    .button-icon-label__chevron {
      color: $dark-grey;
    }
  }
  &--primary {
    .button-icon-label__chevron {
      color: $blue;
    }
  }

  &--success {
    .button-icon-label__chevron {
      color: $green;
    }
  }

  &--warning {
    .button-icon-label__chevron {
      color: $yellow;
    }
  }

  &--danger {
    .button-icon-label__chevron {
      color: $red;
    }
  }
}
</style>