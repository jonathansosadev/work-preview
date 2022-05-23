<template>
  <section class="reset-password-page">
    <div class="signinbox" v-if="email">
      <div class="signinbox__form">
        <div class="signinbox__form__title">{{ $t_locale('pages-extended/auth/reset_password/_token')('title') }}</div>

        <div class="signinbox__form__field" @keyup.enter="send()">
          <InputBasic type="password" :placeholder="$t_locale('pages-extended/auth/reset_password/_token')('passwordLabel')" size="sm" v-model="password"></InputBasic>
        </div>

        <div class="signinbox__form__field" @keyup.enter="send()">
          <InputBasic type="password" :placeholder="$t_locale('pages-extended/auth/reset_password/_token')('passwordConfirmationLabel')" size="sm" v-model="passwordConfirmation"></InputBasic>
        </div>

        <div class="signinbox__form__buttons">
          <div class="signinbox__form__buttons__send">
            <Button type="orange" :disabled="!canSend" @click="send()" class="signinbox__form__buttons__send__btn">
              <i v-if="loading" class="icon-gs-loading" />
              {{ $t_locale('pages-extended/auth/reset_password/_token')('send') }}
            </Button>
          </div>
          <div class="signinbox__form__buttons__msg" v-if="errorMessage">
            <Button type="orange-border" class="signinbox__form__buttons__msg__btn">
              <AppText tag="span" type="warning" v-if="password.length < 8">{{ $t_locale('pages-extended/auth/reset_password/_token')('warningPasswordLength') }}</AppText>
              <AppText tag="span" type="warning" v-else-if="password.includes(' ')">{{ $t_locale('pages-extended/auth/reset_password/_token')('warningPasswordSpace') }}</AppText>
              <AppText tag="span" type="warning" v-else-if="password !== passwordConfirmation">{{ $t_locale('pages-extended/auth/reset_password/_token')('warningPasswordConfirmation') }}</AppText>
              <AppText tag="span" :type="msgSend ? 'success': 'danger'">{{ msgSend ? $t_locale('pages-extended/auth/reset_password/_token')('success') : error }}</AppText>
            </Button>
          </div>
        </div>

      </div>
    </div>
    <div v-else class="bad-token">
      <AppText tag="h2" size="lg" type="danger">{{ $t_locale('pages-extended/auth/reset_password/_token')('badToken') }}</AppText>
    </div>
  </section>
</template>

<script>
  import axios from 'axios';

  export default {
    layout: 'auth',

    async asyncData ({ req, route }) {
      const user = await req.app.models.User.findOne({ where: { 'resetPassword.token': route.params.token.replace(/==.+$/, '==') } });

      return { email: user ? user.email : null };
    },

    data() {
      return {
        error: '',
        msgSend: false,
        loading: false,
        password: '',
        passwordConfirmation: ''
      };
    },

    computed: {
      canSend() {
        return this.password.length >= 8 && !this.password.includes(' ') && this.password === this.passwordConfirmation && !this.loading;
      },
      errorMessage() {
        return this.password.length && (this.password.length < 8 || this.password.includes(' ') || this.password !== this.passwordConfirmation);
      }
    },

    methods: {
      async send() {
        if (this.canSend) {
          this.loading = true;
          try {
            const response = await axios.post(this.$route.path, { password: this.password });

            if (response.data.status === 'ok') {
              this.msgSend = true;
              this.password = '';
              this.passwordConfirmation = '';
              this.error = '';
              setTimeout(() => this.$router.push({ name: 'auth-signin', query: { email: this.email || '' } }), 3000);
            } else {
              this.error = this.$t_locale('pages-extended/auth/reset_password/_token')('error');
            }
          } catch (e) {
            this.error = this.$t_locale('pages-extended/auth/reset_password/_token')('error');
          }
          this.loading = false;
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  .reset-password-page {
    .bad-token {
      width: 100%;
      text-align: center;
      padding: 3rem 0;
    }

    .signinbox {
      padding: 20px;
      margin: 0;
      &__form {
        margin: auto;
        max-width: 450px;
        display: flex;
        flex-direction: column;

        &__title {
          font-size: 2rem;
          color: white;
          margin: 0.5rem 0;
          font-weight: bold;
        }

        &__subtitle {
          font-size: 1rem;
          color: white;
          margin: 0 0 1rem 0;
        }

        &__field, &__helpers {
          margin-bottom: 1rem;
        }
        &__helpers {
          color: white;
          display: flex;
          display: -ms-flexbox;
          flex-direction: row;
          justify-content: space-between;
          font-size: 16px;
          font-weight: 700;
          text-decoration: underline;
          cursor: pointer;
          a:active, a:visited {
            color: white;
          }
          a {
            color: white;
          }
        }
        &__buttons {
          display: flex;
          flex-direction: column;
          align-content: center;
          &__send, &__msg {
            align-self: center;
            &__btn {
              padding-left: 1rem;
              padding-right: 1rem;
            }
          }
          &__msg {
            margin-top: 0.5rem;
            &__btn {
              background-color: $white !important;
              cursor: unset !important;
              height: unset;
            }
          }
        }
      }
    }
  }
</style>
