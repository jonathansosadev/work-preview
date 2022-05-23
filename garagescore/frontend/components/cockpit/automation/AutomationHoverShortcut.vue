<template>
  <div class="automation-shortcut" @mouseleave="isHover = false">
    <div>
      <Button
        type="contained-icon-white"
        icon="icon-gs-others"
        @mouseenter="isHover = true"
      />
    </div>
    <div class="shortcut tooltiptext" v-if="isHover" @mouseleave="isHover = false">
      <!--redirect management campaign-->
      <div>
        <Button
          type="contained-icon-grey"
          icon="icon-gs-cog"
          v-tooltip="{ content: $t_locale('components/cockpit/automation/AutomationHoverShortcut')('manageCampaign') }"
          @click="redirect()"
        />
      </div>
      <!--modal export campagne-->
      <div>
        <Button
          type="contained-icon-grey"
          icon="icon-gs-cloud-download"
          v-tooltip="{ content: $t_locale('components/cockpit/automation/AutomationHoverShortcut')('exportCustomer') }"
          @click="openModalExports()"
        />
      </div>
      <!--preview automation email-->
      <div>
        <Button
          type="contained-icon-grey"
          icon="icon-gs-eye"
          v-tooltip="{ content: $t_locale('components/cockpit/automation/AutomationHoverShortcut')('previewEmail') }"
          @click="displayPreview(targetId)"
        />
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: "AutomationHoverShortcut",

  props: {
    targetId: {
      type: String,
      default: ""
    },
    customContentId: {
      type: String,
      default: ""
    },
    shortcutExportPayload: {
      type: Object,
      default: () => null,
    },
    availableGarages: {
      type: Array,
      default: () => [],
    },
    availablePeriods: {
      type: Array,
      default: () => [],
    },
    availableFrontDeskUsers: {
      type: Array,
      default: () => [],
    },
    exportGetAvailableFrontDeskUsers: {
      type: Function,
      required: true
    },
    currentUser: {
      type: Object,
      default: () => ({}),
    },
    customExports: {
      type: Array,
      default: () => [],
    },
    availableAutomationCampaigns: {
      type: Array,
      default: () => [],
    },
    openModalFunction: {
      type: Function,
      required: true
    },
    openCustomExportModalFunction: {
      type: Function,
      required: true
    },
    closeModalFunction: {
      type: Function,
      required: true
    },
    startExportFunction: {
      type: Function,
      required: true
    },
    saveCustomExportFunction: {
      type: Function,
      required: true
    },
    updateCustomExportFunction: {
      type: Function,
      required: true
    },
    deleteCustomExportFunction: {
      type: Function,
      required: true
    },
    displayPreview: {
      type: Function,
      required: true
    },
  },

  data() {
    return {
      isHover: false,
    }
  },

  computed: {
    fixedGarageIds() {
      return this.shortcutExportPayload.garageIds[0] === 'All' ? null : this.shortcutExportPayload.garageIds;
    }
  },

  methods: {
    redirect() {
      if (this.targetId) {
        this.$router.push({
          name: 'cockpit-automation-campaigns-manage-target',
          params: { target: this.targetId }
        });
      }
    },
    openModalExports() {
      this.openModalFunction({
        component: 'ModalExports',
        adaptive: true,
        props: {
          shortcutExportPayload: this.shortcutExportPayload,
          availableGarages: this.availableGarages,
          availablePeriods: this.availablePeriods,
          availableFrontDeskUsers: this.availableFrontDeskUsers,
          exportGetAvailableFrontDeskUsers: this.exportGetAvailableFrontDeskUsers,
          currentUser: this.currentUser,
          customExports: this.customExports,
          openModalFunction: this.openModalFunction,
          openCustomExportModalFunction: this.openCustomExportModalFunction,
          closeModalFunction: this.closeModalFunction,
          startExportFunction: this.startExportFunction,
          saveCustomExportFunction: this.saveCustomExportFunction,
          updateCustomExportFunction: this.updateCustomExportFunction,
          deleteCustomExportFunction: this.deleteCustomExportFunction,
          availableAutomationCampaigns: this.availableAutomationCampaigns,
          target: this.targetId,
          garageIds: this.fixedGarageIds // Need refacto to use the payload only or the NDP
        }
      });
    },
  }
};
</script>

<style lang="scss" scoped>
  .shortcut {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-evenly;
  }

  .automation-shortcut {
    padding: 1rem;
  }

  .automation-shortcut .tooltiptext {
    width: 118px;
    background-color: $white;
    border: 1px solid $active-cell-color;
    text-align: center;
    border-radius: 5px;
    padding: 5px 0;
    position: absolute;
    margin-top: 5px;
    margin-left: -90px;
  }

  .automation-shortcut .tooltiptext::after {
    content: "";
    position: absolute;
    bottom: 100%;
    left: 88%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: transparent transparent $active-cell-color transparent;
  }

</style>
