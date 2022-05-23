<template>
  <div class="report-bar-chart">
    <ReportChartHeader :title="title" :months="true"></ReportChartHeader>
    <div class="report-bar-chart__graph">
      <div v-for="line in lines" :key="line.key" class="report-bar-chart__graph__line">

        <ReportChartLine v-bind="lineProperties(line)">
          <span slot="label">{{ line.label }}
            <span class="black" v-if="displayTotal(line)">({{ line.total }})</span>
          </span>
        </ReportChartLine>

      </div>
    </div>
  </div>
</template>

<script>
import ReportChartHeader from './ReportChartHeader.vue';
import ReportChartLine from './ReportChartLine.vue';

const Colors = {
  RED: '#D04331',
  ORANGE: '#E9B32F',
  GREEN: '#00B050',
  BLUE: '#219AB5'
};

export default {
  name: 'ReportBarChart',
  components: { ReportChartHeader, ReportChartLine },
  data() {
    return {
    }
  },
  props: {
    title: String,
    lines: Array,
    type: { type: String, default: 'number' }
  },
  computed: {
  },
  methods: {
    fillBar(value, total, thresholds) {
      if (!value) {
        return { color: Colors.RED, percentage: 0 };
      }
      const percentage = this.type !== 'percentage' ? (100 * value / total) : value;
      let color = Colors.ORANGE;
      if (!Number.isFinite(thresholds.good) || !Number.isFinite(thresholds.bad)) {
        color = Colors.BLUE;
      } else if (thresholds.inverted) {
        if (percentage < thresholds.good) color = Colors.GREEN;
        if (percentage > thresholds.bad) color = Colors.RED;
      } else {
        if (percentage > thresholds.good) color = Colors.GREEN;
        if (percentage < thresholds.bad) color = Colors.RED;
      }
      return { color, percentage };
    },
    lineProperties({ total, value12M, valueM1, valueM, thresholds }) {
      return {
        value12M, valueM1, valueM, 
        type: this.type,
        inverted: thresholds.inverted,
        progressBar: this.fillBar(value12M, total, thresholds)
      }
    },
    displayTotal({ thresholds }) {
      return Number.isFinite(thresholds.good) && Number.isFinite(thresholds.bad);
    }
  }
}
</script>

<style lang="scss">
  .report-bar-chart {
    &__graph {
      display: flex;
      flex-direction: column;
      padding-top: 1.5rem;
      padding-left: 1rem;

      &__line {
        margin-bottom: 1rem;
        &:last-child {
          margin-bottom: 0;
        } 
      }
    }
  }
</style>
