<template>
  <ProductDemonstrationBase
    :loading="loading"
    :availableGarages="availableGarages"
    :availableGaragesToolTip="availableGaragesToolTip"
    :brand="brand"
    :prices="prices"
    :demonstration="demonstration"
    :benefits="benefits"
    :hasOnlyMotorbikeOrAgent="hasOnlyMotorbikeOrAgent"
    :isPrioritaryProfile="isPrioritaryProfile"
    :askDemonstration="askDemonstration"
  />
</template>

<script>
import ProductDemonstrationBase from '~/components/global/ProductDemonstrationBase.vue'
import GarageTypes from "~/utils/models/garage.type.js"
  export default {
    name: "CrossLeadsDemonstration",
    components: { ProductDemonstrationBase },
    props: {
      loading: Boolean,
      availableGarages: Array,
      isPrioritaryProfile: Boolean,
      askDemonstration: Function,
    },
    computed: {
      availableGaragesToolTip() {
        return this.availableGarages.map(g => g.publicDisplayName).join(', ');
      },
      hasOnlyMotorbikeOrAgent() { // 42€ for full motorbikes and agents / 62€ for others
        return !(this.availableGarages.some(g => [GarageTypes.DEALERSHIP, GarageTypes.CARAVANNING].includes(g.type)));
      },
      brand() {
        return {
          logo: '/logo/logo-custeed-xlead-long.svg',
          picture: '/cross-leads/xleads-subscription-picture.svg',
          name: this.$t_locale('components/cockpit/leads/CrossLeadsDemonstration')('featureName'),
          title: this.$t_locale('components/cockpit/leads/CrossLeadsDemonstration')('featureTitle'),
          color: '#f1334e'
        }
      },
      prices() {
        return {
          price1: this.$t_locale('components/cockpit/leads/CrossLeadsDemonstration')('price1'),
          price2: this.$t_locale('components/cockpit/leads/CrossLeadsDemonstration')('price2'),
          perContact: this.$t_locale('components/cockpit/leads/CrossLeadsDemonstration')('source'),
          offer: this.$t_locale('components/cockpit/leads/CrossLeadsDemonstration')('offer'),
        }
      },
      demonstration() {
        return {
          demoButton: this.$t_locale('components/cockpit/leads/CrossLeadsDemonstration')('demoButton'),
          loadingButton: this.$t_locale('components/cockpit/leads/CrossLeadsDemonstration')('loadingButton'),
          nUnpluggedGarages: this.$t_locale('components/cockpit/leads/CrossLeadsDemonstration')('nUnpluggedGarages', { availableGarages: this.availableGarages.length }),
          loneUnpluggedGarage: this.$t_locale('components/cockpit/leads/CrossLeadsDemonstration')('loneUnpluggedGarage'),
          preordered: this.$t_locale('components/cockpit/leads/CrossLeadsDemonstration')('preordered'),
        }
      },
      benefits() {
        return [
          {
            icon: "/cross-leads/exhaustivite.svg",
            title: this.$t_locale('components/cockpit/leads/CrossLeadsDemonstration')('XLead.1.title'),
            text: this.$t_locale('components/cockpit/leads/CrossLeadsDemonstration')('XLead.1.text'),
            logos: [
              {
                link: "/cross-leads/LaCentrale.svg",
                title: "LaCentrale",
                showLogo: true
              },
              {
                link: "/cross-leads/LeBonCoin.svg",
                title: "LeBonCoin",
                showLogo: true
              },
              {
                link: "/cross-leads/AutoScout24.svg",
                title: "AutoScout24",
                showLogo: true
              },
              {
                link: "/cross-leads/OuestFranceAuto.svg",
                title: "OuestFranceAuto",
                showLogo: true
              },
              {
                link: "/cross-leads/ParuVendu.svg",
                title: "ParuVendu",
                showLogo: true
              },
              {
                link: "/cross-leads/Promoneuve.svg",
                title: "Promoneuve",
                showLogo: true
              },
              {
                link: "/cross-leads/Zoomcar.svg",
                title: "Zoomcar",
                showLogo: true
              }
            ]
          },
          { icon: "/cross-leads/appels-manques.svg", title: this.$t_locale('components/cockpit/leads/CrossLeadsDemonstration')('XLead.2.title'), text: this.$t_locale('components/cockpit/leads/CrossLeadsDemonstration')('XLead.2.text') },
          { icon: "/cross-leads/professionnalisme.svg", title: this.$t_locale('components/cockpit/leads/CrossLeadsDemonstration')('XLead.3.title'), text: this.$t_locale('components/cockpit/leads/CrossLeadsDemonstration')('XLead.3.text') },
          { icon: "/cross-leads/transparence.svg", title: this.$t_locale('components/cockpit/leads/CrossLeadsDemonstration')('XLead.4.title'), text: this.$t_locale('components/cockpit/leads/CrossLeadsDemonstration')('XLead.4.text') },
        ]
      }
    }
  }
</script>
