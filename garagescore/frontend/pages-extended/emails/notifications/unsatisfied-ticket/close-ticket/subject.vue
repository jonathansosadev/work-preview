<template>
  <span>{{ $t_locale('pages-extended/emails/notifications/unsatisfied-ticket/close-ticket/subject')('title') }} {{ type }}{{ customerName }}</span>
</template>

<script>
export default {
  computed: {
    payload() { return this.$store.getters.payload; },
    type() {
      if (this.payload.data.get('lead.saleType')) {
        return `${this.$t_locale('pages-extended/emails/notifications/unsatisfied-ticket/close-ticket/subject')(this.payload.data.get('lead.saleType'))} `;
      }
      return '';
    },
    customerName() {
      return `- ${this.payload.data.customer_getCustomerPublicDisplayName()}`;
    }
  },
}
</script>
