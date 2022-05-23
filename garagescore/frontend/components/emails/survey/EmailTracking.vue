<template>
  <img v-if="campaignTrackingActivated" :src="campaignTrackingUrl" class="tracking-pixel"/>
</template>

<script>
  export default {
    components: {},
    data() {
      return {};
    },
    computed: {
      campaignTrackingActivated() {
        return !!this.campaignTrackingUrl;
      },
      campaignTrackingUrl() {
        return this.$store.getters.emailData('campaignTrackingUrl');
      }
    }
  };
</script>

<style lang="scss" scoped>
  .tracking-pixel {
    display: none;
  }
</style>



