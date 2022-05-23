<template>
  <div>
    <TableRow>
      <TableRowCell :display="['sm']">
        <AutomationCampaignDetails
          :index="index"
          :tagType="tagType"
          :target="row._id"
          :displayDetails="displayDetails"
        />
      </TableRowCell>
    </TableRow>

    <TableRow border>
      <TableRowCell :style="{ flex: 2 }" :display="['md', 'lg']">
        <AutomationCampaignDetails
          :index="index"
          :tagType="tagType"
          :target="row._id"
          :displayDetails="displayDetails"
        />
      </TableRowCell>

      <TableRowCell center>
        <span>{{ formatNumber(totalRunning) }} / {{ formatNumber(totalCampaigns) }}</span>
      </TableRowCell>

      <TableRowCell center>
        <KPINumber v-if="totalSent" :value="formatNumber(totalSent)" :neutralValue="0" />
        <span v-else>--</span>
      </TableRowCell>

      <TableRowCell center>
        <KPINumber v-if="totalOpened" :value="formatNumber(isMaintenance ? totalOpened: totalLead)" :neutralValue="0" />
        <span v-else>--</span>
        &nbsp;
        <AppText tag="span" size="mds" type="muted" bold>
          ({{ percentageByCampaignType | percentage }})
        </AppText>
      </TableRowCell>

      <TableRowCell center>
        <KPINumber v-if="totalConverted" :value="formatNumber(totalConverted)" :neutralValue="0" :positiveValue="999999"/>
        <span v-else>--</span>
        &nbsp;
        <AppText tag="span" size="mds" type="muted" bold>
            ({{ percentageConverted | percentage }})
        </AppText>
      </TableRowCell>

      <TableRowCell v-if="hasAccessToAutomationCost" center>
        <template v-if="totalCost">
          <KPINumber :value="totalCost" />
          &nbsp;
          <i
            v-if="automationTooltipCost"
            class="icon-gs-help table__header--icon"
            v-tooltip="{ content: $t_locale('components/cockpit/automation/TableAutomationCampaignRow')('tooltipCost')  }"
          />
        </template>
        <span v-else>
          --
          <i
            v-if="automationTooltipCost"
            class="icon-gs-help table__header--icon"
            v-tooltip="{ content: $t_locale('components/cockpit/automation/TableAutomationCampaignRow')('tooltipConsolide')  }"
          />
        </span>
      </TableRowCell>

      <TableRowCell center :style="{ flex: 0.4 }">
        <AutomationHoverShortcut v-bind="AutomationHoverShortcutProps" />
      </TableRowCell>

    </TableRow>
  </div>
</template>

<script>

import ButtonStatus from '~/components/global/ButtonStatus';
import IconLabel from '~/components/global/IconLabel';
import KPINumber from '~/components/ui/KPINumber.vue';
import renderNumber from "~/util/renderNumber";
import AutomationCampaignTypes from '~/utils/models/automation-campaign.type';

import AutomationCampaignDetails from './AutomationCampaignDetails.vue';
import AutomationHoverShortcut from './AutomationHoverShortcut.vue';

export default {
  name: "TableAutomationCampaignRow",
  components: {
    AutomationCampaignDetails,
    AutomationHoverShortcut,
    ButtonStatus,
    KPINumber,
    IconLabel,
  },
  props: {
    row: {
      type: Object,
      default: () => null,
    },
    campaignType: {
      type: String,
      default: "",
    },
    index: {
      type: Number,
      required: true,
    },
    displayDetails: {
      type: Function,
      required: true,
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
      required: true,
    },
    currentUser: {
      type: Object,
      default: () => null,
    },
    customExports: {
      type: Array,
      default: () => [],
    },
    openModalFunction: {
      type: Function,
      required: true,
    },
    openCustomExportModalFunction: {
      type: Function,
      required: true,
    },
    closeModalFunction: {
      type: Function,
      required: true,
    },
    startExportFunction: {
      type: Function,
      required: true,
    },
    saveCustomExportFunction: {
      type: Function,
      required: true,
    },
    updateCustomExportFunction: {
      type: Function,
      required: true,
    },
    deleteCustomExportFunction: {
      type: Function,
      required: true,
    },
    displayPreview: {
      type: Function,
      required: true,
    },
    availableAutomationCampaigns: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return { }
  },

  computed: {
    AutomationHoverShortcutProps() {
      return {
        targetId: this.row._id,
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
        displayPreview: this.displayPreview,
        availableAutomationCampaigns: this.availableAutomationCampaigns,
        garageId: this.row.garageId
      }
    },
    isMaintenance() {
      return this.campaignType === AutomationCampaignTypes.AUTOMATION_MAINTENANCE;
    },
    tagType() {
      if(/NVS/.test(this.row._id)) return 'vn';
      if(/UVS/.test(this.row._id)) return 'vo';
      return 'apv';
    },
    totalRunning() {
      if (this.row.runningEmail > this.row.runningSms) {
        return this.row.runningEmail;
      }
      return this.row.runningSms;
    },
    totalCampaigns() {
      if (this.row.runningEmail > this.row.runningSms) {
        return this.row.totalCampaignsEmail;
      }
      return this.row.totalCampaignsSms;
    },
    totalSent() {
      return this.row.KPI_automationTotalSent;
    },
    totalOpened() {
      return this.row.KPI_automationTotalOpened;
    },
    totalLead() {
      return this.row.KPI_automationTotalLead;
    },
    totalConverted() {
      return this.row.KPI_automationTotalConverted;
    },
    percentageByCampaignType() {
      if (this.isMaintenance && this.totalSent > 0 && this.totalOpened > 0) {
        return (this.totalOpened / this.totalSent) * 100;
      }
      if (this.totalSent > 0 && this.totalLead > 0) {
        return (this.totalLead / this.totalSent) * 100;
      }
      return 0;
    },
    percentageConverted() {
      if (this.isMaintenance && this.totalOpened > 0) {
        return (this.totalConverted / this.totalOpened) * 100;
      }
      if (this.totalLead > 0) {
        return (this.totalConverted / this.totalLead) * 100;
      }
      return 0;
    },
    totalCost() {
      if (!this.row.isConsolidate && this.row.automationCost && this.row.automationCost > 0) {
        return `${this.row.automationCost.toFixed(2)}€`.replace('.', ',');
      }
      return null;
    },
    automationTooltipCost() {
      if (this.row.isConsolidate) {
        return 'tooltipConsolide';
      }
      if (this.row.isLastToggledDate) {
        return 'tooltipCost';
      }
    },
    hasAccessToAutomationCost() {
      const { email } = this.$store.getters['auth/currentUser'] || {};

      return (
        email.includes('@custeed')
        || email.includes('@garagescore')
      );
    },
  },
  methods: {
    manageCampaigns(targetId) {
      this.$router.push({
        name: 'cockpit-automation-campaigns-manage-target',
        params: { target: targetId }
      });
    },
    formatNumber(numb) {
      return renderNumber(Math.max(0, numb));
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
