<template>
  <span>{{ $t_locale('pages-extended/emails/notifications/unsatisfied-ticket/transfer-ticket/subject')('title') }} {{ type }} {{ customerName }}</span>
</template>

<script>
export default {
  computed: {
    payload() { return this.$store.getters.payload; },
    type() {
      const dataType = this.payload.data.type;
      if (dataType) {
        return `${this.$t_locale('pages-extended/emails/notifications/unsatisfied-ticket/transfer-ticket/subject')(dataType)} `;
      }
      return '';
    },
    customerName() {
      return `- ${this.payload.data.customer_getCustomerPublicDisplayName()}`;
    }
  },
}
</script>
