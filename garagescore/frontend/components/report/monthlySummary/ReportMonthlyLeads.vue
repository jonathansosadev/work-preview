<script>
import ReportMonthlyBase from './ReportMonthlyBase.vue';

export default {
  name: 'ReportMonthlyLeads',
  extends: ReportMonthlyBase,
  data() {
    return {
      histogramType: 'number',
      barChartType: 'number',
      garagesRankingType: 'number',
      employeesRankingType: 'number',
      reportName: 'ReportMonthlyLeads'
    }
  },

  computed: {
    displayEmployeeRanking() { return this.rankedEmployees.n > 0; },
    histogramData() {
      return [{
        label: this.getMonthDisplayName(0),
        value: this.objectSum('convertedLeadsM'),
        class: 'primary'
      }, {
        label: this.getMonthDisplayName(-1),
        value: this.objectSum('convertedLeadsM1'),
        class: 'secondary'
      }, {
        label: this.getMonthDisplayName(-2),
        value: this.simpleSum('convertedLeadsM2'),
        class: 'other'
      }, {
        label: this.getMonthDisplayName(-3),
        value: this.simpleSum('convertedLeadsM3'),
        class: 'other'
      }];
    },

    barChartData() {
      return [{
        label: this.$t_locale('components/report/monthlySummary/ReportMonthlyLeads')('newProjects'),
        total: this.objectSum('convertedLeads12M'),
        value12M: this.subKeySum('convertedLeads12M', 'newProjects'),
        valueM: this.subKeySum('convertedLeadsM', 'newProjects'),
        valueM1: this.subKeySum('convertedLeadsM1', 'newProjects'),
        thresholds: {
          inverted: false,
          good: null,
          bad: null
        }
      }, {
        label: this.$t_locale('components/report/monthlySummary/ReportMonthlyLeads')('knownProjects'),
        total: this.objectSum('convertedLeads12M'),
        value12M: this.subKeySum('convertedLeads12M', 'knownProjects'),
        valueM: this.subKeySum('convertedLeadsM', 'knownProjects'),
        valueM1: this.subKeySum('convertedLeadsM1', 'knownProjects'),
        thresholds: {
          inverted: false,
          good: null,
          bad: null
        }
      }, {
        label: this.$t_locale('components/report/monthlySummary/ReportMonthlyLeads')('wonFromCompetition'),
        total: this.objectSum('convertedLeads12M'),
        value12M: this.subKeySum('convertedLeads12M', 'wonFromCompetition'),
        valueM: this.subKeySum('convertedLeadsM', 'wonFromCompetition'),
        valueM1: this.subKeySum('convertedLeadsM1', 'wonFromCompetition'),
        thresholds: {
          inverted: false,
          good: null,
          bad: null
        }
      }];
    },

    recommandationData() {
      let basePath = 'recommandations.bad';
      const conversionsAvg = this.objectSum('convertedLeads12M') / 12;
      if (this.objectSum('convertedLeadsM') && this.objectSum('convertedLeadsM') < conversionsAvg ) {
        basePath = 'recommandations.neutral';
      }
      if (this.objectSum('convertedLeadsM') && this.objectSum('convertedLeadsM') > conversionsAvg) {
        basePath = 'recommandations.good';
      }
      return {
        mainText: this.$t_locale('components/report/monthlySummary/ReportMonthlyLeads')(`${basePath}.main`, { nNewSales: this.$tc_locale('components/report/monthlySummary/ReportMonthlyLeads')('nNewSales', this.objectSum('convertedLeadsM')) }),
        opener: '', //basePath.includes('bad') ? null : this.$t_locale('components/report/monthlySummary/ReportMonthlyLeads')(`${basePath}.opener`, this.averageAndBestPerfs),
        actionPlan: this.$t_locale('components/report/monthlySummary/ReportMonthlyLeads')(`${basePath}.actionPlan`),
        actionList: Array.from(Array(3).keys()).map((e, i) => this.$t_locale('components/report/monthlySummary/ReportMonthlyLeads')(`${basePath}.actionList${i}`)),
        conclusion: this.$t_locale('components/report/monthlySummary/ReportMonthlyLeads')(`${basePath}.conclusion`),
        evaluation: basePath.split('.').pop()
      };
    },

    garagesRankingData() {
      return this.kpis.slice(0,5).map(g => {
        return {
          label: g.garageName,
          value12M: this.sumKeys(g.convertedLeads12M),
          valueM1: this.sumKeys(g.convertedLeadsM1),
          valueM: this.sumKeys(g.convertedLeadsM)
        };
      });
    },
    rankedGarages() {
      return { n : this.kpis.slice(0,5).length };
    },

    employeesRankingData() {
      return this.employeesRanking.map(e => {
        return {
          label: e.employeeName,
          // sublabel: e.garageName,
          value12M: e.convertedLeads12M,
          valueM1: e.convertedLeadsM1,
          valueM: e.convertedLeadsM
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
      return obj.newProjects + obj.knownProjects + obj.wonFromCompetition;
    }
  }
  
}
</script>