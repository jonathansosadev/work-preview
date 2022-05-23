<template>
  <AutomationCampaignSms 
    :shortUrl="shortUrl"
    :target="target"
    :garageName="garageName"
    :customerName="customerName"
    :brandName="brandName"
    :isMotorbikeDealership="!!payload.isMotorbikeDealership"
  />
</template>

<script>
import AutomationCampaignSms from "~/components/sms/automation/AutomationCampaignSms.vue";

export default {
  layout: 'email',
  components: { AutomationCampaignSms },
  methods: { },
  computed: {
    payload() {
      return this.$store.getters.payload;
    },
    shortUrl() {
      return this.payload.shortUrl;
    },
    garageName() {
      return this.payload.garagePublicDisplayName;
    },
    customerName() {
      return this.payload.customerName;
    },
    brandName() {
      return this.payload.brandName;
    },
    target() {
      return this.payload.target;
    },
  }
};
</script>

