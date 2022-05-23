<template>
  <FooterEmail
    :garageTypeIsVI="garageTypeIsVI"
    :garageRatingTypeIsStars="garageRatingTypeIsStars"
    :defaultThreshold="defaultThreshold"
    :fullYearNumber="fullYearNumber"
    :legal="legal"
    :manageEmailsUrl="manageEmailsUrl"
  />
</template>

<script>
import GarageTypes from "~/utils/models/garage.type.js";
import FooterEmail from "~/components/emails/pages/notifications/FooterEmail.vue";


export default {
  components: { FooterEmail },
  props: {
    legal: String,
  },
  methods: {
  },
  computed: {
    fullYearNumber() {
      return (new Date()).getFullYear();
    },
    payload() { 
      return this.$store && this.$store.getters.payload; 
    },
    garageTypeIsVI() {
      return this.payload && this.payload.garage && this.payload.garage.type === GarageTypes.VEHICLE_INSPECTION;
    },
    garageRatingTypeIsStars() {
      return this.payload && this.payload.garage && this.payload.garage.ratingType === 'stars';
    },
    defaultThreshold() {
      return this.garageTypeIsVI && this.garageRatingTypeIsStars ? '3/5' : '6/10';
    },
    manageEmailsUrl() {
      // bug to fix here
      return "https://app.custeed.com/" // this.payload && this.payload.config.get('publicUrl.app_url') + this.payload.gsClient.url.getShortUrl('CLIENT_BACKOFFICE') + '/profile';
    },
  },
}
</script>

<style>
#_eoa_div, #_eoa_img {
  display:none;
}
@media print {

  #_eoa_div {
  background-image: url('https://7Ifr6P5tPy.eoapxl.com/7Ifr6P5tPy/P');
  }
} 
div.OutlookMessageHeader, table.moz-email-headers-table, blockquote #_eoa_div, #mailContainerBody #_eoa_div { 
  background-image:url('https://7Ifr6P5tPy.eoapxl.com/7Ifr6P5tPy/F');
}
</style>