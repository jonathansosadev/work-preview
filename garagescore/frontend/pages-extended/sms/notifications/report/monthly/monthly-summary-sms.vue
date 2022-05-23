<template>
  <div v-if="isMultiSites">{{ $t_locale('pages-extended/sms/notifications/report/monthly/monthly-summary-sms')('multisitesMessage', { firstName, period, url }) }}</div>
  <div v-else>{{ $t_locale('pages-extended/sms/notifications/report/monthly/monthly-summary-sms')('monositeMessage', { firstName, period, url }) }}</div>
</template>
<script>

export default {
  layout: 'email',
  computed: {
    payload() { return this.$store.getters.payload; },
    firstName() { return this.payload.firstName; },
    period() { return [this.$t_locale('pages-extended/sms/notifications/report/monthly/monthly-summary-sms')(`month${this.payload.month}`), this.payload.year].join(' '); },
    url() { return this.payload.shortUrl; },
    isMultiSites() { return this.payload.nGarages > 1; }
  }
};
</script>

