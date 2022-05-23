<template>
  <div><span>{{ $t_locale('pages-extended/emails/survey/reply-subject')('replied', { garageName: payload.garage.publicDisplayName, garageType }) }}</span></div>
</template>
<script>
  export default {
    components: { },
    layout () {
      return 'email';
    },
    computed: {
      payload() { return this.$store.getters.payload; },
      garageType() {
        const campaignType = this.payload.contact.campaignType;
        const type = (campaignType === 'VehicleInspection') ? 'inspection' : 'garage';
        return this.$t_locale('pages-extended/emails/survey/reply-subject')(`type_${type}`);
      }
    },
  }
</script>

