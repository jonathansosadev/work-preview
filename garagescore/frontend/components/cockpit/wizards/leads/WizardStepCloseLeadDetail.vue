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
import { LeadTicketMissedReasons } from '~/utils/enumV2';
import DataTypes from '~/utils/models/data/type/data-types';

export default {
  props: {
    value: String,
    type: String,
    leadSaleType: String,
  },

  computed: {
    options() {
      if (this.type === 'Lost') {
        return LeadTicketMissedReasons.values()
          .filter((value) => {
            const supportedLeadSaleTypes = LeadTicketMissedReasons.getPropertyFromValue(value, 'leadSaleTypes');
            return !this.leadSaleType || supportedLeadSaleTypes.includes(this.leadSaleType);
          })
          .map((value) => ({ value, label: this.$t_locale('components/cockpit/wizards/leads/WizardStepCloseLeadDetail')(value, {}, value) }))
          .sort(({ label: labelA }, { label: labelB }) => labelA.localeCompare(labelB));
      } else {
        if (this.leadSaleType === DataTypes.MAINTENANCE) {
          this.onOptionClick('Maintenance'); // Force Maintenance without asking
          return '';
        }
        return [
          { value: 'NewVehicleSale', label: this.$t_locale('components/cockpit/wizards/leads/WizardStepCloseLeadDetail')('NewVehicleSale') },
          { value: 'UsedVehicleSale', label: this.$t_locale('components/cockpit/wizards/leads/WizardStepCloseLeadDetail')('UsedVehicleSale') },
        ];
      }
    },
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
