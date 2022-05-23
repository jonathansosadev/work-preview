<template>
  <div>{{ getSmsContent('content') }}&nbsp;{{ shortUrl }}</div>
</template>
<script>

export default {
  layout: 'email',
  name: 'AutomationCampaignGdprSms',
  props: { 
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
    shortUrl: {
      type: String,
      default: ""
    },
  },
  methods: {
    getContent(key) {
      return this.$t_locale('components/sms/automation/AutomationGdprSms')(key, {
        garageName: this.garageName,
        customerName: this.customerName,
        brandName: this.brandName,
      });
    },
    applyArguments(str) {
      if (str.includes('{garageName}')) str = str.replace(/{garageName}/g, this.garageName);
      if (str.includes('{customerName}')) str = str.replace(/{customerName}/g, this.customerName);
      if (str.includes('{brandName}')) str = str.replace(/{brandName}/g, this.brandName);
      return str;
    },
    getSmsContent(key) {
      if (this.getContent(key) && this.getContent(key).length > 160) {
        return this.getContent(`${key}Short`);
      }
      return this.getContent(key);
    }
  },
};
</script>

