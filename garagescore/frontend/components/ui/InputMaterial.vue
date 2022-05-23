<template>
  <div class="input-material" :style="inputStyle" :class="classBinding()">
    <template v-if="type === 'date'">
      <DatePicker
        class="input-material__datepicker"
        ref="datepicker"
        :value="valueDate"
        :lang="$t_locale('components/ui/InputMaterial')('lang')"
        :placeholder="$t_locale('components/ui/InputMaterial')('selectDate')"
        :disabled-date="disabledDate"
        type="date"
        format="DD-MM-YYYY"
        @change="handleDateChange"
        :first-day-of-week="1">
      </DatePicker>
    </template>
    <template v-else-if="type === 'checkbox'">
      <input :type="type" class="input-material__checkbox" :checked="value" @click="onClick()" :class="classBindingInput()" ref="input"/>&nbsp;
    </template>
    <template v-else>
      <textarea :minlength="minLength" :maxlength="maxLength" :id="inputId" rows="2" v-if="textArea" class="input-material__input--textarea" :class="classBindingInput()" v-bind="$attrs" :value="value" v-on="listeners"/>
      <input :min="minDate" :max="maxDate" :minlength="minLength" :maxlength="maxLength" :id="inputId" :type="type" v-else class="input-material__input" :class="classBindingInput()" v-bind="$attrs" :value="value" v-on="listeners" @keypress.enter.prevent="submit" ref="input"/>
      <span class="input-material__indicator"/>
      <div class="input-material__min-max-counter" :class="minMaxClass" v-if="minLength || maxLength">{{ value && value.length || 0 }} / {{ maxLength }}</div>
    </template>
    <label class="input-material__label" :class="classBindingLabel()">
      <slot name="label" />
      <AppText tag="span" type="orange" v-if="required" class="input-material__required">*</AppText>
    </label>
    <div class="input-material__error">{{ error }}</div>
  </div>
</template>

<script >
  export default {
    inheritAttrs: false,
    name:"InputMaterial",
    props: {
      value: [String, Number, Date, Boolean, Array, Function],
      error: String,
      isValid: { type: String, default: 'Empty' },
      required: Boolean,
      textArea: Boolean,
      type: String,
      fixedWidth: String,
      inputId: String,
      submitHandler: Function,
      validate: Function,
      minLength: Number,
      maxLength: Number,
      minDate: Date,
      maxDate: Date,
      onClick: Function
    },
    computed: {
      listeners() {
        return {
          ...this.$listeners,
          input: (event) => this.$emit('input', event.target.value),
          keyup: (event) => {
            this.validate && this.validate(this.$refs.input && !this.$refs.input.validity.typeMismatch);
            this.$emit("keyup", event.target.value);
          }
        };
      },
      minMaxClass() {
        if ((this.minLength || this.maxLength) && this.value) {
          return {
            'input-material__min-max-counter--red': !(this.value && this.value.length <= this.maxLength && this.value.length >= this.minLength)
          }
        }
        return {};
      },
      inputStyle() {
        return {
          width: this.fixedWidth || 'auto'
        }
      },
      valueDate() {
        if (this.type === 'date') {
          let response = this.value;
          if (response) {
            const response = new Date(this.value);
            if (response.getTime() < 39600001) return;
            response.setHours(12);
          }
          return response;
        }
        return this.value;
      }
    },
    methods: {
      disabledDate(date) {
        let minDateDisable = false;
        let maxDateDisable = false;
        if (this.minDate) {
          date.setHours(23)
          date.setMinutes(59)
          date.setSeconds(59)
          minDateDisable = this.minDate.getTime() > date.getTime();
        }
        if (this.maxDate) {
          date.setHours(0)
          date.setMinutes(0)
          date.setSeconds(0)
          maxDateDisable = this.maxDate.getTime() < date.getTime();
        }
        return minDateDisable || maxDateDisable;
      },
      classBinding() {
        return {
          //'input-material--error': this.error || this.isValid === 'Invalid',
          'input-material--error': this.error,
          'input-material--valid': this.isValid === 'Valid' && this.value && this.value !== 0,
          'input-material--special': this.type === 'date' || this.type === 'checkbox'
        };
      },
      classBindingInput() {
        return {
          'input-material__input--has-value': true,
          'input-material__input--disabled': this.$attrs.disabled,
        };
      },
      classBindingLabel() {
        return {
          'input-material__label--checkbox': this.type === 'checkbox'
        };
      },
      submit(event) {
        if (this.submitHandler) {
          this.submitHandler(event.target.value);
        }
      },
      handleDateChange(event) {
        const response = new Date(event);
        response.setHours(12);
        this.$emit('input', response)
      }
    }
  }
