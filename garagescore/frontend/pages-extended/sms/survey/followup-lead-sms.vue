<template>
  <div>{{ content }}</div>
</template>
<script>

export default {
  layout: 'email',
  computed: {
    payload() { return this.$store.getters.payload; },
    firstBrand() { return this.payload.garage.brandNames[0]; },
    city() { return this.payload.garage.city; },
    automation() { return this.payload.sourceTypeCategory === 'AUTOMATION' },
    content() {
      const max = 160 - (this.automation ? '(STOP au 36173)'.length : 0); // STOP TEXT ONLY FOR AUTOMATION
      const question = `question_${this.payload.sourceTypeCategory}`;
      let final = this.$t_locale('pages-extended/sms/survey/followup-lead-sms')(question, { firstBrand: this.firstBrand, city: this.city, baseShort: this.payload.surveyUrls.baseShort });
      if (final.length >= max) final = this.$t_locale('pages-extended/sms/survey/followup-lead-sms')(question, { firstBrand: this.firstBrand, baseShort: this.payload.surveyUrls.baseShort });
      if (final.length >= max) final = this.$t_locale('pages-extended/sms/survey/followup-lead-sms')(question, { firstBrand: this.firstBrand.slice(0, 11), baseShort: this.payload.surveyUrls.baseShort });
      return final;
    }
  }
};
</script>

