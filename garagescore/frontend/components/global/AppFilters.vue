<template>
  <div class="app-filters">
    <template v-if="headerFilters">
      <div
        v-if="!hideDataType"
        class="app-filters__part ml-0"
      >
        <OptionsDataTypes
          :availableDataTypes="availableDataTypes"
          class="app-filters__dropdown"
        />
      </div>
      <div
        v-if="showLeadSaleTypes"
        class="app-filters__part ml-0"
      >
        <OptionsLeadSaleTypes
          :availableLeadSaleTypes="availableLeadSaleTypes"
          :currentLeadSaleType="currentLeadSaleType"
          :setCurrentLeadSaleType="setCurrentLeadSaleType"
          class="app-filters__dropdown"
        />
      </div>
      <div
        v-if="showAutomationCampaignType"
        class="app-filters__part ml-0"
      >
        <OptionsAutomationCampaignTypes
          :availableCampaignTypes="availableCampaignTypes"
          class="app-filters__dropdown"
        />
      </div>
    </template>
    <template v-else>
      <template v-if="!loading">
        <div v-if="showCockpitTypes" class="app-filters__part">
          <DropdownCockpitTypes class="app-filters__dropdown"
            :availableCockpitTypes="availableCockpitTypes"
            :currentCockpitType="currentCockpitType"
            :setCurrentCockpitType="setCurrentCockpitType"
          />
        </div>
        <div v-if="showGarage" class="app-filters__part">
          <DropdownGarageFilter
            :userRole="currentUser.role"
            :garages="garagesFilter"
            :availableGarages="availableGarages"
            :openModalCreateTag="openModalCreateTag"
            :openModalUpdateTag="openModalUpdateTag"
            :openModalDeleteTag="openModalDeleteTag"
            :selectedGarageIds="garageIds"
            :applyItemsSelected="applyItemsSelected"
            :optionSelected="optionSelected"
            :setGarageFilterMode="setGarageFilterMode"
            :selectedTags="selectedTags"
            :setSelectedTags="setSelectedTags"
          />
        </div>
        <div v-if="showDMS" class="app-filters__part">
          <DropdownDMS class="app-filters__dropdown"
            :availableDms="availableDms"
            :currentDMS="currentDMS"
            :setCurrentDMS="setCurrentDMS"
          />
        </div>
        <div v-if="showUser" class="app-filters__part">
          <DropdownUser class="app-filters__dropdown"
            :availableUsers="availableUsers"
            :currentUserId="currentUserId"
            :setCurrentUser="setCurrentUser"
          />
        </div>
      <div class="app-filters__part" >
        <DropdownPeriod class="app-filters__dropdown"
          :availablePeriods="availablePeriods"
          :periodId="currentPeriodId"
          :setCurrentPeriod="setCurrentPeriod"
        />
      </div>

      <!-- Export Button -->
      <div
        v-if="showExport"
        class="app-filters__part app-filters__part--right"
      >
        <ButtonExport
          v-if="shortcutExportPayload"
          :availableGarages="availableGarages"
          :availablePeriods="availablePeriods"
          :availableFrontDeskUsers="availableFrontDeskUsers"
          :exportGetAvailableFrontDeskUsers="exportGetAvailableFrontDeskUsers"
          :currentUser="currentUser"
          :shortcutExportPayload="shortcutExportPayload"
          :customExports="customExports"
          :openModalFunction="openModalFunction"
          :openCustomExportModalFunction="openCustomExportModalFunction"
          :closeModalFunction="closeModalFunction"
          :startExportFunction="startExportFunction"
          :saveCustomExportFunction="saveCustomExportFunction"
          :updateCustomExportFunction="updateCustomExportFunction"
          :deleteCustomExportFunction="deleteCustomExportFunction"
          :availableAutomationCampaigns="availableAutomationCampaigns"
          :isAutomation="isAutomation"
          :garageIds="garageIds"
          :selectedTags="selectedTags"
          :optionSelected="optionSelected"
        />
      </div>
    </template>
      <template v-else>
        <div v-if="showCockpitTypes" class="app-filters__part">
          <DropdownMobileSkeleton v-if="isPhoneDevice" />
          <DropdownSkeleton
            v-else
            class="app-filters__dropdown dropdown--cockpit-type"
          />
        </div>
        <div v-if="showGarage" class="app-filters__part">
          <DropdownMobileSkeleton v-if="isPhoneDevice" />
          <DropdownSkeleton
            v-else
            class="app-filters__dropdown dropdown--default"
          />
        </div>
        <div v-if="showDMS" class="app-filters__part">
          <DropdownMobileSkeleton v-if="isPhoneDevice" />
          <DropdownSkeleton
            class="app-filters__dropdown dropdown--dms"
          />
        </div>
        <div v-if="showUser" class="app-filters__part">
          <DropdownMobileSkeleton v-if="isPhoneDevice" />
          <DropdownSkeleton
            v-else
            class="app-filters__dropdown dropdown--default"
          />
        </div>
        <div class="app-filters__part">
          <DropdownMobileSkeleton v-if="isPhoneDevice" />
          <DropdownSkeleton
            v-else
            class="app-filters__dropdown dropdown--default"
          />
        </div>
      </template>
    </template>
  </div>
