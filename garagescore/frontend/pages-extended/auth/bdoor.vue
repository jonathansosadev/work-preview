<template>
  <section class="page-signin">
    <img class="page-signin__header-img" src="/auth/header_login.svg"/>
    <div class="page-signin__main-container">
      <SignInForm class="page-signin__main-container__form"></SignInForm>
    </div>
    <Msg :msg="error" :type="errorType"></Msg>
    <div class="page-signin__help">
      <span>{{ $t_locale('pages-extended/auth/bdoor')('needHelp') }} <a @click="openHelpModal()">{{ $t_locale('pages-extended/auth/bdoor')('help') }}</a></span>
    </div>
  </section>
</template>

<script>
  import SignInForm from '~/components/auth/SignInForm.vue';
  import Msg from '~/components/auth/Msg.vue';


  export default {
    layout: 'auth',

    components: { SignInForm, Msg },

    head() {
      const authData = this.$store.getters['getAuthData'] || {};
      const language = (authData && authData.language) || 'fr';
      return {
        title: 'Custeed | Login',
        meta: [
          { hid: 'description', name: 'description', content: 'Custeed Application Dashboard' },
          { name: 'keywords', content: 'custeed, application, dashboard' },
          { name: 'author', content: 'Custeed' },
          { name: 'robots', content: 'noindex,nofollow' },
          { name: 'apple-mobile-web-app-capable', content: 'yes' }
        ],
        script: [
          // { src: `https://www.google.com/recaptcha/api.js?hl=${language}` },
          { src: '~/assets/scripts/gdpr/cookie_banner.js' },
          { src: '~/assets/scripts/tracking/fingerprint.js'}
        ]
      }
    },
    methods: {
      openHelpModal() {
        this.$store.dispatch('openModal', { component: 'ModalHelp' });
      },
    },
    data() {
      return {
      }
    },
    computed: {
      error() {
        return this.$store.getters['login/error'];
      },
      errorType() {
        return this.$store.getters['login/errorType'];
      }
    }

  }
</script>

<style lang="scss" scoped>
  .page-signin {
    &__header-img {
      display:block;
    }
    &__main-container {
      margin-bottom: 16px;
      width: 440px;
      background-color: white;
    }
    &__help {
      color: white;
      font-size: 12px;
      width: 100%;
      text-align: center;
      a {
        font-weight: bold;
        cursor: pointer;
        text-decoration: underline;
      }
    }
  }
  @media screen and (max-width: $breakpoint-max-xs) {
    .page-signin {
      padding: 0 5px;
      &__header-img {
        position: relative;
        margin-bottom: -3px;
        height: 100%;
        width: 100%;
        &:after {
          display: block;
          content: " ";
          position: absolute;
          width: 5px;
          height: 52px;
          bottom: 0;
          left: 0;
          background-color: white;
        }
      }
      &__main-container {
        margin-bottom: 16px;
        width: 100%;
        background-color: white;
      }
    }
  }
</style>
