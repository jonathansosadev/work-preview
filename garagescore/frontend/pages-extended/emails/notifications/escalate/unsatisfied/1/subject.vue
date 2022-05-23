<template>
  <span>{{ $t_locale('pages-extended/emails/notifications/escalate/unsatisfied/1/subject')('title', {type: $t_locale('pages-extended/emails/notifications/escalate/unsatisfied/1/subject')(type), garageName, client }) }}</span>
</template>

<script>

  export default {
    computed: {
      payload() { return this.$store.getters.payload; },
      type() {
        if (this.payload.data.get('unsatisfiedTicket.type') && this.payload.data.get('unsatisfiedTicket.type') !== "Unknown") {
          return this.payload.data.get('unsatisfiedTicket.type') ;
        }
        return '';
      },
      garageName() {
        return this.payload && this.payload.garage && this.payload.garage.publicDisplayName || '?'
      },
      client() {
        return this.payload.data.get('unsatisfiedTicket.customer.fullName') || ''
      },
    },
  }
</script>

