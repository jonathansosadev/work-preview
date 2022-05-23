<template>
  <div class="widget-page-container">
      <WidgetGuide />
      <WidgetBuilder
        :garageIds="navigationDataProvider.garageIds"
        :availableGarages="navigationDataProvider.availableGarages"
        :selectedTags="navigationDataProvider.selectedTags"
        :selectedGarage="navigationDataProvider"
      />
  </div>
</template>

<script>
  import WidgetGuide from '~/components/cockpit/admin/widget/WidgetGuide';
  import WidgetBuilder from '~/components/cockpit/admin/widget/WidgetBuilder';
  import { setupHotJar } from '~/util/externalScripts/hotjar';
  import { watchersFactory } from '~/mixins/utils';

  export default {
    name: 'widget',
    layout: 'cockpit',
    components: {
      WidgetGuide,
      WidgetBuilder,
    },
    props: {
      navigationDataProvider: {
        type: Object,
        required: true,
      },
    },

    async mounted() {
      setupHotJar(this.navigationDataProvider.locale, 'admin_widget');
      this.navigationDataProvider.refreshRouteParameters();
      await this.refreshView();
    },

    methods: {
      async refreshView() {
        return this.navigationDataProvider.fetchFilters();
      },
    },
    watch: {
      ...watchersFactory({
        'navigationDataProvider.garageIds': ['refreshView'],
        'navigationDataProvider.periodId': ['refreshView'],
        'navigationDataProvider.dataTypeId': ['refreshView'],
        'navigationDataProvider.cockpitType': ['refreshView'],
        'navigationDataProvider.dms.frontDeskUserName': ['refreshView'],
      }),
    },
  }
</script>

<style lang="scss" scoped>
  .widget-page-container {
    background-color: $bg-grey;

    display: flex;
    flex-direction: column;

    height: 100%;
    width: calc(100% - 2rem);

    padding: 1rem 0;
    margin-left: auto;
    margin-right: auto;
    box-sizing: border-box;
  }
</style>
