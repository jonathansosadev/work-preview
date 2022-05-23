import {
  getKpiWatcher,
  getPageKpiData,
  kpiComputed,
  kpiMethod,
} from '~/utils/kpi/pageHelper';

// TODO when migrate to vue3, need to use Composition API
const kpiMixin = (kpiQuery, watcherFields = null, defaultKpiData = {}) => ({
  async mounted() {
    await this.fetchKpi();
  },

  data() {
    const generatedKpiData = getPageKpiData(
      kpiQuery,
      defaultKpiData,
    );

    return {
      ...generatedKpiData,
    };
  },
  computed: {
    ...kpiComputed,
  },
  methods: {
    ...kpiMethod,
  },
  watch: {
    ...getKpiWatcher(watcherFields),
  }
});

export default kpiMixin
