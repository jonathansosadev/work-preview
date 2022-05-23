<template>
  <div class="wizard-folder">
    <div class="wizard-folder__breadcrumbs">
      <Breadcrumbs>
        <BreadcrumbsItem class="wizard-folder__breadcrumbs-item" :active="currentStep >= 0" @click="setCurrentStep(0)">
          {{ labelFirst }}
        </BreadcrumbsItem>
        <BreadcrumbsItem class="wizard-folder__breadcrumbs-item" :active="currentStep >= 1" @click="setCurrentStep(1)">
          {{ labelSecond }}
        </BreadcrumbsItem>
        <BreadcrumbsItem
          v-if="selectedAction.action === 'leadClosed'"
          class="wizard-folder__breadcrumbs-item"
          :active="currentStep >= 2"
          @click="setCurrentStep(2)"
        >
          {{ labelThird }}
        </BreadcrumbsItem>
        <BreadcrumbsItem class="wizard-folder__breadcrumbs-item" :active="currentStep >= 3" @click="setCurrentStep(3)">
          {{ labelFourth }}
        </BreadcrumbsItem>
      </Breadcrumbs>
    </div>
    <div class="wizard-folder__step">
      <WizardStepAction
        v-if="currentStep === 0"
        v-model="selectedAction"
        @validate="firstScreenValidate"
        :isAMaintenanceLead="isAMaintenanceLead"
      />

      <WizardStepPlan v-if="currentStepIsPlan" @validate="secondScreenValidate" />

      <WizardStepTransfert
        v-if="currentStep === 1 && selectedAction.action === 'transfer'"
        v-model="selectedUser"
        @validate="secondScreenValidate"
        :users="users"
        :garageId="garageId"
        :garageDisplayName="garageDisplayName"
        :openModalDispatch="openModalDispatch"
        :appendTicketUserDispatch="appendTicketUserDispatch"
        :ticketManagerId="ticketManagerId"
        :currentUserIsGarageScoreUser="currentUserIsGarageScoreUser"
        :jobsByCockpitType="jobsByCockpitType"
        :userRole="userRole"
      />

      <WizardStepCloseLead
        v-if="currentStep === 1 && selectedAction.action === 'leadClosed'"
        v-model="selectedClose"
        @validate="secondScreenValidate"
        :isAMaintenanceLead="isAMaintenanceLead"
      />

      <WizardStepCloseLeadDetail
        v-if="currentStep === 2 && selectedAction.action === 'leadClosed'"
        v-model="selectedCloseDetail"
        @validate="thirdScreenValidate"
        :type="selectedClose"
        :leadSaleType="leadTicket.saleType"
      />

      <WizardStepComment
        :loading="loading"
        :required="selectedAction.action === 'leadClosed'"
        :minLength="10"
        v-if="currentStep === 3"
        v-model="comment"
        @validate="submit"
      />
    </div>
  </div>
</template>

<script>
import WizardStepComment from '~/components/global/WizardStepComment';
import WizardStepPlan from '~/components/global/WizardStepPlan';
import WizardStepTransfert from '~/components/global/WizardStepTransfert';
import WizardStepAction from './WizardStepAction';
import WizardStepCloseLead from './WizardStepCloseLead';
import WizardStepCloseLeadDetail from './WizardStepCloseLeadDetail';

import DataTypes from '~/utils/models/data/type/data-types';
import { TicketActionNames, LeadTicketMissedReasons } from '~/utils/enumV2';

