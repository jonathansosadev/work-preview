<template>
  <span>{{ $t_locale('pages-extended/emails/notifications/automation-lead/subject')('subject', { garageName, campaignName, customerName, type: leadSaleType }) }}</span>
</template>

<script>
import ContactTypes from '../../../../utils/models/automation-campaign.contact';

export default {
  components: {},
  methods: {},
  computed: {
    payload() { return this.$store.getters.payload; },
    campaignName() {
      return this.payload.automationCampaign && this.payload.automationCampaign.displayName;
    },
    garageName() {
      return this.payload.garage.publicDisplayName;
    },
    customerName() { 
      const fullName = this.payload.data.get('leadTicket.customer.fullName');
      const email = this.payload.data.get('leadTicket.customer.contact.email');
      const mobilePhone = this.payload.data.get('leadTicket.customer.contact.mobilePhone');
      if (fullName) return fullName + ' ';
      if (this.payload.automationCampaign.contactType === ContactTypes.EMAIL) {
        if (email) return email + ' ';
        return (mobilePhone && (mobilePhone + ' ')) || '';
      }
      if (this.payload.automationCampaign.contactType === ContactTypes.MOBILE) {
        if (mobilePhone) return mobilePhone + ' ';
        return (email && (email + ' ')) || '';
      }
      return '';
    },
    leadSaleType() {
      return this.payload.data.get('lead.saleType') === 'Unknown' ? '' : this.$t_locale('pages-extended/emails/notifications/automation-lead/subject')(this.payload.data.get('lead.saleType'));
    },
  },
}
</script>
