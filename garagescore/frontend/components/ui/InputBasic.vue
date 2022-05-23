<template>
  <div class="input" :class="classBinding">
    <input ref="input" class="input__input" v-bind="$attrs" :value="value" v-on="listeners" v-on:keyup.enter="submit"/>
    <template v-if="$slots.right">
      <div v-on:click="submit" class="input__right input__right--btn" v-if="sendButton">
        <slot name="right"></slot>
      </div>
      <div class="input__right" v-else-if="!validateEvent">
        <slot name="right"></slot>
      </div>
      <div v-on:click="submit" class="input__right input__right--btn" v-else @click="$emit('validate')">
        <slot name="right"></slot>
      </div>
    </template>
  </div>
</template>

<script>
import { debounce } from 'lodash';

export default {
  inheritAttrs: false,

  props: {
    value: [Number, String],
    validateEvent: Boolean,
    sendButton: Boolean,
    size: String,
    debounce: { type: Number },
    error: { type: Boolean },
    autofocus: Boolean
  },

  data() {
    return {
      debounceEvent: null,
    }
  },

  created() {
    if (this.debounce) {
      this.debounceEvent = debounce((e) =>{ this.$emit('input', e.target.value) }, this.debounce)
    }
  },

  mounted() {
    if (this.autofocus && this.$refs.input && this.$refs.input.focus) this.$refs.input.focus();
  },

  computed: {
    listeners() {
      return {
        ...this.$listeners,
        input: (event) => this.debounceEvent ? this.debounceEvent(event) : this.$emit('input', event.target.value),
      };
    },

    classBinding() {
      return {
        'input--sm': this.size === 'sm',
        'input--xl': this.size === 'xl',
        'input--error': this.error,
      }
    }
  },

  methods: {
    submit(event) {
      this.$emit('submit', event.target.value);
    }
  }
}
</script>


<style lang="scss" scoped>
$border-radius: 3px;

.input {
  display: flex;
  flex-flow: row;
  background-color: white;
  border-radius: $border-radius;
  border: 1px solid $grey;
  &__input {
    //min-width:2rem;
    flex-grow: 1;
    border: none;
    outline: none;
    padding: 0.5rem;
    border-radius: $border-radius 0 0 $border-radius;
    flex-basis:0;
    width:0;
    min-width:4rem;
    &::placeholder {
      color: $black-grey;
    }
    &:disabled {
      background-color: white !important;
      color: #35495e;
      opacity: .6;
    }
  }

  &__right {
    display: flex;
    justify-content: center;
    align-items: center;
    border-left: 1px solid $grey;
    color: $white;
    background-color: $orange;
    width: 2rem;
    padding: 0.75rem;
    border-radius: 0 $border-radius $border-radius 0;
    border: 0;
    outline: 0;

    &--btn {
      cursor: pointer;

      &:hover {
        background-color: darken($orange, 5%);
      }
    }
  }

  &--sm {
    .input__input {
      padding: 0.5rem;
    }

    .input__right {
      padding: .5rem;
    }
  }

  &--xl {
    .input__input {
      padding: 0.75rem;
    }

    .input__right {
      padding: 0.75rem;
    }
  }

  &--error {
    border-color:$red;
    .input__input {
      background-color: $light-red;
    }
  }
}
</style>
