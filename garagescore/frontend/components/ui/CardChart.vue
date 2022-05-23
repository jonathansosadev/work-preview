<template>
  <div class="chart">
    <div class="chart__title">
      <div class="chart__title__label">
        <div class="clearfix">
          <ButtonGroup
            :activeSlotName="viewType"
            @change="handleViewChange"
          >
            <template #kpi>
              <span
                v-tooltip="{ content: $t_locale('components/ui/CardChart')('stats') }"
                class="chart__title__help"
              >
                <i class="icon-gs-stats"></i>
              </span>
            </template>
            <template #chart>
              <span
                v-tooltip="{ content: $t_locale('components/ui/CardChart')('evol') }"
                class="chart__title__help"
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
        v-if="!chartDataAndConfig.isLoading"
        :chartConfig="chartDataAndConfig.componentChartConfig"
        :global="chartDataAndConfig.global"
        :target="chartDataAndConfig.target"
        :top200="chartDataAndConfig.top200"
      />
      <ChartSkeleton v-else />
    </div>
  </div>
</template>

<script>
import Chart from '~/components/global/Chart';
import ChartSkeleton from '~/components/global/skeleton/ChartSkeleton';

export default {
  name: 'ChartCard',
  components: {
    Chart,
    ChartSkeleton,
  },
  props: {
    chartDataAndConfig: {
      type: Object,
      require: true,
    },
    viewType: {
      type: String,
      require: true,
    },
    onChangeViewType: {
      type: Function,
      required: true,
    },
  },
  methods: {
    handleViewChange(viewType) {
      this.onChangeViewType(viewType);
    },
  },
};
</script>

<style lang="scss" scoped>
.divider {
  height: 1px;
  background-color: $light-grey;
  width: 100%;
  margin: 1rem 0;
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
    color: $black;
    
    &__label {
      display: flex;
      align-items: center;
    }
  }
}
#chartCanvas {
  width: 100%!important;
}
</style>
