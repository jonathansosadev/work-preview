<template>
  <div class="container">
    <CardChart
      v-if="isChartActive"
      :chartDataAndConfig="chartDataAndConfig"
      :onChangeViewType="handleViewChange"
      :viewType="viewType"
      class="stats_nps"
    >
      <template slot="label">
        {{ $t_locale('components/cockpit/satisfaction/StatsNPS')('title') }}
      </template>
    </CardChart>
    <KPI
      v-else
      :neutralValue="60"
      :dangerValue="-100"
      :positiveValue="60"
      :warningValue="40"
      :chartInfoFilters="chartInfoFilters"
      :hoverTitle="hoverText"
      :isLoading="isLoading"
      :onChangeViewType="handleViewChange"
      :value="npsScore"
      :viewType="viewType"
      general-stats-label="nps"
      class="stats_nps"
    >
      <template slot="label">
        {{ $t_locale('components/cockpit/satisfaction/StatsNPS')('title') }}
      </template>
      <template slot="subtitle">
        {{ kpiByPeriodSingle.countSurveysResponded | renderNumber }}
        {{ $t_locale('components/cockpit/satisfaction/StatsNPS')('responded') }}
      </template>
    </KPI>
  </div>
</template>

<script>
export default {
  name: 'StatsNPS',
  props: {
    chartInfoFilters: { type: Object, required: true },
    chartKpiDataAndConf: { type: Object, required: true },
    onChangeView: {
      type: Function,
      required: true,
    },
  },
  computed: {
    componentName() {
      return this.$options.name || 'StatsNPS';
    },
    chartDataAndConfig() {
      return this.chartKpiDataAndConf[this.componentName];
    },
    kpiByPeriodSingle() {
      return this.chartKpiDataAndConf.kpi.data.kpiByPeriodSingle;
    },
    isLoading() {
      return this.chartKpiDataAndConf.kpi.loading;
    },
    viewType() {
      return this.chartDataAndConfig.viewType;
    },
    isChartActive() {
      return this.viewType === 'chart';
    },
    hoverText() {
      return `${this.$t_locale('components/cockpit/satisfaction/StatsNPS')('helpnps1')}\n${this.$t_locale('components/cockpit/satisfaction/StatsNPS')('helpnps2')}\n${this.$t_locale('components/cockpit/satisfaction/StatsNPS')('helpnps3')}`;
    },
    npsScore() {
      const { countSurveysResponded, countSurveySatisfied, countSurveyUnsatisfied } = this.kpiByPeriodSingle || {};

      if (!countSurveysResponded) {
        return '-';
      }
      const promoterRatio = countSurveySatisfied / countSurveysResponded;
      const rawPromotorRate = 100 * promoterRatio;
      const detractorRatio = countSurveyUnsatisfied / countSurveysResponded;
      const rawDetractorRate = 100 * detractorRatio;
      return Math.round(rawPromotorRate - rawDetractorRate);
    },
  },
  methods: {
    handleViewChange(viewType) {
      this.onChangeView(this.componentName, viewType);
    },
  },
};
</script>

<style lang="scss" scoped>
.container {
  height: 100%;
}
</style>
