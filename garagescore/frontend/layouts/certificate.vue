<template>
  <section class="layout-certificate" itemscope itemtype="http://schema.org/AutoRepair">
    <link itemprop="additionalType" href="http://schema.org/AutoDealer">
    <div style="display: inline-block;width: 100%;height: 100%;line-height: 100%;position: absolute;z-index: 10000;background-color: white"
         :style="{ display: appDisplay }"></div>
    <meta itemprop="name" :content="garage.name">
    <meta itemprop="telephone" :content="garage.phone" v-if="garage.phone">
    <ctf-modal-help v-if="showModalHelp" :type="garage.type"></ctf-modal-help>
    <ctf-top-header :useCusteedHeader="useCusteedHeader"></ctf-top-header>
    <ctf-header :useCusteedHeader="useCusteedHeader"></ctf-header>
    <ctf-nav :useCusteedHeader="useCusteedHeader"></ctf-nav>
    <nuxt/>
    <ctf-footer :garageName="garage.name"></ctf-footer>
    <ctf-mobile-actions></ctf-mobile-actions>
    <section v-if="mapVisible" class="contact-map-wrapper">
      <ctf-contact-map></ctf-contact-map>
    </section>
  </section>
</template>

<script>
  import gtagAnalytics from '~/util/externalScripts/gtag-analytics';
  import CtfModalHelp from '~/components/certificate/CtfModalHelp';
  import CtfTopHeader from '~/components/certificate/CtfTopHeader';
  import CtfHeader from '~/components/certificate/CtfHeader';
  import CtfNav from '~/components/certificate/CtfNav';
  import CtfFooter from '~/components/certificate/CtfFooter';
  import CtfMobileActions from '~/components/certificate/CtfMobileActions';
  import CtfContactMap from '~/components/certificate/CtfContactMap';

  export default {
    middleware: 'wwwMounted',
    components: { CtfModalHelp, CtfTopHeader, CtfHeader, CtfNav, CtfFooter, CtfMobileActions, CtfContactMap },

    data() {
      return {
        appDisplay: 'inline-block'
      }
    },

    head() {
      const head = {};
      // Title & meta
      head.title = `${this.garage.name}`;
      head.meta = [{name: 'description', content: this.metaDescription}, { name: 'viewport', content: 'width=device-width, initial-scale=1' }];
      // Some CSS
      head.link = [{rel: 'stylesheet', href: 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css'}];
      head.link.push({ rel: 'stylesheet', href: 'https://api.mapbox.com/mapbox-gl-js/v0.40.1/mapbox-gl.css' });
      head.link.push({ rel: 'stylesheet', href: 'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-directions/v3.1.1/mapbox-gl-directions.css' });
      head.link.push({ rel: 'stylesheet', href: 'https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css'});
      // Scripts
      head.script = [{ src: 'https://api.mapbox.com/mapbox-gl-js/v0.40.1/mapbox-gl.js' }];
      head.script.push({ src: '/certificate//scripts/mapbox-gl-directions.min.js' });
      head.script.push({ src: '/static/latest/js/www/gdpr/cookie_banner.js' });
      // Icons & Manifest
      head.link.push({ rel: 'apple-touch-icon', sizes: '57x57', href: '/logo/icons/gs/icon-57x57.png' });
      head.link.push({ rel: 'apple-touch-icon', sizes: '60x60', href: '/logo/icons/gs/icon-60x60.png' });
      head.link.push({ rel: 'apple-touch-icon', sizes: '72x72', href: '/logo/icons/gs/icon-72x72.png' });
      head.link.push({ rel: 'apple-touch-icon', sizes: '76x76', href: '/logo/icons/gs/icon-76x76.png' });
      head.link.push({ rel: 'apple-touch-icon', sizes: '114x114', href: '/logo/icons/gs/icon-114x114.png' });
      head.link.push({ rel: 'apple-touch-icon', sizes: '120x120', href: '/logo/icons/gs/icon-120x120.png' });
      head.link.push({ rel: 'apple-touch-icon', sizes: '144x144', href: '/logo/icons/gs/icon-144x144.png' });
      head.link.push({ rel: 'apple-touch-icon', sizes: '152x152', href: '/logo/icons/gs/icon-152x152.png' });
      head.link.push({ rel: 'apple-touch-icon', sizes: '180x180', href: '/logo/icons/gs/icon-180x180.png' });
      head.link.push({ rel: 'icon', type: 'image/png', sizes: '192x192', href: '/logo/icons/gs/icon-192x192.png' });
      head.link.push({ rel: 'icon', type: 'image/png', sizes: '32x32', href: '/logo/icons/gs/icon-32x32.png' });
      head.link.push({ rel: 'icon', type: 'image/png', sizes: '96x96', href: '/logo/icons/gs/icon-96x96.png' });
      head.link.push({ rel: 'icon', type: 'image/png', sizes: '16x16', href: '/logo/icons/gs/icon-16x16.png' });
      if(this.useCusteedHeader) {
        head.link.push({ rel: "icon", type: "image/x-icon", href: "/logo/icons/custeed/favicon.ico" });
      } else {
        head.link.push({ rel: "icon", type: "image/x-icon", href: "/logo/icons/gs/favicon.ico?v=1581954028" });
      }
      head.link.push({ rel: 'manifest', href: '/certificate/images/favicon/manifest.json' });
      // Some more meta
      head.meta.push({ name: 'msapplication-TileColor', content: '#ffffff'});
      head.meta.push({ name: 'msapplication-TileImage', content: '/logo/icons/gs/icon-144x144.png' });
      head.meta.push({ name: 'theme-color', content: '#ffffff' });

      if (process.env.NODE_APP_INSTANCE !== 'www' || this.garage.noIndex) {
        head.meta.push({name: 'robots', content: 'noindex'});
      }
      return head;
    },

    beforeMount() {
      gtagAnalytics(process.env.gaMeasurementCertificateID)
    },

    mounted() {
      const leftBlock = document.getElementsByClassName('left-block')[0];
      const rightBlock = document.getElementsByClassName('right-block')[0];

      rightBlock.style.height = leftBlock.offsetHeight + 'px';
      this.appDisplay = 'none';
    },
    computed: {
      garage() {
        return this.$store.state.certificate.garage;
      },
      mapVisible() {
        return this.$store.state.certificate.mapVisible;
      },
      showModalHelp() {
        return this.$store.state.certificate.modalHelpVisible;
      },
      metaDescription() {
        const end = '';
        return this.$t_locale('layouts/certificate')('metaDescription', { respondentsCount: this.garage.respondentsCount, garageName: this.garage.name });
      },
      useCusteedHeader() {
        return this.$store.state.certificate.garage.type === 'VehicleInspection';
      }
    }
  }
</script>

<style lang="scss" scoped>
  #skip a {
    position: absolute;
    left: -10000px;
    top: auto;
    width: 1px;
    height: 1px;
    overflow: hidden;
  }
  #skip a:focus {
    position: static;
    width: auto;
    height: auto;
  }
  .layout-certificate {
    display: block;
    position: relative;
    overflow: hidden;
    margin: auto;

    .contact-map-wrapper {
      position: fixed;
      z-index: 1000;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
    }
  }
  @media only screen and (max-width: 767px) {
    #cookieBanner {
      bottom: 30px !important;
    }
  }
</style>
