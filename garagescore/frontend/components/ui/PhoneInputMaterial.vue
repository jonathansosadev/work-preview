<template>
  <div class="phone-input-material">
    <label class="phone-input-material__label">
      <slot name="label" />
      <AppText tag="span" type="orange" v-if="required" class="phone-input-material__required">*</AppText>
    </label>
    <div class="phone-input-material__prompt">
      <select
        class="phone-input-material__prompt__select"
        :value="countryCode"
        v-on="countryCodeListeners"
        :disabled="disabled"
      >
        <option :value="country" v-for="(countrySpec, country) in phoneNumberSpecs" :key="country" v-if="!countries || countries.includes(country)"
          >{{ country }}&nbsp;&nbsp;{{ countrySpec.code }}</option
        >
      </select>
      <input
        class="phone-input-material__prompt__input"
        v-bind="$attrs"
        :value="rawPhone"
        v-on="listeners"
        :disabled="disabled"
      />
      <slot name="kill" />
    </div>
    <span class="phone-input-material__indicator" :class="classBinding()" />
    <div class="phone-input-material__error">{{ error }}</div>
  </div>
</template>

<script>
import { phoneNumberSpecs, validatePhoneNumberFromInput, parsePhoneNumber } from "~/utils/phone";

export default {
  inheritAttrs: false,
  props: {
    value: [String, Number],
    mode: String,
    error: String,
    required: Boolean,
    validate: Function,
    disabled: Boolean,
    countries: Array,
  },
  data() {
    return {
      rawPhone: "",
      countryCode: "FR",
      phoneNumberSpecs
    };
  },
  mounted() {
    // Guess the country & extract national phone number
    const phoneNumberInfo = parsePhoneNumber(this.value);
    if (phoneNumberInfo) {
      // Update information in the input
      this.countryCode = phoneNumberInfo.country;
      this.rawPhone = this.formatPhoneNumber(phoneNumberInfo.nationalPhoneNumber);
      if (!this.rawPhone) this.$emit("input", "");
      else this.$emit("input", this.phoneNumberSpecs[this.countryCode].code + this.cleanPhoneNumber(this.rawPhone));
    }
  },
  computed: {
    listeners() {
      return {
        input: event => {
          this.rawPhone = event.target.value;

          if (!this.rawPhone) this.$emit("input", "");
          else this.$emit("input", this.phoneNumberSpecs[this.countryCode].code + this.cleanPhoneNumber(this.rawPhone));
        },
        blur: () => {
          if (this.numberNeedsFormatting(this.rawPhone, this.mode))
            this.rawPhone = this.formatPhoneNumber(this.rawPhone);

          if (!this.rawPhone) this.$emit("input", "");
          else this.$emit("input", this.phoneNumberSpecs[this.countryCode].code + this.cleanPhoneNumber(this.rawPhone));
        },
        keyup: event => {
          this.$emit("keyup", event.target.value);
        }
      };
    },
    countryCodeListeners() {
      return {
        change: event => {
          this.countryCode = event.target.value;

          if (!this.rawPhone) this.$emit("input", "");
          else this.$emit("input", this.phoneNumberSpecs[this.countryCode].code + this.cleanPhoneNumber(this.rawPhone));
        }
      };
    },

    isValid() {
      if (!this.rawPhone || !this.phoneNumberSpecs[this.countryCode]) {
        this.validate(false);
        return false;
      }
      const validationResult = validatePhoneNumberFromInput(this.rawPhone, this.mode, this.countryCode);
      this.validate(validationResult);
      return validationResult;
    }
  },
  methods: {
    classBinding() {
      return {
        "phone-input-material__indicator--error": this.error || (this.isValid === false && this.rawPhone),
        "phone-input-material__indicator--valid": this.isValid === true && this.rawPhone
      };
    },
    numberNeedsFormatting(phoneNumber, mode) {
      const countrySpec = this.phoneNumberSpecs[this.countryCode];
      phoneNumber = phoneNumber.replace(/(\s|\.|-)/g, "");
      if (!countrySpec) return false;
      if (countrySpec.numberLength[mode] === null) return true;
      if (countrySpec.leadingZero && phoneNumber[0] !== "0") {
        return phoneNumber.length === countrySpec.numberLength[mode] - 1;
      } else {
        return phoneNumber.length === countrySpec.numberLength[mode];
      }
    },
    formatPhoneNumber(phoneNumber) {
      const countrySpec = this.phoneNumberSpecs[this.countryCode];
      if (!countrySpec) return false;
      return countrySpec.formatter(phoneNumber);
    },
    cleanPhoneNumber(phoneNumber) {
      return phoneNumber.replace(/(\s|\.|-)/g, "");
    }
  }
};
</script>

<style lang="scss" scoped>
.phone-input-material {
  position: relative;
  width: 100%;
  font-size: 1rem;
  margin-top: .5rem;

  &__prompt {
    display: block;
    margin-top: .3rem;
    &__select {
      cursor: pointer;
      display: inline-block;
      color: $dark-grey;
      // appearance: none;
      // -webkit-appearance: none;  /*Removes default chrome and safari style*/
      // -moz-appearance: none;  /*Removes default style Firefox*/
      height: 2rem;
      border: none;
      background-color: transparent;
      
      &--has-no-value {
        color: $grey;
        option {
          color: $dark-grey;
        }
      }
      &--small {
        color: $dark-grey;
      }
      &:focus {
        outline: none;
      }

      /* Styles for IE */
      &::-ms-expand {
        display: none;
      }
    }

    &__input {
      padding-left: 0.5rem;
      display: inline-block;
      width: calc(100% - 76px - 0.5rem - 16px);
      border: none;
      height: 1.5rem;
      background-color: transparent;
      border-left: 2px solid $grey;
      margin-bottom: .3rem;
      &::placeholder {
        color: $grey;
      }
      &:focus {
        outline: none;
      }
    }
  }

  &__indicator {
    display: block;
    border-bottom: 2px solid $grey;
    width: 100%;
    &--error {
      border-bottom-color: $red;
    }
    &--valid {
      border-bottom-color: $green;
    }
  }

  &__label {
    margin-top: 10px;
    user-select: none;
    color: $dark-grey;
    font-size: .9rem;
    font-weight: 300;
    overflow: hidden;
    width: 100%;
    white-space: nowrap;
    text-overflow: ellipsis;
    background-color: transparent;
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
