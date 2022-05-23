<template>
  <div class="chart">
    <div class="chart__title">
      <div class="chart__title__label">
        <div class="clearfix">
          <ButtonGroup
            :activeSlotName="activeSlotName"
            @change="handleViewChange"
          >
            <template #kpi>
              <span
                v-tooltip="{ content: $t_locale('components/ui/OldCardChart')('stats') }"
                class="chart_title_help"
              >
                <i class="icon-gs-stats"></i>
              </span>
            </template>
            <template #chart>
              <span
                v-tooltip="{ content: $t_locale('components/ui/OldCardChart')('evol') }"
                class="chart_title_help"
              >
                <i class="icon-gs-evols"></i>
              </span>
            </template>
          </ButtonGroup>
        </div>
        <slot name="label"></slot>
        <div class="clearfix" />
      </div>
    </div>
    <div class="divider" />
    <div class="chart__main">
      <Chart
        v-if="!loading"
        :chartConfig="chartConfig"
        :global="global"
        :target="target"
        :top200="top200"
      />
      <ChartSkeleton v-else />
    </div>
  </div>
</template>

<script>
import Chart from '~/components/global/Chart';
import ChartSkeleton from '~/components/global/skeleton/ChartSkeleton';
import { ChartConfigFormats } from '~/utils/enumV2';

export default {
  name: 'CardChart',
  components: { Chart, ChartSkeleton },
  props: {
    changeView: { type: Function, required: true },
    view: { type: String, required: true },
    componentName: { type: String, required: true },
    chartData: Object,
  },
  methods: {
    handleViewChange(slotName) {
      this.$props.changeView(this.$props.componentName, slotName);
    },
  },
  computed: {
    chartComponentData() {
      const chartData = this.$props.chartData || {};
      return chartData.components[this.$route.name][this.$props.componentName] || {};
    },
    chartConfig() {
      const fallback = { labels: [...Array(12).keys()] };
      const config = this.$props.chartData.config || {};
      const componentConfig = this.chartComponentData;
      const res = ['min', 'max', 'suggestedMin', 'suggestedMax', 'stepSize', 'format'].reduce(
        (obj, key) => {
          if (componentConfig[key] !== undefined) {
            if (key === 'format') {
              /* suffix the value with "%" if it's a percent value */
              obj['suffix'] = ChartConfigFormats.getPropertyFromValue(componentConfig[key], 'suffix') || '';
            } else {
              obj[key] = componentConfig[key];
            }
          }
          return obj;
        },
        { ...config }
      );
      return res || fallback;
    },
    target() {
      const fallback = { label: '', dataSet: Array(12).fill(0) };
      return this.chartComponentData.target || fallback;
    },
    top200() {
      return this.chartComponentData.top200;
    },
    global() {
      return this.chartComponentData.global;
    },
    activeSlotName() {
      return this.$props.view;
    },
    loading() {
      return this.chartComponentData.loading;
    },
  },
};
</script>
<style lang="scss" scoped>
.divider {
  height: 1px;
  background-color: $light-grey;
  width: 100%;
  margin: 14px 0;
}
.clearfix {
  flex: 1;
}
.chart {
  display: flex;
  flex-flow: column;
  align-items: center;
  box-shadow: 0 0 3px 0 rgba($black, 0.16);
  background-color: $white;
  padding: 1rem 1.5rem;
  box-sizing: border-box;
  border-radius: 5px;

  &__main {
    width: 100%;
    height: 141px;
  }
  &__title {
    width: 100%;
    font-weight: bold;
    text-align: center;
    color: black;
    &__label {
      display: flex;
      align-items: center;
    }
  }
}
</style>



