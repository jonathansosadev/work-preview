<template>
  <div class="wizard-folder">
    <div class="wizard-folder__breadcrumbs">
      <Breadcrumbs>
        <BreadcrumbsItem
            class="wizard-folder__breadcrumbs-item"
            :active="currentStep >= 0"
            @click="setCurrentStep(0)"
        >{{ labelFirst }}
        </BreadcrumbsItem>
        <BreadcrumbsItem
            class="wizard-folder__breadcrumbs-item"
            :active="currentStep >= 1"
            @click="setCurrentStep(1)"
        >{{ labelSecond }}
        </BreadcrumbsItem>
        <BreadcrumbsItem
            class="wizard-folder__breadcrumbs-item"
            :active="currentStep >= 2"
            @click="setCurrentStep(2)"
        >{{ labelThird }}
        </BreadcrumbsItem>
      </Breadcrumbs>
    </div>
    <div class="wizard-folder__step">
      <WizardStepAction
          v-if="currentStep === 0"
          v-model="selectedAction"
          @validate="firstScreenValidate"
          :cockpitType="cockpitType"
      />

      <WizardStepPlan
          v-if="currentStep === 1 && this.selectedAction.subaction === 'plan'"
          @validate="secondScreenValidate"
      />

      <WizardStepTransfert
          v-if="currentStep === 1 && this.selectedAction.action === 'transfer'"
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
          :availableGarages="availableGarages"
      />

      <WizardStepCloseUnsatisfied
          v-if="currentStep === 1 && this.selectedAction.action === 'unsatisfiedClosed'"
          v-model="selectedClose"
          :cockpitType="cockpitType"
          @validate="secondScreenValidate"
      />

      <WizardStepComment
          :loading="loading"
          :required="this.selectedAction.action === 'unsatisfiedClosed'"
          :minLength="10"
          v-if="currentStep === 2"
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
import WizardStepCloseUnsatisfied from './WizardStepCloseUnsatisfied';
import GarageTypes from "~/utils/models/garage.type.js";

