<template>
  <div class="container">
    <OldCardChart
      v-if="view === 'chart'"
      :changeView="changeView"
      :view="view"
      :chartData="chartData"
      :componentName="componentName"
      class="stats-lead"
    >
      <template slot="label">{{ $t_locale('components/cockpit/automation/StatsAutomationLead')('title') }}</template>
   </OldCardChart>
    <OldKPI
      v-else
      class="stats-lead"
      :value="countLead"
      :loading="loading"
      dark-grey-only
      no-bottom
      no-info
      :changeView="changeView"
      :view="view"
      :componentName="componentName"
    >
      <template slot="label">{{ $t_locale('components/cockpit/automation/StatsAutomationLead')('title') }}</template>
      <template slot="subtitle">
        <div class="stats-leads__subtitle-part" >
          {{ $t_locale('components/cockpit/automation/StatsAutomationLead')('lead', { percent, countSent }) }}
        </div>
      </template>
    </OldKPI>
  </div>
  
</template>

<script>
import renderNumber from "~/util/renderNumber";

export default {
  props: {
    loading: Boolean,
    automationCountSent: Number,
    automationCountLeadSales: Number,
    changeView: Function,
    view : String,
    chartData : Object
  },
  computed: {
    countSent() {
      return renderNumber(Math.max(0, this.automationCountSent));
    },
    countLead() {
      return Math.max(0, this.automationCountLeadSales);
    },
    percent() {
      const result = this.automationCountSent ? Math.round((this.automationCountLeadSales / this.automationCountSent) * 100) : 0;
      return renderNumber(Math.min(100, Math.max(0, result)));
    },
    componentName() {
      return this.$options.name || "StatsAutomationLead";
    },
  }
};
</script>

<style lang="scss" scoped>
.container {
  height: 100%;
}
.stats-leads {
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
