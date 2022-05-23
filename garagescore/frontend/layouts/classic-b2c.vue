<template>
  <div id="home" class="homepage">
    <section id="header" class="header">
      <div class="header__container">
        <img class="header__logo" src="/logo/gs-logo-blue.svg">
        <span class="header__txt">{{ $t_locale('layouts/classic-b2c')('headerTxt') }}</span>
        <div class="header__gotopro">
          <a href="https://pro.garagescore.com" target="_blank">{{ $t_locale('layouts/classic-b2c')('goToPro') }}</a>
        </div>
      </div>
    </section>
    <nuxt/>
    <section id="footer" class="footer">
        <div class="footer__container">
          <img class="footer__container__logo" src="/logo/gs-logo.svg">
          <div class="footer__container__brand">{{$t_locale('layouts/classic-b2c')("brand")}} <a href="https://custeed.com/" target="_blank">Custeed</a></div>
          <div class="footer__container__spacer" />
          <div class="footer__container__blocs">
            <div class="footer__container__blocs__bloc">
               <div class="footer__container__blocs__bloc__title">{{$t_locale('layouts/classic-b2c')("about")}}</div>
               <div class="footer__container__blocs__bloc__link"><a target="_blank" href="http://custeed.com">Custeed</a></div>
               <div class="footer__container__blocs__bloc__link"><a target="_blank" href="http://custeed.com/jobs">{{$t_locale('layouts/classic-b2c')("jobs")}}</a></div>
            </div>
            <div class="footer__container__blocs__bloc">
              <div class="footer__container__blocs__bloc__title">{{$t_locale('layouts/classic-b2c')("locals")}}</div>
              <a class="footer__container__blocs__bloc__link" :href="siteindex">{{$t_locale('layouts/classic-b2c')("bestlocals")}}</a>
            </div>
            <div class="footer__container__blocs__bloc" v-if="locale === 'fr'">
              <div class="footer__container__blocs__bloc__title">{{$t_locale('layouts/classic-b2c')("social")}}</div>
              <div class="footer__social">
                <a target="_blank" class="footer__social__btn footer__social__btn__facebook" href="https://www.facebook.com/GarageScore">
                  <i class="icon-gs-facebook" />
                </a>
                <a target="_blank" class="footer__social__btn footer__social__btn__twitter" href="https://twitter.com/GarageScore">
                  <i class="icon-gs-twitter" />
                </a>
                <a target="_blank" class="footer__social__btn footer__social__btn__linkedin" href="https://www.linkedin.com/company/garagescore">
                  <i class="icon-gs-linkedin" />
                </a>
                <a target="_blank" class="footer__social__btn footer__social__btn__youtube" href="https://www.youtube.com/channel/UC8byZiPX5RRcbtl93Wx4hoQ/videos">
                  <i class="icon-gs-youtube" />
                </a>
              </div>
            </div>
          </div>
          <div class="footer__container__copyright">
            <div>© Custeed {{fullYearNumber}}</div>
            <div>{{ $t_locale('layouts/classic-b2c')("rights") }}
              <a :href="CGULink" target="_blank">{{ $t_locale('layouts/classic-b2c')("CGU") }}</a>.
              <a :href="privacyLink" target="_blank">{{ $t_locale('layouts/classic-b2c')("privacy") }}</a>
            </div>
            </div>
        </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
#header {
  position: fixed;
  margin: auto;
  top: 0px;
  right: 0px;
  background-color: #ffffff;
  z-index: 1000;
  box-shadow: 0 4px 6px -6px #222;
  height: 80px;
  width: 100%;
}

