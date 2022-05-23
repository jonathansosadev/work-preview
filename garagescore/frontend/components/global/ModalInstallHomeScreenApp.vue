<template>
  <ModalBase class="modal-install-home-screen-app">
    <template slot="header-icon">
      <i class="icon-gs-help-question-circle"></i>
    </template>

    <template slot="header-title">
      <span>{{ $t_locale('components/global/ModalInstallHomeScreenApp')("Title") }}</span>
    </template>

    <template slot="header-subtitle">
      <span>{{ $t_locale('components/global/ModalInstallHomeScreenApp')("Subtitle") }}</span>
    </template>

    <template slot="body">
      <div class="modal-install-home-screen-app__part">
        <AppText tag="div" type="black" size="lg">{{ $t_locale('components/global/ModalInstallHomeScreenApp')('Message') }}</AppText>
        <AppText class="modal-install-home-screen-app__part__instructions" tag="div" type="muted" size="md" italic align="center">{{ $t_locale('components/global/ModalInstallHomeScreenApp')('Instructions1') }} <img src="/pwa/iosHelp.png" alt="iOS" /> {{ $t_locale('components/global/ModalInstallHomeScreenApp')('Instructions2') }}</AppText>
      </div>
    </template>

    <template slot="footer">
      <div class="modal-install-home-screen-app__footer">
        <Button type="success" class="btn validate-closing-btn" @click.native="close()" >
          {{ $t_locale('components/global/ModalInstallHomeScreenApp')('Ok') }}
        </Button>
      </div>
    </template>

  </ModalBase>
</template>


<script>

  export default {
    data() {
      return {};
    },
    methods: {
      close() {
        this.$store.dispatch('closeModal');
      }
    }
  }
</script>

<style lang="scss" scoped>
  .modal-install-home-screen-app {

    &__part {
      margin: 1rem 0;

      &__instructions {
        margin: 1rem 0 0 0;
        img {
          position: relative;
          top: 0.4rem;
        }
      }
    }

    &__footer {
      display: flex;
      flex-flow: row;
      align-items: center;
      justify-content: flex-end;

      .btn {
        margin: 0 0.5rem 0 0;
      }
    }
  }
</style>
