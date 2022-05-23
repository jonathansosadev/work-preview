<template>
  <div class="container">
    <CardChart
      v-if="isChartActive"
      :chartDataAndConfig="chartDataAndConfig"
      :onChangeViewType="handleViewChange"
      :viewType="viewType"
      class="stats-lead-converted"
    >
      <template slot="label">{{ $t_locale('components/cockpit/leads/StatsLeadConverted')('title') }}</template>
    </CardChart>
    <KPI
      v-else
      :dangerValue="0"
      :warningValue="10"
      :neutralValue="20"
      :positiveValue="20"
      :value="percent"
      :chartInfoFilters="chartInfoFilters"
      :hoverTitle="hoverText"
      :isLoading="isLoading"
      :onChangeViewType="handleViewChange"
      :viewType="viewType"
      general-stats-label="leadConverted"
      :componentName="componentName"
      isPercent
      class="stats-lead-converted"
    >
      <template slot="label">{{ $t_locale('components/cockpit/leads/StatsLeadConverted')('title') }}</template>
      <template slot="subtitle">
        <div class="stats-lead-converted__subtitle-part">
          {{ $t_locale('components/cockpit/leads/StatsLeadConverted')('subtitle', { countLeadsClosedWithSale, countLeads }) }}
        </div>
      </template>
    </KPI>
  </div>
</template>

<script>
import renderNumber from '~/util/renderNumber';
import { transformDataLeadSaleType } from '~/utils/kpi/componentHelper';

export default {
  name: 'StatsLeadConverted',
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
      return this.$options.name || 'StatsLeadConverted';
    },
    chartDataAndConfig() {
      return this.chartKpiDataAndConf[this.componentName];
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
      return [this.$t_locale('components/cockpit/leads/StatsLeadConverted')('helpGood'), this.$t_locale('components/cockpit/leads/StatsLeadConverted')('helpMedium'), this.$t_locale('components/cockpit/leads/StatsLeadConverted')('helpBad')].join('\n');
    },

    baseKPI() {
      const selectedKpi = this.$route.name.includes('team')
        ? this.chartKpiDataAndConf.kpi.data.kpiData.usersKpi || {}
        : this.chartKpiDataAndConf.kpi.data.kpiData.garagesKpi || {};

      return transformDataLeadSaleType(
        selectedKpi,
        this.chartInfoFilters.leadSaleTypeSuffix,
        'countLeads',
      );
    },
    countLeads() {
      return renderNumber(this.baseKPI.countLeads);
    },
    countLeadsClosedWithSale() {
      return renderNumber(this.baseKPI.countLeadsClosedWithSale);
    },
    percent() {
      return (this.baseKPI.countLeadsClosedWithSale / this.baseKPI.countLeads) * 100;
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
.stats-lead-converted {
  &__subtitle-part {
    text-align: center;
    padding-bottom: calc(12px + 0.5rem);
  }
}
</style>
