<template>
  <section class="page-signin">
    <div class="page-signin__header">
      <img class="page-signin__header-img" src="/auth/header_login.svg"/>
    </div>
    <div class="page-signin__main-container">
      <SignInForm class="page-signin__main-container__form" />
    </div>
    <Msg :msg="error" :type="errorType" />
  </section>
</template>

<script>
  import SignInForm from '~/components/auth/SignInForm.vue';
  import Msg from '~/components/auth/Msg.vue';

  export default {
    layout: 'auth',

    components: { SignInForm, Msg },

    middleware: 'unauthenticated',

    head() {
      const authData = this.$store.getters['getAuthData'] || {};
      const language = (authData && authData.language) || 'fr';

      return {
        title: 'Custeed | Login',
        meta: [
          { hid: 'description', name: 'description', content: 'Custeed Application Dashboard' },
          { name: 'keywords', content: 'Custeed, application, dashboard' },
          { name: 'author', content: 'Custeed' },
          { name: 'robots', content: 'noindex,nofollow' },
          { name: 'apple-mobile-web-app-capable', content: 'yes' }
        ],
        script: [
          // { src: `https://www.google.com/recaptcha/api.js?hl=${language}` },
          { src: '~/assets/scripts/gdpr/cookie_banner.js' },
          { src: '/scripts/tracking/fingerprint.js'}
        ],
        link: [
          { rel: "icon", type: "image/x-icon", href: "/logo/icons/custeed/favicon.ico?v=1581954028" }
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
    &__header {
      position: relative;
      margin-bottom: -2px;
      height: 100%;
      &:after,
      &:before {
        display: block;
        content: " ";
        position: absolute;
        width: 5px;
        height: 48px;
        bottom: 0;
        background-color: transparent;
      }
      &:before {
        left: 0;
      }
      &:after {
        right: 0;
      }
    }
    &__header-img {
      display:block;
      width: 100%;
      height: auto;
    }
    &__main-container {
      margin-bottom: 16px;
      width: 440px;
      background-color: $white;
      border-radius: 0 0 5px 5px;
    }
    &__help {
      color: $white;
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
        margin-bottom: 1px;
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
          background-color: $white;
        }
      }
      &__main-container {
        margin-bottom: 16px;
        width: 100%;
        background-color: $white;
      }
    }
  }
  @media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
    .page-signin {
      &__header-img {
        width: calc(100% + 6px);
        position: relative;
        left: -3px;
      }
    }
  }
  @media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
    .page-signin {
      &__header-img {
        width: calc(100% + 6px);
        position: relative;
        left: -3px;
      }
    }
  }
</style>
