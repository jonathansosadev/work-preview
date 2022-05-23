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
        {{ $t_locale('components/cockpit/satisfaction/StatsDetractors')('title') }}
      </template>
    </CardChart>
    <KPI
      v-else
      :positiveValue="5"
      :neutralValue="5"
      :warningValue="10"
      :dangerValue="100"
      :chartInfoFilters="chartInfoFilters"
      :hoverTitle="hoverText"
      :isLoading="isLoading"
      :onChangeViewType="handleViewChange"
      :value="surveyDetractorPrc"
      :viewType="viewType"
      :general-stats-label="'detractors'"
      isPercent
      reverse
      :componentName="componentName"
      class="stats_nps"
    >
      <template slot="label">
        {{ $t_locale('components/cockpit/satisfaction/StatsDetractors')('title') }}
      </template>
      <template slot="subtitle">
        {{ kpiByPeriodSingle.countSurveyUnsatisfied | renderNumber }}
        {{ $t_locale('components/cockpit/satisfaction/StatsDetractors')('on') }}
        {{ kpiByPeriodSingle.countSurveysResponded | renderNumber }}
        {{ $t_locale('components/cockpit/satisfaction/StatsDetractors')('responded') }}
      </template>
    </KPI>
  </div>
</template>

<script>
export default {
  name: 'StatsDetractors',
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
      return this.$options.name || 'StatsDetractors';
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
      return `${this.$t_locale('components/cockpit/satisfaction/StatsDetractors')('helpnps1')}\n${this.$t_locale('components/cockpit/satisfaction/StatsDetractors')('helpnps2')}\n${this.$t_locale('components/cockpit/satisfaction/StatsDetractors')('helpnps3')}`;
    },
    surveyDetractorPrc() {
      const { countSurveysResponded, countSurveyUnsatisfied } = this.kpiByPeriodSingle;

      if (!countSurveysResponded) {
        return '-';
      }
      return Math.round((100 * countSurveyUnsatisfied) / countSurveysResponded);
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
