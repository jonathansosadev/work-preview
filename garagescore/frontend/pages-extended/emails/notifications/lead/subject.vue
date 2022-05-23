<template>
  <span>{{ subject }}</span>
</template>

<script>
  export default {
    components: {},
    methods: {},
    computed: {
      payload() { return this.$store.getters.payload; },
      garageName() {
        return this.payload.garage.publicDisplayName;
      },
      customerFullName() {
        return this.payload.data.customer.fullName.value;
      },
      leadSaleType() {
        const isempty = this.payload.data.get('lead.saleType') === 'Unknown' || !this.payload.data.get('lead.saleType')  
        return isempty ? '' : this.$t_locale('pages-extended/emails/notifications/lead/subject')(this.payload.data.get('lead.saleType'), {}, this.payload.data.get('lead.saleType'));
      },
      subject(){
        return this.garageName &&
        this.customerFullName &&
        this.leadSaleType &&
        this.$t_locale('pages-extended/emails/notifications/lead/subject')('subject', {
          garageName: this.garageName,
          client: this.customerFullName,
          type: this.leadSaleType,
        })
      }
    },
  }
</script>
