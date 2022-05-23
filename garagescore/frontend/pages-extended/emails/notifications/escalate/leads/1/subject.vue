<template>
  <span>{{ title }}</span>
</template>

<script>

  export default {
    computed: {
      payload() { return this.$store.getters.payload; },
      data() { return this.payload.data; },
      saleType() { return this.data.get('leadTicket.saleType') || ''; },
      sourceTypeCategory() { return this.payload.sourceTypeCategory; },
      sourceType() { return this.payload.data.get('source.type'); },
      garagePublicDisplayName() { return (this.payload.garage && this.payload.garage.publicDisplayName) || '?'; },
      client() { return this.data.get('customer.fullName.value') || this.data.get('customer.lastName.value') || this.data.get('customer.contact.email.value') || this.data.get('customer.contact.mobilePhone.value'); },
      title() {
        return this.$t_locale('pages-extended/emails/notifications/escalate/leads/1/subject')('title', {
          lead: this.$t_locale('pages-extended/emails/notifications/escalate/leads/1/subject')(`lead_${this.sourceTypeCategory}`, { sourceType: this.sourceType }),
          saleType: this.$t_locale('pages-extended/emails/notifications/escalate/leads/1/subject')(this.saleType),
          client: this.client,
          garagePublicDisplayName: this.garagePublicDisplayName
        });
      },
    },
  }
</script>

