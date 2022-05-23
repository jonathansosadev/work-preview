<template>
  <AutomationGdprSms
    :garageName="garageName"
    :customerName="customerName"
    :brandName="brandName"
    :shortUrl="shortUrl"
  />
</template>
<script>
import AutomationGdprSms from "~/components/sms/automation/AutomationGdprSms.vue";

export default {
  layout: 'email',
  name: 'AutomationGdprSMS',
  components: { AutomationGdprSms },
  methods: {},
  computed: {
    payload() {
      return this.$store.getters.payload;
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
    shortUrl() {
      return this.payload.shortUrl || '';
    },
  }
};
</script>

