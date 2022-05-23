<template>
  <div class="modal-wrapper" :class="classBinding()">
    <transition name="fade">
      <div class="modal-wrapper__window" @click.stop>
        <template v-if="shouldDisplay">
          <component :is="unifiedModalComponent" v-bind="unifiedModalProps" />
        </template>
      </div>
    </transition>
  </div>
</template>

<script>
import ModalHelp from '~/components/auth/ModalHelp.vue';
import ModalMatchAutoAssignedUsers from '~/components/automatic-billing/details/ModalMatchAutoAssignedUsers.vue';
import ModalConfigModelResponse from '~/components/cockpit/admin/ModalConfigModelResponse.vue'
import ModalConfigTimeAnswer from '~/components/cockpit/admin/ModalConfigTimeAnswer.vue'
import ModalDeleteModelResponse from '~/components/cockpit/admin/ModalDeleteModelResponse.vue'
import ModalAddSource from '~/components/cockpit/admin/sources/ModalAddSource';
import ModalMakeSurveys from '~/components/cockpit/admin/surveys/ModalMakeSurveys';
import ModalConnectGarages from '~/components/cockpit/modals/e-reputation/ModalConnectGarages';
import ModalConnectAs from '~/components/cockpit/modals/ModalConnectAs';
import ModalConnectWithUrl from '~/components/cockpit/modals/e-reputation/ModalConnectWithUrl';
import ModalContactForm from '~/components/cockpit/modals/ModalContactForm';
import ModalMakeSurveysPrevisualisation from '~/components/cockpit/admin/surveys/ModalMakeSurveysPrevisualisation';
import ModalDeleteChildUser from '~/components/cockpit/modals/ModalDeleteChildUser';
import ModalDeleteChildUserStatus from '~/components/cockpit/modals/ModalDeleteChildUserStatus';
import ModalDeleteGroup from '~/components/cockpit/modals/ModalDeleteGroup';
import ModalDisconnectService from '~/components/cockpit/modals/e-reputation/ModalDisconnectService';
import ModalLeadsTicketReopen from '~/components/cockpit/modals/leads/ModalLeadsTicketReopen';
import ModalAddLead from '~/components/cockpit/modals/leads/ModalAddLead';
import ModalCustomContent from '~/components/cockpit/automation/ModalCustomContent';
import ModalPreviewAutomationCampaignEmail from '~/components/cockpit/automation/ModalPreviewAutomationCampaignEmail';
import ModalPasswordRequestStatus from '~/components/cockpit/modals/ModalPasswordRequestStatus';
import ModalRemoveGarage from '~/components/cockpit/modals/ModalRemoveGarage';
import ModalAddUnsatisfied from '~/components/cockpit/modals/unsatisfied/ModalAddUnsatisfied';
import ModalMessage from '~/components/ui/ModalMessage';
import ModalResetPassword from '~/components/cockpit/modals/ModalResetPassword';
import ModalShowAlert from '~/components/cockpit/modals/ModalShowAlert';
import ModalSubscriptionSatisfaction from '~/components/cockpit/modals/ModalSubscriptionSatisfaction';
import ModalSubscriptionVNVO from '~/components/cockpit/modals/ModalSubscriptionVNVO';
import ModalSubscriptionAnalytics from '~/components/cockpit/analytics/ModalSubscriptionAnalytics';
import ModalCannotTranslateAnalytics from '~/components/cockpit/analytics/ModalCannotTranslateAnalytics';
import ModalSubscriptionUnsatisfied from '~/components/cockpit/modals/unsatisfied/ModalSubscriptionUnsatisfied';
import ModalSubscriptionLeads from '~/components/cockpit/modals/leads/ModalSubscriptionLeads';
import ModalSubscriptionAutomation from '~/components/cockpit/automation/ModalSubscriptionAutomation';
import ModalSubscriptionContacts from '~/components/cockpit/modals/ModalSubscriptionContacts';
import ModalSubscriptionEreputation from '~/components/cockpit/modals/e-reputation/ModalSubscriptionEreputation';
import ModalUnsatisfiedTicketReopen from '~/components/cockpit/modals/unsatisfied/ModalUnsatisfiedTicketReopen';
import ModalDeleteReply from '~/components/cockpit/modals/e-reputation/ModalDeleteReply';
import ModalMaintenance from '~/components/cockpit/modals/e-reputation/ModalMaintenance';
import ModalMatchGarages from '~/components/cockpit/modals/e-reputation/ModalMatchGarages';
import ModalTerminateSubscription from '~/components/cockpit/user/ModalTerminateSubscription.vue';
import ModalAddFavorite from '~/components/cockpit/user/ModalAddFavorite.vue';
import ModalRequestAccepted from '~/components/cockpit/modals/e-reputation/ModalRequestAccepted.vue';
import ModalWelcome from '~/components/cockpit/modals/e-reputation/ModalWelcome.vue';
import ModalConfirmSubscription from '~/components/cockpit/modals/e-reputation/ModalConfirmSubscription.vue';
import ModalEditSource from '~/components/cockpit/admin/sources/ModalEditSource';
import ModalDeleteSource from '~/components/cockpit/admin/sources/ModalDeleteSource';
import ModalInstallHomeScreenApp from '~/components/global/ModalInstallHomeScreenApp';
import ModalExports from '~/components/global/exports/ModalExports';
import ModalSplashScreen from '~/components/global/exports/ModalSplashScreen';
import ModalConfirmName from '~/components/global/exports/ModalConfirmName';
import ModalConfirmDelete from '~/components/global/exports/ModalConfirmDelete';
import ModalAccessDenied from '~/components/cockpit/modals/e-reputation/ModalAccessDenied';
import ModalAddUser from '~/components/cockpit/modals/ModalAddUser';
import ModalCompleteProfile from '~/components/global/ModalCompleteProfile';
import ModalConfirmEmail from '~/components/global/exports/ModalConfirmEmail';
import ModalAdminTag from '~/components/global/ModalAdminTag.vue'
import ModalDeleteTag from '~/components/global/ModalDeleteTag.vue'

