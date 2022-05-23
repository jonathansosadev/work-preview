<template>
  <div class="reset-password">
    <div v-if="title" class="reset-password__title">
      <span class="reset-password__title__text">{{ $t_locale('components/auth/ResetPassword')(title)}}</span>
    </div>
    <template v-if="title === 'invalidToken'">
      <span class="reset-password__invalid-text">{{ $t_locale('components/auth/ResetPassword')('invalidTokenSpeech')}}</span>
      <div class="reset-password__buttons">
        <Button
          type="orange"
          thick
          :disabled="loading"
          @click="switchPage('forgotten')"
        >
          <i class="icon-gs-cog" v-if="loading" />
          {{ $t_locale('components/auth/ResetPassword')('renewDemand') }}
        </Button>
      </div>
    </template>
    <template v-else>
      <div class="reset-password__field" @keyup.enter="resetPassword()">
        <InputMaterial selectedColor="blue" v-model="email">
          <template slot="label">{{$t_locale('components/auth/ResetPassword')("emailLabel")}}</template>
        </InputMaterial>
      </div>
      <div class="reset-password__field" @keyup.enter="resetPassword()">
        <InputMaterial selectedColor="blue" v-model="password" type="password">
          <template slot="label">{{$t_locale('components/auth/ResetPassword')("passwordLabel")}}</template>
        </InputMaterial>
      </div>
      <div class="reset-password__field" @keyup.enter="resetPassword()">
        <InputMaterial selectedColor="blue" v-model="passwordConfirm" type="password">
          <template slot="label">{{$t_locale('components/auth/ResetPassword')("confirmPasswordLabel")}}</template>
        </InputMaterial>
      </div>
      <div class="reset-password__buttons">
        <Button thick type="orange" :disabled="loading" @click="resetPassword()" >
          <i class="icon-gs-loading" v-if="loading" />
          {{ $t_locale('components/auth/ResetPassword')('resetPassword') }}
        </Button>
      </div>
    </template>
  </div>
</template>

<script>
  import * as urls from '~/utils/urls';
  import cookieHandler from '~/utils/cookie-handler';

  import axios from 'axios';
  import { throws } from 'assert';

  export default {
    data() {
      return {
        email: '',
        password: '',
        passwordConfirm: '',
        title: '',
        token: '',
      }
    },
    async mounted() {
      await this.checkToken();
    },
    computed: {
      authData() {
        return this.$store.getters['getAuthData'] || {};
      },
      postUrl() {
        return this.authData.postUrl || urls.getUrl('AUTH_SIGNIN_LOCAL');
      },
      loading() {
        return this.$store.getters['login/loading'];
      },
      storeEmail() {
        return this.$store.getters['login/email']
      }
    },    
    watch: {
      storeEmail() {
        this.initializeEmail();
      }
    },
    methods: {
      async checkToken() {
        this.token =  this.$store.getters['login/token'] || this.$route.query.token;
        const response = await axios.post(urls.getUrl('AUTH_CHECK_RESET_TOKEN'), { token: this.token });
        if (response.data.status === 'ok') {
          this.title = response.data.type;
          this.email = response.data.email;
          this.$store.dispatch('login/SET_EMAIL', { email: response.data.email });
        } else {
          if (response.data.message === 'invalidToken') {
            this.$store.dispatch('login/SET_EMAIL', { email: response.data.email });
            this.title = 'invalidToken'
          }
        }

      },
      switchPage(page) {
        this.$store.dispatch('login/CHANGE_PAGE', {page});
      },
      initializeEmail() {
        this.email = (this.$store.getters['login/email']);
      },
      async resetPassword() {
        // 1. Basic checkings
        if (this.loading) return;
        // 1.a Init error msg
        this.$store.dispatch('login/SET_ERROR', { error: '', errorType: 'danger' });
        // 1.b Basic checkings
        if (!this.email) {
          this.$store.dispatch('login/SET_ERROR', { error: this.$t_locale('components/auth/ResetPassword')('noEmail'), errorType: 'danger' });
          return;
        }
        if (!this.password || !this.passwordConfirm) {
          this.$store.dispatch('login/SET_ERROR', { error: this.$t_locale('components/auth/ResetPassword')('noPassword'), errorType: 'danger' });
          return;
        }
        if (!this.password.match(/^\S{8,}$/)) {
          this.$store.dispatch('login/SET_ERROR', { error: this.$t_locale('components/auth/ResetPassword')('invalidPassword'), errorType: 'danger' });
          return;
        }
        if (this.passwordConfirm !== this.password) {
          this.$store.dispatch('login/SET_ERROR', { error: this.$t_locale('components/auth/ResetPassword')('unmatchingPasswords'), errorType: 'danger' });
          return;
        }
        if (this.$store.getters['login/error']) return;

        // 2. Start the spinner
        this.$store.dispatch('login/SET_LOADING', { loading: true });
        try {
          const response = await axios.post(urls.getUrl('AUTH_RESET_PASSWORD_BACK'), { password: this.password, email: this.email, token: this.token });

          if (response.data.status === 'ok') {
            this.$store.dispatch('login/SET_ERROR', { error: this.$t_locale('components/auth/ResetPassword')('passwordResetSuccess'), errorType: 'success' });
            this.switchPage('login');
          } else {
            this.$store.dispatch('login/SET_ERROR', { error: this.$t_locale('components/auth/ResetPassword')('error'), errorType: 'danger' });
          }
        } catch (e) {
          this.$store.dispatch('login/SET_ERROR', { error: this.$t_locale('components/auth/ResetPassword')('noPassword'), errorType: 'danger' });
        }
        this.$store.dispatch('login/SET_LOADING', { loading: false });
      }
    }
  }
</script>

<style lang="scss" scoped>
  .reset-password {
    &__field, &__helpers, &__buttons, &__captcha {
      margin-bottom: 28px;
    }
    &__buttons {
      display: flex;
      flex-direction: column;
      align-content: center;
    }
    &__title {
      text-align: center;
      margin-bottom: 28px;
      &__text {
        font-size: 21px;
        line-height: 1.33;
        letter-spacing: normal;
        color: black;
      }
    }
    &__invalid-text {
      display:block;
      font-size: 14px;
      text-align:center;
      line-height: 1.86;
      margin-bottom: 28px;
    }
  }
</style>
