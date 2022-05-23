<template>
  <ModalBase class="modal-preview-email">

    <template slot="header-icon">
      <img class="modal-make-surveys-previsualisation__logo" src="/logo/logo-custeed-picto.svg"/>
    </template>

    <template slot="header-title">
      <span>{{ $t_locale('components/cockpit/automation/ModalPreviewAutomationCampaignEmail')('title') }} {{ campaignName }}</span>
    </template>

    <template slot="header-subtitle">
      <span>{{ $t_locale('components/cockpit/automation/ModalPreviewAutomationCampaignEmail')('subtitle') }}</span>
    </template>

    <template slot="body">
      <AutomationCampaignEmail v-bind="emailProps"/>
    </template>

  </ModalBase>
</template>

<script>
import AutomationCampaignEmail from "~/components/emails/pages/automation/AutomationCampaignEmail.vue";

export default {
  name: 'ModalPreviewAutomationCampaignEmail',

  components: { AutomationCampaignEmail },

  props: {
    logoUrl: {
      type: String,
      default: ""
    },
    themeColor: {
      type: String,
      default: ""
    },
    garageName: {
      type: String,
      default: ""
    },
    customerName: {
      type: String,
      default: ""
    },
    brandName: {
      type: String,
      default: ""
    },
    target: {
      type: String,
      default: ""
    },
    campaignName: {
      type: String,
      default: ""
    },
  },
  
  computed: {
    emailProps() {
      return {
        logoUrl: this.logoUrl,
        themeColor: this.themeColor,
        garageName: this.garageName,
        customerName: this.customerName,
        brandName: this.brandName,
        target: this.target,
        isPreview: true,
      };
    },
  },
};
</script>

<style lang="scss" scoped>
.modal-preview-email {
  overflow: auto;
  height: 100%;
  width: 680px;
}

@media only screen and (max-width: $breakpoint-max-sm) {
  .modal-preview-email {
    width: auto;
    margin: auto;
  }
}
</style>
