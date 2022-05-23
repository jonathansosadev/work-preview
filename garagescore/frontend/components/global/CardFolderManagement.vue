<template>
  <Card class="folder-management">
    <div class="folder-management__header">
      <div class="folder-management__header-part">
        <Title icon="icon-gs-file-folder">{{ $t_locale('components/global/CardFolderManagement')('title')   }}</Title>
      </div>
      <div class="folder-management__header-part">
        <AppText class="folder-management__header-title" tag="span" bold>{{ $t_locale('components/global/CardFolderManagement')('handledBy')  }}</AppText>
        <AppText class="folder-management__header-subtitle" tag="span" type="muted" bold>{{ fullName }}</AppText>
      </div>
    </div>
    <div class="folder-management__body">
      <div
        :is="folderManagementComponent"
        v-if="folderManagementComponent"
        :id="id"
        :garage="garage"
        :unsatisfiedTicket="unsatisfiedTicket"
        :leadTicket="leadTicket"
        :updateTicketDispatch="updateTicketDispatch"
        :addTicketActionDispatch="addTicketActionDispatch"
        :openModalDispatch="openModalDispatch"
        :appendTicketUserDispatch="appendTicketUserDispatch"
        :ticketManagerId="ticketManagerId"
        :currentUserIsGarageScoreUser="currentUserIsGarageScoreUser"
        :jobsByCockpitType="jobsByCockpitType"
        :cockpitType="cockpitType"
        :userRole="userRole"
        :solutionOptions="solutionOptions"
        :claimOptions="claimOptions"
        :addTicketAction="addTicketAction"
        :availableGarages="availableGarages"
      />
      <!--  solutionOptions + claimOptions + addTicketAction => Unsatisfied  -->
    </div>
  </Card>
</template>

<script>
import WizardUnsatisfiedFolder
  from '~/components/cockpit/wizards/unsatisfied/WizardUnsatisfiedFolder';
import WizardLeadsFolder
  from '~/components/cockpit/wizards/leads/WizardLeadsFolder';
import { getDeepFieldValue as deep } from '~/utils/object';

export default {
  components: { WizardUnsatisfiedFolder, WizardLeadsFolder },
  props: {
    unsatisfiedTicket: Object,
    id: String,
    ticketType: String,
    folderManagementComponent: String,
    garage: Object,
    leadTicket: Object,
    updateTicketDispatch: Function,
    addTicketActionDispatch: Function,
    openModalDispatch: Function,
    appendTicketUserDispatch: Function,
    currentUserIsGarageScoreUser: Boolean,
    jobsByCockpitType: Array,
    cockpitType: { type: String, required: false },
    userRole: String,

    solutionOptions: Array,
    claimOptions: Array,
    addTicketAction: Function,
    availableGarages: Array,
  },

  created() {
    this.deep = (fieldName) => deep(this, fieldName);
  },

  computed: {
    fullName() {
      if (this.customerFullName) {
        return this.customerFullName;
      } else if (this.customerContactEmail) {
        return this.customerContactEmail;
      }
      if (this.id) {
        return this.$t_locale('components/global/CardFolderManagement')('noOne');
      }

      return this.$t_locale('components/global/CardFolderManagement')('unAssigned');
    },
    ticketManagerId() {
      return this.id;
    },
    customerFullName() {
      if (
        this.deep(`${this.ticketType}.manager.firstName`)
        && this.deep(`${this.ticketType}.manager.lastName`)
      ) {
        return `${this.deep(`${this.ticketType}.manager.firstName`)} ${this.deep(
          `${this.ticketType}.manager.lastName`
        )}`.trim();
      }
      return null;
    },

    customerContactEmail() {
      return this.deep(`${this.ticketType}.manager.email`);
    },
  },
};
</script>

<style lang="scss" scoped>
.folder-management {
  &__header {
    display: flex;
    flex-flow: row;
    width: 100%;
    margin-bottom: 1rem;
  }

  &__body {
    border-top: 1px solid rgba($grey, .5);
  }

  &__header-part {
    display: flex;
    align-items: center;
    flex: 1;

    &:last-child {
      margin-left: 0.5rem;
      justify-content: flex-end;
    }
  }

  &__header-title {
    margin-right: 0.5rem;
    white-space: nowrap;
  }
}
</style>
