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
        {{ $t_locale('components/cockpit/satisfaction/StatsPromotors')('title') }}
      </template>
    </CardChart>
    <KPI
      v-else
      :positiveValue="85"
      :neutralValue="85"
      :warningValue="75"
      :dangerValue="0"
      :chartInfoFilters="chartInfoFilters"
      :hoverTitle="hoverText"
      :isLoading="isLoading"
      :onChangeViewType="handleViewChange"
      :value="surveyPromotorPrc"
      :viewType="viewType"
      :general-stats-label="'promotors'"
      :componentName="componentName"
      isPercent
      class="stats_nps"
    >
      <template slot="label">
        {{ $t_locale('components/cockpit/satisfaction/StatsPromotors')('title') }}
      </template>
      <template slot="subtitle">
        {{ kpiByPeriodSingle.countSurveySatisfied | renderNumber }}
        {{ $t_locale('components/cockpit/satisfaction/StatsPromotors')('on') }}
        {{ kpiByPeriodSingle.countSurveysResponded | renderNumber }}
        {{ $t_locale('components/cockpit/satisfaction/StatsPromotors')('responded') }}
      </template>
    </KPI>
  </div>
</template>

<script>
export default {
  name: 'StatsPromotors',
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
      return this.$options.name || 'StatsPromotors';
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
      return `${this.$t_locale('components/cockpit/satisfaction/StatsPromotors')('helpnps1')}\n${this.$t_locale('components/cockpit/satisfaction/StatsPromotors')('helpnps2')}\n${this.$t_locale('components/cockpit/satisfaction/StatsPromotors')('helpnps3')}`;
    },
    surveyPromotorPrc() {
      const { countSurveysResponded, countSurveySatisfied } = this.kpiByPeriodSingle || {};
      if (!countSurveysResponded) {
        return '-';
      }
      return Math.round((100 * countSurveySatisfied) / countSurveysResponded);
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
