<template>
  <div class="container">
    <CardChart
      v-if="isChartActive"
      :chartDataAndConfig="chartDataAndConfig"
      :onChangeViewType="handleViewChange"
      :viewType="viewType"
      class="stats-unprocessed"
    >
      <template slot="label">
        <div>
          {{ $t_locale('components/cockpit/leads/StatsLeadsUnprocessed')('title') }}
        </div>
      </template>
    </CardChart>
    <KPI
      v-else
      :positiveValue="20"
      :neutralValue="20"
      :warningValue="50"
      :dangerValue="100"
      :value="percent"
      :chartInfoFilters="chartInfoFilters"
      :hoverTitle="hoverText"
      :isLoading="isLoading"
      :onChangeViewType="handleViewChange"
      :viewType="viewType"
      general-stats-label="leadUntreated"
      isPercent
      reverse
      class="stats-unprocessed"
    >
      <template slot="label">
        <div>
          {{ $t_locale('components/cockpit/leads/StatsLeadsUnprocessed')('title') }}
        </div>
      </template>
      <template slot="subtitle">
        <div class="stats-unprocessed__subtitle-part">
          {{ $t_locale('components/cockpit/leads/StatsLeadsUnprocessed')('untreated', { countLeadsUntouched, countLeads }) }}
        </div>
      </template>
    </KPI>
  </div>
</template>

<script>
import renderNumber from '~/util/renderNumber';
import { transformDataLeadSaleType } from '~/utils/kpi/componentHelper';

export default {
  name: 'StatsLeadsUnprocessed',
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
      return this.$options.name || 'StatsLeadsUnprocessed';
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
      return [this.$t_locale('components/cockpit/leads/StatsLeadsUnprocessed')('helpGood'), this.$t_locale('components/cockpit/leads/StatsLeadsUnprocessed')('helpMedium'), this.$t_locale('components/cockpit/leads/StatsLeadsUnprocessed')('helpBad')].join('\n');
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
      return this.renderNumber(this.baseKPI.countLeads);
    },
    countLeadsUntouched() {
      return this.renderNumber(this.baseKPI.countLeadsUntouched);
    },
    percent() {
      return Math.round((this.baseKPI.countLeadsUntouched / this.baseKPI.countLeads) * 100);
    },
  },

  methods: {
    renderNumber,
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
.stats-unprocessed {
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
