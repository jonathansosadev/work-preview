<template>
  <span>{{ $t_locale('pages-extended/emails/notifications/success/unsatisfied/subject')('title', {type, garageName}) }}</span>
</template>

<script>
  export default {
    computed: {
      payload() { return this.$store.getters.payload; },
      type() {
        return this.$t_locale('pages-extended/emails/notifications/success/unsatisfied/subject')(this.payload.data.get('unsatisfiedTicket.type')) || ''
      },
      garageName() {
        return this.payload && this.payload.garage && this.payload.garage.publicDisplayName || '?'
      },
    },
  }
</script>

