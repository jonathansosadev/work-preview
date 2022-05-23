<template>
  <ModalBase class="modal-connect-garages">
    <template slot="header-icon">
      <img :src="`/e-reputation/${source}.svg`" :alt="source">
    </template>

    <template slot="header-title">
      <AppText
        tag="div"
        size="md"
        bold
      >
        {{ source }}
      </AppText>
    </template>

    <template slot="header-subtitle">
      <AppText tag="div" type="muted">
        {{ $t_locale('components/cockpit/modals/e-reputation/ModalConnectWithUrl')('subtitle') }}
      </AppText>
    </template>

    <template slot="body">
      <AppText
        tag="div"
        type="primary"
        bold
      >
        {{ $t_locale('components/cockpit/modals/e-reputation/ModalConnectWithUrl')('yellowPagesURL') }}
      </AppText>
      <input
        type="text"
        v-model="url"
        placeholder="Renseignez votre URL"
      >
      <AppText
        tag="div"
        type="muted"
        size="sm"
      >
        {{ $t_locale('components/cockpit/modals/e-reputation/ModalConnectWithUrl')('URLFormat', { source }) }}
      </AppText>
      <AppText
        tag="div"
        type="muted"
        size="sm"
      >
        {{ $t_locale('components/cockpit/modals/e-reputation/ModalConnectWithUrl')('yellowPagesId') }}
      </AppText>
      <AppText
        tag="div"
        type="muted"
        size="sm"
      >
        {{ $t_locale('components/cockpit/modals/e-reputation/ModalConnectWithUrl')('howFindId') }}
      </AppText>
      <AppText
        tag="div"
        type="muted"
        size="sm"
      >
        {{ $t_locale('components/cockpit/modals/e-reputation/ModalConnectWithUrl')('whereIsId') }}
      </AppText>
    </template>

    <template slot="footer">
      <div class="buttons">
        <Button
          type="orange"
          border="square"
          @click="connect"
          :disabled="!urlOk"
        >
          {{ $t_locale('components/cockpit/modals/e-reputation/ModalConnectWithUrl')('confirm') }}
        </Button>
      </div>
    </template>
  </ModalBase>
</template>

<script>
export default {
  name: 'ModalConnectWithUrl',
  props: {
    source: String,
    garage: Object,
    postExogenousConfiguration: {
      type: Function,
      required: true,
    },
  },

  data() {
    return {
      url: 'https://www.pagesjaunes.fr/pros/',
    };
  },

  computed: {
    urlOk() {
      return !!(
        this.url.indexOf('https://www.pagesjaunes.fr/pros/') === 0 &&
        this.url.substr('https://www.pagesjaunes.fr/pros/'.length).match(/^\d+$/) &&
        this.url.substr('https://www.pagesjaunes.fr/pros/'.length).length === 8
      );
    },
  },
  methods: {
    async connect() {
      if (!this.url) {
        return;
      }
      await this.postExogenousConfiguration({
        garageId: this.garage.garageId,
        source: this.source,
        code: this.url,
      });
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
      img {
        width: 40px;
      }
    }

    .header-info {
      flex: 1;
      height: 40px;
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
  }

  input {
    width: calc(100% - 20px);
    border: 1px solid #cdcdcd;
    outline: none;
    border-radius: 2px;
    padding: 8px 10px;
    margin-top: 10px;
    margin-bottom: 10px;
    background: #eeeeee;

    &::placeholder {
      font-style: italic;
      color: #aaaaaa;
    }
  }
}
</style>
