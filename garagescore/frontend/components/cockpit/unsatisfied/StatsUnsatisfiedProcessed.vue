<template>
  <div class="container">
    <CardChart
      v-if="isChartActive"
      :chartDataAndConfig="chartDataAndConfig"
      :onChangeViewType="handleViewChange"
      :viewType="viewType"
      class="stats-processed"
    >
      <template slot="label">{{ $t_locale('components/cockpit/unsatisfied/StatsUnsatisfiedProcessed')('title') }}</template>
    </CardChart>
    <KPI
      v-else
      :dangerValue="0"
      :warningValue="50"
      :neutralValue="80"
      :positiveValue="80"
      :chartInfoFilters="chartInfoFilters"
      :hoverTitle="hoverText"
      :value="prc"
      :isLoading="isLoading"
      :onChangeViewType="handleViewChange"
      :viewType="viewType"
      general-stats-label="unsatisfiedPendingOrProcessed"
      isPercent
      :componentName="componentName"
      class="stats-processed"
    >
      <template slot="label">
        {{ $t_locale('components/cockpit/unsatisfied/StatsUnsatisfiedProcessed')('title') }}
      </template>
      <template slot="subtitle">
        <div class="stats-processed__subtitle-part">
          {{ $t_locale('components/cockpit/unsatisfied/StatsUnsatisfiedProcessed')('folder', { folderIngoing, folderCount }) }}
        </div>
      </template>
    </KPI>
  </div>
</template>

<script>
import renderNumber from '~/util/renderNumber';
import { transformDataDataTypeId } from '~/utils/kpi/componentHelper';

export default {
  name: 'StatsUnsatisfiedProcessed',
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
      return this.$options.name || 'StatsUnsatisfiedProcessed';
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
      return [this.$t_locale('components/cockpit/unsatisfied/StatsUnsatisfiedProcessed')('helpGood'), this.$t_locale('components/cockpit/unsatisfied/StatsUnsatisfiedProcessed')('helpMedium'), this.$t_locale('components/cockpit/unsatisfied/StatsUnsatisfiedProcessed')('helpBad')].join('\n');
    },
    chartDataAndConfig() {
      return this.chartKpiDataAndConf[this.componentName];
    },
    baseKpi() {
      const selectedKpi = this.chartKpiDataAndConf.kpi.data.kpiData.garagesKpi
        || this.chartKpiDataAndConf.kpi.data.kpiData.usersKpi
        || {};

      return transformDataDataTypeId(
        selectedKpi,
        this.chartInfoFilters.dataTypeId,
      );
    },
    prc() {
      return Math.round(100 * (this.baseKpi.countUnsatisfiedTouched / this.baseKpi.countUnsatisfied));
    },
    folderIngoing() {
      return renderNumber(this.baseKpi.countUnsatisfiedTouched);
    },
    folderCount() {
      return renderNumber(this.baseKpi.countUnsatisfied);
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
