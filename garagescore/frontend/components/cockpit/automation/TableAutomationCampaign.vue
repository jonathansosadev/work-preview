<template>
  <div class="cockpit-table">
    <div class="cockpit-table__content">
      <Table :rows="rows" :loading="loading" fixed>
        <template slot="header">
          <TableAutomationCampaignHeader v-bind="headerProps"/>
        </template>
        <template slot="header-fixed">
          <TableAutomationCampaignHeader v-bind="headerProps"/>
        </template>
        <template slot="row" slot-scope="{ row, index }">
          <TableAutomationCampaignRow 
            :displayDetails="displayDetails"
            :row="row"
            :campaignType="campaignType"
            :index="index" 
            :shortcutExportPayload="shortcutExportPayload"
            :availableGarages="availableGarages"
            :availablePeriods="availablePeriods"
            :availableFrontDeskUsers="availableFrontDeskUsers"
            :exportGetAvailableFrontDeskUsers="exportGetAvailableFrontDeskUsers"
            :currentUser="currentUser"
            :customExports="customExports"
            :openModalFunction="openModalFunction"
            :openCustomExportModalFunction="openCustomExportModalFunction"
            :closeModalFunction="closeModalFunction"
            :startExportFunction="startExportFunction"
            :saveCustomExportFunction="saveCustomExportFunction"
            :updateCustomExportFunction="updateCustomExportFunction"
            :deleteCustomExportFunction="deleteCustomExportFunction"
            :displayPreview="displayPreview"
            :availableAutomationCampaigns="availableAutomationCampaigns"
            :selectedGarageId="selectedGarageId"
          />
          <TableAutomationCampaignRowDetails
            v-if="showCampaignDetails.includes(row._id)"
            title="EMAIL"
            :row="row" 
            :campaignType="campaignType" 
            :index="index"
          />
          <TableAutomationCampaignRowDetails 
            v-if="showCampaignDetails.includes(row._id)"
            title="MOBILE" 
            :row="row" 
            :campaignType="campaignType" 
            :index="index" 
          />
        </template>
        <template slot="row-loading">
          <TableRowCockpitSkeleton v-for="n in 10" :key="n" :columnCount="6"/>
        </template>
      </Table>
    </div>
  </div>
</template>


<script>
import TableRowCockpitSkeleton from "~/components/global/skeleton/TableRowCockpitSkeleton";
import TableAutomationCampaignHeader from "./TableAutomationCampaignHeader";
import TableAutomationCampaignRow from "./TableAutomationCampaignRow";
import TableAutomationCampaignRowDetails from "./TableAutomationCampaignRowDetails";

export default {
  components: {
    TableAutomationCampaignHeader,
    TableAutomationCampaignRow,
    TableRowCockpitSkeleton,
    TableAutomationCampaignRowDetails
  },

  props: {
    campaignsRows: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
    orderBy: {
      type: String,
      default: "",
    },
    order: {
      type: String,
      default: "",
    },
    search: {
      type: String,
      default: "",
    },
    hasBackArrow: {
      type: Boolean,
      default: false,
    },
    customContents: {
      type: Array,
      default: () => [],
    },
    campaignType: {
      type: String,
      default: "",
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
    selectedGarageId: {
      type: Array,
      default: () => [],
    }
  },

  data() {
    return {
      showCampaignDetails: [],
    };
  },
  computed: {
    rows() {
        return this.campaignsRows.map((campaignRow) => {
          const customContent = this.customContents.find((customContent) => customContent.activeGarageIds.includes(campaignRow.garageId) && customContent.target === campaignRow.target);
          return {
            ...campaignRow,
            customContent
          };
      })
    },
    averageContactCost() {
      return this.rows.length > 0 && this.rows[0].averageContactCost || 0;
    },
    headerProps() {
      return {
        initialSearch: this.search,
        campaignType: this.campaignType,
        sortCampaign: this.sortCampaign,
        onSearch: this.onSearch,
        handleBack: this.handleBack,
        hasBackArrow: this.hasBackArrow,
        selectedGarageId: this.selectedGarageId,
        averageContactCost: this.averageContactCost,
      }
    },
  },

  methods: {
    displayDetails(target) {
      if (this.showCampaignDetails.includes(target)) {
        this.showCampaignDetails = this.showCampaignDetails.filter(campaignTarget => campaignTarget !== target);
      } else {
        this.showCampaignDetails = [...this.showCampaignDetails, target];
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.cockpit-table {
  &__footer {
    margin: 1rem 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
