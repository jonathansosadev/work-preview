<template>
  <div class="signinbox">
    <div class="signinbox__form">
      <Login v-show="page === 'login'"></Login>
      <PasswordForgotten v-show="page === 'forgotten'"></PasswordForgotten>
      <ResetPassword v-show="page === 'resetPassword'"></ResetPassword>
    </div>
  </div>
</template>

<script>
import * as urls from '~/utils/urls'
import cookieHandler from '~/utils/cookie-handler'
import Login from '~/components/auth/Login.vue'
import PasswordForgotten from '~/components/auth/PasswordForgotten.vue'
import ResetPassword from '~/components/auth/ResetPassword.vue'
  
import axios from 'axios'
import { throws } from 'assert'

  export default {
    name: 'SignInForm',
    components: {
      Login,
      PasswordForgotten,
      ResetPassword
    },
    data() {
      return {};
    },
    async mounted() {
      if (this.$route.query.token) {
        await this.$store.dispatch('login/SET_TOKEN', { token: this.$route.query.token });
        this.switchPage('resetPassword');
      }
    },
    computed: {
      page() {
        return this.$store.getters['login/page'];
      }
    },
    methods: {
      switchPage(page) {
        this.$store.dispatch('login/CHANGE_PAGE', { page } );
      }
    }
  }
</script>

<style lang="scss" scoped>
  .signinbox {
    padding: 20px 20px 0 20px;
    margin: 0;
    &__form {
      margin: auto;
      max-width: 400px;
      display: flex;
      flex-direction: column;
    }
  }
</style>
