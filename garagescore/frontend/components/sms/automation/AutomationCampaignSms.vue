<template>
  <div>{{ getSmsContent('content') }} {{ shortUrl }}</div>
</template>
<script>

export default {
  layout: 'email',
  name: 'AutomationCampaignSms',
  props: { 
    shortUrl: {
      type: String,
      default: ""
    },
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
        return this.$t_locale('components/sms/automation/AutomationCampaignSms')('Motorbike');
      }
      return this.$t_locale('components/sms/automation/AutomationCampaignSms')('Vehicle');
    }
  },
  methods: {
    getContent(key) {
      return this.$t_locale('components/sms/automation/AutomationCampaignSms')(`${this.target}_${key}`, { 
        garageName: this.garageName,
        customerName: this.customerName,
        brandName: this.brandName,
        vehiculeType: this.vehiculeType
       });
    },
    getSmsContent(key) {
      if (this.getContent(key) && this.getContent(key).length > 160) {
        return this.getContent(`${key}Short`);
      }
      return this.getContent(key);
    }
  }
};
</script>