</script>

<style lang="scss" scoped>
.input-material {
  position: relative;
  width: 100%;
  padding-top: 1rem;
  font-size: 1rem;
  &--special {
    width: auto;
  }
  &__datepicker {
    padding-top: 1rem;
    box-sizing: border-box;
  }
  &__checkbox {
    position: absolute; // take it out of document flow
    opacity: 0; // hide it
    // Box.
  & + label:before {
    content: '';
    margin-right: 10px;
    display: inline-block;
    vertical-align: initial;
    width: 1rem;
    height: 1rem;
    background: $white;
    border: 2px solid $dark-grey;
    box-sizing: border-box;
    border-radius: 3px;
  }
    // Box hover
    &:hover + label:before {
      background: $white;
    }
    // Box focus
    &:focus + label:before {
      box-shadow: 0 0 0 3px rgba($blue, .16);
    }
    // Box checked
    &:checked + label:before {
      border: 2px solid $blue;
    }
    // Disabled state label.
    &:disabled + label {
      color: $grey;
      cursor: auto;
    }
    // Disabled box.
    &:disabled + label:before {
      box-shadow: none;
      background: $white;
    }
    // Checkmark. Could be replaced with an image
    &:checked + label:after {
      content: '';
      position: absolute;
      left: .6rem;
      top: 1.4rem;
      background: $blue;
      width: 2px;
      height: 2px;
      box-shadow:
        1px 0 0 $blue,
        3px 0 0 $blue,
        3px -1px 0 $blue,
        3px -3px 0 $blue,
        3px -5px 0 $blue,
        3px -7px 0 $blue;
      transform: rotate(45deg);
    }
  }
  &__input {
    display: block;
    width: 100%;
    border: none;
    height: 34px;
    background-color: transparent;
    padding: 0;
    color: $greyish-brown;
    
    &--textarea {
      margin-top: 1rem;
      resize: none;
      width: 100%;
      border: none;
    }
    &--disabled {
      color: $grey;
    }
    &:focus {
      outline: none;
    }
    &::placeholder {
      color: $grey;
    }
  }
  &__indicator {
    display: block;
    border-bottom: 2px solid $grey;
    width: 100%;
  }
  &__min-max-counter {
    &--red {
      color: $red;
    }
    text-align: right;
    width: 100%;
    padding: 0.5rem 0.5rem 0 0;
    padding-right: 0;
    box-sizing: border-box;
    font-size: .9rem;
    color: $dark-grey;
  }
  &__error {
    margin-top: 0.5rem;
    font-size: 12px;
    color: $red;
    margin-bottom: .5rem;
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
    overflow: hidden;
    width: 100%;
    white-space: nowrap;
    text-overflow: ellipsis;

    &--checkbox {
      position: static;
      padding-top: 0;
      font-weight: bold;
    }
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
  &__input:focus ~ &__label,
  &__input--has-value ~ &__label {
    top: -10px;
    font-size: .9rem;
    font-weight: 300;
  }
  &--error {
    .input-material {
      &__indicator {
        border-bottom-color: $red;
      }
    }
  }
  &--valid {
    .input-material {
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