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
    :askDemonstration="askDemonstration"
  />
</template>

<script>
import ProductDemonstrationBase from '~/components/global/ProductDemonstrationBase.vue'
import GarageTypes from "~/utils/models/garage.type.js"
export default {
  name:"AutomationDemonstration",
  components: { ProductDemonstrationBase },
  props: {
    loading: Boolean,
    availableGarages: Array,
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
        logo: '/logo/logo-custeed-automation-long.svg',
        picture: '/automation/automation-subscription-picture.svg',
        name: this.$t_locale('components/cockpit/automation/AutomationDemonstration')('featureName'),
        title: this.$t_locale('components/cockpit/automation/AutomationDemonstration')('featureTitle'),
      }
    },
    prices() {
      return {
        price1: this.$t_locale('components/cockpit/automation/AutomationDemonstration')('price1'),
        price2: this.$t_locale('components/cockpit/automation/AutomationDemonstration')('price2'),
        perContact: this.$t_locale('components/cockpit/automation/AutomationDemonstration')('pricePerContact'),
        offer: this.$t_locale('components/cockpit/automation/AutomationDemonstration')('offer'),
      }
    },
    demonstration() {
      return {
        demoButton: this.$t_locale('components/cockpit/automation/AutomationDemonstration')('demoButton'),
        loadingButton: this.$t_locale('components/cockpit/automation/AutomationDemonstration')('loadingButton'),
        nUnpluggedGarages: this.$t_locale('components/cockpit/automation/AutomationDemonstration')('nUnpluggedGarages', { availableGarages: this.availableGarages.length }),
        loneUnpluggedGarage: this.$t_locale('components/cockpit/automation/AutomationDemonstration')('loneUnpluggedGarage'),
      }
    },
    benefits() {
      return [
        { icon: "/automation/ciblage.svg", title: this.$t_locale('components/cockpit/automation/AutomationDemonstration')('targettingTitle'), text: this.$t_locale('components/cockpit/automation/AutomationDemonstration')('targettingText') },
        { icon: "/automation/marketing.svg", title: this.$t_locale('components/cockpit/automation/AutomationDemonstration')('reactiveTitle'), text: this.$t_locale('components/cockpit/automation/AutomationDemonstration')('reactiveText') },
        { icon: "/automation/work.svg", title: this.$t_locale('components/cockpit/automation/AutomationDemonstration')('planificationTitle'), text: this.$t_locale('components/cockpit/automation/AutomationDemonstration')('planificationText') },
        { icon: "/automation/roi.svg", title: this.$t_locale('components/cockpit/automation/AutomationDemonstration')('RoiTitle'), text: this.$t_locale('components/cockpit/automation/AutomationDemonstration')('RoiText') },
        { icon: "/automation/business.svg", title: this.$t_locale('components/cockpit/automation/AutomationDemonstration')('businessTitle'), text: this.$t_locale('components/cockpit/automation/AutomationDemonstration')('businessText') },
        { icon: "/automation/ux.svg", title: this.$t_locale('components/cockpit/automation/AutomationDemonstration')('customerXpTitle'), text: this.$t_locale('components/cockpit/automation/AutomationDemonstration')('customerXpText') }
      ]
    }
  }
}
</script>
