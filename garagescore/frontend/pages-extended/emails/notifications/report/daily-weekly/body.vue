<template>
  <table class="report-email" width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <BaseHeader :subTitle="(countGarages === 1) ? garageName : $t_locale('pages-extended/emails/notifications/report/daily-weekly/body')('group', { count: countGarages })" :title="$t_locale('pages-extended/emails/notifications/report/daily-weekly/body')('report') + ' ' + title" color="blue" logo-url="/images/www/report/report.png"></BaseHeader>
    </tr>
    <tr>
      <td colspan="2">
        {{ $t_locale('pages-extended/emails/notifications/report/daily-weekly/body')('greetings') }}
      </td>
    </tr>

    <tr>
      <td colspan="2">
        <template v-if="reportPeriodId === 'daily'">
          {{ $t_locale('pages-extended/emails/notifications/report/daily-weekly/body')('explanationDaily', { date: getDateFormat(report.period), type: countGarages > 1 ? $t_locale('pages-extended/emails/notifications/report/daily-weekly/body')('garages') : $t_locale('pages-extended/emails/notifications/report/daily-weekly/body')('garage') }) }}.
        </template>
        <template v-else-if="reportPeriodId === 'weekly'">
          {{ $t_locale('pages-extended/emails/notifications/report/daily-weekly/body')('explanationWeekly', { start: getDateFormat(report.minDate), end: getDateFormat(report.maxDate), type: countGarages > 1 ? $t_locale('pages-extended/emails/notifications/report/daily-weekly/body')('garages') : $t_locale('pages-extended/emails/notifications/report/daily-weekly/body')('garage') }) }}.
        </template>
        <template v-else-if="reportPeriodId === 'monthly'">
          {{ $t_locale('pages-extended/emails/notifications/report/daily-weekly/body')('explanationMonthly', { start: getDateFormat(report.minDate), end: getDateFormat(report.maxDate), type: countGarages > 1 ? $t_locale('pages-extended/emails/notifications/report/daily-weekly/body')('garages') : $t_locale('pages-extended/emails/notifications/report/daily-weekly/body')('garage') }) }}.
        </template>
      </td>
    </tr>

    <tr>
      <CentralButton :text="$t_locale('pages-extended/emails/notifications/report/daily-weekly/body')('cta')" :url="url"/>
    </tr>

    <tr>
      <td class="no-padding" colspan="2">
        <BaseFooter></BaseFooter>
      </td>
    </tr>
  </table>
</template>

<script>
  import BaseHeader from '../../../../../components/emails/notifications/BaseHeader';
  import BaseFooter from '../../../../../components/emails/notifications/BaseFooter';
  import CentralButton from '../../../../../components/emails/general/CentralButton';

  export default {
    layout: 'email',
    components: { BaseHeader, BaseFooter, CentralButton },
    methods: {
      getDateFormat(rawDate) {
        const date = new Date(rawDate);
        return this.$t_locale('pages-extended/emails/notifications/report/daily-weekly/body')('dateFormat', { day: date.getDate(), month: this.$t_locale('pages-extended/emails/notifications/report/daily-weekly/body')(`month[${date.getMonth()}]`), year: date.getFullYear() });
      }
    },
    computed: {
      payload() { return this.$store.getters.payload; },
      url() {
        return encodeURI(this.payload.baseUrl + /report/ + this.report.reportPublicToken);
      },
      gsClient() {
        return this.payload.gsClient;
      },
      config() {
        return this.payload.config;
      },
      reportPeriodId() {
        return this.payload.reportConfig.id;
      },
      report() {
        return this.payload.report;
      },
      title() {
        if (this.reportPeriodId === 'daily') {
          return this.$t_locale('pages-extended/emails/notifications/report/daily-weekly/body')('titleDaily', { date: this.getDateFormat(this.report.period) })
        }
        return this.$t_locale('pages-extended/emails/notifications/report/daily-weekly/body')('titleWeekly', { start: this.getDateFormat(this.report.minDate), end: this.getDateFormat(this.report.maxDate) });
      },
      countGarages() {
        return this.report.garageIds.length;
      },
      garageName() {
        return this.payload.firstGarageDisplayName;
      }
    },
  }
</script>


<style lang="scss" scoped>
.report-email {
  color: #757575;
  font-family: "Trebuchet MS";
  font-size: 14px;

  td {
    padding: 10px 20px;
  }

  .no-padding {
    padding: 0;
  }

  .logo {
    width: 65px;
  }

  .logo-wrapper {
    width: 65px;
  }

  .title {
    font-size: 20px;
    color: #219AB5;
    font-weight: bold;
    margin-bottom: 10px;
  }

  .subtitle {
    font-size: 20px;
    color: #000000;
    font-weight: bold;
  }

  .cta {
    text-decoration: underline;
  }
}
</style>
