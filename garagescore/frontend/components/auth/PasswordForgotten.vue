<template>
  <div class="password-forgotten">
    <div class="password-forgotten__field" @keyup.enter="requestNewPassword()">
      <InputMaterial selectedColor="blue" v-model="email">
        <template slot="label">{{$t_locale('components/auth/PasswordForgotten')("emailLabel")}}</template>
      </InputMaterial>
    </div>
    <div class="password-forgotten__buttons">
      <Button
        class="signinbox__form__buttons__login-btn"
        type="orange"
        thick
        :disabled="loading"
        @click="requestNewPassword()"
      >
        <i v-if="loading" class="icon-gs-loading" />
        {{ $t_locale('components/auth/PasswordForgotten')('resetPassword') }}
      </Button>
    </div>
    <div class="password-forgotten__helpers">
      <span class="password-forgotten__helpers__forgotten-passwd" @click="switchPage('login')">{{ $t_locale('components/auth/PasswordForgotten')('back') }}</span>
    </div>
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
      }
    },
    mounted() {
      this.email = (this.$store.getters['login/email']);
    },
    computed: {
      authData() {
        return this.$store.getters['getAuthData'] || {};
      },
      postUrl() {
        return this.authData.postUrl || urls.getUrl('AUTH_SIGNIN_LOCAL');
      },
      captchaSiteKey() {
        return this.authData.captchaSiteKey;
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
        this.email = this.$store.getters['login/email'];
      }
    },
    methods: {
      switchPage(page) {
        this.$store.dispatch('login/CHANGE_PAGE', { page } );
      },
      async requestNewPassword() {
        // 1. Basic checkings
        if (this.loading) return;
        // 1.a Init error msg
        this.$store.dispatch('login/SET_ERROR', { error: '', errorType: 'danger' });
        // 1.b Basic checkings
        if (!this.email) {
          this.$store.dispatch('login/SET_ERROR', { error: this.$t_locale('components/auth/PasswordForgotten')('noEmail'), errorType: 'danger' });
          return;
        }
        if (!this.email.match(/^(([a-zA-Z\-0-9._+]+@[a-zA-Z\-0-9._]+\.[a-zA-Z\-0-9._]+)([,][ ])*)+$/i)) {
          this.$store.dispatch('login/SET_ERROR', { error: this.$t_locale('components/auth/PasswordForgotten')('invalidEmail'), errorType: 'danger' });
          return;
        }
        if (this.$store.getters['login/error']) return;
        this.$store.dispatch('login/SET_LOADING', { loading: true });
        try {
          const response = await axios.post(urls.getUrl('AUTH_REQUEST_NEW_PASSWORD'), { email: this.email.toLowerCase() });
          if (response.data.status === 'ok') {
            this.$store.dispatch('login/SET_ERROR', { error: this.$t_locale('components/auth/PasswordForgotten')('passwordRequestSent'), errorType: 'success' });
            this.$store.dispatch('login/CHANGE_PAGE', { page: 'login' } );
          } else {
            this.$store.dispatch('login/SET_ERROR', { error: this.$t_locale('components/auth/PasswordForgotten')(response.data.message, {}, response.data.message), errorType: 'danger' });
          }
        } catch (e) {
          this.$store.dispatch('login/SET_ERROR', { error: e.toString(), errorType: 'danger' });
        }
        this.$store.dispatch('login/SET_LOADING', { loading: false });
      },
    }
  }
</script>

<style lang="scss" scoped>
  .password-forgotten {
    &__helpers {
      text-align:center;
    }
    &__field, &__helpers, &__buttons, &__captcha {
      margin-bottom: 28px;
      &__forgotten-passwd {
        font-size: 12px;
        color: $dark-grey;
        text-decoration: none;
        cursor:pointer;
      }
    }
    &__buttons {
      display: flex;
      flex-direction: column;
      align-content: center;
    }
  }
</style>
