<template>
  <AutomationCampaignEmailSubject 
    :target="target"
    :garageName="garageName"
    :customerName="customerName"
    :brandName="brandName"
    :isMotorbikeDealership="!!payload.isMotorbikeDealership"
  />
</template>

<script>
  import AutomationCampaignEmailSubject from "~/components/emails/pages/automation/AutomationCampaignEmailSubject.vue";

  export default {
    components: { AutomationCampaignEmailSubject },
    methods: { },
    computed: {
      garageName() {
        return this.payload.garagePublicDisplayName;
      },
      customerName() {
        return this.payload.customerName;
      },
      brandName() {
        return this.payload.brandName;
      },
      payload() {
        return this.$store.getters.payload;
      },
      target() {
        return this.payload.target;
      },
    }
  }
</script>