<template>
  <div id="content">
    <TeaserSection />
    <ReviewsSection v-if="showReviews"/>
    <DifferencesSection />
    <PartnersSection v-if="showPartners" />
    <ContactSection />
  </div>
</template>

<style>
  html {
    box-sizing:border-box;
  }
</style>

<script>
  import TeaserSection from '~/components/home/classic-b2c/TeaserSection.vue';
  import DifferencesSection from '~/components/home/classic-b2c/DifferencesSection.vue';
  import PartnersSection from '~/components/home/classic-b2c/PartnersSection.vue';
  import ContactSection from '~/components/home/classic-b2c/ContactSection.vue';
  import ReviewsSection from '~/components/home/classic-b2c/ReviewsSection.vue';
  export default {
    middleware: ['www-redirect-by-locale'],
    components: { TeaserSection, DifferencesSection, PartnersSection, ContactSection, ReviewsSection },
    data() {
      return {
        captchaSiteKey: ''
      }
    },
    head() {
      return {
        title: 'GarageScore',
        link: [
          { rel: "icon", type: "image/x-icon", href: "/logo/icons/gs/favicon.ico?v=1581954028" }
        ]
      }
    },
    layout () {
      return 'classic-b2c';
    },
    async fetch ({ store, params, app }) {
      await store.dispatch("b2c/FETCH_HOME_B2C");
      if (store.getters['b2c/locale'] === 'ca_ES') {
        store.commit('setLang', 'ca');
        app.i18n.locale = 'ca';
      } else if (store.getters['b2c/locale'] === 'es_ES') {
        store.commit('setLang', 'es');
        app.i18n.locale = 'es';
      } else if (store.getters['b2c/locale'] === 'en_US') {
        store.commit('setLang', 'en');
        app.i18n.locale = 'en';
      } else {
        store.commit('setLang', 'fr');
        app.i18n.locale = 'fr';
      }
    },
    computed: {
      showReviews() {
        return this.$store.getters['b2c/locale'] === 'fr_FR';
      },
      showPartners() {
        return this.$store.getters['b2c/locale'] === 'fr_FR';
      }
    }
  }
</script>
