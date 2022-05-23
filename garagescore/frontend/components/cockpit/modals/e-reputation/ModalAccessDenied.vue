<template>
  <ModalBase class="modal-access-denied" type="danger">
    <template v-slot:header-icon>
      <img
        ref="logo"
        src="/logo/logo-custeed-picto.svg"
        class="modal-exports__logo"
        alt="custeed"
      >
    </template>

    <template v-slot:header-title>
      <span>{{ $t_locale('components/cockpit/modals/e-reputation/ModalAccessDenied')('Title') }}</span>
    </template>

    <template v-slot:header-subtitle class="header-subtitle">
      <span>{{ $t_locale('components/cockpit/modals/e-reputation/ModalAccessDenied')('Subtitle') }}</span>
    </template>

    <template v-slot:body>
      <div class="modal-access-denied__message">
        <i class="icon-gs-info" />
        <AppText
          class="modal-access-denied__message__title"
          tag="span"
          align="center"
          bold
        >
          {{ $t_locale('components/cockpit/modals/e-reputation/ModalAccessDenied')('AccessDeniedTitle') }}
        </AppText>
        <template v-if="reason === 'insufficientClearance'">
          <AppText
            class="modal-access-denied__message__text"
            tag="span"
            align="center"
            bold
          >
            {{ $t_locale('components/cockpit/modals/e-reputation/ModalAccessDenied')('AccessDeniedInsufficientClearanceSubtitle') }}
          </AppText>
          <AppText
            class="modal-access-denied__message__text"
            tag="span"
            align="center"
            bold
          >
            {{ $t_locale('components/cockpit/modals/e-reputation/ModalAccessDenied')('AccessDeniedInsufficientClearanceSubtitle2') }}
          </AppText>
        </template>
        <template v-if="reason === 'noSubscribedGarages'">
          <AppText
            class="modal-access-denied__message__text"
            tag="span"
            align="center"
            bold
          >
            {{ $t_locale('components/cockpit/modals/e-reputation/ModalAccessDenied')('AccessDeniedNoSubscribedGaragesSubtitle') }}
          </AppText>
          <AppText
            class="modal-access-denied__message__text"
            tag="span"
            align="center"
            bold
          >
            {{ $t_locale('components/cockpit/modals/e-reputation/ModalAccessDenied')('AccessDeniedNoSubscribedGaragesSubtitle2') }}
          </AppText>
          <div class="modal-access-denied__more-info">
            <Button
              @click="openSubscription"
              type="orange"
              thick
            >
              <span>{{ $t_locale('components/cockpit/modals/e-reputation/ModalAccessDenied')('AccessDeniedNoSubscribedGaragesButton') }}</span>
            </Button>
          </div>
        </template>
      </div>
    </template>

    <template v-slot:footer>
      <div class="modal-access-denied__footer">
        <Button
          @click="closeModal"
          type="orange"
          thick
        >
          <span>{{ $t_locale('components/cockpit/modals/e-reputation/ModalAccessDenied')('Close') }}</span>
        </Button>
      </div>
    </template>
  </ModalBase>
</template>

<script>
export default {
  name: 'ModalAccessDenied',
  props: {
    reason: {
      type: String,
      default: '',
    },
    closeModal: {
      type: Function,
      default: () => ({}),
    },
    openSubscription: {
      type: Function,
      default: () => ({}),
    },
  },
};
</script>

<style lang="scss" scoped>
.modal-access-denied {
  overflow: auto;
  height: 100%;

  .header-subtitle {
    margin-bottom: 1rem;
  }

  &__message {
    display: flex;
    flex-direction: column;
    margin-top: 6.21rem;

    & i {
      font-size: 70px;
      color: $red;
      text-align: center;
    }

    &__title {
      font-size: 1.5rem;
      color: $black;
      margin: 1.5rem 0 1rem 0 !important;
    }

    &__text {
      font-size: 1rem;
      color: $dark-grey;
      margin: 0.2rem 0 !important;
    }
  }

  &__more-info {
    display: flex;
    justify-content: center;
    margin-top: 10px;
    height: 37px;
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
