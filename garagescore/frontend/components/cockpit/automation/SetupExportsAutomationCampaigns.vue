<template>
  <SetupStep v-bind="stepProps">
    <template slot="input">
      <Skeleton v-if="componentLoading" class="setup-exports__skeleton" />
      <MultiSelectMaterial
        v-else
        class="setup-exports__multiselect"
        :placeholder="$t_locale('components/cockpit/automation/SetupExportsAutomationCampaigns')('placeholder')"
        @input="setSelectedAutomationCampaigns"
        :value="selectedAutomationCampaigns"
        :multiple="true"
        :options="availableCampaigns"
        :noResult="$t_locale('components/cockpit/automation/SetupExportsAutomationCampaigns')('multiselectCampaignsNoResult')"
        :label="$t_locale('components/cockpit/automation/SetupExportsAutomationCampaigns')('campaigns')"
      />
    </template>
  </SetupStep>
</template>

<script>
import { ExportTypes } from '~/utils/enumV2';

export default {
  name: 'SetupExportsAutomationCampaigns',
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    selectedExportType: {
      type: String,
      default: ExportTypes.AUTOMATION_RGPD,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    setActiveStep: {
      type: Function,
      required: true,
    },
    onValidateSelectedAutomationCampaigns: {
      type: Function,
      required: true,
    },
    onCancelSelectedAutomationCampaigns: {
      type: Function,
      required: true,
    },
    setSelectedAutomationCampaigns: {
      type: Function,
      required: true,
    },
    selectedAutomationCampaigns: {
      type: Array,
      default: () => [],
    },
    availableAutomationCampaigns: {
      type: Array,
      default: () => [],
    },
    target: {
      type: String,
      default: "",
    },
    selectedAreValid: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      componentLoading: false,
      all: {
        label: this.$t_locale('components/cockpit/automation/SetupExportsAutomationCampaigns')('All'),
        value: 'All',
        $isDisabled: false,
      }
    };
  },
  mounted() {
    // pre filled campaign with "All"
    if (this.selectedAutomationCampaigns.length === 0 && !this.target) {
      this.setSelectedAutomationCampaigns([this.all]);
    }
    // pre filled campaign with current campaign
    if (this.target) {
      const campaign = this.availableAutomationCampaigns.find(({id}) => id === this.target);
      if (campaign) {
      const tag = this.tagType(campaign.id);
        this.setSelectedAutomationCampaigns([{
          label: `${campaign.name} - ${this.$t_locale('components/cockpit/automation/SetupExportsAutomationCampaigns')(tag)}`,
          value: campaign.id,
          $isDisabled: false,
        }]);
      }
    }
  },
  computed: {
    stepProps() {
      return {
        stepName: this.stepName,
        label: this.$t_locale('components/cockpit/automation/SetupExportsAutomationCampaigns')('stepLabel'),
        subLabel: this.subLabel,
        isOpen: this.isOpen,
        filled: this.isFilled,
        isValid: this.isFilled,
        onSetActive: this.setActiveStep,
        onValidate: this.onValidateSelectedAutomationCampaigns,
        onCancel: this.onCancelSelectedAutomationCampaigns,
        loading: this.loading,
        disabled: this.isExportAutomationRgpd,
        disabledTooltip: this.disabledTooltip,
      };
    },

    isExportAutomationRgpd() {
      return this.selectedExportType === ExportTypes.AUTOMATION_RGPD;
    },

    disabledTooltip() {
      return this.isExportAutomationRgpd ? this.$t_locale('components/cockpit/automation/SetupExportsAutomationCampaigns')('toolTipsNoModifiable') : '';
    },

    isFilled() {
      return this.selectedAutomationCampaigns.length > 0;
    },

    stepName() {
      return this.isExportAutomationRgpd ? 'automationRgpdStep' : 'automationCampaignStep';
    },

    availableCampaigns() {
      const all = {
        label: this.$t_locale('components/cockpit/automation/SetupExportsAutomationCampaigns')('All'),
        value: 'All',
        $isDisabled: false,
      }
      const isDisabled = this.selectedAutomationCampaigns.find((e) => e.value === 'All');
      const campaigns = this.availableAutomationCampaigns.map(campaign => {
        const tag = this.tagType(campaign.id);
        return {
          label: `${campaign.name} - ${this.$t_locale('components/cockpit/automation/SetupExportsAutomationCampaigns')(tag)}`,
          value: campaign.id,
          $isDisabled: !!isDisabled,
        }
      });

      return [all, ...campaigns];
    },

    subLabel() {
      const all = this.selectedAutomationCampaigns.find(({ value }) => value ==='All');
      if (all) {
        return this.$t_locale('components/cockpit/automation/SetupExportsAutomationCampaigns')('allCampaigns');
      }
      if (this.selectedAutomationCampaigns.length === 0) {
        return this.$t_locale('components/cockpit/automation/SetupExportsAutomationCampaigns')('chooseCampaigns');
      }
      return this.selectedAutomationCampaigns.map(campaign => campaign.label).join((', '));
    },
  },

  methods: {
    tagType (campaignType) {
      if(/NVS/.test(campaignType)) {
        return 'vn';
      }
      if(/UVS/.test(campaignType)) {
        return 'vo';
      }
      return 'apv';
    }
  },

  watch: {
    isExportAutomationRgpd() {
      // set all when user choose export RGPD
      this.setSelectedAutomationCampaigns([this.all]);
    },
  },
};
</script>

<style lang="scss" scoped>
.setup-exports {
  &__skeleton {
    height : 35px !important;
    margin-top: 10px;
  }
  &__multiselect {
    max-width: 560px;
    margin-top: 2rem;

    &:first-child {
      margin-bottom: 2rem;
    }
  }
}
</style>
