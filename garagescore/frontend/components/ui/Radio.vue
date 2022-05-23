<template>
  <label class="radio" @keyup.enter.stop="$refs.radio.click()"> 
    <input type="radio" class="radio__radio" v-bind="$attrs" :value="radioValue" @change="change" ref="radio" :name="name"/> 
    <span class="radio__indicator" :class="{'radio__indicator__active':(value === radioValue)}">
      <i class="radio__indicator-checked" :class="classBinding"/>  
    </span> 
    <span class="radio__label" :class="{'radio__label__active':(value === radioValue)}"><slot/></span> 
  </label> 
</template>

<script>
export default {
  inheritAttrs: false,

  props: {
    radioValue: [String],
    value: [String],
    name: String,
  },

  methods: {
    change(event) {
      this.$emit('input', this.radioValue);
    }
  },

  computed: {
    classBinding() {
      return {
        'radio__indicator-checked--visible': this.value === this.radioValue,
        'radio__indicator--active': this.value === this.radioValue,
      }
    },
  }
}
</script>

<style lang="scss" scoped>
.radio  {
  position: relative;
  display: inline-flex;
  cursor: pointer;
  align-items: center;

  &__radio {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1;
    opacity: 0;
  }

  &__label {
    user-select: none;
    word-wrap: break-word;

    &__active {
      color: $blue;
      font-weight: 700;
    }
  }

  &__indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    height: 1.3rem;
    width: 1.3rem;
    border-radius: 50%;
    border: 2px solid $dark-grey;
    margin-right: .5rem;
    cursor: pointer;
    box-sizing: border-box;

    &__active {
      border: 2px solid $blue;
    }
  }

  &__indicator-checked {
    width: .6rem;
    height: .6rem;
    border-radius: 50%;
    background: transparent;

    &--visible {
      background: $blue;
    }
  }
}
</style>