</template>

<script>
import DropdownCockpitTypes from "~/components/global/DropdownCockpitTypes.vue";
import DropdownDMS from "~/components/global/DropdownDMS.vue";
import DropdownGarageFilter from "~/components/global/DropdownGarageFilter.vue";
import DropdownPeriod from "~/components/global/DropdownPeriod.vue";
import DropdownUser from "~/components/global/DropdownUser.vue";
import ButtonExport from "~/components/global/exports/ButtonExport";
import OptionsAutomationCampaignTypes
  from "~/components/global/OptionsAutomationCampaignTypes.vue";
import OptionsDataTypes from "~/components/global/OptionsDataTypes.vue";
import OptionsLeadSaleTypes from "~/components/global/OptionsLeadSaleTypes.vue";
import DropdownMobileSkeleton
  from "~/components/global/skeleton/DropdownMobileSkeleton";
import DropdownSkeleton
  from "~/components/global/skeleton/DropdownSkeleton.vue";
import { garagesValidator } from '~/utils/components/validators';
import DataTypes from "~/utils/models/data/type/data-types";

export default {
  name: 'AppFilters',
  components: {
    DropdownCockpitTypes,
    DropdownGarageFilter,
    OptionsDataTypes,
    OptionsLeadSaleTypes,
    OptionsAutomationCampaignTypes,
    DropdownPeriod,
    DropdownDMS,
    DropdownUser,
    DropdownSkeleton,
    DropdownMobileSkeleton,
    ButtonExport
  },
  props: {
    // State
    headerFilters: Boolean,
    loading: Boolean,
    // Cockpit
    authorizations: {
      type: Object,
      required: true,
    },
    cockpitType: String,
    currentCockpitType: {
      type: String,
      default: ""
    },
    currentDMS: {
      type: Object,
      default: () => {}
    },
    currentUser: {
      type: Object,
      default: () => ({}),
    },
    currentUserId: {
      type: String,
      default: ''
    },
    garageIds: {
      required: true,
      validator: garagesValidator,
    },
    currentPeriodId: {
      type: String,
      default: ''
    },
    setCurrentCockpitType: {
      type: Function,
      default: () =>({})
    },
    setCurrentDMS: {
      type: Function,
      default: () => console.error('AppFilters.vue :: setCurrentDMS not set')
    },
    setCurrentLeadSaleType: {
      type: Function,
      required: true,
    },
    setCurrentPeriod:{
      type: Function,
      default: () => console.error('AppFilters.vue :: setCurrentPeriod not set')
    },
    setCurrentUser: {
      type: Function,
      default: ()=>console.error('AppFilters.vue :: setCurrentUser not set')
    },
    // Available Data
    availableAutomationCampaigns: {
      type: Array,
      default: () => [],
    },
    availableCampaignTypes: {
      type: Array,
      default: () => [],
    },
    availableDataTypes: {
      type: Array,
      default: () => [],
    },
    availableDms: {
      type: Array,
      default: () => []
    },
    availableFrontDeskUsers: {
      type: Array,
      default: () => [],
    },
    availableGarages: {
      type: Array,
      default: () => [],
    },
    availableLeadSaleTypes: {
      type: Array,
      default: () => [],
    },
    availablePeriods: {
      type: Array,
      default: () => [],
    },
    availableCockpitTypes: {
      type: Array,
      default: () => []
    },
    availableUsers: {
      type: Array,
      default: () => []
    },
    // Export
    customExports: {
      type: Array,
      default: () => [],
    },
    deleteCustomExportFunction: {
      type: Function,
      default: () => console.error('AppFilters.vue :: updateCustomExportFunction not set')
    },
    exportGetAvailableFrontDeskUsers: {
      type: Function,
      default: () => console.error('AppFilters.vue :: exportGetAvailableFrontDeskUsers not set')
    },
    isAutomation: {
      type: Boolean,
      default: false
    },
    openCustomExportModalFunction: {
      type: Function,
      default:() => console.error('AppFilters:vue :: openCustomExportModalFunction not set')
    },
    saveCustomExportFunction: {
      type: Function,
      default: () => console.error('AppFilters.vue :: saveCustomExportFunction not set')
    },
    shortcutExportPayload: {
      type: Object,
      default: () => null,
    },
    startExportFunction: {
      type: Function,
      default: () => console.error('AppFilters.vue :: startExportFunction not set')
    },
    updateCustomExportFunction: {
      type: Function,
      default: () => console.error('AppFilters.vue :: updateCustomExportFunction not set')
    },
    // Modal
    closeModalFunction: {
      type: Function,
      default: () => console.error('AppFilters.vue ::closeModalFunction not set')
    },
    openModalFunction: {
      type: Function,
      default: () => console.error('AppFilters.vue :: openModalFunction not set')
    },
    // Filters
    applyItemsSelected: {
      type: Function,
      default: (garages, tags) => console.error('AppFilters.vue :: applyItemsSelected is not set', garages, tags)
    },
    garagesFilter: {
      type: Array,
      default: () => []
    },
    optionSelected: {
      type: String,
      default: 'garages'
    },
    setGarageFilterMode:{
      type: Function,
      default: () => console.error('AppFilters.vue :: setGarageFilterMode not set')
    },
    openModalCreateTag: {
      type: Function,
      default: (garagesSelected) => console.error('AppFilters.vue :: openModalCreateTag is not set', garagesSelected)
    },
    openModalDeleteTag:{
      type: Function,
      default: (tagName) => console.error('AppFilters.vue :: openModalDeleteTag is not set', tagName)
    },
    openModalUpdateTag:{
      type: Function,
      default: (id, nameTag, garagesSelected) => console.error('AppFilters.vue :: openModalUpdateTag is not set', id, nameTag, garagesSelected)
    },
    selectedTags:{
      type: Array,
      default: () => []
    },
    setSelectedTags: {
      type: Function,
      default: ()=>console.error('AppFilters.vue :: setSelectedTags is not set')
    }
  },
  computed: {
    // cockpit
    cockpitData() {
      return this.$store.state.cockpit;
    },
    cockpitStates() {
      return this.cockpitData.current;
    },
    currentLeadSaleType() {
      return this.cockpitStates.leadSaleType;
    },
    cockpitSelectedData() {
      return {
        garage: this.$store.getters["cockpit/selectedGarage"],
      };
    },
    // routing
    accessRules() {
      return {
        team: this.$store.getters["auth/hasAccessToTeam"],
        eReputation: this.$store.getters["auth/hasAccessToEreputation"],
      };
    },
    hasAccessToTeamSubMenu() {
      return this.accessRules.team;
    },
    isLeadsOrUnsatisfiedDetailPage() {
      return [
        "cockpit-leads-id",
        "cockpit-unsatisfied-id",
      ].includes(this.$route.name);
    },
    // ui
    isPhoneDevice() {
      return this.$mq === 'sm';
    },
    customStyle() {
      return {
        "margin-left": "0",
      }
    },
    showCockpitTypes() {
      return !(
        this.isLeadsOrUnsatisfiedDetailPage
        || this.cockpitData.availableCockpitTypes.length === 1
      );
      // Little hack above to hide it from our customers that only have
      // 1 cockpit type, GS users will have 3 cockpit types anyway
    },
    showGarage() {
      return !(
        /^cockpit-admin/.test(this.$route.name)
        || this.isLeadsOrUnsatisfiedDetailPage
        || (
          /e-reputation/.test(this.$route.name)
          && !this.accessRules.eReputation
        )
      );
    },
    hideDataType() {
      return (
        this.isLeadsOrUnsatisfiedDetailPage
        || /^cockpit-leads/.test(this.$route.name)
        || /^cockpit-admin/.test(this.$route.name)
        || /e-reputation/.test(this.$route.name)
        || /automation/.test(this.$route.name)
        || /analytics/.test(this.$route.name)
        || this.cockpitStates.cockpitType === DataTypes.VEHICLE_INSPECTION
      ); // This one will be removed later
    },
    showLeadSaleTypes() {
      return /^cockpit-leads/.test(this.$route.name);
    },
    showAutomationCampaignType() {
      return (
        /automation/.test(this.$route.name)
        && !/manage/.test(this.$route.name)
      );
    },
    showDMS() {
      return (
        this.hasAccessToTeamSubMenu
        && !this.showUser
        && !this.$route.name.includes('welcome')
        && !this.$route.name.includes('-garages')
        && !this.$route.name.includes("-sources")
        && !this.$route.name.includes('automation')
        && !this.$route.name.includes('e-reputation')
        && !(/^cockpit-admin/.test(this.$route.name))
      );
    },
    showUser() {
      if (/^cockpit-admin/.test(this.$route.name)) return false;
      return (
        this.hasAccessToTeamSubMenu
        && (
          this.$route.name.includes("cockpit-leads")
          || this.$route.name.includes("cockpit-unsatisfied")
        )
        && !this.$route.name.includes("garages")
        && !this.$route.name.includes("sources")
      );
    },
    showExport() {
      const hasEReputation = this.cockpitSelectedData.garage.some(
        g => g.subscriptions?.EReputation === true
      );
      const hideOnWelcome = this.$route.name.includes('welcome');
      const hideOnTicketDetails = this.isLeadsOrUnsatisfiedDetailPage;
      const hideOnAdmin = /^cockpit-admin/.test(this.$route.name);
      let hideOnErep = false;
      if (this.$route.name.includes('e-reputation')) {
        // a cockpit top filter garage is selected, check that the garage has Ereputation subscription
        if(hasEReputation) {
          hideOnErep = !hasEReputation;
        }
        // a cockpit top filter garage is selected, check if at least one garage has Erep
        else {
          hideOnErep = !this.authorizations.hasEReputationAtLeast;
        }
      }
      return !(hideOnWelcome || hideOnTicketDetails || hideOnAdmin || hideOnErep);
    }
  }
};
</script>

