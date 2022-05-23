<template>
  <div>{{smsContent}} {{surveyUrl}}</div>
</template>
<script>

export default {
  components: { },
  data() {
    return {};
  },
  layout() {
    return "email";
  },
  computed: {
    smsContent() {
      const campaignType = this.$store.getters.emailData("contact").campaignType;
      if (campaignType === "VehicleSale") {
        return this.$t_locale('pages-extended/sms/survey/followup-unsatisfied-sms')("VehicleSale");
      } else if (campaignType === "VehicleInspection") {
        return this.$t_locale('pages-extended/sms/survey/followup-unsatisfied-sms')("VehicleInspection");
      } else {
        return this.$t_locale('pages-extended/sms/survey/followup-unsatisfied-sms')("Maintenance");
      }
    },
    surveyUrl() {
      return this.$store.getters.emailData("surveyUrls").baseShort;
    }
  },
  methods: {
    contactData(key, fallback = '') {
      const contact = this.$store.getters.emailData('contact');
      return (contact && contact[key]) || fallback;
    }
  }
};
</script>
