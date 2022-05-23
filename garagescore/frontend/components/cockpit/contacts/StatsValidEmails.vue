<template>
  <div class="container">
    <CardChart
      v-if="isChartActive"
      :chartDataAndConfig="chartDataAndConfig"
      :onChangeViewType="handleViewChange"
      :viewType="viewType"
      class="stats-valid-emails"
    >
      <template slot="label">{{ $t_locale('components/cockpit/contacts/StatsValidEmails')('title') }}</template>
    </CardChart>
    <KPI
      v-else
      :dangerValue="0"
      :warningValue="65"
      :neutralValue="75"
      :positiveValue="75"
      :chartInfoFilters="chartInfoFilters"
      :hoverTitle="hoverText"
      :isLoading="isLoading"
      :onChangeViewType="handleViewChange"
      :value="prc"
      :viewType="viewType"
      :general-stats-label="'validEmails'"
      :componentName="componentName"
      isPercent
      class="stats-valid-emails"
    >
      <template slot="label">
        {{ $t_locale('components/cockpit/contacts/StatsValidEmails')('title') }}
      </template>
      <template slot="subtitle">
        <div class="stats-valid-emails__subtitle-part">
          {{ $t_locale('components/cockpit/contacts/StatsValidEmails')('countCountacts', { stat, count }) }}
        </div>
      </template>
    </KPI>
  </div>
</template>

<script>
import renderNumber from '~/util/renderNumber';

export default {
  name: 'StatsValidEmails',
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
      return this.$options.name || 'StatsValidEmails';
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
      return [this.$t_locale('components/cockpit/contacts/StatsValidEmails')('helpGood'), this.$t_locale('components/cockpit/contacts/StatsValidEmails')('helpMedium'), this.$t_locale('components/cockpit/contacts/StatsValidEmails')('helpBad')].join('\n');
    },

    totalEmails() {
      return (
        this.baseKpi.countValidEmails +
        this.baseKpi.countWrongEmails +
        this.baseKpi.countBlockedByEmail +
        this.baseKpi.countNotPresentEmails
      );
    },

    totalValidEmails() {
      return this.baseKpi.countValidEmails + this.baseKpi.countBlockedByEmail;
    },

    prc() {
      if (this.totalEmails) {
        return Math.round((this.totalValidEmails / this.totalEmails) * 100);
      }
      return undefined;
    },

    count() {
      return renderNumber(this.totalEmails);
    },

    stat() {
      return renderNumber(this.totalValidEmails);
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

.stats-valid-emails {
  &__subtitle-part {
    text-align: center;

    & + & {
      margin-top: 7px;
    }
  }
}
</style>
