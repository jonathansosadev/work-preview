<template>
  <div class="wizard-actions">
    <div class="wizard-actions__steps-container">
      <WizardButtonStep
        :options="[{ value: 'customerCall', label: $t_locale('components/cockpit/wizards/unsatisfied/WizardStepAction')('call'), icon: 'icon-gs-help-customer-support'}]"
        v-if="value.action !== 'customerCall'"
        :value="value.action"
        @input="(v) => setAction(v, false)"
      />
      <WizardButtonStep
        :options="planOptions"
        v-if="value.action === 'customerCall'"
        :value="value.subaction"
        @input="setSubaction"
      />
    </div>
    <div class="wizard-actions__steps-container">
      <WizardButtonStep
        :options="[{ value: 'investigation', label: $t_locale('components/cockpit/wizards/unsatisfied/WizardStepAction')('investigation'), icon: 'icon-gs-folder-details'}]"
        v-if="value.action !== 'investigation'"
        :value="value.action"
        @input="(v) => setAction(v, false)"
      />
      <WizardButtonStep
        :options="planOptions"
        v-if="value.action === 'investigation'"
        :value="value.subaction"
        @input="setSubaction"
      />
    </div>
    <div class="wizard-actions__steps-container">
      <WizardButtonStep
        :options="[{ value: 'garageSecondVisit', label: $t_locale('components/cockpit/wizards/unsatisfied/WizardStepAction')('visit', { label }), icon: 'icon-gs-calendar'}]"
        v-if="value.action !== 'garageSecondVisit'"
        :value="value.action"
        @input="(v) => setAction(v, false)"
      />
      <WizardButtonStep
        :options="planOptions"
        v-if="value.action === 'garageSecondVisit'"
        :value="value.subaction"
        @input="setSubaction"
      />
    </div>
    <div class="wizard-actions__steps-container">
      <WizardButtonStep
        :options="[{ value: 'transfer', label: $t_locale('components/cockpit/wizards/unsatisfied/WizardStepAction')('transfer'), icon: 'icon-gs-group'}]"
        :value="value.action"
        @input="setAction"
      />
    </div>
    <div class="wizard-actions__steps-container">
      <WizardButtonStep
        :options="[{ value: 'unsatisfiedClosed', label: $t_locale('components/cockpit/wizards/unsatisfied/WizardStepAction')('closing'), icon: 'icon-gs-lock'}]"
        :value="value.action"
        @input="setAction"
      />
    </div>
  </div>
</template>


<script>
import WizardButtonStep from "~/components/global/WizardButtonStep";

export default {
  components: { WizardButtonStep },

  props: {
    value: {
      type: Object,
      default: {
        action: null,
        subaction: null
      }
    },
    cockpitType: String,
  },

  computed: {
    label() {
      return this.$t_locale('components/cockpit/wizards/unsatisfied/WizardStepAction')(this.cockpitType || "Dealership");
    },
    planOptions() {
      return [
        { value: "done", label: this.$t_locale('components/cockpit/wizards/unsatisfied/WizardStepAction')("realised"), icon: "icon-gs-validation-check-circle" },
        { value: "plan", label: this.$t_locale('components/cockpit/wizards/unsatisfied/WizardStepAction')("toPlan"), icon: "icon-gs-programming-time" }
      ];
    }
  },

  methods: {
    setAction(val, validate = true) {
      this.$emit("input", { action: val, subaction: null });

      if (validate) {
        this.$emit("validate");
      }
    },

    setSubaction(val, validate = true) {
      this.$emit("input", { action: this.value.action, subaction: val });

      if (validate) {
        this.$emit("validate");
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.wizard-actions {
  display: flex;
  flex-flow: row;
  justify-content: center;
  flex-wrap: wrap;
  margin-left: -0.5rem;
  margin-right: -0.5rem;

  &__steps-container {
    margin-top: 1rem;
    margin-left: 0.5rem;
    margin-right: 0.5rem;
    width: calc(100% / 3 - 1rem);
    min-width: 7rem;
    @media (min-width: $breakpoint-min-md) {
      width: calc(20% - 1rem)
    }
    @media (min-width: $breakpoint-min-lg) {
      width: calc(100% / 3 - 1rem);
    }
    @media (min-width: $breakpoint-min-xl) {
      width: calc(20% - 1rem)
    }
  }
}
</style>
