<template>
  <span>{{ title }}</span>
</template>

<script>
  export default {
  methods: {
    getDateFormat(rawDate) {
      const date = new Date(rawDate);
      return this.$t_locale('pages-extended/emails/notifications/report/daily-weekly/subject')('dateFormat', { day: date.getDate(), month: this.$t_locale('pages-extended/emails/notifications/report/daily-weekly/subject')(`month[${date.getMonth()}]`), year: date.getFullYear() });
    }
  },
  computed: {
    payload() { return this.$store.getters.payload; },
    reportPeriodId() {
      return this.payload.reportConfig.id;
    },
    report() {
      return this.payload.report;
    },
    title() {
      if (this.reportPeriodId === 'daily') {
        return this.$t_locale('pages-extended/emails/notifications/report/daily-weekly/subject')('titleDaily', { date: this.getDateFormat(this.report.period) });
      }
      if (this.reportPeriodId === 'monthly') {
        return this.$t_locale('pages-extended/emails/notifications/report/daily-weekly/subject')('titleMonthly', { start: this.getDateFormat(this.report.minDate), end: this.getDateFormat(this.report.maxDate) });
      }
      if (this.reportPeriodId === 'weekly') {
        return this.$t_locale('pages-extended/emails/notifications/report/daily-weekly/subject')('titleWeekly', { start: this.getDateFormat(this.report.minDate), end: this.getDateFormat(this.report.maxDate) });
      }
    }
  },
}
</script>
