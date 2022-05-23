<template>
  <section class="layout-auth">
    <nuxt/>
    <ModalWrapper/>
  </section>
</template>

<script>
  import gtagAnalytics from '~/util/externalScripts/gtag-analytics';
  import { hotjar } from '../util/externalScripts/hotjar';
  import userTracking from '../util/externalScripts/user-tracking';
  import ModalWrapper from '~/components/global/ModalWrapper';

  export default {
    components: { ModalWrapper },

    async mounted() {
      /* Google Analytics tracking */
      const onGtagConfigured = (gtag) => {
        gtag('event', 'page_view', {
          page_path: this.$route.fullPath,
          session_origin: this.$store.getters['cockpit/getOrigin'] || 'Unknown',
        });
      };
      gtagAnalytics(process.env.gaMeasurementCockpitID, { send_page_view: false, onGtagConfigured });
      // Load hotjar
      hotjar(process.env.hotjarId);
      // load user Tracking
      userTracking(process.env.publicAPIUrl, "invite"); // TODO we could store the userId in a cookie and retrieve it for the next logins
    }
  }
</script>


<style lang="scss" scoped>
  .layout-auth {
    height: 100vh;
    display: flex;
    display: -ms-flexbox;
    -ms-flex-pack: center;
    -ms-flex-align:center;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    background: url("/auth/bg_login.jpg") bottom fixed no-repeat;
    background-size: cover;
  }
</style>