.header {
  &__container {
    top: 16px;
    position: relative;
    max-width: 1110px;
    margin: auto;
    @media (max-width: $breakpoint-min-sm) {
      margin-left: 0px;
      margin-right: 0px;
    }
  }
  &__logo {
    width: 226px;
    position: absolute;
    top: 0px;
    left: 0px;
    @media (max-width: $breakpoint-min-sm) {
      width: 150px;
      position: absolute;
    }
  }
  &__txt {
    display: none;
    @media (min-width: $breakpoint-max-md) {
      display: block;
      font-size: 14px;
      line-height: 21px;
      position: absolute;
      top: 17px;
      left: 245px;
      width: 400px;
      color: #757575;
      font-family: "Lato";
      font-style: normal;
      font-weight: 400;
    }
  }
  &__gotopro {
    height: 40px;
    line-height: 40px;
    width: 200px;
    position: absolute;
    right: 15px;
    top: 4px;
    text-align: center;
    background-color: $orange;
    z-index: 1000;
    font-weight: 700;
    font-size: 1rem;
    border-radius: 3px;

    @media (max-width: $breakpoint-min-sm) {
      height: 3em;
      font-size: 0.8em;
      line-height: 3em;
    }
  }
  &__gotopro a {
    color: white;
    text-decoration: none;
  }
}
.footer {
    padding-top: 15px;
    padding-bottom: 15px;
    background-color: rgb(33, 31, 32);
    color: #bcbcbc;
    font-size: 14px;
    font-weight: 300;
    height: 100%;
    line-height: 21px;
    a {
      color:#bcbcbc;
      text-decoration: none;
      cursor: pointer;
    }
    &__container {
      max-width: 1110px;
      @media (max-width: $breakpoint-min-lg) {
        max-width: 900px;
      }
      @media (max-width: $breakpoint-min-md) {
        max-width: 700px;
      }
      margin: auto;
      &__logo {
        display: bloc;
        width: 278px;
        @media (max-width: $breakpoint-min-sm) {
          width: 200px;
        }
      }
      &__brand {
        padding-left: 12px;
        font-size: 16px;
        a {
          color: #3c9990;
          font-weight: 500;
        }
      }
      &__spacer {
        width: 100%;
        border-bottom: 2px dotted #ffffff;
        padding-top: 24px;
        margin-bottom: 25px;
      }
      &__copyright {
        font-size: 14px;
        a {
          color:#bcbcbc;
        }
        a:hover {
          color: #3c9990;
        }
      }
      &__blocs {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        margin-bottom: 35px;
        &__bloc {
          flex: 33%;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          @media (max-width: $breakpoint-min-md) {
            flex: 50%;
            margin-bottom: 25px;
          }
          @media (max-width: $breakpoint-min-sm) {
            flex: 100%;
          }
          &__title {
            font-size: 18px;
            color: #ffffff;
            font-weight: 500;
          }
          a:hover {
            color: #3c9990;
          }
          &__link {
            display: flex;
            flex: 100;
            a {
              display: inline-block;
            }
          }
        }
      }
    }
    &__social {
      margin-top: 3px;
      padding-right: 22px;
      display: flex;
      flex-direction: row;
      &__btn {
        font-size: 18px;
        margin-right: 22px;
        .fa-facebook:hover {
          color: #3b5998;
        }
        .fa-twitter:hover {
          color: #3cf;
        }
        .fa-linkedin:hover {
          color: #007bb6;
        }
        .fa-youtube:hover {
          color: #bb0000;
        }
      }
    }
}
</style>

<style lang="scss">
body {
  font-family: "Lato";
}

.firstsection {
  margin-top: 80px;
}

</style>

<script>

export default {
  head() {
    const script = [];
    const meta = [];
    script.push({ src: '/static/latest/js/www/gdpr/cookie_banner.js' });
    /*script.push({ src: 'https://apis.google.com/js/platform.js', async: false, body: false });
    script.push({ src: 'https://connect.facebook.net/en_US/sdk.js', async: false, body: false });
    meta.push({ name: "google-signin-client_id", content: process.env.GOOGLE_OAUTH_CLIENT_ID});*/
    return { script, meta };
  },
  computed: {
    locale() {
      return this.$store.getters['locale'];
    },
    siteindex() {
      const localeFull = this.$store.getters['b2c/locale'];
      return `/${localeFull}/siteindex`;
    },
    CGVLink() {
      if (['es', 'ca'].includes(this.locale)) {
        return 'https://www.garagescore.com/CGV-es.pdf';
      }
      return 'https://www.garagescore.com/CGV.pdf';
    },
    CGULink() {
      if (['es', 'ca'].includes(this.locale)) {
        return 'https://www.garagescore.com/CGU-es.pdf';
      }
      return 'https://www.garagescore.com/CGU.pdf';
    },
    privacyLink() {
      if (['es', 'ca'].includes(this.locale)) {
        return 'https://www.garagescore.com/privacy-es.pdf';
      }
      return 'https://www.garagescore.com/privacy.pdf';
    },
    fullYearNumber() {
      return (new Date()).getFullYear();
    },
  }
};
</script>
