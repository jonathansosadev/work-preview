<template>
  <div class="widget-guide">
    <Recommendations :recommendations="recommendationContent"/>
  </div>
</template>

<script>
  import Recommendations from "~/components/global/Recommendations.vue";

  export default {
    name: 'WidgetGuide',
    components: { Recommendations },
    data() {
      return {
        recommendationContent: this.$t_locale(
          'components/cockpit/admin/widget/WidgetGuide'
        )('recommendationsContent'),
      };
    },
  }
</script>

<style lang="scss" scoped>
  // box-sizing applied here to avoid breaking other pages
  // using <Recommandations /> until this component is refactored
  .widget-guide > .recommendations {
    box-sizing: border-box;
  }
</style>
