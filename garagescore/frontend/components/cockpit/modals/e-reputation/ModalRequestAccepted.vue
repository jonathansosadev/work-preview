<template>
  <ModalBase class="modal-request-accepted">
    <!-- HEADER -->
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
        {{ $t_locale('components/cockpit/modals/e-reputation/ModalRequestAccepted')('title') }}
      </AppText>
    </template>

    <template #header-subtitle>
      <AppText tag="div" type="muted">
        {{ $t_locale('components/cockpit/modals/e-reputation/ModalRequestAccepted')('subtitle') }}
      </AppText>
    </template>

    <!-- BODY -->
    <template #body>
      <AppText tag="div" type="muted">
        {{ getMessage }}
      </AppText>
    </template>

    <!-- FOOTER -->
    <template #footer>
      <div class="buttons">
        <Button
          type="orange"
          border="square"
          @click="close"
        >
          {{ $t_locale('components/cockpit/modals/e-reputation/ModalRequestAccepted')('close') }}
        </Button>
      </div>
    </template>
  </ModalBase>
</template>


<script>

export default {
  name: 'ModalRequestAccepted',
  props: {
    error: {
      type: String
    },
    closeModal: {
      type: Function,
      required: true,
    }
  },

  methods: {
    close() {
      this.closeModal();
    }
  },

  computed: {
    getMessage() {
      if (this.error) {
        return this.$t_locale('components/cockpit/modals/e-reputation/ModalRequestAccepted')('errorMessage', { error: this.$t_locale('components/cockpit/modals/e-reputation/ModalRequestAccepted')(this.error) });
      } else {
        return this.$t_locale('components/cockpit/modals/e-reputation/ModalRequestAccepted')('successMessage');
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.modal-request-accepted {
  max-height: 80vh;
  overflow-y: auto;

  .logo {
    width: 40px;
  }

  .header-wrapper {
    display: flex;
    align-items: center;
    justify-content: left;

    .header-logo {
      img {
        width: 40px;
      }
    }

    .header-info {
      flex: 1;
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
}
</style>
