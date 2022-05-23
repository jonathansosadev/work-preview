<template>
  <WelcomeEmail
    :url="url"
    :token="token"
    :icons="icons"
  />
</template>

<script>
import WelcomeEmail from "~/components/emails/pages/notifications/WelcomeEmail.vue"

  export default {
    layout: 'email',
    components: { WelcomeEmail },
    computed: {
      payload() { return this.$store.getters.payload; },
      url() {
        return encodeURI(this.payload.baseUrl + this.gsClient.url.getShortUrl('AUTH_RESET_PASSWORD') + this.token);
      },
      token() {
        return this.payload.token;
      },
      gsClient() {
        return this.payload.gsClient;
      },
      config() {
        return this.payload.config;
      },
      icons() {
        return {
          logo: '/logo/logo-custeed-long-286px-rgb.png',
          welcome: this.gsClient.latestStaticUrl('/images/www/R1-R2/welcome-2.png'),
          review: this.gsClient.latestStaticUrl('/images/www/R1-R2/review.png'),
          unsatisfied: this.gsClient.latestStaticUrl('/images/www/R1-R2/unsatisfied.png'),
          lead: this.gsClient.latestStaticUrl('/images/www/R1-R2/lead.png'),
          analytics: this.gsClient.latestStaticUrl('/images/www/R1-R2/analytics.png'),
          answer: this.gsClient.latestStaticUrl('/images/www/R1-R2/answer.png')
        }
      }
    },
  }
</script>


<style>
 
</style>
