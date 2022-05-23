<template>
  <div class="container">
    <CardChart
      v-if="isChartActive"
      :chartDataAndConfig="chartDataAndConfig"
      :onChangeViewType="handleViewChange"
      :viewType="viewType"
      class="stats-processed"
    >
      <template slot="label">{{ $t_locale('components/cockpit/leads/StatsLeadsProcessed')('title') }}</template>
    </CardChart>
    <KPI
      v-else
      :dangerValue="0"
      :warningValue="50"
      :neutralValue="80"
      :positiveValue="80"
      :value="percent"
      :chartInfoFilters="chartInfoFilters"
      :hoverTitle="hoverText"
      :isLoading="isLoading"
      :onChangeViewType="handleViewChange"
      :viewType="viewType"
      general-stats-label="leadPendingOrProcessed"
      :componentName="componentName"
      isPercent
      class="stats-processed"
    >
      <template slot="label">{{ $t_locale('components/cockpit/leads/StatsLeadsProcessed')('title') }}</template>
      <template slot="subtitle">
        <div class="stats-processed__subtitle-part">
          {{ $t_locale('components/cockpit/leads/StatsLeadsProcessed')('ongoing', { countLeadsTouched, countLeads }) }}
        </div>
      </template>
    </KPI>
  </div>
</template>


<script>
import renderNumber from '~/util/renderNumber';
import { transformDataLeadSaleType } from '~/utils/kpi/componentHelper';

export default {
  name: 'StatsLeadsProcessed',
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
      return this.$options.name || 'StatsLeadsProcessed';
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
      return [this.$t_locale('components/cockpit/leads/StatsLeadsProcessed')('helpGood'), this.$t_locale('components/cockpit/leads/StatsLeadsProcessed')('helpMedium'), this.$t_locale('components/cockpit/leads/StatsLeadsProcessed')('helpBad')].join('\n');
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
    countLeadsTouched() {
      return renderNumber(this.baseKPI.countLeadsTouched);
    },
    percent() {
      return Math.round((this.baseKPI.countLeadsTouched / this.baseKPI.countLeads) * 100);
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

.stats-processed {
  &__help {
    color: $grey;
    font-size: 9px;
    cursor: pointer;
    position: relative;
    top: 1px;
    left: 4px;
  }

  &__subtitle-part {
    text-align: center;

    & + & {
      margin-top: 7px;
    }
  }
}
</style>
