<template>
  <div class="report-base">
    <div class="report-base__graphs">
      <ReportHistogram :title="$t_locale(pathFile)('histogramTitle')" :data="histogramData" :type="histogramType"></ReportHistogram>
      <ReportBarChart :title="$t_locale(pathFile)('barChartTitle')" :lines="barChartData" :type="barChartType"></ReportBarChart>
    </div>
    <div class="report-base__recommandation">
      <ReportRecommandation v-bind="recommandationData"></ReportRecommandation>
    </div>
    <div class="report-base__rankings">
      <ReportRanking v-if="isMultiSites" :title="$t_locale(pathFile)('garagesRankingTitle', rankedGarages)" :ranking="garagesRankingData" :type="garagesRankingType">
        <span slot="detailsLink" class="report-leads__rankings__details">
          <!-- <a :href="detailsUrl"> {{ $t_locale('components/report/monthlySummary/ReportMonthlyBase')('moreDetails') }} &nbsp;<i class="icon-gs-link"></i></a> -->
        </span>
      </ReportRanking>
      <ReportRanking v-if="displayEmployeeRanking" :title="$t_locale(pathFile)('employeesRankingTitle', rankedEmployees)" :ranking="employeesRankingData" :type="employeesRankingType">
        <span slot="detailsLink" class="report-leads__rankings__details">
          <!-- <a :href="detailsUrl"> {{ $t_locale('components/report/monthlySummary/ReportMonthlyBase')('moreDetails') }} &nbsp;<i class="icon-gs-link"></i></a> -->
        </span>
      </ReportRanking>
    </div>
  </div>
</template>

<script>
import ReportHistogram from '~/components/report/common/ReportHistogram.vue';
import ReportBarChart from '~/components/report/common/ReportBarChart.vue';
import ReportRecommandation from '~/components/report/common/ReportRecommandation.vue';
import ReportRanking from '~/components/report/common/ReportRanking.vue';

export default {
  name: 'ReportMonthlyBase',
  components: { ReportHistogram, ReportBarChart, ReportRecommandation, ReportRanking },
  props: {
    isMultiSites: Boolean,
    month: Number,
    kpis: Array,
    employeesRanking: Array,
    averageAndBestPerfs: Object
  },

  computed: {
    detailsUrl() {
      return ''; // Replace by value taken from KPIs as soon as it's in the specs 
    },
    pathFile(){
      return `components/report/monthlySummary/${this.reportName}`;
    }
  },

  methods: {
    getMonthDisplayName(offset) {
      // We add 12 because we always want positive month number
      const monthToDisplay = (this.month + 12 + offset) % 12;
      return this.$t_locale(this.pathFile)(`shortMonth${monthToDisplay}`);
    }
  },
  filters: {
  }
}
</script>

<style lang="scss" scoped>
  .report-base {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    & > *:last-child > div:last-child {
      margin-bottom: 0;
    }
    &__recommandation {
      margin-bottom: 4rem;
    }
    &__graphs, &__rankings {
      display: flex;
      flex-direction: column;
      & > div {
        margin-bottom: 4rem;
        flex-basis: 0;
        flex-grow: 1;
      }
    }
  }

  @media (min-width: $breakpoint-min-sm) {

  }
  @media (min-width: $breakpoint-min-md) {
    .report-base {
      & > *:last-child > div {
        margin-bottom: 0;
      }
      &__recommandation {
        margin-bottom: 2rem;
      }
      &__graphs, &__rankings {
        flex-direction: row;
        & > div {
          margin-bottom: 2rem;
          &:first-child {
            margin-right: 2rem;
          }
        }
      }
    }
  }
  @media (min-width: $breakpoint-min-lg) {

  }
  @media (min-width: $breakpoint-min-xl) {

  }

  @media print {
    .report-base {
      &__graphs, &__rankings, &__recommandation {
        page-break-inside: avoid;
      }
      &__graphs {
        flex-direction: row;
      }
    }
  }
</style>