<style lang="scss" scoped>
  .ml-0 {
    margin-left: 0;
  }
  .app-filters {
    display: flex;
    align-items: center;
    flex-direction: row;
    width: 100%;

    &__part {
      flex: 1 0 auto; // IE
      display: flex;
      justify-content: center;
      align-items: center;

      &--right {
        flex: 1 0 auto;
        justify-content: flex-end;
      }
    }

    &__dropdown {
      &.dropdown--cockpit-type {
        width: 171px;
      }
      &.dropdown--dms {
        width: 214px;
      }
      &.dropdown--default {
        width: 236px;
      }
      ::v-deep .dropdown__button {
        box-shadow: 0 0 3px 0 rgba(0, 0, 0, 0.16);
        background-color: white;
        box-sizing: border-box;
        border-radius: 20px;
      }
    }
  }

  @media (min-width: $breakpoint-min-md) {
    .app-filters {
      &__part {
        display: flex;
        justify-content: initial;
        align-items: initial;
        flex: initial;

        flex: 0 1 auto;
        min-width: 0;
        max-width: 100%;

        &--right {
          flex: 1 0 auto;
          justify-content: flex-end;
        }

        & + & {
          margin-left: 1rem;
        }
      }

      &__dropdown {
        width: 100%;

        ::v-deep .dropdown-button {
          width: 100%;
        }

        ::v-deep .dropdown {
          width: 100%;
        }
      }
    }
  }
</style>
