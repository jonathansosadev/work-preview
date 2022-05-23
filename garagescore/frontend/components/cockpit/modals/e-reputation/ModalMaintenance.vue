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
        {{ $t_locale('components/cockpit/modals/e-reputation/ModalMaintenance')('unavailable') }}
      </AppText>
    </template>

    <template v-slot:body>
      <div class="body-wrapper">
        <AppText tag="div" type="muted">
          {{ $t_locale('components/cockpit/modals/e-reputation/ModalMaintenance')('sourceDead', { source }) }}
        </AppText><br>
      </div>
    </template>

    <template v-slot:footer>
      <div class="buttons">
        <Button
          type="orange"
          border="square"
          @click="ok"
        >
          {{ $t_locale('components/cockpit/modals/e-reputation/ModalMaintenance')('ok') }}
        </Button>
      </div>
    </template>
  </ModalBase>
</template>


<script>

export default {
  name: 'ModalMaintenance',
  props: {
    source: String,
    closeModal: {
      type: Function,
      required: true,
    },
  },

  methods: {
    ok() {
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

  .body-wrapper {
    margin-top: -15px;
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
