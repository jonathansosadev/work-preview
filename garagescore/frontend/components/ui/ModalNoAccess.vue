<template>
  <ModalBase class="modal-no-access">
    <template slot="header-icon">
      <i class="icon-gs-sad"></i>
    </template>

    <template slot="header-title">
      <AppText tag="div" size="md" bold>{{ $t_locale('components/ui/ModalNoAccess')('title') }}</AppText>
    </template>

    <template slot="header-subtitle">
      <AppText tag="div" type="muted">{{ $t_locale('components/ui/ModalNoAccess')('subtitle') }}</AppText>
    </template>

    <template slot="body">
      <div class="body-wrapper">
        <AppText tag="div" type="muted">{{ $t_locale('components/ui/ModalNoAccess')('text') }}</AppText>
        <br />
      </div>
    </template>

    <template slot="footer">
      <div class="buttons">
        <Button type="orange" border="square" @click="ok()">{{ $t_locale('components/ui/ModalNoAccess')('ok') }}</Button>
      </div>
    </template>
  </ModalBase>
</template>


<script>
export default {
  props: {
    source: String
  },

  methods: {
    ok() {
      this.$store.dispatch("closeModal");
    }
  }
};
</script>

<style lang="scss" scoped>
.modal-no-access {
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
