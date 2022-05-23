<template>
  <AutomationCampaignEmail
    :themeColor="customContent && customContent.themeColor"
    :promotionalMessage="customContent && customContent.promotionalMessage"
    :customButtonText="customContent && customContent.customButtonText"
    :choices="choices"
    :logoUrl="payload && payload.logoUrl"
    :target="payload && payload.target"
    :garageName="payload && payload.garagePublicDisplayName"
    :customerName="payload && payload.customerName"
    :brandName="payload && payload.brandName"
    :isMotorbikeDealership="payload && payload.isMotorbikeDealership"
  />
</template>


<script>

import AutomationCampaignEmail from "~/components/emails/pages/automation/AutomationCampaignEmail.vue";


export default {
  layout: 'email',
  name: 'AutomationCampaignEmailBody',
  components: { AutomationCampaignEmail },
  props: { },
  computed: {
    payload() {
      return this.$store && this.$store.getters.payload;
    },
    customContent() {
      return this.payload.customContent;
    },
    defaultUrl() {
      return this.payload && `${this.payload.config.get('publicUrl.app_url')}/public/automation-campaign?campaignid=${this.payload.campaignId}&customerid=${this.payload.customerId}&isLead=isLead`;
    },
    customUrl() {
      if (this.customContent && this.customContent.customUrl) {
        return this.payload && `${this.payload.config.get('publicUrl.app_url')}/public/automation-campaign-redirect/${this.payload.campaignId}/${this.payload.customerId}/${this.customContent._id}/isLead/false`;
      }
    },
    choices() {
      return [
        {
          label: this.payload && this.payload.choice1,
          url: this.customUrl || this.defaultUrl,
        }
      ]
    },
  },
}
</script>


<style lang="scss" scoped>
  .choiceTitle {
    font-weight: 700;
    font-size: 16px;
    color: black;
    line-height: 1.5;
    margin: 0;
  }
</style>
