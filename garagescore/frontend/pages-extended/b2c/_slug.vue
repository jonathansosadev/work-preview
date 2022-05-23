<template>
    <section class="page-certificate container">
      <div class="row">
        <div class="left-block">
          <ctf-global-rating></ctf-global-rating>
          <ctf-ratings :useCusteedHeader="useCusteedHeader"></ctf-ratings>
          <ctf-reviews :useCusteedHeader="useCusteedHeader"></ctf-reviews>
        </div>
        <div class="right-block">
          <ctf-contact></ctf-contact>
        </div>
      </div>
    </section>
</template>

<script>
  import Vue from 'vue';
  import CtfGlobalRating from '~/components/certificate/CtfGlobalRating';
  import CtfRatings from '~/components/certificate/CtfRatings';
  import CtfReviews from '~/components/certificate/CtfReviews';
  import CtfContact from '~/components/certificate/CtfContact';
  import ProgressBar from '~/components/certificate/CtfProgressBar';
  //import CertificateBuilder from '~/utils/certificate';

  export default {
    components: {CtfGlobalRating, CtfRatings, CtfReviews, CtfContact},
    async fetch ({ store, params, app }) {
      const locale = store.getters['certificate/locale'];
      if (locale === 'es_ES') {
        store.commit('setLang', 'es');
        app.i18n.locale = 'es';
      }
      else if (locale === 'ca_ES') {
        store.commit('setLang', 'ca');
        app.i18n.locale = 'ca';
      }
      else if (locale === 'en_US') {
        store.commit('setLang', 'en');
        app.i18n.locale = 'en';
      } else {
        store.commit('setLang', 'fr');
        app.i18n.locale = 'fr';
      }
    },
    computed: {
      useCusteedHeader() {
        return this.$store.state.certificate.garage.type === 'VehicleInspection';
      }
    },
    validate({ params }) {
      return typeof params.slug === 'string';
    },
    mounted() {
      const bar = Vue.prototype.$bar = new Vue(ProgressBar).$mount();
      document.body.appendChild(bar.$el);
    },
    layout: 'certificate',
  }
</script>

<style lang="scss" scoped>
.page-certificate {
}

.gs-body {
  width: 100%;
  display: inline-block;
}

.left-block {
  width: 65%;
  display: inline-block;
  padding-left: 15px;
  padding-right: 15px;
  vertical-align: top;
}

.right-block {
  width: 33.33333333%;
  display: inline-block;
  padding-right: 15px;
  vertical-align: top;
  position: relative;
}

.mobile-only {
  display: none;
}

.gs-font-16 {
  font-size: 16px;
}

@media (max-width: 768px) {
  .right-block {
    display: none;
  }

  .left-block {
    width: 100%;
    padding-left: 15px;
  }

  .mobile-only {
    display: inline-block;
  }
}

@media (max-width: 480px) {
  .left-block {
    width: 100%;
    padding-right: 15px;
  }
}
</style>
