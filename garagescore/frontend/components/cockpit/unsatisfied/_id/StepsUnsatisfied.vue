<template>
  <Steps :steps="steps">
    <template slot="step" slot-scope="{ step }">
      <StepsItemSimple v-bind="step" />
    </template>
  </Steps>
</template>

<script>
import StepsItemSimple from '~/components/global/StepsItemSimple';

export default {
  components: { StepsItemSimple },

  props: {
    actions: Array,
    ticketStatus: String,
    cockpitType: String,
    isManual: Boolean
  },

  methods: {
    getTitle() {
      return this.$t_locale('components/cockpit/unsatisfied/_id/StepsUnsatisfied')('visit', { label: this.$t_locale('components/cockpit/unsatisfied/_id/StepsUnsatisfied')(this.cockpitType || 'Dealership', {}, this.cockpitType || 'Dealership') });
    },
  },

  computed: {
    steps() {
      const steps = [];

      // ------------
      // Steps ------
      // ------------

      const findAction = (action, actionName) => action.name === actionName;
      const findReminder = (action, actionName) => action.reminderActionName === actionName && action.reminderStatus !== 'Cancelled';

      const unsatisfiedStarted = this.actions.find(t => findAction(t, 'unsatisfiedStarted')) || this.actions.find(t => findReminder(t, 'unsatisfiedStarted'));
      const customerCall = this.actions.find(t => findAction(t, 'customerCall')) || this.actions.find(t => findReminder(t, 'customerCall'));
      const garageSecondVisit = this.actions.find(t => findAction(t, 'garageSecondVisit')) || this.actions.find(t => findReminder(t, 'garageSecondVisit'));
      const unsatisfiedClosed = this.actions.find(t => findAction(t, 'unsatisfiedClosed')) || this.actions.find(t => findReminder(t, 'unsatisfiedClosed'));
      const isClosed = this.ticketStatus.includes('Closed');

      // --------------
      const stepsArray = [unsatisfiedStarted, customerCall, garageSecondVisit];

      const getActive = (step) => stepsArray.slice(step).some((s) => s !== undefined) || (isClosed);

      const getType = (step) => {
        if (getActive(step)) {
          if (isClosed) {
            return 'primary';
          }
          const lastIsReminder = stepsArray[step] && stepsArray[step].name === 'reminder' && stepsArray.slice(step + 1).every((s) => s === undefined);
          if (lastIsReminder) {
            return this.$moment().isBefore(stepsArray[step].reminderDate) ? 'warning' : 'danger';
          }
          return 'primary';
        } else {
          return 'default';
        }
      };

      const status = this.isManual ? this.$t_locale('components/cockpit/unsatisfied/_id/StepsUnsatisfied')('created') : this.$t_locale('components/cockpit/unsatisfied/_id/StepsUnsatisfied')('received');

      steps.push({
        title: this.$t_locale('components/cockpit/unsatisfied/_id/StepsUnsatisfied')('unsatisfied'),
        icon: 'icon-gs-sad',
        status: (unsatisfiedStarted) ? status : '',
        value: (unsatisfiedStarted) ? this.$moment(unsatisfiedStarted.createdAt).format('DD/MM/YYYY') : '',
        type: 'primary',
        active: false,
      });

      steps.push({
        title: this.$t_locale('components/cockpit/unsatisfied/_id/StepsUnsatisfied')('contact'),
        icon: 'icon-gs-help-customer-support',
        type: getType(1),
        active: getActive(1),
      });

      steps.push({
        title: this.getTitle(),
        icon: 'icon-gs-calendar',
        type: getType(2),
        active: getActive(2),
      });

      if (['ClosedWithResolution', 'ClosedWithoutResolution'].includes(this.ticketStatus)) {
        steps.push({
          title: this.$t_locale('components/cockpit/unsatisfied/_id/StepsUnsatisfied')('resolution'),
          icon: this.ticketStatus === 'ClosedWithResolution' ? 'icon-gs-folder-check' : 'icon-gs-folder-remove',
          type: this.ticketStatus === 'ClosedWithResolution' ? 'primary' : 'danger',
          active: this.ticketStatus === 'ClosedWithResolution' || this.ticketStatus === 'ClosedWithoutResolution',
          status: this.ticketStatus === 'ClosedWithResolution' ? this.$t_locale('components/cockpit/unsatisfied/_id/StepsUnsatisfied')('satisfied') : this.$t_locale('components/cockpit/unsatisfied/_id/StepsUnsatisfied')('unresolved'),
          value: this.ticketStatus === 'ClosedWithResolution' ? this.$moment(unsatisfiedClosed.createdAt).format('DD/MM/YYYY') : '',
        });
      } else {
        steps.push({
          title: this.$t_locale('components/cockpit/unsatisfied/_id/StepsUnsatisfied')('resolution'),
          icon: 'icon-gs-folder-check',
          type: 'default',
          active: false,
          status: '',
          value: '',
        });
      }

      return steps;
    }
  }
}
</script>


<style lang="scss" scoped>
</style>
