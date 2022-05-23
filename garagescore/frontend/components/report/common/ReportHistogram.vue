<template>
  <div class="report-histogram">
    <ReportChartHeader :title="title"></ReportChartHeader>
    <div class="report-histogram__graph">
      <div v-for="col in data" :key="col.label" class="report-histogram__graph__data">
        <div class="report-histogram__graph__data__value" :class="col.class">
          {{ col.value | displayPerf(type) }}
        </div>
        <div class="report-histogram__graph__data__rect" :class="col.class" :style="{height: rectHeight(col.value)}"></div>
        <div class="report-histogram__graph__data__label" :class="col.class">
          {{ col.label }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ReportChartHeader from './ReportChartHeader.vue';
export default {
  name: 'ReportHistogram',
  components: { ReportChartHeader },
  data() {
    return {
    }
  },
  props: {
    title: String,
    data: Array,
    type: { type: String, default: 'number' }
  },

  computed: {
    maxValue() {
      switch (this.type) {
        case 'percentage': return 100;
        case 'score': return 10;
        case 'number': return this.data.reduce((r,d) => d.value > r ? d.value : r, 0) / 0.8;
      }
    }
  },

  methods: {
    rectHeight (value) {
      return value ? `${Math.round(100 * value / this.maxValue)}px` : 0;
    }
  },

  filters: {
    displayPerf(perf, type) {
      if (Number.isNaN(perf)) return '-';
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

<style lang="scss">
  .report-histogram {
    &__graph {
      height: 150px;
      display: flex;
      flex-direction: row-reverse;
      justify-content: space-around;
      align-items: flex-end;
      &__data {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        color: $dark-grey;
        
        &__value {
          margin-bottom: 0.5rem;
          &.primary {
            font-weight: 700;
          }
        }
        &__rect {
          width: 60px;
          box-shadow: inset 0 0 0 1000px $grey;
          &.primary {
            box-shadow: inset 0 0 0 1000px $blue;
          }
          &.secondary {
            box-shadow: inset 0 0 0 1000px rgba($blue, 0.5)
          }
        }
        &__label {
          margin-top: 0.25rem;
          &.primary {
            color: $blue;
            font-weight: 700;
          }
          &.secondary {
            color: rgba($blue, 0.5)
          }
        }
      }
    }
  }
</style>
