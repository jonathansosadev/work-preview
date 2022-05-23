<template>
  <span>👍 {{ $t_locale('pages-extended/emails/notifications/success/leads/subject')('title', {saleType, publicDisplayName}) }}</span>
</template>

<script>
  export default {
    computed: {
      payload() { return this.$store.getters.payload; },
      saleType() {
        if (this.payload.data.get('leadTicket.saleType') && this.payload.data.get('leadTicket.saleType') !== "Unknown") {
          return `${this.$t_locale('pages-extended/emails/notifications/success/leads/subject')(this.payload.data.get('leadTicket.saleType'))} `;
        }
        return '';
      },
      publicDisplayName() {
        return this.payload && this.payload.garage && this.payload.garage.publicDisplayName || '?'
      },
    },
  }
</script>

