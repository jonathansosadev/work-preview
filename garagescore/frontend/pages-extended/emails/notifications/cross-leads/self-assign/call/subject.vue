<template>
  <span>{{ subject }}</span>
</template>

<script>
  export default {
    components: {},
    methods: {},
    computed: {
      payload() { return this.$store.getters.payload; },
      garage() { return this.payload.garage; },
      publicDisplayName() { return this.garage.publicDisplayName },
      data() { return this.payload.data; },
      sourceType() { return this.$t_locale('pages-extended/emails/notifications/cross-leads/self-assign/call/subject')(this.data.get('source.type')); },
      phone() { return this.data.get('customer.contact.mobilePhone.value') || this.$t_locale('pages-extended/emails/notifications/cross-leads/self-assign/call/subject')('anonymousCall'); },
      subject() {
        return this.$t_locale('pages-extended/emails/notifications/cross-leads/self-assign/call/subject')('subject', { publicDisplayName: this.publicDisplayName, sourceType: this.sourceType, phone: this.phone });
      }
    },
  }
</script>
