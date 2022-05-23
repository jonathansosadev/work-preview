<template>
  <ModalBase v-if="!subscriptionIsLoading" class="modal-connect-garages">
    <template #header-icon>
      <img
        class="logo"
        src="/e-reputation/EReputationLogo.svg"
        alt="E-Reputation"
      >
    </template>

    <template #header-title>
      <AppText
        tag="div"
        size="md"
        bold
      >
        {{ $t_locale('components/cockpit/modals/e-reputation/ModalConfirmSubscription')('title') }}
      </AppText>
    </template>

    <template #header-subtitle>
      <AppText tag="div" type="muted">
        {{ $t_locale('components/cockpit/modals/e-reputation/ModalConfirmSubscription')('subtitle') }}
      </AppText>
    </template>

    <template #body>
      <div class="modal-connect-garages__pricing" v-if="pricing && isPrioritaryProfile">
        {{ $t_locale('components/cockpit/modals/e-reputation/ModalConfirmSubscription')('pricing') }}
      </div>
      <AppText
        class="modal-connect-garages__confirmation"
        tag="div"
        type="muted"
        v-if="isPrioritaryProfile"
      >
        {{ $t_locale('components/cockpit/modals/e-reputation/ModalConfirmSubscription')('confirmSubscribe') }}
      </AppText>
      <AppText
        class="modal-connect-garages__confirmation"
        tag="div"
        type="muted"
        v-else
      >
        {{ $t_locale('components/cockpit/modals/e-reputation/ModalConfirmSubscription')('confirmAccessRequest') }}
      </AppText>
    </template>

    <template #footer>
      <div class="footer-wrapper">
        <div class="modal-connect-garages__cgv" v-if="pricing && isPrioritaryProfile">
          {{ $t_locale('components/cockpit/modals/e-reputation/ModalConfirmSubscription')('IAccept') }}
          <a
            class="modal-connect-garages__cgv--link"
            :href="cgvLink"
            target="_blank"
          >{{ $t_locale('components/cockpit/modals/e-reputation/ModalConfirmSubscription')('CGV') }}</a>
        </div>
        <div class="buttons">
          <Button
            type="orange"
            border="square"
            @click="subscribe"
          >
            {{ $t_locale('components/cockpit/modals/e-reputation/ModalConfirmSubscription')('confirm') }}
          </Button>
          <Button
            type="white"
            border="square"
            @click="cancel"
          >
            {{ $t_locale('components/cockpit/modals/e-reputation/ModalConfirmSubscription')('cancel') }}
          </Button>
        </div>
      </div>
    </template>
  </ModalBase>
</template>

<script>
import { get } from 'lodash';

export default {
  name: 'ModalConfirmSubscription',
  props: {
     changeAutorization: {
      type: Function,
      required: true,
    },
    changeAutorizationContent: {
      type: Function,
      required: true,
    },
    changeGaragesSubscription: {
      type: Function,
      required: true,
    },
    childModalProps: Object,
    closeModal: {
      type: Function,
      required: true,
    },
    garageId: {
      type: String,
      required: true
    },
    isPriorityProfile: Boolean,
    locale: {
      type: String,
      required: true,
    },
    openModal: {
      type: Function,
      required: true,
    },
    erepConnections: {
      type: Object,
      required: true,
    },
    pricing: Boolean,
    refreshView: {
      type: Function,
      required: true,
    },
    subscribeToEreputation: {
      type: Function,
      required: true,
    },
    subscriptionIsLoading: Boolean,
    toggleLoadingScreen: {
      type: Function,
      required: true,
    },
    wwwUrl: {
      type: String,
      required: true,
    },
  },

  computed: {
    cgvLink() {
      if (['ca', 'es'].includes(this.locale)) {
        return `${this.wwwUrl}/CGV-es.pdf`;
      }
      return `${this.wwwUrl}/CGV.pdf`;
    },
    isPrioritaryProfile() {
      return this.isPriorityProfile;
    },
  },
  methods: {
    async subscribe() {
      await this.toggleLoadingScreen(true);
      const response = await this.subscribeToEreputation({
        garageId: this.garageId,
      });
      await this.toggleLoadingScreen(false);
      await this.processResult(response);
    },
    getModalPropsByName(modalName) {
      return this.childModalProps?.[modalName] || {};
    },
    async processResult(response) {
      if (response.success) {
        if (response.unauthorized) {
          await this.changeAutorizationContent({
            authorization: 'ACCESS_TO_E_REPUTATION',
            val: false,
          });
        } else {
          await this.changeAutorization({
            authorization: 'ACCESS_TO_E_REPUTATION',
            val: true
          });
          await this.changeAutorizationContent({
            authorization: 'ACCESS_TO_E_REPUTATION',
            val: true,
          });
          await this.changeGaragesSubscription({
            authorization: 'EReputation',
            val: true,
          });
          await this.refreshView();
          await this.openModal({
            component: 'ModalWelcome',
            props: {
              ...this.getModalPropsByName('ModalWelcome'),
              source: 'Google',
              stats: this.erepConnections,
              childModalProps: this.childModalProps,
            },
          });
        }
      } else {
        await this.openModal({
          component: 'ModalRequestAccepted',
          props: {
            ...this.getModalPropsByName('ModalRequestAccepted'),
            error: response.message,
          },
        });
      }
    },
    getStatsOfSource(source) {
      return (
        (get(this.erepConnections, 'sources') &&
          this.erepConnections.sources.filter(
            (g) => g.connectedSources && g.connectedSources.includes(source)
          )) ||
        null
      );
    },
    cancel() {
      this.closeModal();
    },
  },
};
</script>

<style lang="scss" scoped>
.modal-connect-garages {
  max-height: 80vh;
  overflow-y: auto;

  .header-wrapper {
    display: flex;
    align-items: flex-start;
    justify-content: left;

    .header-logo {
    }

    .header-info {
      flex: 1;
      height: 65px;
      display: flex;
      flex-flow: column;
      align-items: flex-start;
      justify-content: space-between;
      padding-left: 15px;
    }
  }

  .buttons {
    display: flex;
    flex: 1;
    align-items: stretch;
    justify-content: flex-end;

    button {
      margin-left: 10px;
    }
  }

  &__pricing {
    color: $golden;
    font-size: 1.2rem;
    font-weight: 700;
    padding: 0 0 1rem 0;

    &--condition {
      font-size: 1rem;
      font-weight: 300;
    }
  }

  &__confirmation {
    font-size: 1rem;
    font-weight: 400;
  }

  &__cgv {
    color: #757575;
    padding: 0;
    font-size: 0.9rem;
    font-weight: 300;

    &--link {
      text-decoration: underline;
      color: inherit;
    }
  }

  .footer-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
