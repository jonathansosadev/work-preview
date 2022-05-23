<template>
  <div class="table__thead">
    <div class="table__header table__header--top">
      <div class="table__searchbar">
        <template v-if="hasBackArrow">
          <div class="table__back">
            <button @click="handleBack()">
              <i class="icon-gs-left-circle" />
              <span class="table__back__label">{{ $t_locale('components/cockpit/automation/TableAutomationCampaignHeader')("back") }}</span>
            </button>
          </div>
        </template>
        <Searchbar v-model="search" @searchClick="onSearch(search)" />
      </div>
    </div>
    <div class="table__header table-cockpit-header">
      <TableHeader :style="{ flex: 2 }">
        <!--empty cell-->
      </TableHeader>
      <TableHeader center>
        <LabelSort type="header" v-model="sort" field="totalCampaignsEmail">
          {{ $t_locale('components/cockpit/automation/TableAutomationCampaignHeader')("overallCampaign") }}
          <i class="icon-gs-help table__header--icon" v-tooltip="{ content: $t_locale('components/cockpit/automation/TableAutomationCampaignHeader')('totalCampaignsEmailTooltip') }" />
        </LabelSort>
      </TableHeader>
      <TableHeader center>
        <LabelSort type="header" v-model="sort" field="KPI_automationTotalSent">
          {{ $t_locale('components/cockpit/automation/TableAutomationCampaignHeader')("sent") }}
        </LabelSort>
      </TableHeader>
      <TableHeader center>
        <LabelSort type="header" v-model="sort" field="KPI_automationTotalOpened">
          {{ $t_locale('components/cockpit/automation/TableAutomationCampaignHeader')(textOpenedLead) }}
        </LabelSort>
      </TableHeader>
      <TableHeader center>
        <LabelSort type="header" v-model="sort" field="KPI_automationTotalConverted">
          {{ $t_locale('components/cockpit/automation/TableAutomationCampaignHeader')(textConverted) }}
        </LabelSort>
      </TableHeader>
      <TableHeader v-if="hasAccessToAutomationCost" center>
        <LabelSort type="header" v-model="sort" field="automationCost">
          {{ $t_locale('components/cockpit/automation/TableAutomationCampaignHeader')(textCost) }}
          <i
            class="icon-gs-help table__header--icon"
            v-tooltip="{ content: $t_locale('components/cockpit/automation/TableAutomationCampaignHeader')(tooltipCost, { averageContactCost }) }"
          />
        </LabelSort>
      </TableHeader>
      <TableHeader :style="{ flex: 0.4 }" />
    </div>
  </div>
</template>


<script>
import LabelSort from "~/components/global/LabelSort";
import Searchbar from "~/components/ui/searchbar/Searchbar";
import AutomationCampaign from "~/utils/models/automation-campaign.type";

export default {
  name: 'TableAutomationCampaignHeader',
  components: {
    LabelSort,
    Searchbar,
  },
  props: {
    hasBackArrow: {
      type: Boolean,
      default: false
    },
    initialSearch: {
      type: String,
      default: ''
    },
    campaignType: {
      type: String,
      default: 'AUTOMATION_MAINTENANCE'
    },
    sortCampaign: {
      type: Function,
      required: true,
    },
    onSearch: {
      type: Function,
      required: true,
    },
    handleBack: {
      type: Function,
      required: true,
    },
    selectedGarageId: {
      type: Array,
      default: () => [],
    },
    averageContactCost: {
      type: Number,
      default: 0,
    }
  },

  data() {
    return {
      sort: {
        column: 'KPI_automationTotalConverted',
        order: 'DESC'
      },
      search: this.initialSearch,
    };
  },

  computed: {
    textOpenedLead() {
      return this.campaignType === AutomationCampaign.AUTOMATION_MAINTENANCE ? 'opened': 'lead';
    },
    textConverted() {
      return this.campaignType === AutomationCampaign.AUTOMATION_MAINTENANCE ? 'convertedApv': 'convertedSales';
    },
    textCost() {
      return this.campaignType === AutomationCampaign.AUTOMATION_MAINTENANCE ? 'costApv': 'costSales';
    },
    tooltipCost() {
      if (Array.isArray(this.selectedGarageId) && this.selectedGarageId.length === 1) {
        return this.campaignType === AutomationCampaign.AUTOMATION_MAINTENANCE ? 'tooltipCostApv': 'tooltipCostSales';
      }
      return this.campaignType === AutomationCampaign.AUTOMATION_MAINTENANCE ? 'tooltipCostAverageApv': 'tooltipCostAverageSales';
    },
    hasAccessToAutomationCost() {
      const { email } = this.$store.getters['auth/currentUser'] || {};

      return (
        email.includes('@custeed')
        || email.includes('@garagescore')
      );
    },
  },
  watch: {
    sort(newV, oldV) {
      if ((oldV.column !== newV.column) || (oldV.order !== newV.order)) {
        this.sortCampaign(newV.column, newV.order)
      }
    }
  },
};

</script>

<style lang="scss" scoped>
  .table {

    &__header {

      &--icon {
        color: $grey;
        font-size: .8rem;
        padding-left: .2rem;
      }
    }
  }
</style>
