<template>
  <div class="wizard-comment">
    <textarea class="wizard-comment__textarea" :value="value" :placeholder="required? $t_locale('components/global/WizardStepComment')('placeholderMandatory', { 'minLength': minLength }) : $t_locale('components/global/WizardStepComment')('placeholder')" rows="3" @input="onInput"></textarea>
    <button
      class="wizard-comment__button"
      @click="$emit('validate')"
      :disabled="loading || (required && value.length < minLength)"
      :class="{ disabled: loading || (required && value.length < minLength) }">
      <i v-if="loading" class="icon-gs-loading" />
      {{ $t_locale('components/global/WizardStepComment')('save') }}
    </button>
  </div>
</template>


<script>
export default {
  props: {
    value: String,
    loading: Boolean,
    required: Boolean,
    minLength: Number,
  },

  methods: {
    onInput(event) {
      this.$emit('input', event.target.value);
    }
  }
}
</script>


<style lang="scss" scoped>
.wizard-comment {
  width: 100%;

  &__textarea {
    margin-top: 0.714rem;
    width: 100%;
    outline: 0;
    border-radius: 5px;
    border-color: rgba($grey, .5);
    padding: 0.7rem;
    box-sizing: border-box;
  }

  &__button {
    margin-top: 0.5rem;
    display: block;
    border: none;
    background-color: $orange;
    padding: 0.5rem;
    border-radius: 5px;
    color: $white;
    width: 100%;
    outline: 0;
    cursor: pointer;
  }

  &__button.disabled {
    background-color: $grey;
    cursor: not-allowed;
  }
}
</style>
