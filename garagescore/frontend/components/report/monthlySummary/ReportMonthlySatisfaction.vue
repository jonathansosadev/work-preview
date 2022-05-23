<script>
import ReportMonthlyBase from './ReportMonthlyBase.vue';

export default {
  name: 'ReportMonthlySatisfaction',
  extends: ReportMonthlyBase,
  data() {
    return {
      histogramType: 'score',
      barChartType: 'percentage',
      garagesRankingType: 'score',
      employeesRankingType: 'score',
      reportName: 'ReportMonthlySatisfaction'
    }
  },

  computed: {
    displayEmployeeRanking() { return false; },
    histogramData() {
      return [{
        label: this.getMonthDisplayName(0),
        value: this.simpleSum(`ponderatedScoreM`) / this.simpleSum(`surveysRespondedM`),
        class: 'primary'
      }, {
        label: this.getMonthDisplayName(-1),
        value: this.simpleSum(`ponderatedScoreM1`) / this.simpleSum(`surveysRespondedM1`),
        class: 'secondary'
      }, {
        label: this.getMonthDisplayName(-2),
        value: this.simpleSum(`ponderatedScoreM2`) / this.simpleSum(`surveysRespondedM2`),
        class: 'other'
      }, {
        label: this.getMonthDisplayName(-3),
        value: this.simpleSum(`ponderatedScoreM3`) / this.simpleSum(`surveysRespondedM3`),
        class: 'other'
      }];
    },

    barChartData() {
      const sum12M = this.simpleSum('surveysResponded12M');
      return [{
        label: this.$t_locale('components/report/monthlySummary/ReportMonthlySatisfaction')('promotors'),
        total: this.subKeySum('satisfaction12M', 'promotors'),
        value12M: 100 * this.subKeySum('satisfaction12M', 'promotors') / this.simpleSum('surveysResponded12M'),
        valueM: 100 * this.subKeySum('satisfactionM', 'promotors') / this.simpleSum('surveysRespondedM'),
        valueM1: 100 * this.subKeySum('satisfactionM1', 'promotors') / this.simpleSum('surveysRespondedM1'),
        thresholds: {
          inverted: false,
          good: 85,
          bad: 75
        }
      }, {
        label: this.$t_locale('components/report/monthlySummary/ReportMonthlySatisfaction')('passives'),
        total: this.subKeySum('satisfaction12M', 'passives'),
        value12M: 100 * this.subKeySum('satisfaction12M', 'passives') / this.simpleSum('surveysResponded12M'),
        valueM: 100 * this.subKeySum('satisfactionM', 'passives') / this.simpleSum('surveysRespondedM'),
        valueM1: 100 * this.subKeySum('satisfactionM1', 'passives') / this.simpleSum('surveysRespondedM1'),
        thresholds: {
          inverted: true,
          good: 10,
          bad: 15
        }
      }, {
        label: this.$t_locale('components/report/monthlySummary/ReportMonthlySatisfaction')('detractors'),
        total: this.subKeySum('satisfaction12M', 'detractors'),
        value12M: 100 * this.subKeySum('satisfaction12M', 'detractors') / this.simpleSum('surveysResponded12M'),
        valueM: 100 * this.subKeySum('satisfactionM', 'detractors') / this.simpleSum('surveysRespondedM'),
        valueM1: 100 * this.subKeySum('satisfactionM1', 'detractors') / this.simpleSum('surveysRespondedM1'),
        thresholds: {
          inverted: true,
          good: 5,
          bad: 10
        }
      }];
    },

    recommandationData() {
      let basePath = 'recommandations.neutral';
      const scoreM = this.simpleSum(`ponderatedScoreM`) / this.simpleSum(`surveysRespondedM`);
      if (scoreM < 7) basePath = 'recommandations.bad';
      if (scoreM >= 9) basePath = 'recommandations.good';

      return {
        mainText: this.$t_locale('components/report/monthlySummary/ReportMonthlySatisfaction')(`${basePath}.main`),
        opener: this.$t_locale('components/report/monthlySummary/ReportMonthlySatisfaction')(`${basePath}.opener`, this.averageAndBestPerfs),
        actionPlan: this.$t_locale('components/report/monthlySummary/ReportMonthlySatisfaction')(`${basePath}.actionPlan`),
        actionList: Array.from(Array(3).keys()).map((e, i) => this.$t_locale('components/report/monthlySummary/ReportMonthlySatisfaction')(`${basePath}.actionList${i}`)),
        evaluation: basePath.split('.').pop(),
        welcomeLink: "/cockpit/welcome",
        satisfactionTeamLink: "/cockpit/satisfaction/team"
      };
    },

    garagesRankingData() {
      return this.kpis.slice(0, 5).map(g => {
        return {
          label: g.garageName,
          value12M: g.ponderatedScore12M / g.surveysResponded12M,
          valueM1: g.ponderatedScoreM1 / g.surveysRespondedM1,
          valueM: g.ponderatedScoreM / g.surveysRespondedM,
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
          sublabel: e.garageName,
          value12M: e.rating12M,
          valueM1: e.ratingM1,
          valueM: e.ratingM
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
      return obj.promotors + obj.passives + obj.detractors;
    }
  }
  
}
</script>
