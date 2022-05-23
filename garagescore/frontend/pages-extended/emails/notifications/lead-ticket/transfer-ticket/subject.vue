<template>
  <span>{{ $t_locale('pages-extended/emails/notifications/lead-ticket/transfer-ticket/subject')('title', { type }) }} {{ customerName }}</span>
</template>

<script>
export default {
  computed: {
    payload() { return this.$store.getters.payload; },
    type() {
      if (this.payload.data.get('lead.saleType') && this.payload.data.get('lead.saleType') !== "Unknown") {
        return `${this.$t_locale('pages-extended/emails/notifications/lead-ticket/transfer-ticket/subject')(this.payload.data.get('lead.saleType'))} `;
      }
      return '';
    },
    customerName() {
      return `- ${this.payload.data.get('customer.fullName.value')}`;
    },
  },
}
</script>
