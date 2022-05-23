<template>
  <div class="table__thead">
    <div class="table__header table__header--top">
      <div class="table__searchbar">
        <Searchbar v-model="search" @input="onSearchInput" @searchClick="onSearch" />
      </div>
    </div>
    <div class="table__header table-cockpit-header">
      <TableHeader class="table-cockpit-header__header" :style="{ flex: 2 }" :display="['md', 'lg']">
        <!-- Empty: first col. for garage details -->
      </TableHeader>
      <TableHeader class="table-cockpit-header__header" center>
        <LabelSort v-model="sort" type="header" field="automationCountCampaigns">
          {{ $t_locale('components/cockpit/automation/TableAutomationGarageHeader')("countCampaigns") }}
          <i class="hover-title" v-tooltip="{ content: $t_locale('components/cockpit/automation/TableAutomationGarageHeader')('totalCampaignsEmailTooltip') }">
            <i class="icon-gs-help" />
          </i>
        </LabelSort>
      </TableHeader>
      <TableHeader class="table-cockpit-header__header" center>
        <LabelSort v-model="sort" type="header" :field="automationCountSent">
          {{ $t_locale('components/cockpit/automation/TableAutomationGarageHeader')("sent") }}
        </LabelSort>
      </TableHeader>
      <TableHeader class="table-cockpit-header__header" center>
        <LabelSort v-model="sort" type="header" :field="automationCountByCampaignType">
          {{ $t_locale('components/cockpit/automation/TableAutomationGarageHeader')(textOpened) }}
        </LabelSort>
      </TableHeader>
      <TableHeader class="table-cockpit-header__header" center>
        <LabelSort v-model="sort" type="header" field="KPI_automationCountConverted">
          {{ $t_locale('components/cockpit/automation/TableAutomationGarageHeader')(textConverted) }}
          <span
            v-if="campaignType !== automationCampaignTypes.AUTOMATION_MAINTENANCE"
            class="hover-title"
            v-tooltip="{ content: $t_locale('components/cockpit/automation/TableAutomationGarageHeader')('tooltip') }"
          >
            <i class="icon-gs-help" />
          </span>
        </LabelSort>
      </TableHeader>
      <TableHeader
        v-if="hasAccessToAutomationCost"
        center
        class="table-cockpit-header__header"
      >
        <LabelSort v-model="sort" type="header" field="automationCost">
          {{ $t_locale('components/cockpit/automation/TableAutomationGarageHeader')(textCost) }}
          <i class="hover-title" v-tooltip="{ content: $t_locale('components/cockpit/automation/TableAutomationGarageHeader')(tooltipCost, { contactCost }) }">
            <i class="icon-gs-help" />
          </i>
        </LabelSort>
      </TableHeader>
    </div>
  </div>
</template>


<script>
import LabelSort from "~/components/global/LabelSort";
import Searchbar from "~/components/ui/searchbar/Searchbar";
import AutomationCampaign from "../../../utils/models/automation-campaign.type";

export default {
  name: 'TableAutomationGarageHeader',
  components: {
    LabelSort,
    Searchbar
  },
  props: {
    initialOrderBy: { type: String, default: 'KPI_automationCountConverted' },
    initialOrder: { type: String, default: 'DESC' },
    initialSearch: { type: String, default: '' },
    campaignType: { type: String, default: 'AUTOMATION_MAINTENANCE' },
    contactCost: { type: Number, default: 0 },
    selectedGarageId: { type: Array, default: () => [] },
  },

  data() {
    return {
      sort: {
        column: this.initialOrderBy,
        order: this.initialOrder
      },
      search: this.initialSearch,
      automationCampaignTypes: AutomationCampaign
    };
  },

  computed: {
    textOpened() {
      return this.campaignType === AutomationCampaign.AUTOMATION_MAINTENANCE ? 'opened': 'lead';
    },
    textConverted() {
      return this.campaignType === AutomationCampaign.AUTOMATION_MAINTENANCE ? 'convertedApv': 'convertedSales';
    },
    automationCountSent() {
      return this.campaignType === AutomationCampaign.AUTOMATION_MAINTENANCE ? 'KPI_automationCountSentMaintenances': 'KPI_automationCountSentSales';
    },
    automationCountByCampaignType() {
      return this.campaignType === AutomationCampaign.AUTOMATION_MAINTENANCE ? 'KPI_automationCountOpenedMaintenances': 'KPI_automationCountLeadSales';
    },
    textCost() {
      return this.campaignType === AutomationCampaign.AUTOMATION_MAINTENANCE ? 'costApv': 'costSales';
    },
    tooltipCost() {
      if (Array.isArray(this.selectedGarageId) && this.selectedGarageId.length === 1) {
        return this.campaignType === AutomationCampaign.AUTOMATION_MAINTENANCE ? 'tooltipCostPriceApv': 'tooltipCostPriceSales';
      }
      return this.campaignType === AutomationCampaign.AUTOMATION_MAINTENANCE ? 'tooltipCostApv': 'tooltipCostSales';
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
    onSearch() {
      this.$emit('onSearch', this.search);
    },
    onSearchInput() {
      this.$emit('onSearchInput', this.search);
    },
  },
  watch: {
    sort(newV, oldV) {
      if ((oldV.column !== newV.column) || (oldV.order !== newV.order)) {
        this.$emit('onSort', { orderBy: newV.column, order: newV.order });
      }
    }
  },
};

</script>
<style lang="scss" scoped>
.hover-title {
  display: inline-block;
  position: relative;
  top: 0.1rem;
  padding-left: .2rem;
  font-size: .8rem;
  color: $grey;
}
</style>
