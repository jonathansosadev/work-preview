<template>
  <span>{{ $t_locale('pages-extended/emails/notifications/lead-ticket/reminder-ticket/subject')('title') }} - {{ date }}</span>
</template>

<script>
export default {
  computed: {
    payload() { return this.$store.getters.payload; },
    date() {
      return this.$dd(new Date(), 'DD MMMM YYYY');
    }
  },
}
</script>
