<template>
  <div class="container">
    <CardChart
      v-if="isChartActive"
      :chartDataAndConfig="chartDataAndConfig"
      :onChangeViewType="handleViewChange"
      :viewType="viewType"
      class="stats-unsatisfied-saved"
    >
      <template slot="label">{{ $t_locale('components/cockpit/unsatisfied/StatsUnsatisfiedSaved')('title') }}</template>
    </CardChart>
    <KPI
      v-else
      :dangerValue="0"
      :warningValue="50"
      :neutralValue="75"
      :positiveValue="75"
      :chartInfoFilters="chartInfoFilters"
      :hoverTitle="hoverText"
      :value="prc"
      :isLoading="isLoading"
      :onChangeViewType="handleViewChange"
      :viewType="viewType"
      :general-stats-label="'unsatisfiedSaved'"
      isPercent
      :componentName="componentName"
      class="stats-unsatisfied-saved"
    >
      <template slot="label">
        {{ $t_locale('components/cockpit/unsatisfied/StatsUnsatisfiedSaved')('title') }}
      </template>
      <template slot="subtitle">
        <div class="stats-unsatisfied-saved__subtitle-part">
          {{ $t_locale('components/cockpit/unsatisfied/StatsUnsatisfiedSaved')('subtitle', { folderSaved, folderCount }) }}
        </div>
      </template>
    </KPI>
  </div>
</template>

<script>
import renderNumber from "~/util/renderNumber";
import { transformDataDataTypeId } from '~/utils/kpi/componentHelper';

export default {
  name: "StatsUnsatisfiedSaved",
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
      return this.$options.name || "StatsUnsatisfiedSaved";
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
      return [this.$t_locale('components/cockpit/unsatisfied/StatsUnsatisfiedSaved')('helpGood'), this.$t_locale('components/cockpit/unsatisfied/StatsUnsatisfiedSaved')('helpMedium'), this.$t_locale('components/cockpit/unsatisfied/StatsUnsatisfiedSaved')('helpBad')].join('\n');
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
      return Math.round(100 * (this.baseKpi.countUnsatisfiedClosedWithResolution / this.baseKpi.countUnsatisfied));
    },

    folderCount() {
      return renderNumber(this.baseKpi.countUnsatisfied);
    },

    folderSaved() {
      return renderNumber(this.baseKpi.countUnsatisfiedClosedWithResolution);
    }
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
.stats-unsatisfied-saved {
  &__subtitle-part {
    text-align: center;
    padding-bottom: calc(12px + 0.5rem);
  }
}
</style>
