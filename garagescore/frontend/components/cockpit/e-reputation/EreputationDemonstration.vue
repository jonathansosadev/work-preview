<template>
  <ProductDemonstrationBase
    :loading="loading"
    :availableGarages="availableGarages"
    :availableGaragesToolTip="availableGaragesToolTip"
    :brand="brand"
    :prices="prices"
    :demonstration="demonstration"
    :benefits="benefits"
    :isPrioritaryProfile="isPrioritaryProfile"
    :askDemonstration="askDemonstration"
  />
</template>

<script>
import ProductDemonstrationBase from '~/components/global/ProductDemonstrationBase.vue'

export default {
  name: "EreputationDemonstration",
  components: { ProductDemonstrationBase },
  props: {
    loading: Boolean,
    availableGarages: Array,
    isPrioritaryProfile: Boolean,
    askDemonstration: Function,
  },
  computed: {
    globalStats() {
      return this.$store.getters['cockpit/ereputation/globalStatistics'];
    },
    unsubscribeGarages() {
      return this.availableGarages.filter(g => !g.subscriptions.EReputation);
    },
    countUnsubscribeGarage() {
      return this.unsubscribeGarages.length;
    },
    localeUnsubscribeGarage() {
      const garage = this.unsubscribeGarages.find(unsubscribeGarage => !!unsubscribeGarage.locale);
      return garage && garage.locale ? garage.locale : '';
    },
    availableGaragesToolTip() {
      let result = this.unsubscribeGarages.length ? (this.unsubscribeGarages[0].garagePublicDisplayName || this.unsubscribeGarages[0].publicDisplayName) : '';

      for (const garage of this.unsubscribeGarages.slice(1)) {
        result += `, ${garage.garagePublicDisplayName || garage.publicDisplayName}`;
      }
      result += '.';
      return result;
    },
    brand() {
      return {
        logo: '/logo/logo-custeed-e-reputation-long.svg',
        picture: '/e-reputation/ereputation-subscription-picture.svg',
        name: this.$t_locale('components/cockpit/e-reputation/EreputationDemonstration')('featureName'),
        title: this.$t_locale('components/cockpit/e-reputation/EreputationDemonstration')('featureTitle'),
        color: '#e9b330'
      }
    },
    prices() {
      return {
        price1: this.$t_locale('components/cockpit/e-reputation/EreputationDemonstration')('price', { price: this.localeUnsubscribeGarage === 'fr_FR' ? '29' : '20'}),
      }
    },
    demonstration() {
      return {
        demoButton: this.$t_locale('components/cockpit/e-reputation/EreputationDemonstration')('demoButton'),
        loadingButton: this.$t_locale('components/cockpit/e-reputation/EreputationDemonstration')('loadingButton'),
        nUnpluggedGarages: this.$t_locale('components/cockpit/e-reputation/EreputationDemonstration')('nUnpluggedGarages', { countUnsubscribeGarage: this.countUnsubscribeGarage } ),
        loneUnpluggedGarage: this.$t_locale('components/cockpit/e-reputation/EreputationDemonstration')('loneUnpluggedGarage'),
        preordered: this.$t_locale('components/cockpit/e-reputation/EreputationDemonstration')('preordered'),
      }
    },
    benefits() {
      return [
        {
          icon: "/e-reputation/simplicite.svg",
          title: this.$t_locale('components/cockpit/e-reputation/EreputationDemonstration')('centralization'),
          text: this.$t_locale('components/cockpit/e-reputation/EreputationDemonstration')('centralization2'),
          logos: [
            {
              link: "/e-reputation/GarageScore.svg",
              title: "GarageScore",
              showLogo: true
            },
            {
              link: "/e-reputation/Google.svg",
              title: "Google",
              showLogo: true
            },
            {
              link: "/e-reputation/Facebook.svg",
              title: "Facebook",
              showLogo: true
            },
            {
              link: "/e-reputation/PagesJaunes.svg",
              title: "PagesJaunes",
              showLogo: this.locale === 'fr'
            }
          ]
        },
        { icon: "/e-reputation/simplicite.svg", title: this.$t_locale('components/cockpit/e-reputation/EreputationDemonstration')('treatment'), text: this.$t_locale('components/cockpit/e-reputation/EreputationDemonstration')('treatment2') },
        { icon: "/e-reputation/reactivite.svg", title: this.$t_locale('components/cockpit/e-reputation/EreputationDemonstration')('alert'), text: this.$t_locale('components/cockpit/e-reputation/EreputationDemonstration')('alert2') },
        { icon: "/e-reputation/e-reputation.svg", title: this.$t_locale('components/cockpit/e-reputation/EreputationDemonstration')('control'), text: this.$t_locale('components/cockpit/e-reputation/EreputationDemonstration')('control2') },
      ]
    }
  }
}
</script>
