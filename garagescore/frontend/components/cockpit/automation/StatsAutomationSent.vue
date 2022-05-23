<template>
  <div class="container">
    <OldCardChart
      v-if="view === 'chart'"
      :changeView="changeView"
      :view="view"
      :chartData="chartData"
      :componentName="componentName"
      class="stats-surveyed"
    >
      <template slot="label">{{ $t_locale('components/cockpit/automation/StatsAutomationSent')('title') }}</template>
   </OldCardChart>
    <OldKPI
      v-else
      class="stats-surveyed"
      :value="countSent"
      :loading="loading"
      dark-grey-only
      no-bottom
      no-info
      :changeView="changeView"
      :view="view"
      :componentName="componentName"
    >
      <template slot="label">{{ $t_locale('components/cockpit/automation/StatsAutomationSent')('title') }}</template>
    </OldKPI> 
  </div>

</template>

<script>

export default {
  name: "StatsAutomationSent",
  props: {
    loading: Boolean,
    automationCountSent: Number,
    changeView:  Function,
    view :  String,
    chartData :  Object
  },
  computed: {
    countSent() {
      return Math.max(0, this.automationCountSent);
    },
    componentName() {
      return this.$options.name || "StatsAutomationSent";
    },
  }
};
</script>

<style lang="scss" scoped>
.container {
  height: 100%;
}
.stats-surveyed {
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
