<template>
  <div class="container">
    <CardChart
      v-if="isChartActive"
      :chartDataAndConfig="chartDataAndConfig"
      :onChangeViewType="handleViewChange"
      :viewType="viewType"
      class="stats-unprocessed"
    >
      <template slot="label">{{ $t_locale('components/cockpit/unsatisfied/StatsUnsatisfiedUnprocessed')('title') }}</template>
    </CardChart>
    <KPI
      v-else
      :positiveValue="20"
      :neutralValue="20"
      :warningValue="50"
      :dangerValue="100"
      :chartInfoFilters="chartInfoFilters"
      :hoverTitle="hoverText"
      :value="prc"
      :isLoading="isLoading"
      :onChangeViewType="handleViewChange"
      :viewType="viewType"
      :general-stats-label="'unsatisfiedUntreated'"
      isPercent
      reverse
      :componentName="componentName"
      class="stats-unprocessed"
    >
      <template slot="label">
        {{ $t_locale('components/cockpit/unsatisfied/StatsUnsatisfiedUnprocessed')('title') }}
      </template>
      <template slot="subtitle">
        <div class="stats-unprocessed__subtitle-part">
          {{
            $t_locale('components/cockpit/unsatisfied/StatsUnsatisfiedUnprocessed')('folder', {
              folderIngoing,
              folderCount,
            })
          }}
        </div>
      </template>
    </KPI>
  </div>
</template>

<script>
import renderNumber from '~/util/renderNumber';
import { transformDataDataTypeId } from '~/utils/kpi/componentHelper';

export default {
  name: 'StatsUnsatisfiedUnprocessed',
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
      return this.$options.name || 'StatsUnsatisfiedUnprocessed';
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
      return [this.$t_locale('components/cockpit/unsatisfied/StatsUnsatisfiedUnprocessed')('helpGood'), this.$t_locale('components/cockpit/unsatisfied/StatsUnsatisfiedUnprocessed')('helpMedium'), this.$t_locale('components/cockpit/unsatisfied/StatsUnsatisfiedUnprocessed')('helpBad')].join('\n');
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
      return Math.round(100 * (this.baseKpi.countUnsatisfiedUntouched / this.baseKpi.countUnsatisfied));
    },

    folderIngoing() {
      return renderNumber(this.baseKpi.countUnsatisfiedUntouched);
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

<style lang='scss' scoped>
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