export default {
  components: {
    WizardStepAction,
    WizardStepComment,
    WizardStepPlan,
    WizardStepTransfert,
    WizardStepCloseLead,
    WizardStepCloseLeadDetail,
  },

  props: {
    id: String,
    garage: Object,
    leadTicket: Object,
    updateTicketDispatch: Function,
    addTicketActionDispatch: Function,
    openModalDispatch: Function,
    appendTicketUserDispatch: Function,
    ticketManagerId: String,
    currentUserIsGarageScoreUser: Boolean,
    jobsByCockpitType: Array,
    userRole: String,
  },

  data() {
    return {
      currentStep: 0,

      // data needed
      selectedAction: { action: null, subaction: null },
      selectedDate: null,
      selectedUser: null,
      selectedClose: null,
      selectedCloseDetail: null,
      comment: '',
      loading: false,
    };
  },

  watch: {
    currentStep(newStep) {
      if (newStep === 2 && this.selectedAction.action !== 'leadClosed') this.currentStep = 3;
    },
  },

  computed: {
    isAMaintenanceLead() {
      return this.leadTicket.saleType === DataTypes.MAINTENANCE;
    },

    users() {
      return this.garage.users || [];
    },

    garageId() {
      return this.garage.id;
    },

    garageDisplayName() {
      return this.garage.publicDisplayName;
    },

    currentStepIsPlan() {
      const isSubActionPlan = this.selectedAction.subaction === 'plan';
      const isActionPostponedLead = this.selectedAction.action === 'postponedLead';
      return this.currentStep === 1 && (isActionPostponedLead || isSubActionPlan);
    },

    labelFirst() {
      switch (this.selectedAction.action) {
        case TicketActionNames.CUSTOMER_CALL:
          return this.$t_locale('components/cockpit/wizards/leads/WizardLeadsFolder')(TicketActionNames.CUSTOMER_CALL);
        case TicketActionNames.PROPOSITION:
          return this.$t_locale('components/cockpit/wizards/leads/WizardLeadsFolder')(TicketActionNames.PROPOSITION);
        case TicketActionNames.MEETING:
          return this.$t_locale('components/cockpit/wizards/leads/WizardLeadsFolder')(this.isAMaintenanceLead ? 'apv_meeting' : 'meeting');
        case TicketActionNames.TRANSFER:
          return this.$t_locale('components/cockpit/wizards/leads/WizardLeadsFolder')(TicketActionNames.TRANSFER);
        case TicketActionNames.LEAD_CLOSED:
          return this.$t_locale('components/cockpit/wizards/leads/WizardLeadsFolder')(TicketActionNames.LEAD_CLOSED);
        case TicketActionNames.POSTPONED_LEAD:
          return this.$t_locale('components/cockpit/wizards/leads/WizardLeadsFolder')(TicketActionNames.POSTPONED_LEAD);
        case null:
          return this.$t_locale('components/cockpit/wizards/leads/WizardLeadsFolder')('null');
        default:
          return this.selectedAction.action;
      }
    },

    labelSecond() {
      if (this.selectedAction.subaction) {
        if (this.selectedAction.subaction === 'done') {
          return this.$t_locale('components/cockpit/wizards/leads/WizardLeadsFolder')('realised');
        }
        return this.selectedDate ? this.$dd(this.selectedDate, 'DD MMMM YYYY') : this.$t_locale('components/cockpit/wizards/leads/WizardLeadsFolder')('planification');
      }

      if (!this.selectedAction.action) return '';
      switch (this.selectedAction.action) {
        case 'transfer':
          return this.selectedUser ? this.userLabel(this.selectedUser) : this.$t_locale('components/cockpit/wizards/leads/WizardLeadsFolder')('staff');
        case 'leadClosed':
          switch (this.selectedClose) {
            case 'Sold':
              return this.isAMaintenanceLead ? this.$t_locale('components/cockpit/wizards/leads/WizardLeadsFolder')('yes') : this.$t_locale('components/cockpit/wizards/leads/WizardLeadsFolder')('sold');
            case 'Lost':
              return this.isAMaintenanceLead ? this.$t_locale('components/cockpit/wizards/leads/WizardLeadsFolder')('no') : this.$t_locale('components/cockpit/wizards/leads/WizardLeadsFolder')('lost');
            default:
              return this.isAMaintenanceLead ? this.$t_locale('components/cockpit/wizards/leads/WizardLeadsFolder')('rdvDone?') : this.$t_locale('components/cockpit/wizards/leads/WizardLeadsFolder')('sold?');
          }
        default:
          return this.$t_locale('components/cockpit/wizards/leads/WizardLeadsFolder')('status');
      }
    },

    labelThird() {
      if (this.selectedAction.action === 'leadClosed') {
        if (LeadTicketMissedReasons.hasValue(this.selectedCloseDetail)) {
          return this.$t_locale('components/cockpit/wizards/leads/WizardLeadsFolder')(this.selectedCloseDetail, {}, this.selectedCloseDetail);
        }
        if (DataTypes.hasValue(this.selectedCloseDetail)) {
          return this.$t_locale('components/cockpit/wizards/leads/WizardLeadsFolder')(this.selectedCloseDetail, {}, this.selectedCloseDetail);
        }
        return this.$t_locale('components/cockpit/wizards/leads/WizardLeadsFolder')('details?');
      }
      return undefined;
    },
    labelFourth() {
      return this.selectedAction.action !== null ? this.$t_locale('components/cockpit/wizards/leads/WizardLeadsFolder')('comment') : '';
    },
  },

  methods: {
    clearAll() {
      this.currentStep = 0;
      this.selectedAction = { action: null, subaction: null };
      this.selectedDate = null;
      this.selectedUser = null;
      this.selectedClose = null;
      this.selectedCloseDetail = null;
      this.comment = '';
    },

    async submit() {
      const getReminder = () => {
        if (this.selectedAction.action === TicketActionNames.POSTPONED_LEAD) {
          return this.selectedDate;
        }
        if (this.selectedAction.subaction === 'plan') {
          return this.selectedDate;
        }
        return null;
      };
      if (!this.loading) {
        try {
          this.loading = true;
          if (['NewVehicleSale', 'UsedVehicleSale'].includes(this.selectedCloseDetail)) {
            // Update leadType when we close
            try {
              await this.updateTicketDispatch({
                dataId: this.id,
                field: 'saleType',
                value: this.selectedCloseDetail,
              });
            } catch (e) {
              console.log('Nothing to change');
            }
          }
          const success = await this.addTicketActionDispatch({
            id: this.id,
            action: this.selectedAction.action,
            comment: this.comment,
            reminder: getReminder(),
            transferTo: this.selectedUser,
            closeReason: this.selectedCloseDetail,
          });

          if (success) {
            this.clearAll();
          }
          this.loading = false;
        } catch (e) {
          this.loading = false;
        }
      }
    },

    setCurrentStep(val) {
      if ((val === 1 && this.selectedAction.subaction === 'done') || this.selectedAction.action === null) {
        return;
      }

      if (val === 3) {
        if (
          (this.selectedAction.subaction === 'plan' && this.selectedDate === null) ||
          (this.selectedAction.action === 'transfer' && this.selectedUser === null)
        ) {
          return;
        }
      }

      if (this.selectedAction.action === 'leadClosed') {
        // Cancel click if the user didn't choose the previous step
        if (val === 2 && !this.selectedClose) return null;
        if (val === 3 && !this.selectedCloseDetail) return null;
      }

      this.currentStep = val;
    },

    firstScreenValidate() {
      !this.selectedAction.subaction || this.selectedAction.subaction === 'plan'
        ? (this.currentStep = 1)
        : (this.currentStep = 2);
    },

    secondScreenValidate(selectedDate) {
      if (selectedDate) {
        this.selectedDate = selectedDate;
      }
      this.currentStep = 2;
    },
    thirdScreenValidate() {
      this.currentStep = 3;
    },

    userLabel(id) {
      const user = this.users.find((u) => u.id === id);
      return user.firstName || user.lastName ? `${user.firstName} ${user.lastName}` : user.email;
    },
  },
};
</script>

<style lang="scss" scoped>
.wizard-folder {
  display: flex;
  flex-flow: column;

  &__breadcrumbs {
    margin-top: .5rem;
  }

  &__breadcrumbs-item {
    &:hover {
      cursor: pointer;
    }
  }

  &__step {
    min-height: 8rem;
  }
}
</style>