export default {
  components: {
    WizardStepAction,
    WizardStepComment,
    WizardStepPlan,
    WizardStepTransfert,
    WizardStepCloseUnsatisfied,
  },

  props: {
    id: String,
    openModalDispatch: Function,
    appendTicketUserDispatch: Function,
    ticketManagerId: String,
    currentUserIsGarageScoreUser: Boolean,
    jobsByCockpitType: Array,
    cockpitType: String,
    userRole: String,
    unsatisfiedTicket: Object,
    garage: Object,
    solutionOptions: Array,
    claimOptions: Array,
    addTicketAction: Function,
    availableGarages: Array,
  },

  data() {
    return {
      currentStep: 0,

      // data needed
      selectedAction: { action: null, subaction: null },
      selectedDate: null,
      selectedUser: null,
      selectedClose: null,
      comment: '',
      loading: false,
    };
  },

  computed: {
    users() {
      return this.garage.users;
    },

    garageId() {
      return this.garage.id;
    },

    garageDisplayName() {
      return this.garage.publicDisplayName;
    },

    labelFirst() {
      switch (this.selectedAction.action) {
        case 'customerCall':
          return this.$t_locale('components/cockpit/wizards/unsatisfied/WizardUnsatisfiedFolder')('customerCall');
        case 'investigation':
          return this.$t_locale('components/cockpit/wizards/unsatisfied/WizardUnsatisfiedFolder')('investigation');
        case 'garageSecondVisit':
          return this.$t_locale('components/cockpit/wizards/unsatisfied/WizardUnsatisfiedFolder')('garageSecondVisit');
        case 'transfer':
          return this.$t_locale('components/cockpit/wizards/unsatisfied/WizardUnsatisfiedFolder')('transfer');
        case 'unsatisfiedClosed':
          return this.$t_locale('components/cockpit/wizards/unsatisfied/WizardUnsatisfiedFolder')('unsatisfiedClosed');
        case null:
          return this.$t_locale('components/cockpit/wizards/unsatisfied/WizardUnsatisfiedFolder')('null');
        default:
          return this.selectedAction.action;
      }
    },

    labelSecond() {
      if (this.selectedAction.subaction) {
        if (this.selectedAction.subaction === 'done') {
          return this.$t_locale('components/cockpit/wizards/unsatisfied/WizardUnsatisfiedFolder')('realised');
        }
        return this.selectedDate ? this.$dd(this.selectedDate, 'DD MMMM YYYY') : this.$t_locale('components/cockpit/wizards/unsatisfied/WizardUnsatisfiedFolder')('planification');
      }

      switch (this.selectedAction.action) {
        case 'transfer':
          return this.selectedUser
              ? this.userLabel(this.selectedUser)
              : this.$t_locale('components/cockpit/wizards/unsatisfied/WizardUnsatisfiedFolder')('staff');
        case 'unsatisfiedClosed': {
          if (this.selectedClose === null) {
            return this.$t_locale('components/cockpit/wizards/unsatisfied/WizardUnsatisfiedFolder')('resolvedQuestion');
          } else {
            const claimOption = this.getClaimOption(this.selectedClose);
            if (claimOption) {
              return this.$t_locale('components/cockpit/wizards/unsatisfied/WizardUnsatisfiedFolder')('unResolved', {
                label: this.$t_locale('components/cockpit/wizards/unsatisfied/WizardUnsatisfiedFolder')(claimOption.value, {
                  label: this.$t_locale('components/cockpit/wizards/unsatisfied/WizardUnsatisfiedFolder')(
                      `_${this.cockpitType || 'Dealership'}`,
                  ),
                }),
              });
            }

            const solutionOption = this.getSolutionOption(this.selectedClose);
            if (solutionOption) {
              return this.$t_locale('components/cockpit/wizards/unsatisfied/WizardUnsatisfiedFolder')('resolved', {
                label: this.$t_locale('components/cockpit/wizards/unsatisfied/WizardUnsatisfiedFolder')(solutionOption.value, {
                  label: this.$t_locale('components/cockpit/wizards/unsatisfied/WizardUnsatisfiedFolder')(
                      `_${this.cockpitType || 'Dealership'}`,
                  ),
                }),
              });
            }
          }
          break;
        }
      }

      return '';
    },

    labelThird() {
      return this.selectedAction.action !== null ? this.$t_locale('components/cockpit/wizards/unsatisfied/WizardUnsatisfiedFolder')('comment') : '';
    },
  },

  methods: {
    // ----------------------
    // @TODO move it ? ------
    // TODO : use Enumv2 ?
    // ----------------------

    getClaimOption(val) {
      const options = [
        { value: "UnreachableCustomer", label: "Client injoignable" },
        { value: "RejectedSolution", label: "Solution non-acceptée" },
        { value: "UnjustifiedClaim", label: "Réclamation injustifiée" }
      ];
      if (![GarageTypes.VEHICLE_INSPECTION].includes(this.cockpitType)) {
        options.push(
            ...[
              { value: "ConstructorProblem", label: "Problème constructeur" },
              {
                value: "OtherServiceProblem",
                label: "Problème sur un autre service"
              }
            ]
        );
      }

      return options.find(
          v => v.value === val,
      );
    },

    getSolutionOption(val) {
      const garageLabel = `Passage ${GarageTypes.displayName(
          this.cockpitType,
          "fr",
          "TICKET"
      )}`;
      const solutionOptions = [
        { value: "CustomerCall", label: "Echange téléphonique" },
        { value: "GarageSecondVisit", label: garageLabel },
        { value: "Voucher", label: "Bon de réduction" },
        { value: "Other", label: "Autres" }
      ];

      return solutionOptions.find(
          v => v.value === val,
      );
    },

    //-----------------------

    clearAll() {
      this.currentStep = 0;
      this.selectedAction = { action: null, subaction: null };
      this.selectedDate = null;
      this.selectedUser = null;
      this.selectedClose = null;
      this.comment = '';
    },

    async submit() {
      if (!this.loading) {
        try {
          this.loading = true;
          // add reminder for the selected action
          const success = await this.addTicketAction(
              {
                id: this.id,
                action: this.selectedAction.action,
                comment: this.comment,
                reminder:
                    this.selectedAction.subaction === 'plan'
                        ? this.selectedDate
                        : null,
                transferTo: this.selectedUser,
                closeReason: this.selectedClose,
              },
          );

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
      if (
          (val === 1 && this.selectedAction.subaction === 'done') ||
          this.selectedAction.action === null
      ) {
        return;
      }

      if (val === 2) {
        if (
            (this.selectedAction.subaction === 'plan' &&
                this.selectedDate === null) ||
            (this.selectedAction.action === 'transfer' &&
                this.selectedUser === null)
        ) {
          return;
        }
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

    userLabel(id) {
      const user = this.users.find(u => u.id === id);
      return user.firstName || user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.email;
    },
  },
};
</script>


<style lang="scss" scoped>
.wizard-folder {
  display: flex;
  flex-flow: column;

  &__breadcrumbs {
    margin-bottom: 0.5rem;
    margin-top: 1rem;
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
