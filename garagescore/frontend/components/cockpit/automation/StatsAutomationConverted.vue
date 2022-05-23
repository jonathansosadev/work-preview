<template>
  <div class="container">
    <OldCardChart
      v-if="view === 'chart'"
      :changeView="changeView"
      :view="view"
      :chartData="chartData"
      :componentName="componentName"
      class="stats-converted"
    >
      <template slot="label">{{ $t_locale('components/cockpit/automation/StatsAutomationConverted')(campaignType + '_title') }}</template>
   </OldCardChart>
    <OldKPI
      v-else
      class="stats-converted"
      :value="countConverted"
      :loading="loading"
      blue-only
      no-bottom
      :changeView="changeView"
      :view="view"
      :componentName="componentName"
      :hoverTitle="displayTooltip"
    >
      <template slot="label">{{ $t_locale('components/cockpit/automation/StatsAutomationConverted')(campaignType + '_title', {}, campaignType) }}</template>
      <template slot="subtitle">
        <div class="stats-converted__subtitle-part" >
          {{ $t_locale('components/cockpit/automation/StatsAutomationConverted')(campaignType + '_converted', { percent, countOpened }, campaignType) }}
        </div>
      </template>
    </OldKPI>
  </div>
</template>

<script>
import renderNumber from "~/util/renderNumber";
import AutomationCampaignTypes from "../../../utils/models/automation-campaign.type";

export default {
  name:"StatsAutomationConverted",
  props: {
    loading: Boolean,
    automationCountOpened: Number,
    automationCountLeadSales: Number,
    automationCountConverted: Number,
    campaignType: String,
    changeView: Function,
    view : String,
    chartData : Object
  },
  computed: {
    displayTooltip() {
      if (this.campaignType === AutomationCampaignTypes.AUTOMATION_MAINTENANCE) {
        return null;
      }
      return this.$t_locale('components/cockpit/automation/StatsAutomationConverted')('tooltip');
    },
    countConverted() {
        return Math.max(0, this.automationCountConverted);
    },
    countOpened() {
      return Math.max(0, this.automationCountOpened);
    },
    countLead() {
      return Math.max(0, this.automationCountLeadSales)
    },
    displayCount() {
      return this.campaignType === AutomationCampaignTypes.AUTOMATION_MAINTENANCE ? this.countOpened : this.countLead;
    },
    percent() {
      let denominator = this.campaignType === AutomationCampaignTypes.AUTOMATION_MAINTENANCE ? this.countOpened: this.countLead;
      const result = denominator ? Math.round((this.countConverted / denominator) * 100) : 0;
      return renderNumber(Math.min(100, Math.max(0, result)));
    },
    componentName() {
      return this.$options.name || "StatsAutomationConverted";
    },
  }
};
</script>

<style lang="scss" scoped>
.container {
  height: 100%;
}
.stats-converted {
  &__help {
    color: $grey;
    margin-left: 6px;
    font-size: 9px;
    cursor: pointer;
  }

  &__subtitle-part {
    text-align: center;
  }
}
</style>
