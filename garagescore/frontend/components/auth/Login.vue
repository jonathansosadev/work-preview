<template>
  <form class="login" v-on:submit.prevent="login()">
    <div class="login__field" @keyup.enter="login()">
      <InputMaterial selectedColor="blue" v-model="email" inputId="email">
        <template slot="label">{{$t_locale('components/auth/Login')("emailLabel")}}</template>
      </InputMaterial>
    </div>
    <div class="login__field" @keyup.enter="login()">
      <InputMaterial selectedColor="blue" v-model="password" type="password" inputId="password">
        <template slot="label">{{$t_locale('components/auth/Login')("passwordLabel")}}</template>
      </InputMaterial>
    </div>
    <div class="login__helpers">
      <span class="login__helpers__forgotten-passwd" @click="switchPage('forgotten')">{{ $t_locale('components/auth/Login')('forgotPassword') }}</span>
    </div>
    <span style="color:white">captcha {{ captcha }}</span>
    <!-- 2794 div class="g-recaptcha login__captcha" v-show="captcha" :data-sitekey="captchaSiteKey"></div-->
    <div class="login__buttons">
      <Button thick type="orange" :disabled="loading" class="login__buttons__login-btn">
        <i class="icon-gs-loading" v-if="loading" />
        {{ $t_locale('components/auth/Login')('connect') }}
      </Button>
    </div>
  </form>
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
        nbError: 0,
      }
    },
    mounted() {
      this.initializeEmailPassword(this.$route.query || {})
    },
    computed: {
      captcha() {
        return this.$store.getters['isCaptchaActivated']
      },
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
      },
      'nbError': function () {
        if (this.nbError >= 3) {
          this.activateCaptcha();
        }
      }
    },
    methods: {
      activateCaptcha() {
        this.$store.commit('activateCaptcha');
      },
      async initializeEmailPassword(query) {
        await this.$store.dispatch('login/INITIALIZE_EMAIL_PASSWORD', { route: this.$route });
        this.email = (this.$store.getters['login/email']) || query.email;
        this.password = (this.$store.getters['login/password']) || query.password;
      },
      switchPage(page) {
        this.$store.dispatch('login/CHANGE_PAGE', { page } );
      },
      async login() {
        // 1. Basic checkings
        if (this.loading) {
          return;
        }
        // 1.a Init error msg
        this.$store.dispatch('login/SET_ERROR', { error: '', errorType: 'danger' });
        // 1.b Basic checkings
        if (!this.email) {
          this.$store.dispatch('login/SET_ERROR', { error: this.$t_locale('components/auth/Login')('noEmail'), errorType: 'danger' });
          return;
        }
        if (!this.password) {
          this.$store.dispatch('login/SET_ERROR', { error: this.$t_locale('components/auth/Login')('noPassword'), errorType: 'danger' });
          return;
        }
        // Waiting for google recaptcha to be ready. Prevents "No reCAPTCHA client exists" error
        /* 2794 await new Promise((res) => grecaptcha.ready(() => res()))
        if (this.captcha && !grecaptcha.getResponse()) {
          this.$store.dispatch('login/SET_ERROR', { error: this.$t_locale('components/auth/Login')('tickCaptcha'), errorType: 'danger' });
          return;
        }*/
        if (this.$store.getters['login/error']) {
          return;
        }

        // 2. Start the spinner
        this.$store.dispatch('login/SET_LOADING', { loading: true });

        // 3. Start building the login request
        const request = new XMLHttpRequest();
        request.open('POST', this.postUrl, true);
        request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        request.onload = (event) => {
          event.stopPropagation();
          event.preventDefault();
          if (request.status === 200) {
            // success
            try {
              cookieHandler.createCookie('garagescore-login', this.email, 10000);
              var res = JSON.parse(request.responseText);
              var url = res.url;
              var authToken = res.authToken;
              if (!authToken) {
                throws(new Error('No authToken found'));
              }
              if (!url) {
                throws(new Error('No url found'));
              }
              cookieHandler.createCookie('auth-token', authToken, res.authTokenExpireTime);
              this.$store.dispatch('auth/setAuthToken', authToken);
              window.location.href = url;
            } catch (e) {
              console.error(e);
              this.$store.dispatch('login/SET_ERROR', {error: this.$t_locale('components/auth/Login')('loginFail'), errorType: 'danger'});
              this.nbError++;
            }
          } else {
            if (request.status === 401) {
              // wrong login/pwd
              this.$store.dispatch('login/SET_ERROR', { error: this.$t_locale('components/auth/Login')('loginFail'), errorType: 'danger' });
              this.nbError++;
            } else if (request.status === 404) {
              this.$store.dispatch('login/SET_ERROR', { error: this.$t_locale('components/auth/Login')('loginFail'), errorType: 'danger' });
              this.nbError++;
            } else if(request.responseText) {
              /* recaptcha */
              var message = JSON.parse(request.responseText).message;
              if (message && message[0] && message[0].match(/timeout/)) {
                this.$store.dispatch('login/SET_ERROR', { error: this.$t_locale('components/auth/Login')('captchaTimeout'), errorType: 'danger' });
                // 2794 grecaptcha.reset();
              } else if(message.match(/recaptcha/)) {
                this.$store.dispatch('login/SET_ERROR', { error: this.$t_locale('components/auth/Login')('tickCaptcha'), errorType: 'danger' });
                this.activateCaptcha();
                this.nbError = 2;
              } else {
                this.$store.dispatch('login/SET_ERROR', { error: this.$t_locale('components/auth/Login')('loginFail'), errorType: 'danger' });
              }
            } else {
              this.$store.dispatch('login/SET_ERROR', { error: this.$t_locale('components/auth/Login')('loginFail'), errorType: 'danger' });
              this.nbError++;
            }
            this.$store.dispatch('login/SET_LOADING', { loading: false });
          }
        };

        // 4. Sending request
        const data = { email: this.email.toString().toLowerCase(), password: this.password };
        // 2794 if(this.captcha) data.recaptcha = grecaptcha.getResponse();
        request.send(JSON.stringify(data));
      }
    }
  }
</script>

<style lang="scss" scoped>
  .login {
    &__field, &__helpers, &__buttons, &__captcha {
      margin-bottom: 28px;
    }
    &__helpers {
      display: flex;
      display: -ms-flexbox;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      &__forgotten-passwd {
        font-size: 12px;
        color: $dark-grey;
        text-decoration: none;
        cursor:pointer;
      }
    }
    &__captcha {
      /*transform:scale(0.77);*/
      /*-webkit-transform:scale(0.77);*/
      /*transform-origin:0 0;*/
      /*-webkit-transform-origin:0 0;*/
      margin: 0 auto;
      margin-bottom: 28px;
      width: 304px;
    }
    &__buttons {
      display: flex;
      flex-direction: column;
      align-content: center;
    }
  }
  /**banner style from Notification.vue component */
  .notification {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    padding: 1rem 1.35rem;
    text-align: center;
    line-height: 1.4;
    color: $blue;
    background-color: #e9f5f7;
    border: 1px solid #67b3ff;
    margin-bottom: 21px;
    .__close {
      position: absolute;
      top: 10px;
      right: 10px;
      font-size:0.8rem;
      cursor:pointer;
    }
  }
  /*banner style end*/
</style>
