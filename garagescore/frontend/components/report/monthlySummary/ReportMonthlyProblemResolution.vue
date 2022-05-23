<script>
import ReportMonthlyBase from './ReportMonthlyBase.vue';

export default {
  name: 'ReportMonthlyProblemResolution',
  extends: ReportMonthlyBase,
  data() {
    return {
      histogramType: 'percentage',
      barChartType: 'percentage',
      garagesRankingType: 'percentage',
      employeesRankingType: 'percentage',
      reportName: 'ReportMonthlyProblemResolution'
    }
  },

  computed: {
    displayEmployeeRanking() { return this.rankedEmployees.n > 0; },
    histogramData() {
      return [{
        label: this.getMonthDisplayName(0),
        value: 100 * this.simpleSum('unsatisfiedSolvedM') / this.simpleSum('countUnsatisfiedM'),
        class: 'primary'
      }, {
        label: this.getMonthDisplayName(-1),
        value: 100 * this.simpleSum('unsatisfiedSolvedM1') / this.simpleSum('countUnsatisfiedM1'),
        class: 'secondary'
      }, {
        label: this.getMonthDisplayName(-2),
        value: 100 * this.simpleSum('unsatisfiedSolvedM2') / this.simpleSum('countUnsatisfiedM2'),
        class: 'other'
      }, {
        label: this.getMonthDisplayName(-3),
        value: 100 * this.simpleSum('unsatisfiedSolvedM3') / this.simpleSum('countUnsatisfiedM3'),
        class: 'other'
      }];
    },

    barChartData() {
      return [{
        label: this.$t_locale('components/report/monthlySummary/ReportMonthlyProblemResolution')('noAction'),
        total: this.subKeySum('problemProcessing12M','noAction'),
        value12M: 100 * this.subKeySum('problemProcessing12M','noAction') / this.objectSum('problemProcessing12M'),
        valueM: 100 * this.subKeySum('problemProcessingM','noAction') / this.objectSum('problemProcessingM'),
        valueM1: 100 * this.subKeySum('problemProcessingM1','noAction') / this.objectSum('problemProcessingM1'),
        thresholds: {
          inverted: true,
          good: 5,
          bad: 10
        }
      }, {
        label: this.$t_locale('components/report/monthlySummary/ReportMonthlyProblemResolution')('contacted'),
        total: this.subKeySum('problemProcessing12M','contacted'),
        value12M: 100 * this.subKeySum('problemProcessing12M','contacted') / this.objectSum('problemProcessing12M'),
        valueM: 100 * this.subKeySum('problemProcessingM','contacted') / this.objectSum('problemProcessingM'),
        valueM1: 100 * this.subKeySum('problemProcessingM1','contacted') / this.objectSum('problemProcessingM1'),
        thresholds: {
          inverted: false,
          good: 95,
          bad: 90
        }
      }, {
        label: this.$t_locale('components/report/monthlySummary/ReportMonthlyProblemResolution')('closedWithResolution'),
        total: this.subKeySum('problemProcessing12M','closedWithResolution'),
        value12M: 100 * this.subKeySum('problemProcessing12M','closedWithResolution') / this.objectSum('problemProcessing12M'),
        valueM: 100 * this.subKeySum('problemProcessingM','closedWithResolution') / this.objectSum('problemProcessingM'),
        valueM1: 100 * this.subKeySum('problemProcessingM1','closedWithResolution') / this.objectSum('problemProcessingM1'),
        thresholds: {
          inverted: false,
          good: 95,
          bad: 90
        }
      }];
    },

    recommandationData() {
      let basePath = 'recommandations.neutral';
      const unsatisfiedSolved = 100 * this.simpleSum('unsatisfiedSolvedM') / this.simpleSum('countUnsatisfiedM');
      if (unsatisfiedSolved < 20) basePath = 'recommandations.bad';
      if (unsatisfiedSolved > 30) basePath = 'recommandations.good';

      return {
        mainText: this.$t_locale('components/report/monthlySummary/ReportMonthlyProblemResolution')(`${basePath}.main`),
        opener: this.$t_locale('components/report/monthlySummary/ReportMonthlyProblemResolution')(`${basePath}.opener`, this.averageAndBestPerfs),
        actionPlan: this.$t_locale('components/report/monthlySummary/ReportMonthlyProblemResolution')(`${basePath}.actionPlan`),
        actionList: Array.from(Array(3).keys()).map((e, i) => this.$t_locale('components/report/monthlySummary/ReportMonthlyProblemResolution')(`${basePath}.actionList${i}`)),
        conclusion: this.$t_locale('components/report/monthlySummary/ReportMonthlyProblemResolution')(`${basePath}.conclusion`),
        evaluation: basePath.split('.').pop()
      };
    },

    garagesRankingData() {
      return this.kpis.slice(0, 5).map(g => {
        return {
          label: g.garageName,
          value12M: 100 * g.unsatisfiedSolved12M / g.countUnsatisfied12M,
          valueM1: 100 * g.unsatisfiedSolvedM1 / g.countUnsatisfiedM1,
          valueM: 100 * g.unsatisfiedSolvedM / g.countUnsatisfiedM
        };
      });
    },
    rankedGarages() {
      return { n : this.kpis.slice(0, 5).length };
    },

    employeesRankingData() {
      return this.employeesRanking.map(e => {
        return {
          label: e.employeeName,
          // sublabel: e.garageName,
          value12M: e.solvingRate12M,
          valueM1: e.solvingRateM1,
          valueM: e.solvingRateM
        };
      });
    },
    rankedEmployees() {
      return { n: this.employeesRanking.length };
    }
  },

  methods: {
    simpleSum(key) {
      return this.kpis.reduce((res, kpi) => res += kpi[key], 0);
    },
    objectSum(key) {
      return this.kpis.reduce((res, kpi) => res += this.sumKeys(kpi[key]), 0);
    },
    subKeySum(key, subKey) {
      return this.kpis.reduce((res, kpi) => res += kpi[key][subKey], 0);
    },
    sumKeys(obj) {
      return obj.closedWithResolution + obj.noAction + obj.contacted;
    }
  }

}
</script>
