<template>
  <span>{{ $t_locale('pages-extended/emails/notifications/auto-allow-crawlers/subject')('subject', { garageName: payload.garage.publicDisplayName }) }}</span>
</template>

<script>
export default {
  computed: {
    payload() { return this.$store.getters.payload; }
  },
}
</script>
