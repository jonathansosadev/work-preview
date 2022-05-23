<template>
  <span>{{ getContent('subject') }}</span>
</template>

<script>
  export default {
    name: 'AutomationCampaignEmailSubject',
    props: { 
      target: {
        type: String,
        default: ""
      },
      garageName: {
        type: String,
        default: ""
      },
      customerName: {
        type: String,
        default: ""
      },
      brandName: {
        type: String,
        default: ""
      },
      isMotorbikeDealership: {
        type: Boolean,
        default: false
      },
    },
    computed: {
      vehiculeType() {
        if (this.isMotorbikeDealership) {
          return this.$t_locale('components/emails/pages/automation/AutomationCampaignEmailSubject')('Motorbike');
        }
        return this.$t_locale('components/emails/pages/automation/AutomationCampaignEmailSubject')('Vehicle');
      }
    },
    methods: {
      getContent(key) {
        return this.$t_locale('components/emails/pages/automation/AutomationCampaignEmailSubject')(`${this.target}_${key}`, { 
          garageName: this.garageName,
          customerName: this.customerName,
          brandName: this.brandName,
          vehiculeType: this.vehiculeType,
         });
      },
    },
  }
</script>

