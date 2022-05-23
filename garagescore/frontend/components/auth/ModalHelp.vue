<template>
  <ModalBase class="modal-help-auth">
    <template slot="header-icon">
      <i class="icon-gs-help-question-circle"></i>
    </template>
    <template slot="header-title">
      <span>{{ $t_locale('components/auth/ModalHelp')("title") }}</span>
    </template>
    <template slot="header-subtitle">
      <span>{{ $t_locale('components/auth/ModalHelp')("subtitle") }}</span>
    </template>
    <template slot="body">
      <div class="modal-help-auth__part">
        <AppText tag="p" type="primary" bold><div class="modal-help-auth__part__title">{{ $t_locale('components/auth/ModalHelp')('firstLogin') }}</div></AppText>
        <AppText tag="p" type="muted">{{ $t_locale('components/auth/ModalHelp')('checkEmail') }}</AppText>
      </div>
      <div class="modal-help-auth__part">
        <AppText tag="p" type="primary" bold><div class="modal-help-auth__part__title">{{ $t_locale('components/auth/ModalHelp')('cantFind') }}</div></AppText>
        <AppText tag="p" type="muted">{{ $t_locale('components/auth/ModalHelp')('askForIt') }}</AppText>
      </div>
      <div class="modal-help-auth__part">
        <div class="form-group">
          <textarea :placeholder="$t_locale('components/auth/ModalHelp')('placeholder')" v-model="message" maxlength="500"></textarea>
          <AppText tag="div" :type="canSend ? 'success': 'danger'" size="sm" italic>{{ message.length }} / 500 ({{ $t_locale('components/auth/ModalHelp')('minimumChar') }})</AppText>
        </div>
      </div>
    </template>
    <template slot="footer">
      <div class="modal-help-auth__footer">
        <Button
          type="orange"
          class="btn validate-closing-btn"
          @click.native="sendMessage()"
          :disabled="!canSend"
        >
          <i class="icon-gs-loading" v-if="loading" />
          <span> {{ $t_locale('components/auth/ModalHelp')('send') }}</span>
        </Button>
        <AppText tag="span" bold :type="msgSend ? 'success' : 'danger'">{{ msgSend ? $t_locale('components/auth/ModalHelp')('success') : error }}</AppText>
      </div>
    </template>
  </ModalBase>
</template>


<script>
  import axios from 'axios';

export default {
  data() {
    return {
      message: '',
      loading: false,
      msgSend: false,
      error: ''
    };
  },
  computed: {
    canSend() {
      return this.message.length >= 20 && this.message.length <= 500 && !this.loading;
    }
  },
  methods: {
    async sendMessage() {
      if (this.canSend) {
        this.loading = true;
        try {
          const response = await axios.post('/help-me', { message: this.message, context: 'LogIn' });

          if (response.status === 200) {
            this.msgSend = true;
            this.message = '';
            this.error = '';
          }
        } catch (e) {
          this.error = this.$t_locale('components/auth/ModalHelp')('error');
        }
        this.loading = false;
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .modal-help-auth {

    &__part {
      margin: 1rem 0;

      &__title {
        margin: 0 0 0.5rem 0;
      }

      textarea {
        width: 100%;
        min-height: 6rem;
        max-width: 46rem;
      }
    }

    &__footer {
      display: flex;
      flex-flow: row;
      align-items: center;
      justify-content: flex-start;

      .btn {
        margin: 0 0.5rem 0 0;
      }
    }
  }
</style>
