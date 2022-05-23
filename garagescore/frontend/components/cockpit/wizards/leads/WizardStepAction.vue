<template>
  <div class="wizard-actions">
    <div class="wizard-actions__steps-container">
      <WizardButtonStep
        :options="[{ value: 'customerCall', label: $t_locale('components/cockpit/wizards/leads/WizardStepAction')('customerCall'), icon: 'icon-gs-help-customer-support'}]"
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
        :options="[{ value: 'meeting', label: meetingType(), icon: 'icon-gs-calendar'}]"
        v-if="value.action !== 'meeting'"
        :value="value.action"
        @input="(v) => setAction(v, false)"
      />
      <WizardButtonStep
        :options="planOptions"
        v-if="value.action === 'meeting'"
        :value="value.subaction"
        @input="setSubaction"
      />
    </div>
    <div class="wizard-actions__steps-container" v-if="!isAMaintenanceLead">
      <WizardButtonStep
        :options="[{ value: 'proposition', label: $t_locale('components/cockpit/wizards/leads/WizardStepAction')('proposition'), icon: 'icon-gs-cash-bag-euro'}]"
        v-if="value.action !== 'proposition'"
        :value="value.action"
        @input="(v) => setAction(v, false)"
      />
      <WizardButtonStep
        :options="planOptions"
        v-if="value.action === 'proposition'"
        :value="value.subaction"
        @input="setSubaction"
      />
    </div>
    <div class="wizard-actions__steps-container">
      <WizardButtonStep
        :options="[{ value: 'transfer', label: $t_locale('components/cockpit/wizards/leads/WizardStepAction')('transfert'), icon: 'icon-gs-group'}]"
        :value="value.action"
        @input="setAction"
      />
    </div>
    <div class="wizard-actions__steps-container">
      <WizardButtonStep
        :options="[{ value: 'postponedLead', label: $t_locale('components/cockpit/wizards/leads/WizardStepAction')('postponedLead'), icon: 'icon-gs-programming-time'}]"
        :value="value.action"
        @input="setAction"
      />
    </div>
    <div class="wizard-actions__steps-container">
      <WizardButtonStep
        :options="[{ value: 'leadClosed', label: $t_locale('components/cockpit/wizards/leads/WizardStepAction')('closing'), icon: 'icon-gs-lock'}]"
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
    isAMaintenanceLead: Boolean
  },

  data() {
    return {
      planOptions: [
        { value: "done", label: this.$t_locale('components/cockpit/wizards/leads/WizardStepAction')("done"), icon: "icon-gs-validation-check-circle" },
        { value: "plan", label: this.$t_locale('components/cockpit/wizards/leads/WizardStepAction')("plan"), icon: "icon-gs-programming-time" }
      ]
    };
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
    },
    meetingType() {
      const x = this.isAMaintenanceLead ? 'apv_meeting' : 'meeting';
      return this.$t_locale('components/cockpit/wizards/leads/WizardStepAction')(x);
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
      width: calc(100% / 6 - 1rem);
    }
    @media (min-width: $breakpoint-min-lg) {
      width: calc(100% / 3 - 1rem);
    }
    @media (min-width: $breakpoint-min-xl) {
      width: calc(100% / 6 - 1rem);
    }
  }
}
</style>