export default {
  components: {
    ModalAddUser,
    ModalAddLead,
    ModalAddUnsatisfied,
    ModalCompleteProfile,
    ModalConnectAs,
    ModalConnectGarages,
    ModalConnectWithUrl,
    ModalContactForm,
    ModalDeleteChildUser,
    ModalDeleteChildUserStatus,
    ModalDeleteGroup,
    ModalDisconnectService,
    ModalLeadsTicketReopen,
    ModalMessage,
    ModalMakeSurveys,
    ModalMakeSurveysPrevisualisation,
    ModalPasswordRequestStatus,
    ModalRemoveGarage,
    ModalResetPassword,
    ModalShowAlert,
    ModalSubscriptionAnalytics,
    ModalCannotTranslateAnalytics,
    ModalSubscriptionSatisfaction,
    ModalSubscriptionUnsatisfied,
    ModalSubscriptionEreputation,
    ModalSubscriptionVNVO,
    ModalSubscriptionLeads,
    ModalSubscriptionAutomation,
    ModalSubscriptionContacts,
    ModalUnsatisfiedTicketReopen,
    ModalTerminateSubscription,
    ModalAddFavorite,
    ModalDeleteReply,
    ModalMaintenance,
    ModalMatchGarages,
    ModalRequestAccepted,
    ModalWelcome,
    ModalConfirmSubscription,
    ModalHelp,
    ModalMatchAutoAssignedUsers,
    ModalInstallHomeScreenApp,
    ModalAddSource,
    ModalEditSource,
    ModalDeleteSource,
    ModalCustomContent,
    ModalPreviewAutomationCampaignEmail,
    ModalExports,
    ModalSplashScreen,
    ModalConfirmName,
    ModalConfirmDelete,
    ModalAccessDenied,
    ModalConfigTimeAnswer,
    ModalConfigModelResponse,
    ModalDeleteModelResponse,
    ModalConfirmEmail,
    ModalAdminTag,
    ModalDeleteTag,
  },
  props: {
    adaptive: Boolean,
    fullScreen: Boolean,
    modalComponent: {
      type: String,
      default: () => null,
    },
    modalProps: {
      type: Object,
      default: () => ({}),
    },
  },

  computed: {
    shouldDisplay() {
      const modalComponent = this.unifiedModalComponent;
      return modalComponent !== null;
    },
    storeModalComponent() {
      return this.$store.getters["getModalComponent"];
    },
    unifiedModalComponent() {
      return this.modalComponent || this.storeModalComponent;
    },
    unifiedModalProps() {
      const isModalPropsEmpty = !this.modalProps
        || Object.keys(this.modalProps).length === 0;
      return isModalPropsEmpty
        ? this.$store.getters["getModalProps"]
        : this.modalProps;
    },
  },
  methods: {
    classBinding() {
      const adaptive = this.adaptive !== undefined
        ? this.adaptive
        : this.$store.getters["getModalIsAdaptive"];
      const fullScreen = this.fullScreen !== undefined
        ? this.fullScreen
        : this.$store.getters["getModalIsFullScreen"];

      return {
        "modal-wrapper--display": this.shouldDisplay,
        "modal-wrapper--full-screen": fullScreen,
        "modal-wrapper--adaptive": adaptive
      };
    },
  },
  watch: {
    shouldDisplay(isOpen) {
      document.documentElement.style.overflow = isOpen ? "hidden" : "auto";
    },
  },
};
</script>

<style lang="scss" scoped>
  .modal-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background-color: rgba($black ,0.75);
    height: 100vh;
    width: 100%;
    z-index: 1000;
    display: none;
    &--display {
      display: flex;
      justify-content: center;
      /*align-items: center;*/
      padding: 10vh 0;
      max-height: 80vh;
    }
    &--full-screen {
      padding: 0;
      & .modal-wrapper__window {
        width: 100%;
      }
    }
    &--adaptive {
      padding:10vh 0;
      & .modal-wrapper__window {
        width: auto;
        max-width: 100%;
        max-height: 82vh;
      }
    }
    &__window {
      overflow: hidden;
      min-width: 50rem;
    }
  }
  @media (max-width: $breakpoint-min-sm) {
    .modal-wrapper {
      &__window {
        min-width: calc(100vw - 2rem);
      }
    }
  }
</style>
