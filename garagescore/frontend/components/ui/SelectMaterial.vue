<template>
  <div class="select-material" :class="classBinding()">
    <select
      class="select-material__select"
      :class="classBindingSelect()"
      v-bind="$attrs"
      :value="value"
      v-on="listeners"
    >
      <option value disabled>{{placeholder}}</option>
      <option
        :disabled="option.disabled"
        :value="option.value"
        v-for="(option, index) in options"
        :key="index"
      >{{ option.label }}</option>
    </select>
    <span class="select-material__indicator" />
    <div class="select-material__error">{{ error }}</div>
    <label class="select-material__label">
      <slot name="label" />
      <AppText tag="span" type="orange" v-if="required" class="select-material__required">*</AppText>
    </label>
  </div>
</template>

<script >
export default {
  inheritAttrs: false,

  props: {
    value: [String, Object, Number, Boolean],
    error: String,
    isValid: String,
    options: Array,
    required: Boolean,
    placedLabel: Boolean,
    placeholder: String,
    small: Boolean
  },

  computed: {
    listeners() {
      return {
        change: event => {
          this.$emit("input", event.target.value);
        }
      };
    }
  },

  methods: {
    classBinding() {
      return {
        //"select-material--error": this.error || this.isValid === "Invalid",
        "select-material--error": this.error,
        "select-material--valid": this.isValid === "Valid" && this.value && this.value !== 0,
        "select-material--small": this.small
      };
    },

    classBindingSelect() {
      return {
        "select-material__select--has-value": true, // No more placed label this.value || this.value !== '' || this.placedLabel,
        "select-material__select--has-no-value": !(
          this.value || this.value !== ""
        ),
        "select-material__select--small": this.small
      };
    }
  }
};
</script>

<style lang="scss" scoped>
.select-material {
  position: relative;
  width: 100%;
  padding-top: 1rem;
  font-size: 1rem;

  &--small {
    font-size: 1rem;
  }

  &__select {
    cursor: pointer;
    display: block;
    appearance: none;
    width: 100%;
    height: 36px;
    border: none;
    background-color: transparent;
    &--has-no-value {
      color: $grey;
      option {
        color: black;
      }
    }
    &--small {
      color: $dark-grey;
    }
    option:disabled {
      color: $grey;
    }
  }

  &__indicator {
    display: block;
    border-bottom: 2px solid $grey;
    width: 100%;
  }

  &__label {
    pointer-events: none;
    transition: 0.2s ease all;
    position: absolute;
    top: 0;
    left: 0;
    padding-top: 10px;
    user-select: none;
    color: $dark-grey;
    font-weight: 300;
    overflow: hidden;
    width: 100%;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &__icon {
    pointer-events: none;
    transition: 0.2s ease all;
    position: absolute;
    top: 0;
    left: 0;
    padding-top: 2.5rem;
    padding-left: 0.25rem;
    user-select: none;
  }

  &__required {
    margin-left: 0.25rem;
  }

  &__select:focus {
    outline: none;
  }

  &__select:focus ~ &__label,
  &__select--has-value ~ &__label {
    top: -5px;
    font-size: .9rem;
    font-weight: 300;
  }

  &--error {
    .select-material {
      &__indicator {
        border-bottom-color: $red;
      }
    }
  }

  &--valid {
    .select-material {
      &__indicator {
        border-bottom-color: $green;
      }
    }
  }
}

@keyframes fill {
  0% {
    width: 0%;
  }
  100% {
    width: 100%;
  }
}
</style>
