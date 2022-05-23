<template>
  <div class="container">
    <OldCardChart
      v-if="view === 'chart'"
      :changeView="changeView"
      :view="view"
      :chartData="chartData"
      :componentName="componentName"
      class="stats-opened"
    >
      <template slot="label">{{ $t_locale('components/cockpit/automation/StatsAutomationOpened')('title') }}</template>
   </OldCardChart>
    <OldKPI
      v-else
      class="stats-opened"
      :value="countOpened"
      :loading="loading"
      dark-grey-only
      no-bottom
      no-info
      :changeView="changeView"
      :view="view"
      :componentName="componentName"
    >
      <template slot="label">{{ $t_locale('components/cockpit/automation/StatsAutomationOpened')('title') }}</template>
      <template slot="subtitle">
        <div class="stats-leads__subtitle-part" >
          {{ $t_locale('components/cockpit/automation/StatsAutomationOpened')('opened', { percent, countSent }) }}
        </div>
      </template>
    </OldKPI>
  </div>
</template>

<script>
import renderNumber from "~/util/renderNumber";

export default {
  name:"StatsAutomationOpened",
  props: {
    loading: Boolean,
    automationCountSent: Number,
    automationCountOpened: Number,
    changeView: Function,
    view : String,
    chartData : Object
  },
  computed: {
    countSent() {
      return renderNumber(Math.max(0, this.automationCountSent));
    },
    countOpened() {
      return Math.max(0, this.automationCountOpened);
    },
    percent() {
      const result = this.automationCountSent ? Math.round((this.automationCountOpened / this.automationCountSent) * 100) : 0;
      return renderNumber(Math.min(100, Math.max(0, result)));
    },
    componentName() {
      return this.$options.name || "StatsAutomationOpened";
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
