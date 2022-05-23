<template>
  <div class="report-ranking">
    <ReportChartHeader :title="title" :months="true"></ReportChartHeader>

    <div class="report-ranking__standings">
      <div class="report-ranking__standings__line" v-for="(line, index) in sortedRanking" :key="index">
        <ReportChartLine v-bind="line" :type="type">
          <span slot="label">
            <span class="black">{{ index + 1 }}. {{ line.label }}</span>
            <span class="black" v-if="line.sublabel"> - </span>
            <span v-if="line.sublabel"> {{ line.sublabel }} </span>
          </span>
        </ReportChartLine>
      </div>
    </div>
    <!-- <div class="report-ranking__details">
      <slot name="detailsLink"></slot>
    </div> -->
  </div>
</template>

<script>
import ReportChartHeader from './ReportChartHeader.vue';
import ReportChartLine from './ReportChartLine.vue';


export default {
  name: 'ReportRanking',
  components: { ReportChartHeader, ReportChartLine },
  data() {
    return {
    }
  },
  props: {
    title: String,
    ranking: Array,
    inverted: { type: Boolean, default: false },
    type: { type: String, default: 'number' }
  },
  
  computed: {
    sortedRanking() {
      return this.ranking.slice(0).sort((line1, line2) => {
        return this.inverted ? (line1.valueM - line2.valueM) : (line2.valueM - line1.valueM);
      });
    }
  },
  methods: {
  }
}
</script>

<style lang="scss">
  .report-ranking {
    &__standings {
      padding: 1.5rem 0 1.5rem 1rem;
      &__line {
        margin-bottom: 1rem;
        &:last-child {
          margin-bottom: 0;
        } 
      }
    }
    &__details a {
      padding-left: 1rem;
      color: $link-blue;
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
    }
  }
</style>
