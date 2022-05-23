<script>
import ReportMonthlyBase from './ReportMonthlyBase.vue';

export default {
  name: 'ReportMonthlyValidEmails',
  extends: ReportMonthlyBase,
  data() {
    return {
      histogramType: 'percentage',
      barChartType: 'percentage',
      garagesRankingType: 'percentage',
      employeesRankingType: 'percentage',
      reportName: 'ReportMonthlyValidEmails'
    }
  },

  computed: {
    displayEmployeeRanking() { return false; },
    histogramData() {
      return [{
        label: this.getMonthDisplayName(0),
        value: 100 * this.simpleSum('validEmailsM') / this.simpleSum('totalForEmailsM'),
        class: 'primary'
      }, {
        label: this.getMonthDisplayName(-1),
        value: 100 * this.simpleSum('validEmailsM1') / this.simpleSum('totalForEmailsM1'),
        class: 'secondary'
      }, {
        label: this.getMonthDisplayName(-2),
        value: 100 * this.simpleSum('validEmailsM2') / this.simpleSum('totalForEmailsM2'),
        class: 'other'
      }, {
        label: this.getMonthDisplayName(-3),
        value: 100 * this.simpleSum('validEmailsM3') / this.simpleSum('totalForEmailsM3'),
        class: 'other'
      }];
    },

    barChartData() {
      return [{
        label: this.$t_locale('components/report/monthlySummary/ReportMonthlyValidEmails')('validEmails'),
        total: this.subKeySum('emailQuality12M', 'validEmails'),
        value12M: 100 * this.subKeySum('emailQuality12M', 'validEmails') / this.simpleSum('totalForEmails12M'),
        valueM: 100 * this.subKeySum('emailQualityM', 'validEmails') / this.simpleSum('totalForEmailsM'),
        valueM1: 100 * this.subKeySum('emailQualityM1', 'validEmails') / this.simpleSum('totalForEmailsM1'),
        thresholds: {
          inverted: false,
          good: 75,
          bad: 65
        }
      }, {
        label: this.$t_locale('components/report/monthlySummary/ReportMonthlyValidEmails')('wrongEmails'),
        total: this.subKeySum('emailQuality12M','wrongEmails'),
        value12M: 100 * this.subKeySum('emailQuality12M', 'wrongEmails') / this.simpleSum('totalForEmails12M'),
        valueM: 100 * this.subKeySum('emailQualityM', 'wrongEmails') / this.simpleSum('totalForEmailsM'),
        valueM1: 100 * this.subKeySum('emailQualityM1', 'wrongEmails') / this.simpleSum('totalForEmailsM1'),
        thresholds: {
          inverted: true,
          good: 25,
          bad: 35
        }
      }, {
        label: this.$t_locale('components/report/monthlySummary/ReportMonthlyValidEmails')('missingEmails'),
        total: this.subKeySum('emailQuality12M','missingEmails'),
        value12M: 100 * this.subKeySum('emailQuality12M', 'missingEmails') / this.simpleSum('totalForEmails12M'),
        valueM: 100 * this.subKeySum('emailQualityM', 'missingEmails') / this.simpleSum('totalForEmailsM'),
        valueM1: 100 * this.subKeySum('emailQualityM1', 'missingEmails') / this.simpleSum('totalForEmailsM1'),
        thresholds: {
          inverted: true,
          good: 25,
          bad: 35
        }
      }];
    },

    recommandationData() {
      let basePath = 'recommandations.neutral';
      const validEmails = 100 * this.simpleSum('validEmailsM') / this.simpleSum('totalForEmailsM');
      if (validEmails < 70) basePath = 'recommandations.bad';
      if (validEmails > 80) basePath = 'recommandations.good';

      return {
        mainText: this.$t_locale('components/report/monthlySummary/ReportMonthlyValidEmails')(`${basePath}.main`),
        opener: this.$t_locale('components/report/monthlySummary/ReportMonthlyValidEmails')(`${basePath}.opener`, this.averageAndBestPerfs),
        actionPlan: this.$t_locale('components/report/monthlySummary/ReportMonthlyValidEmails')(`${basePath}.actionPlan`),
        actionList: Array.from(Array(3).keys()).map((e, i) => this.$t_locale('components/report/monthlySummary/ReportMonthlyValidEmails')(`${basePath}.actionList${i}`)),
        conclusion: this.$t_locale('components/report/monthlySummary/ReportMonthlyValidEmails')(`${basePath}.conclusion`),
        evaluation: basePath.split('.').pop(),
        contactTeamLink: "/cockpit/contacts/team"
      };
    },

    garagesRankingData() {
      return this.kpis.slice(0, 5).map(g => {
        return {
          label: g.garageName,
          value12M: 100 * g.validEmails12M / g.totalForEmails12M,
          valueM1: 100 * g.validEmailsM1 / g.totalForEmailsM1,
          valueM: 100 *  g.validEmailsM / g.totalForEmailsM
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
          value12M: e.emailsRate12M,
          valueM1: e.emailsRateM1,
          valueM: e.emailsRateM
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
      return obj.validEmails + obj.wrongEmails + obj.missingEmails;
    }
  }

}
</script>
