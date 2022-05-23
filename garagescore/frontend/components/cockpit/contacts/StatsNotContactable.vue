<template>
  <div class="container">
    <CardChart
      v-if="isChartActive"
      :chartDataAndConfig="chartDataAndConfig"
      :onChangeViewType="handleViewChange"
      :viewType="viewType"
      class="stats-not-contactable"
    >
      <template slot="label">{{ $t_locale('components/cockpit/contacts/StatsNotContactable')('title') }}</template>
    </CardChart>
    <KPI
      v-else
      :chartInfoFilters="chartInfoFilters"
      :componentName="componentName"
      :dangerValue="100"
      :hoverTitle="hoverText"
      :isLoading="isLoading"
      :neutralValue="5"
      :onChangeViewType="handleViewChange"
      :positiveValue="5"
      :value="prc"
      :viewType="viewType"
      :warningValue="15"
      class="stats-not-contactable"
      general-stats-label="unreachables"
      isPercent
      reverse
    >
      <template slot="label">
        {{ $t_locale('components/cockpit/contacts/StatsNotContactable')('title') }}
      </template>
      <template slot="subtitle">
        <div class="stats-not-contactable__subtitle-part">
          {{ $t_locale('components/cockpit/contacts/StatsNotContactable')('countCountacts', { stat, count }) }}
        </div>
      </template>
    </KPI>
  </div>
</template>

<script>
import renderNumber from '~/util/renderNumber';

export default {
  name: 'StatsNotContactable',
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
      return this.$options.name || 'StatsNotContactable';
    },
    chartDataAndConfig() {
      return this.chartKpiDataAndConf[this.componentName];
    },
    baseKpi() {
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
      return [this.$t_locale('components/cockpit/contacts/StatsNotContactable')('helpGood'), this.$t_locale('components/cockpit/contacts/StatsNotContactable')('helpMedium'), this.$t_locale('components/cockpit/contacts/StatsNotContactable')('helpBad')].join('\n');
    },

    prc() {
      if (this.baseKpi.totalShouldSurfaceInCampaignStats) {
        return ((this.baseKpi.countNotContactable || 0) / this.baseKpi.totalShouldSurfaceInCampaignStats) * 100;
      }
      return undefined;
    },

    count() {
      return renderNumber(this.baseKpi.totalShouldSurfaceInCampaignStats);
    },

    stat() {
      return renderNumber(this.baseKpi.countNotContactable);
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

.stats-not-contactable {
  &__subtitle-part {
    text-align: center;

    & + & {
      margin-top: 7px;
    }
  }
}
</style>
