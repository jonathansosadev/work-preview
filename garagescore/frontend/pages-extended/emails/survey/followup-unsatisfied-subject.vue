<template>
  <div>{{ hello }} {{ content }}</div>
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
    hello() {
      let title = this.$store.getters.emailData("addressee").title || '';
      title = title.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // removeDiacritics
      let fullName = this.$store.getters.emailData("addressee").fullName;
      return fullName && title ? this.$t_locale('pages-extended/emails/survey/followup-unsatisfied-subject')("helloM", {fullName, title: this.$t_locale('pages-extended/emails/survey/followup-unsatisfied-subject')(title)}) : this.$t_locale('pages-extended/emails/survey/followup-unsatisfied-subject')("hello")
    },
    content() {
      const campaignType = this.$store.getters.emailData("contact").campaignType;
      if (campaignType === "VehicleSale") {
        return this.$t_locale('pages-extended/emails/survey/followup-unsatisfied-subject')("VehicleSale");
      } else if (campaignType === "VehicleInspection") {
        return this.$t_locale('pages-extended/emails/survey/followup-unsatisfied-subject')("VehicleInspection");
      } else {
        return this.$t_locale('pages-extended/emails/survey/followup-unsatisfied-subject')("Maintenance");
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
