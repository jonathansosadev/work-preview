<template>
  <div class="wizard-step">
    <button
      role="button"
      :class="classBinding(option.value)"
      class="wizard-step__item wizard-step__item--large"
      v-for="option in options"
      :key="option.value"
      @click="onOptionClick(option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script>
export default {
  props: {
    value: String,
    isAMaintenanceLead: Boolean,
  },

  methods: {
    classBinding(val) {
      return { 'wizard-step__item--active': this.value === val };
    },

    onOptionClick(val) {
      this.$emit('input', val);
      this.$emit('validate');
    },
  },
  computed: {
    options() {
      return [
        { value: 'Sold', label: this.$t_locale('components/cockpit/wizards/leads/WizardStepCloseLead')(this.isAMaintenanceLead ? 'yes' : 'sold') },
        { value: 'Lost', label: this.$t_locale('components/cockpit/wizards/leads/WizardStepCloseLead')(this.isAMaintenanceLead ? 'no' : 'lost') },
      ];
    },
  },
};
</script>

<style lang="scss" scoped>
.wizard-step {
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
  flex-flow: row;
  flex-wrap: wrap;

  &__item {
    width: 10rem;
    min-height: 1rem;
    margin: 0.5rem;
    padding: 1rem;
    border: 1px solid $orange;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    background-color: transparent;
    outline: none;
    font-size: 0.9rem;

    &--large {
      height: 5rem;
    }

    &:hover {
      background-color: lighten($orange, 40%);
    }

    &--active {
      background-color: $orange;
      color: $white;

      &:hover {
        background-color: $orange;
      }
    }
  }
}
</style>
