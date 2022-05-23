<template>
  <div class="input-material" :class="classBinding()"> 
    <input class="input-material__input" :class="classBindingInput()" v-bind="$attrs" :value="value" v-on="listeners"/> 
    <span class="input-material__indicator"/>
    <div class="input-material__error">{{ error }}</div>
    <label class="input-material__label"><slot name="label"/></label> 
  </div> 
</template>


<script >
import Vue from 'vue';

export default {
  inheritAttrs: false,

  props: {
    value: [String, Number],
    error: String,
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
        'input-material--error': this.error,
      };
    },

    classBindingInput() {
      return {
        'input-material__input--has-value': this.value || this.value !== '',
      };
    }
  }
}
</script>

<style lang="scss" scoped>


.input-material {
  position: relative;
  width: 100%;
  padding-top: 16px;
  font-size: 16px;
  margin-top: 10px;

  &__input {
    display: block;
    width: 100%;
    padding: 1rem 0;
    border: none;
    height: 16px;
    background-color: transparent;
  }

  &__error {
    color: $red;
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

  &__input:focus {
    outline: none 
  }

  &__input:disabled {
    background-color: #848484;
  }

  &__input:focus ~ &__label, &__input--has-value ~ &__label {
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

