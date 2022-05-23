<template>
  <span>{{ erratum ? $t_locale('pages-extended/emails/notifications/report/monthly/subject')('erratum') : '' }}{{ $t_locale('pages-extended/emails/notifications/report/monthly/subject')('title') }} - {{ $t_locale('pages-extended/emails/notifications/report/monthly/subject')(`month[${month}]`) }} {{ year }}</span>
</template>

<script>
  export default {
    layout () {
      return 'email';
    },
    computed: {
      payload() { return this.$store.getters.payload; },
      erratum() {
        return this.payload.erratum;
      },
      month() {
        return this.payload.month;
      },
      year() {
        return this.payload.year;
      },
    }
  }
</script>
