<template>
  <div class="report-chart-line">

    <div class="report-chart-line__top">
      <div class="report-chart-line__top__label">
        <slot name="label"></slot>
      </div>
      <span class="report-chart-line__top__12M">{{ value12M | displayPerf(type) }}</span>
      <span class="report-chart-line__top__M1">{{ valueM1 | displayPerf(type) }}</span>
      <span class="report-chart-line__top__M">
        <span>{{ valueM | displayPerf(type) }}</span><i :class="arrowClasses"></i>
      </span>
    </div>

    <div class="report-chart-line__bottom" v-if="progressBar">
      <div class="report-chart-line__bottom__colored">
        <div :style="fillProgressBar"></div>
      </div>
      <div class="report-chart-line__bottom__empty"></div>
    </div>

  </div>
</template>

<script>
export default {
  name: 'ReportChartLine',
  props: {
    value12M: Number,
    valueM1: Number,
    valueM: Number,
    inverted: Boolean,
    progressBar: Object,
    type: { type: String, default: 'number' }
  },
  
  computed: {
    arrowClasses() {
      if (!Number.isFinite(this.valueM) || !Number.isFinite(this.valueM1)) return '';
      const valueM = parseFloat(this.valueM.toFixed(this.type === 'score' ? 1 : 0));
      const valueM1 = parseFloat(this.valueM1.toFixed(this.type === 'score' ? 1 : 0));
      return {
        'icon-gs-progress-up': valueM > valueM1,
        'icon-gs-progress-down': valueM < valueM1,
        'icon-gs-equal': valueM === valueM1,
        'better': this.inverted ? valueM < valueM1 : valueM > valueM1,
        'worse': this.inverted ? valueM > valueM1 : valueM < valueM1
      };
    },
    fillProgressBar() {
      return {
        'box-shadow': `inset 0 0 0 1000px ${this.progressBar.color}`,
        'height': '100%',
        'width': `${Math.round(this.progressBar.percentage)}%`
      }
    }
  },
  filters: {
    displayPerf(perf, type) {
      if (Number.isNaN(perf) || perf === null) return '-';
      switch (type) {
        case 'percentage': return `${Math.round(perf)} %`;
        case 'score': return perf.toFixed(1);
        case 'number': return Math.round(perf);
        default: return Math.round(perf);
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .report-chart-line {
    display: flex;
    flex-direction: column;

    &__top {
      display: flex;
      flex-direction: row;
      &__12M, &__M1, &__M {
        flex-basis: 0;
        flex-grow: 1;
        text-align: center;
        font-weight: 700;
      }
      &__label {
        flex-basis: 0;
        flex-grow: 5.6;
        .black {
          color: $black;
        }
      }
      &__12M {
        color: $black;
      }
      &__M1 {
        color: rgba($blue, 0.5)
      }
      &__M {
        color: $blue;
        & i {
          position: relative;
          margin-left: 0.5rem;
          font-size: 0.79rem;
          color: $grey;
          &.better { color: $bright-green; }
          &.worse { color: $red; }
        }
      }
    }

    &__bottom {
      display: flex;
      flex-direction: row;
      height: 0.43rem;
      padding-top: 0.07rem;
      margin-top: 0.5rem;
      &__colored {
        flex-grow: 6;
        box-shadow: inset 0 0 0 1000px $active-cell-color;
      }
      &__empty {
        flex-grow: 2;
      }
    }
  }
    
  // @media only screen and (min-width: 520px) { // It's ugly but it prevents percentages from being displayed on 2 lines 
  //   .report-chart-line {
  //     &__top {
  //       &__label {
  //         flex-grow: 6;
  //       }
  //     }
  //   }
  // }
  // @media only screen and (min-width: $breakpoint-min-md) { // 768px
  //   .report-chart-line {
  //     &__top {
  //       &__label {
  //         flex-grow: 5;
  //       }
  //     }
  //   }
  // }
  // @media only screen and (min-width: $breakpoint-min-lg) { // 960px
  //   .report-chart-line {
  //     &__top {
  //       &__label {
  //         flex-grow: 6;
  //       }
  //     }
  //   }
  // }
</style>
