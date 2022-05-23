<template>
  <section class="old-report-layout">
    <nuxt/>
  </section>
</template>

<script>
  import gtagAnalytics from '~/util/externalScripts/gtag-analytics';

  export default {
    props: {},
    computed: {},
    beforeMount() {
      gtagAnalytics(process.env.gaMeasurementCockpitID);
    }
  }
</script>

<style lang="scss" scoped>
  @font-face {
    font-family: 'gs-logo';
    src: url('/fonts/GsLogo/GsLogo.eot');
    src: url('/fonts/GsLogo/GsLogo.eot?#iefix') format('embedded-opentype'),
    url('/fonts/GsLogo/GsLogo.woff') format('woff'),
    url('/fonts/GsLogo/GsLogo.ttf') format('truetype'),
    url('/fonts/GsLogo/GsLogo.svg#Glyphter') format('svg');
    font-weight: normal;
    font-style: normal;
  }

  i.gs-vn-car:before {
    content: '\0041';
    font-family: "gs-logo";
  }

  .old-report-layout {
    background-color: $bg-grey;
    font-family: 'Lato', sans-serif;
    color: $white;
    font-size: 1rem;
  }
</style>
