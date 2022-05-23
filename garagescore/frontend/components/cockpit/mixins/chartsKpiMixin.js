import {
  getPageConfigCharts,
  chartsComputed,
  chartsMethod,
  chartsWatcher,
} from '~/utils/charts/pageHelper';

// TODO when migrate to vue3, need to use Composition API
const chartsKpiMixin = (configChartName, kpiQuery, kpiDataObject) => ({
  async mounted() {
    await Promise.all([
      this.fetchKPIDataForChart(),
      this.fetchKpi(),
    ])
  },

  data() {
    const generatedConfigCharts = getPageConfigCharts(
      configChartName,
      kpiQuery,
      this.$route?.name,
      this.navigationDataProvider,
      kpiDataObject,
    );

    return {
      ...generatedConfigCharts,
    };
  },
  computed: {
    ...chartsComputed,
  },
  methods: {
    ...chartsMethod,
  },
  watch: {
    ...chartsWatcher,
  },
});

export default chartsKpiMixin;
