<template>
  <div>
    <TableRow>
      <TableRowCell :display="['sm']">
        <GarageDetails
          :index="index"
          :certificateUrl="certifUrl"
          :certificatePublished="!row.hideDirectoryPage"
          :garageId="row.garageId"
		      :externalId="row.externalId"
          :garageName="row.garagePublicDisplayName"
          :hasSubscription="row.garageHasSubscription"
          baseRoute="cockpit-automation"
        />
      </TableRowCell>
    </TableRow>
    <TableRow border>
      <TableRowCell :style="{ flex: 2 }" :display="['md', 'lg']">
        <GarageDetails
          :index="index"
          :certificateUrl="certifUrl"
          :certificatePublished="!row.hideDirectoryPage"
          :garageId="row.garageId"
		      :externalId="row.externalId"
          :garageName="row.garagePublicDisplayName"
          :hasSubscription="row.garageHasSubscription"
          baseRoute="cockpit-automation"
        />
      </TableRowCell>
      <TableRowCell center>
        <template v-if="row.automationCountCampaigns">
          <AppText tag="span" type="muted" bold>
            {{ row.automationCountRunningCampaigns }}/{{ row.automationCountCampaigns }}
          </AppText>
        </template>
        <span v-else>--</span>
      </TableRowCell>
      <TableRowCell center>
        <template v-if="automationCountSent">
          <KPINumber :value="automationCountSent" :neutralValue="0" />
          &nbsp;
        </template>
        <span v-else>--</span>
      </TableRowCell>
      <TableRowCell center>
        <template v-if="isAutomationMaintenance && automationCountOpened">
          <KPINumber :value="automationCountOpened" :neutralValue="0" />
          &nbsp;
          <AppText tag="span" size="mds" type="muted" bold>
           ({{ automationPctOpened | percentage }})
          </AppText>
        </template>
        <template v-else-if="!isAutomationMaintenance && automationCountLead">
          <KPINumber :value="automationCountLead" :neutralValue="0" />
          &nbsp;
          <AppText tag="span" size="mds" type="muted" bold>
            ({{ automationPctLead | percentage }})
          </AppText>
        </template>
        <span v-else>--</span>
      </TableRowCell>
      <TableRowCell center>
        <template v-if="automationCountConverted">
          <KPINumber :value="automationCountConverted" :neutralValue="0" />
          &nbsp;
          <AppText tag="span" size="mds" type="muted" bold>
            ({{ automationPctConverted | percentage }})
          </AppText>
          <span
            v-if="displayTooltip"
            class="hover-title"
            v-tooltip="{ content: $t_locale('components/cockpit/automation/TableAutomationGarageRow')('tooltip') }"
          >
            <i class="icon-gs-help" />
          </span>
        </template>
        <span v-else>--</span>
      </TableRowCell>
      <TableRowCell v-if="hasAccessToAutomationCost" center>
        <template v-if="AutomationTotalCost">
          <KPINumber :value="AutomationTotalCost" :neutralValue="0"/>
          &nbsp;
          <i
            v-if="automationTooltipCost"
            class="icon-gs-help table__header--icon"
            v-tooltip="{ content: $t_locale('components/cockpit/automation/TableAutomationGarageRow')('tooltipCost') }"
          />
        </template>
        <span v-else>
          --
          <i
            v-if="automationTooltipCost"
            class="icon-gs-help table__header--icon"
            v-tooltip="{ content: $t_locale('components/cockpit/automation/TableAutomationGarageRow')('tooltipConsolide') }"
          />
        </span>
      </TableRowCell>
    </TableRow>
  </div>
</template>

<script>
import GarageTypes from "../../../../common/models/garage.type.js";
import KPINumber from "~/components/ui/KPINumber.vue";
import GarageDetails from "~/components/global/GarageDetails";
import AutomationCampaignTypes from "../../../utils/models/automation-campaign.type";

export default {
  name: "TableAutomationGarageRow",
  components: {
    KPINumber,
    GarageDetails
  },
  props: {
    row: Object,
    index: Number,
    campaignType: String,
  },

  computed: {
    isAutomationMaintenance() {
      return this.campaignType === AutomationCampaignTypes.AUTOMATION_MAINTENANCE;
    },
    certifUrl() {
      const cockpitType = this.$store.state.cockpit.current.cockpitType;
      return `${this.$store.getters["wwwUrl"]}/${GarageTypes.getSlug(cockpitType)}/${this.row.garageSlug}`;
    },
    automationCountSent() {
      return (this.row.KPI_automationCountSentMaintenances || 0) + (this.row.KPI_automationCountSentSales || 0);
    },
    automationCountOpened() {
      return (this.row.KPI_automationCountOpenedMaintenances || 0)
    },
    automationCountLead() {
      return (this.row.KPI_automationCountLeadSales || 0)
    },
    automationCountConverted() {
      return (this.row.KPI_automationCountConvertedMaintenances || 0) + (this.row.KPI_automationCountConvertedSales || 0);
    },
    automationPctOpened() {
      return this.automationCountSent > 0 ? (this.automationCountOpened/this.automationCountSent) * 100 : 0;
    },
    automationPctLead() {
      return this.automationCountSent > 0 ? (this.automationCountLead/this.automationCountSent) * 100 : 0;
    },
    automationPctConverted() {
      if (this.isAutomationMaintenance) {
        return this.automationCountOpened > 0 ? (this.automationCountConverted/this.automationCountOpened) * 100 : 0;
      }
      return this.automationCountLead > 0 ? (this.automationCountConverted/this.automationCountLead) * 100 : 0;
    },
    displayTooltip() {
      return !this.isAutomationMaintenance && this.automationCountConverted > this.automationCountLead;
    },
    AutomationTotalCost() {
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
  }
};
</script>
<style lang="scss" scoped>
.hover-title {
  position: relative;
  top: 2px;
  padding-left: .3rem;
  font-size: .85rem;
  color: $grey;
}
</style>
