<template>
  <Steps :steps="steps">
    <template slot="step" slot-scope="{ step }">
      <StepsItemSimple v-bind="step" />
    </template>
  </Steps>
</template>

<script>
  import StepsItemSimple from '~/components/global/StepsItemSimple';
  import DataTypes from "~/utils/models/data/type/data-types";
  import { getDeepFieldValue as deep } from "~/utils/object";

  export default {
    components: { StepsItemSimple },

    data() {
      return { deep: (fieldName) => deep(this.dataGetLeadTicket, fieldName) };
    },
    props: {
      dataGetLeadTicket: Object
    },
    computed: {
      isAMaintenanceLead() {
        return this.deep('leadTicket.saleType') === DataTypes.MAINTENANCE;
      },
      actions() {
        return this.deep('leadTicket.actions') || [];
      },
      steps() {
        const steps = [];
        // ------------
        // Steps ------
        // ------------

        const findAction = (action, actionName) => action.name === actionName;
        const findReminder = (action, actionName) => action.reminderActionName === actionName && action.reminderStatus !== 'Cancelled';

        const leadStarted = this.actions.find(t => findAction(t, 'leadStarted')) || this.actions.find(t => findReminder(t, 'leadStarted'));
        const customerCall = this.actions.find(t => (findAction(t, 'customerCall') || findAction(t, 'incomingCall'))) || this.actions.find(t => findReminder(t, 'customerCall'));
        const meeting = this.actions.find(t => findAction(t, 'meeting')) || this.actions.find(t => findReminder(t, 'meeting'));
        const proposition = this.actions.find(t => findAction(t, 'proposition')) || this.actions.find(t => findReminder(t, 'proposition'));
        const leadClosed = this.actions.find(t => findAction(t, 'leadClosed'));
        const isClosed = (this.deep('leadTicket.status') || '').includes('Closed');

        // --------------
        const stepsArray = [leadStarted, customerCall, meeting, proposition];

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

        const status = (this.deep('source.type') === 'ManualLead') ? this.$t_locale('components/cockpit/leads/_id/StepsLead')('created') : this.$t_locale('components/cockpit/leads/_id/StepsLead')('received');

        //1 - Projet
        steps.push({
          title: this.$t_locale('components/cockpit/leads/_id/StepsLead')('project'),
          icon: 'icon-gs-car-repair',
          status: (leadStarted) ? status: '',
          value: (leadStarted) ? this.$dd(leadStarted.createdAt, 'DD MMMM YYYY') : '',
          type: 'primary',
          active: false,
        });

        //2 - Prise de contact
        steps.push({
          title: this.$t_locale('components/cockpit/leads/_id/StepsLead')('contact'),
          icon: 'icon-gs-help-customer-support',
          type: getType(1),
          active: getActive(1),
        });


        //3 - Rendez-vous
        steps.push({
          title: this.$t_locale('components/cockpit/leads/_id/StepsLead')(this.isAMaintenanceLead ? 'apv_meeting' : 'meeting'),
          icon: 'icon-gs-calendar',
          type: getType(2),
          active: getActive(2),
        });

        //4 - Négociation
        if (!this.isAMaintenanceLead) {
          steps.push({
            title: this.$t_locale('components/cockpit/leads/_id/StepsLead')('nego'),
            icon: 'icon-gs-cash-bag-euro',
            type: getType(3),
            active: getActive(3),
          });
        }

        //5 - Vente
        if (['ClosedWithSale', 'ClosedWithoutSale'].includes(this.deep('leadTicket.status'))) {
          const closedWithSale = this.deep('leadTicket.status') === 'ClosedWithSale';
          if (closedWithSale) {
            steps.push({
              title: this.$t_locale('components/cockpit/leads/_id/StepsLead')('sell'),
              icon: 'icon-gs-folder-check',
              type: 'primary',
              active: true,
              status: this.$t_locale('components/cockpit/leads/_id/StepsLead')(this.isAMaintenanceLead ? 'yes' : 'sold'),
              value: this.$dd(leadClosed.createdAt, 'DD MMMM YYYY'),
            });
          } else {
            steps.push({
              title: this.$t_locale('components/cockpit/leads/_id/StepsLead')('sell'),
              icon: 'icon-gs-folder-remove',
              type: 'danger',
              active: true,
              status: this.$t_locale('components/cockpit/leads/_id/StepsLead')(this.isAMaintenanceLead ? 'no' : 'lost'),
              value: '',
            });
          }
        } else {
          steps.push({
            title: this.$t_locale('components/cockpit/leads/_id/StepsLead')('sell'),
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
