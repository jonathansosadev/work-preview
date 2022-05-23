<template>
  <div class="select-material" :class="classBinding()">
    <select class="select-material__select" :class="classBindingSelect()" v-bind="$attrs" :value="value" v-on="listeners">
      <option value="" disabled></option>
      <option :value="option.value" v-for="(option, index) in options" :key="index">{{ option.label }}</option>
    </select>
    <span class="select-material__indicator"/>
    <div class="select-material__error">{{ error }}</div>
    <label class="select-material__label"><slot name="label"/></label>
  </div>
</template>


<script >
import Vue from 'vue';

export default {
  inheritAttrs: false,

  props: {
    value: [String, Object, Number, Boolean],
    error: String,
    options: Array,
  },

  computed: {
    listeners() {
      return {
        input: (event) => this.$emit('input', event.target.value),
      };
    }
  },

  methods: {
    classBinding() {
      return {
        'select-material--error': this.error,
      };
    },

    classBindingSelect() {
      return {
        'select-material__select--has-value':  this.value || this.value !== '',
      };
    }
  }
}
</script>

<style lang="scss" scoped>

.select-material {
  position: relative;
  width: 100%;
  padding-top: 18px;
  font-size: 16px;
  margin-top: 8px;

  &__select {
    cursor: pointer;
    display: block;
    appearance: none;
    width: 100%;
    border: none;
    background-color: transparent;
  }

  &__indicator {
    display: block;
    border-bottom: 1px solid silver;
    width: 100%;
  }

  &__label {
    pointer-events: none ;
    transition: 0.2s ease all;
    position: absolute;
    top: 0;
    left: 0;
    padding-top: 16px;
    user-select: none;
    color: silver;
    font-weight: 300;
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

  &__select:focus {
    outline: none
  }

  &__select:focus ~ &__label, &__select--has-value ~ &__label {
    top: -25px;
    font-size: 14px;
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

