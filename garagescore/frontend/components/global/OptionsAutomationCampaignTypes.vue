<template>
  <div class="options-content">
    <div class="options-content__items">
      <Button
        class="options-content__item"
        type="options"
        v-for="(campaignType, id) in availableCampaignTypes"
        :key="id"
        :disabled="!enabled"
        :active="isActive"
        :class="{'button--options__active':(campaignType.id === currentCampaignType.id)}"
        v-model="activeCampaignType"
        @click="setCurrentCampaignType(campaignType.id)"
        track-id="topfilter-datatype"
      >
        {{ $t_locale('components/global/OptionsAutomationCampaignTypes')(campaignType.label) }}
      </Button>
    </div>
  </div>
</template>

<script>
import CampaignTypes from "~/utils/models/automation-campaign.type";

export default {
  name: 'OptionsAutomationCampaignTypes',

  props: {
    availableCampaignTypes: Array,
  },

  computed: {
    activeCampaignType: {
      get() {
        return {
          key: this.currentCampaignType.id ? this.currentCampaignType.id : CampaignTypes.AUTOMATION_MAINTENANCE,
          label: this.labelHelper(
            this.currentCampaignType.id ? this.currentCampaignType.id : CampaignTypes.AUTOMATION_MAINTENANCE
          ),
          value: this.currentCampaignType
        };
      },

      set(item) {
        this.setCurrentCampaignType(item.id);
        return item;
      }
    },

    isActive() {
      return this.$store.getters["cockpit/selectedAutomationCampaignType"] !== null;
    },

    currentCampaignType() {
      return (
        this.availableCampaignTypes.find(
          e => e.id === this.$store.getters["cockpit/selectedAutomationCampaignType"]
        ) || { id: CampaignTypes.AUTOMATION_MAINTENANCE, value: this.$t_locale('components/global/OptionsAutomationCampaignTypes')(CampaignTypes.AUTOMATION_MAINTENANCE) }
      );
    },
    iconClass() {
      if (this.currentCampaignType.id === CampaignTypes.AUTOMATION_MAINTENANCE) return 'icon-gs-repair';
      if (this.currentCampaignType.id === CampaignTypes.AUTOMATION_VEHICLE_SALE) return 'icon-gs-car';
      if (this.currentCampaignType.id === CampaignTypes.AUTOMATION_NEW_VEHICLE_SALE) return 'icon-gs-car';
      if (this.currentCampaignType.id === CampaignTypes.AUTOMATION_USED_VEHICLE_SALE) return 'icon-gs-car-old';
      if (this.currentCampaignType.id === CampaignTypes.AUTOMATION_VEHICLE_INSPECTION) return 'icon-gs-repair';
      return 'icon-gs-repair';
    },

    enabled() {
      return this.availableCampaignTypes.length >= 2;
    }
  },

  methods: {
    labelHelper(campaignType) {
      if (!campaignType) {
        return this.$t_locale('components/global/OptionsAutomationCampaignTypes')(CampaignTypes.AUTOMATION_MAINTENANCE)
      }
      return this.$t_locale('components/global/OptionsAutomationCampaignTypes')(campaignType);
    },
    setCurrentCampaignType(campaignType) {
      this.$store.dispatch("cockpit/changeCurrentAutomationCampaignType", campaignType);
      this.$store.dispatch("cockpit/refreshRouteParameters");
    }

  }
};
</script>

<style lang="scss" scoped>
.options-content {
  &__items {
    display: flex;
  }
}
</style>
