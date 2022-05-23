<template>
  <div class="wizard-step">
    <button role="button"
      :class="classBinding(option.value)"
      class="wizard-step__item"
      v-for="option in reasonOptions"
      :key="option.value"
      @click="onOptionClick(option.value)">
      {{ option.label }}
    </button>
  </div>
</template>

<script>
import { UnsatisfiedTicketClaimReasons, UnsatisfiedTicketProvidedSolutions } from '~/utils/enumV2';

export default {
  props: {
    cockpitType: String,
    value: String,
  },

  data() {
    return {
      options: [
        { value: 'Resolved', label: this.$t_locale('components/cockpit/wizards/unsatisfied/WizardStepCloseUnsatisfied')('Resolved') },
        { value: 'NotResolved', label: this.$t_locale('components/cockpit/wizards/unsatisfied/WizardStepCloseUnsatisfied')('NotResolved') },
      ],

      display: null,
    }
  },

  computed: {
    label() {
      return this.$t_locale('components/cockpit/wizards/unsatisfied/WizardStepCloseUnsatisfied')(`_${this.cockpitType || 'Dealership'}`);
    },
    garageType() {
      return this.$t_locale('components/cockpit/wizards/unsatisfied/WizardStepCloseUnsatisfied')(`_${this.cockpitType}`);
    },
    reasonOptions() {
      if (!this.display) {
        return this.options;
      }
      if (this.display === 'Resolved') {
        return this.solutionOptions;
      }
      if (this.display === 'NotResolved') {
        return this.claimOptions;
      }
    },
    solutionOptions() {
      return UnsatisfiedTicketProvidedSolutions.values()
        .map((value) => ({ value, label: this.$t_locale('components/cockpit/wizards/unsatisfied/WizardStepCloseUnsatisfied')(value, { garageType: this.garageType }) }))
        .sort(({ label: labelA }, { label: labelB }) => labelA.localeCompare(labelB));
    },
    claimOptions() {
      return UnsatisfiedTicketClaimReasons.values()
        .filter((value) => {
            const supportedCockpitTypes = UnsatisfiedTicketClaimReasons.getPropertyFromValue(value, 'cockpitTypes');
            return supportedCockpitTypes.includes(this.cockpitType);
        })
        .map((value) => ({ value, label: this.$t_locale('components/cockpit/wizards/unsatisfied/WizardStepCloseUnsatisfied')(value) }))
        .sort(({ label: labelA }, { label: labelB }) => labelA.localeCompare(labelB));
    },
  },

  methods: {
    classBinding(val) {
      return {
        'wizard-step__item--active': this.value === val,
        'wizard-step__item--large': this.display !== null,
      }
    },

    onOptionClick(val) {
      if (this.display === null) {
        return this.displayChoice(val);
      } else {
        return this.validateTicketClose(val);
      }
    },

    displayChoice(val) {
      this.display = val;
    },

    validateTicketClose(reason) {
      this.$emit('input', reason);
      this.$emit('validate');
    },
  }
}
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
    font-size: 1.2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    background-color: transparent;
    outline: none;
    font-size: 0.9rem;
    border-radius: 5px;
    line-height: 1.5;

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
