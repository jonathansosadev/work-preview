<template>
  <div class="container">
    <CardChart
      v-if="isChartActive"
      :chartDataAndConfig="chartDataAndConfig"
      :onChangeViewType="handleViewChange"
      :viewType="viewType"
      class="stats-responded"
    >
      <template slot="label">{{ $t_locale('components/cockpit/contacts/StatsResponded')('title') }}</template>
    </CardChart>
    <KPI
      v-else
      :dangerValue="0"
      :warningValue="20"
      :neutralValue="27"
      :positiveValue="27"
      :chartInfoFilters="chartInfoFilters"
      :hoverTitle="hoverText"
      :isLoading="isLoading"
      :onChangeViewType="handleViewChange"
      :value="hasStats ? prc : '-'"
      :viewType="viewType"
      :general-stats-label="'respondents'"
      :componentName="componentName"
      isPercent
      class="stats-responded"
    >
      <template slot="label">
        {{ $t_locale('components/cockpit/contacts/StatsResponded')('title') }}
      </template>
      <template slot="subtitle">
        <div v-if="hasStats" class="stats-responded__subtitle-part">
          {{ $t_locale('components/cockpit/contacts/StatsResponded')('receivedSurvey', { stat, count }) }}
        </div>
        <div v-else class="stats-responded__subtitle-part">-</div>
      </template>
    </KPI>
  </div>
</template>

<script>
import renderNumber from '~/util/renderNumber';

export default {
  name: 'StatsResponded',
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
      return this.$options.name || 'StatsResponded';
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
      return [this.$t_locale('components/cockpit/contacts/StatsResponded')('helpGood'), this.$t_locale('components/cockpit/contacts/StatsResponded')('helpMedium'), this.$t_locale('components/cockpit/contacts/StatsResponded')('helpBad')].join('\n');
    },

    countReceivedAndScheduledSurveys() {
      if (this.baseKpi.countScheduledContacts) {
        return this.baseKpi.countReceivedSurveys + this.baseKpi.countScheduledContacts || 0;
      }
      return this.baseKpi.countReceivedSurveys || 0;
    },
    hasStats() {
      // boscary users have no survey sent (only this.baseKpi.countBlocked)
      return this.baseKpi.countScheduledContacts > 0 || this.baseKpi.countReceivedSurveys > 0;
    },
    prc() {
      if (this.baseKpi.countSurveys) {
        return Math.round(((this.baseKpi.countSurveysResponded || 0) / this.countReceivedAndScheduledSurveys) * 100);
      }
      return undefined;
    },

    count() {
      return renderNumber(this.countReceivedAndScheduledSurveys);
    },

    stat() {
      return renderNumber(this.baseKpi.countSurveysResponded);
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

.stats-responded {
  &__subtitle-part {
    text-align: center;

    & + & {
      margin-top: 7px;
    }
  }
}
</style>
