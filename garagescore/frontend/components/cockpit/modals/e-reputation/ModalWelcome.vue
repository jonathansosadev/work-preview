<template>
  <ModalBase class="modal-connect-garages">
    <template #header-icon>
      <img
        class="logo"
        src="/e-reputation/EReputationLogo.svg"
        alt="E-Reputation logo"
      >
    </template>

    <template #header-title>
      <AppText
        tag="div"
        size="md"
        bold
      >
        {{ $t_locale('components/cockpit/modals/e-reputation/ModalWelcome')('welcome') }}
      </AppText>
    </template>

    <template #header-subtitle>
      <AppText tag="div" type="muted">
        {{ $t_locale('components/cockpit/modals/e-reputation/ModalWelcome')('enhance') }}
      </AppText>
    </template>

    <template #body>
      <AppText
        tag="div"
        bold
        class="welcome-title"
      >
        {{ $t_locale('components/cockpit/modals/e-reputation/ModalWelcome')('startEasy') }}
      </AppText>
      <AppText tag="div" class="steps">
        {{ $t_locale('components/cockpit/modals/e-reputation/ModalWelcome')('step1') }}
      </AppText>
      <AppText tag="div" class="steps">
        {{ $t_locale('components/cockpit/modals/e-reputation/ModalWelcome')('step2') }}
      </AppText>
      <AppText tag="div" class="steps" />
    </template>

    <template #footer>
      <div class="buttons">
        <Button
          type="orange"
          border="square"
          @click="close"
        >
          {{ $t_locale('components/cockpit/modals/e-reputation/ModalWelcome')('start') }}
        </Button>
      </div>
    </template>
  </ModalBase>
</template>

<script>

export default {
  name: 'ModalWelcome',
  props: {
    source: String,
    stats: Object,
    closeModal: {
      type: Function,
      required: true,
    },
    openModal: {
      type: Function,
      required: true,
    },
    garageId: {
      type: String,
      required: true,
    },
    connectSource: {
      type: Function,
      required: true,
    },
    childModalProps: Object,
  },

  computed: {
    isGroup() {
      return this.countGarages > 0;
    },
    countGarages() {
      return this.getStatsOfSource ? this.getStatsOfSource.countConnectedGarages : 0;
    },
    getStatsOfSource() {
      return this.stats?.sources?.find(g => g.name === this.source || 'Google');
    },
  },

  methods: {
    close() {
      this.closeModal();
      this.showConnectionAction();
    },
    getModalPropsByName(modalName) {
      return this.childModalProps?.[modalName] || {};
    },
    showConnectModal() {
      this.openModal({
        component: 'ModalConnectGarages',
        props: {
          ...this.getModalPropsByName('ModalConnectGarages'),
          source : this.source,
          childModalProps: this.childModalProps,
        }
      });
    },
    showConnectionAction() {
      if (this.isGroup) {
        this.showConnectModal();
      } else {
        this.connect(this.garageId);
      }
    },
    connect(garageId) {
      this.connectSource({ garageId, source: this.source });
    },
  }
}
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

  .logo {
    width: 40px;
  }

  .steps {
    padding: 0.5rem 0 0.5rem 3.7rem;
    align-items: center;
    color: #757575;
    font-size: 1rem;
    font-weight : 400;
  }

  .welcome-title {
    font-size: 1rem;
    margin-bottom: 0.5rem;
    padding-left: 3.7rem;
  }


  .buttons {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;

    button {
      padding: 0 2rem;
    }
  }
}
</style>
