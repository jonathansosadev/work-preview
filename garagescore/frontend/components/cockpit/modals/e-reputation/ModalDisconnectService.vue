<template>
  <ModalBase class="modal-connect-garages">
    <template v-slot:header-icon>
      <img :src="`/e-reputation/${source}.svg`" :alt="source">
    </template>

    <template v-slot:header-title>
      <AppText
        tag="div"
        size="md"
        bold
      >
        {{ source }}
      </AppText>
    </template>

    <template v-slot:header-subtitle>
      <AppText tag="div" type="muted">
        {{ garage.garagePublicDisplayName }}
      </AppText>
    </template>

    <template v-slot:header-subtitle-2>
      <AppText tag="div" type="primary">
        {{ $t_locale('components/cockpit/modals/e-reputation/ModalDisconnectService')('subtitle', { source }) }}
      </AppText>
    </template>

    <template v-slot:body>
      <AppText tag="div" type="muted">
        {{ $t_locale('components/cockpit/modals/e-reputation/ModalDisconnectService')('dataDeleted') }}
      </AppText>
      <AppText tag="div" type="muted">
        {{ $t_locale('components/cockpit/modals/e-reputation/ModalDisconnectService')('dataRemains', { source }) }}
      </AppText>
      <AppText tag="div" type="muted">
        {{ $t_locale('components/cockpit/modals/e-reputation/ModalDisconnectService')('reactivateAnytime') }}
      </AppText>
    </template>

    <template v-slot:footer>
      <div class="buttons">
        <Button
          type="orange"
          border="square"
          @click="disconnect"
        >
          {{ $t_locale('components/cockpit/modals/e-reputation/ModalDisconnectService')('confirm') }}
        </Button>
        <Button
          type="white"
          border="square"
          @click="cancel"
        >
          {{ $t_locale('components/cockpit/modals/e-reputation/ModalDisconnectService')('cancel') }}
        </Button>
      </div>
    </template>
  </ModalBase>
</template>


<script>

export default {
  name: 'ModalDisconnectService',
  props: {
    source: String,
    garage: Object,
    closeModal: {
      type: Function,
      required: true,
    },
    deleteExogenousConfiguration: {
      type: Function,
      required: true,
    },
    refreshView: {
      type: Function,
      required: true,
    },
  },
  methods: {
    async disconnect() {
      const success = await this.deleteExogenousConfiguration({
        garageId: this.garage.garageId,
        source: this.source,
      });
      if (success) {
        await this.closeModal();
        await this.refreshView();
      }
    },
    cancel() {
      this.closeModal();
    }
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
      img {
        width: 40px;
      }
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
}
</style>
