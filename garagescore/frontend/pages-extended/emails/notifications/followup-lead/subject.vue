<template>
  <span>{{ subject }}</span>
</template>

<script>
  import LeadSaleTypes from '../../../../utils/models/data/type/lead-sale-types';
  export default {
    computed: {
      payload() { return this.$store.getters.payload; },
      data() { return this.payload.data; },
      client() { return this.data.get('customer.fullName.value') || this.data.get('customer.lastName.value') || this.data.get('customer.contact.email.value') || this.data.get('customer.contact.mobilePhone.value'); },
      saleType() {
      const saleType = this.data.get('leadTicket.saleType') || null;
      switch(saleType) {
        case LeadSaleTypes.NEW_VEHICLE_SALE:
          return this.$t_locale('pages-extended/emails/notifications/followup-lead/subject')(`saleType_${LeadSaleTypes.NEW_VEHICLE_SALE}`);
        case LeadSaleTypes.USED_VEHICLE_SALE:
          return this.$t_locale('pages-extended/emails/notifications/followup-lead/subject')(`saleType_${LeadSaleTypes.USED_VEHICLE_SALE}`);
        case LeadSaleTypes.UNKNOWN:
          return this.$t_locale('pages-extended/emails/notifications/followup-lead/subject')(`saleType_${LeadSaleTypes.NEW_VEHICLE_SALE}`);
        default:
          return '';
      }
    },
      subject() {
        const saleType = this.saleType;
        const action = (this.data.get('leadTicket.followup.appointment') === 'NotProposed') ? this.$t_locale('pages-extended/emails/notifications/followup-lead/subject')('action_appointment') : this.$t_locale('pages-extended/emails/notifications/followup-lead/subject')('action_recontacted');
        const publicDisplayName = this.payload.garage.publicDisplayName;
        let type = this.$t_locale('pages-extended/emails/notifications/followup-lead/subject')('type_DEFAULT');
        if (this.payload.sourceTypeCategory === 'XLEADS') type = this.$t_locale('pages-extended/emails/notifications/followup-lead/subject')('type_XLEADS', { sourceType: this.$t_locale('pages-extended/emails/notifications/followup-lead/subject')(this.data.get('source.type')) });
        else if (this.payload.sourceTypeCategory === 'AUTOMATION')  type = this.$t_locale('pages-extended/emails/notifications/followup-lead/subject')('type_AUTOMATION');
        return this.$t_locale('pages-extended/emails/notifications/followup-lead/subject')('subject', { type, saleType, action, client: this.client, publicDisplayName })
      }
    },
  }
</script>
