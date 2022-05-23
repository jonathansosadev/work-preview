<template>
  <NavigationDataProvider
    :onDataReady="mergeNavigationDataToInstance"
    :onDataUpdate="mergeNavigationDataToInstance"
  >
    <template #default="{ navigationDataProvider, isLoading }">
      <div
      
        v-if="!isLoading"
        :class="classBinding"
        class="base-layout"
      >
        <div
          v-if="isSidebarOpen"
          @click="hideAside"
          class="base-layout__aside-bg"
        />
        <div :class="asideClassBinding" class="base-layout__aside">
          <CockpitSidebar
            :accessRules="sidebarAccessRules"

            :authorizations="navigationDataProvider.authorizations"
            :canAccessToAutomation="navigationDataProvider.canAccessToAutomation"
            :canSubscribeToCrossLeads="canSubscribeToCrossLeads"

            :setFromRowClick="setFromRowClick"

            :availableFrontDeskUsers="availableFrontDeskUsers"
            :availableGarages="availableGarages"

            :availableAutomationCampaigns="availableAutomationCampaigns"
            :automationCampaignType="automationCampaignType"
            :cockpitType="navigationDataProvider.cockpitType"
            :currentUser="currentUser"
            :currentUserIsGarageScoreUser="currentUserIsGarageScoreUser"
            :dataTypeId="navigationDataProvider.dataTypeId"
            :garageIds="navigationDataProvider.garageIds"
            :locale="navigationDataProvider.locale"
            :periodId="navigationDataProvider.periodId"
            :route="storeRoute"

            :selectedGarage="selectedGarage"

            :closeModalFunction="closeModalFunction"
            :openModalFunction="openModalFunction"

            :customExports="customExports"
            :deleteCustomExportFunction="deleteCustomExportFunction"
            :exportGetAvailableFrontDeskUsers="exportGetAvailableFrontDeskUsers"
            :openCustomExportModalFunction="openCustomExportModalFunction"
            :saveCustomExportFunction="saveCustomExportFunction"
            :startExportFunction="startExportFunction"
            :updateCustomExportFunction="updateCustomExportFunction"

            :jobsByCockpitType="jobsByCockpitType"

            :hasSidebarSubmenu="hasSidebarSubmenu"
            :sidebarTiny="sidebarTiny"
            :toggleSidebar="toggleSidebar"
            :optionSelected="optionSelected"
            :selectedTags="navigationDataProvider.selectedTags"
          />
        </div>
        <div class="base-layout__header">
          <CockpitHeader
            :adminData="adminData"
            :onConnectAs="connectAs"

            :authorizations="navigationDataProvider.authorizations"
            :hasAccessToDarkBo="hasAccessToDarkBo"
            :hasAccessToEreputation="hasAccessToEreputation"
            :hasAccessToGreyBo="hasAccessToGreyBo"

            :availableCampaignTypes="availableCampaignTypes"
            :availableCockpitTypes="availableCockpitTypes"
            :availableDataTypes="availableDataTypes"
            :availableDms="availableDms"
            :availableGarages="availableGarages"
            :availableLeadSaleTypes="availableLeadSaleTypes"
            :availablePeriods="availablePeriods"
            :availableUsers="availableUsers"

            :currentDMS="currentDMS"
            :currentCockpitType="currentCockpitType"
            :currentUser="currentUser"
            :currentUserId="currentUserId"
            :garageIds="navigationDataProvider.garageIds"
            :periodId="navigationDataProvider.periodId"
            :setCurrentCockpitType="setCurrentCockpitType"
            :setCurrentDMS="setCurrentDMS"
            :setCurrentPeriod="setCurrentPeriod"
            :setCurrentUser="setCurrentUser"
            :setCurrentLeadSaleType="setCurrentLeadSaleType"

            :closeModalFunction="closeModalFunction"
            :openModalFunction="openModalFunction"

            :customExports="customExports"
            :deleteCustomExportFunction="deleteCustomExportFunction"
            :openCustomExportModalFunction="openCustomExportModalFunction"
            :saveCustomExportFunction="saveCustomExportFunction"
            :shortcutExportPayload="shortcutExportPayload"
            :startExportFunction="startExportFunction"
            :updateCustomExportFunction="updateCustomExportFunction"

            :applyItemsSelected="applySelectedItems"
            :optionSelected="optionSelected"
            :isFilterVisible="isFilterVisible"
            :setGarageFilterMode="setGarageFilterMode"
            :openModalCreateTag="openModalCreateTag"
            :openModalUpdateTag="openModalUpdateTag"
            :openModalDeleteTag="openModalDeleteTag"
            :selectedTags="navigationDataProvider.selectedTags"
            :setSelectedTags="navigationDataProvider.setTagsSelected"
          />
        </div>
        <div class="base-layout__main" :class="mainClass">
          <div
            v-show="areFiltersVisible"
            id="filters-inside"
            :class="filtersClass"
            class="subheader"
          >
            <AppFilters
              v-if="areFiltersVisible"
              :loading="loading"

              :availableAutomationCampaigns="availableAutomationCampaigns"
              :availableCockpitTypes="availableCockpitTypes"
              :availableDms="availableDms"
              :availableGarages="availableGarages"
              :availablePeriods="availablePeriods"
              :availableFrontDeskUsers="availableFrontDeskUsers"
              :availableUsers="availableUsers"

              :authorizations="navigationDataProvider.authorizations"
              :currentCockpitType="currentCockpitType"
              :currentDMS="currentDMS"
              :currentPeriodId="navigationDataProvider.periodId"
              :currentUser="currentUser"
              :currentUserId="currentUserId"
              :garageIds="navigationDataProvider.garageIds"
              :setCurrentCockpitType="setCurrentCockpitType"
              :setCurrentUser="setCurrentUser"
              :setCurrentPeriod="setCurrentPeriod"
              :setCurrentDMS="setCurrentDMS"
              :setCurrentLeadSaleType="setCurrentLeadSaleType"

              :closeModalFunction="closeModalFunction"
              :openModalFunction="openModalFunction"

              :customExports="customExports"
              :deleteCustomExportFunction="deleteCustomExportFunction"
              :exportGetAvailableFrontDeskUsers="exportGetAvailableFrontDeskUsers"
              :openCustomExportModalFunction="openCustomExportModalFunction"
              :saveCustomExportFunction="saveCustomExportFunction"
              :shortcutExportPayload="shortcutExportPayload"
              :startExportFunction="startExportFunction"
              :updateCustomExportFunction="updateCustomExportFunction"
              :isAutomation="isAutomation"

              :garagesFilter="garagesFilter"
              :openModalCreateTag="openModalCreateTag"
              :openModalUpdateTag="openModalUpdateTag"
              :openModalDeleteTag="openModalDeleteTag"
              :applyItemsSelected="applySelectedItems"
              :optionSelected="optionSelected"
              :setGarageFilterMode="setGarageFilterMode"
              :selectedTags="navigationDataProvider.selectedTags"
              :setSelectedTags="navigationDataProvider.setTagsSelected"
            />
          </div>
          <NuxtChild
            :modalMixin="modalMixin"
            :navigationDataProvider="navigationDataProvider"
          />
        </div>
        <ModalWrapper
          :adaptive="modalMixin.adaptive"
          :fullScreen="modalMixin.fullScreen"
          :modalComponent="modalMixin.component"
          :modalProps="modalMixin.props"
        />
        <ServiceWorker />
      </div>
    </template>
  </NavigationDataProvider>
</template>

<script>
import fieldsHandler
  from '../../common/lib/garagescore/cockpit-exports/fields/fields-handler';

import CockpitHeader from "~/components/cockpit/CockpitHeader.vue";
import CockpitSidebar from "~/components/cockpit/CockpitSidebar.vue";
import NavigationDataProvider
  from '~/components/cockpit/NavigationDataProvider/index.vue';
import AppFilters from "~/components/global/AppFilters.vue";
import ModalWrapper from '~/components/global/ModalWrapper';
import ModalMixin from '~/mixins/ModalMixin/index.js';
import gtagAnalytics from '~/util/externalScripts/gtag-analytics';
import userTracking from '~/util/externalScripts/user-tracking';
import {
  ExportTypes,
  ShortcutExportTypes,
  ExportFrequencies
} from '~/utils/enumV2';
import { setupPeriodsForPrefill } from '~/utils/exports/period';
import CampaignTypes from '~/utils/models/automation-campaign.type';
import DataTypes from '~/utils/models/data/type/data-types';
import GarageTypes from '~/utils/models/garage.type';
import { sortArrayObject } from '~/util/arrayTools.js';
import { salesEnum } from '~/utils/models/types.js';
import { makeApolloQueries } from "~/util/graphql";

function getUnixTime(date) {
  const unixDate = new Date(date);
  return (unixDate.getTime() / 1000) | 0;
}

export default {
  components: {
    AppFilters,
    CockpitSidebar,
    CockpitHeader,
    ModalWrapper,
    NavigationDataProvider,
  },
  layout: 'cockpit-middleware',
  mixins: [ModalMixin],
  middleware: ["redirectRootCockpit"],

  data() {
    return {
      navigationData: null,
      availableAutomationCampaigns: []
    }
  },

  async mounted() {
    const user = this.$store.state.auth.currentUser;
    this.identifyCurrentUser(this.$store);
    // Set view from localStorage for chart components
    this.$store.dispatch('cockpit/initChartComponentsView');
    this.$store.dispatch('cockpit/fetchCustomExports');

    //--- GA4 Tracking
    gtagAnalytics(
      process.env.gaMeasurementCockpitID,
      {
        send_page_view: false,
        onGtagConfigured: this.trackGoogleAnalytics4
      },
    );
    // Don't send info to userTracking if backdoor
    if (!this.getAuthDataByName('isBackdoor')) {
      userTracking(process.env.publicAPIUrl, user.id);
    }
    if (this.currentUser.hasAccessToAutomation) {
      await this.fetchAvailableTargets();
    }

    // initiliaze stonly widget
    try {
      window.STONLY_WID = "cc1b35f7-9b0f-11ec-9fb8-0ae9fa2a18a2";
      !function(s,t,o,n,l,y,w,g){s.StonlyWidget||((w=s.StonlyWidget=function(){
      w._api?w._api.apply(w,arguments):w.queue.push(arguments)}).scriptPath=n,w.queue=[],(y=t.createElement(o)).async=!0,
      (g=new XMLHttpRequest).open("GET",n+"version?v="+Date.now(),!0),g.onreadystatechange=function(){
      4===g.readyState&&(y.src=n+"stonly-widget.js?v="+(200===g.status?g.responseText:Date.now()),
      (l=t.getElementsByTagName(o)[0]).parentNode.insertBefore(y,l))},g.send())
      }(window,document,"script","https://stonly.com/js/widget/v2/");
    } catch (e) {
      console.error("[STRONLY WIDGET] error ", e);
    }


    // lol masters
    this.lolMasters(user);
  },

  computed: {
    adminData() {
      return this.$store.state.cockpit.admin;
    },
    asideClassBinding() {
      return {
        "base-layout__aside--open": this.$store.state.sidebarOpen
      };
    },
    automationCampaignType() {
      return this.$store.state.cockpit.current.automationCampaignType;
    },
    canSubscribeToCrossLeads() {
      return this.$store.getters["cockpit/canSubscribeToCrossLeads"];
    },
    cockpitType() {
      return this.$store.state.cockpit.current.cockpitType;
    },
    isSidebarOpen() {
      return this.$store.state.sidebarOpen;
    },
    isFilterVisible() {
      return this.$store.getters['isFiltersVisible'];
    },
    classBinding() {
      return {
        "base-layout--tiny": this.$store.getters["sidebarTiny"]
      };
    },
    mainClass() {
      return this.$route.name.match(/welcome/)
        ? "base-layout__main--grey"
        : "";
    },
    sidebarOpen() {
      return this.$store.state.sidebarOpen;
    },
    loading() {
      return this.$store.getters["cockpit/isFiltersLoading"];
    },
    hasAccessToDarkBo() {
      return this.getAuthDataByName('hasAccessToDarkbo');
    },
    hasAccessToEreputation() {
      return this.getAuthDataByName('hasAccessToEreputation');
    },
    hasAccessToGreyBo() {
      return this.getAuthDataByName('hasAccessToGreybo');
    },
    isVehicleInspection() {
      return this.cockpitType === GarageTypes.VEHICLE_INSPECTION;
    },
    availableDataTypes() {
      const dataTypes = [
        {
          key: "allServices",
          id: null,
          label: "allServices"
        },
        {
          key: DataTypes.MAINTENANCE,
          id: DataTypes.MAINTENANCE,
          label: DataTypes.MAINTENANCE
        },
        {
          key: DataTypes.NEW_VEHICLE_SALE,
          id: DataTypes.NEW_VEHICLE_SALE,
          label: DataTypes.NEW_VEHICLE_SALE
        },
        {
          key: DataTypes.USED_VEHICLE_SALE,
          id: DataTypes.USED_VEHICLE_SALE,
          label: DataTypes.USED_VEHICLE_SALE
        },
      ];
      if (this.isAnalytics) {
        return dataTypes.filter(({ key }) => key !== "allServices");
      }
      return dataTypes;
    },
    availableLeadSaleTypes() {
      if (this.isVehicleInspection) {
        return [
          ...this.availableDataTypes.filter(
            (type) => type.key !== DataTypes.MAINTENANCE
          ),
          {
            id: DataTypes.UNKNOWN,
            key: DataTypes.UNKNOWN,
            label: DataTypes.UNKNOWN
          }
        ]
      }
      return [
        ...this.availableDataTypes,
        {
          id: DataTypes.UNKNOWN,
          key: DataTypes.UNKNOWN,
          label: DataTypes.UNKNOWN
        }
      ]
    },
    availableCampaignTypes() {
      if (this.isVehicleInspection) {
        return [];
      }
      return [
        {
          id: CampaignTypes.AUTOMATION_MAINTENANCE,
          key: CampaignTypes.AUTOMATION_MAINTENANCE,
          label: CampaignTypes.AUTOMATION_MAINTENANCE,
        },
        {
          id: CampaignTypes.AUTOMATION_VEHICLE_SALE,
          key: CampaignTypes.AUTOMATION_VEHICLE_SALE,
          label: CampaignTypes.AUTOMATION_VEHICLE_SALE,
        },
      ];
    },
    availableCockpitTypes() {
      return this.$store.state.cockpit.availableCockpitTypes;
    },
    availableGarages() {
      return this.$store.getters['cockpit/availableGarages'];
    },
    availablePeriods() {
      return this.$store.getters['cockpit/availablePeriods'];
    },
    isWelcome() {
      return this.$route.name.includes("cockpit-welcome");
    },
    isAutomation() {
      return this.$route.name.includes('automation');
    },
    isAnalytics() {
      return this.$route.name.includes('analytics');
    },
    areFiltersVisible() {
      const {
        $route: { name: routeName } = {},
        $store,
        navigationData: {
          authorizations,
        },
      } = this;
      const hasEReputationAtLeast = authorizations.hasEReputationAtLeast;
      const isEreputationRoute = routeName.includes('e-reputation');
      const hideOnErep = isEreputationRoute && !hasEReputationAtLeast;

      return hideOnErep ? false : $store.getters['isFiltersVisible'];
    },
    filtersClass() {
      return this.$store.getters["cockpit/isFiltersLoading"]
        ? "subheader__loading"
        : "";
    },
    currentUserIsGarageScoreUser() {
      return !!this.$store.getters['auth/isGaragescoreUser'];
    },
    currentUser() {
      return this.$store.getters['auth/currentUser'];
    },
    selectedDataType() {
      return this.$store.getters['cockpit/selectedDataType'];
    },
    selectedLeadSaleType() {
      return this.$store.getters['cockpit/selectedLeadSaleType']
    },
    selectedGarage() {
      return this.$store.getters["cockpit/selectedGarage"];
    },
    // TODO selectedGarageId | garageIds
    selectedGarageId() {
      return this.$store.getters['cockpit/selectedGarageId'];
    },
    selectedPeriodId() {
      return this.$store.getters['cockpit/selectedPeriod'];
    },
    selectedFrontDeskUser() {
      return this.$store.getters['cockpit/selectedFrontDeskUserName'];
    },
    selectedFrontDeskUserCusteed() {
      return this.$store.getters['cockpit/selectedUser'];
    },
    sidebarTiny(){
      return this.$store.getters['sidebarTiny'];
    },
    jobsByCockpitType() {
      const cockpitType = this.$store.state.cockpit.current.cockpitType;
      return this.$store.getters["profile/jobsByCockpitType"](cockpitType) || [];
    },
    customExports() {
      return this.$store.getters["cockpit/customExports"];
    },
    selectedCampaignType() {
      return this.$store.getters['cockpit/selectedAutomationCampaignType'];
    },
    modalExportsProps() {
      return {
        availableGarages: this.availableGarages,
        availableFrontDeskUsers: this.availableFrontDeskUsers,
        closeModalFunction: this.closeModalFunction,
        currentUser: this.currentUser,
        customExports: this.customExports,
        deleteCustomExportFunction: this.deleteCustomExportFunction,
        exportGetAvailableFrontDeskUsers: this.exportGetAvailableFrontDeskUsers,
        openModalFunction: this.openModalFunction,
        openCustomExportModalFunction: this.openCustomExportModalFunction,
        saveCustomExportFunction: this.saveCustomExportFunction,
        startExportFunction: this.startExportFunction,
        updateCustomExportFunction: this.updateCustomExportFunction,
      };
    },
    routeName() {
      const { $route } = this;
      return $route?.name || '';
    },
    storeRoute() {
      return this.$store.state.route;
    },
    shortcutExportPayload() {
      const isSatisfactionGaragesRoute = this.routeName === 'cockpit-satisfaction-garages';
      const isSatisfactionTeamRoute = this.routeName === 'cockpit-satisfaction-team';
      const isSatisfactionReviewsRoute = this.routeName === 'cockpit-satisfaction-reviews';
      const isUnsatisfiedGaragesRoute = this.routeName === 'cockpit-unsatisfied-garages';
      const isUnsatisfiedTeamRoute = this.routeName === 'cockpit-unsatisfied-team';
      const isUnsatisfiedReviewsRoute = this.routeName === 'cockpit-unsatisfied-reviews';
      const isContactsGaragesRoute = this.routeName === 'cockpit-contacts-garages';
      const isContactsTeamRoute = this.routeName === 'cockpit-contacts-team';
      const isContactsReviewsRoute = this.routeName === 'cockpit-contacts-reviews';
      const isEReputationGaragesRoute = this.routeName === 'cockpit-e-reputation-garages';
      const isEReputationReviewsRoute = this.routeName === 'cockpit-e-reputation-reviews';
      const isAutomationCampaignsRoute = this.$route.name === 'cockpit-automation-campaigns'
      let garageIdsTemp = this.selectedGarageId || 'All';
      garageIdsTemp =  Array.isArray(garageIdsTemp) ? garageIdsTemp : [garageIdsTemp]
      if (isSatisfactionGaragesRoute) {
        return {
          dataTypes: [this.selectedDataType || 'All'],
          exportType: ExportTypes.GARAGES,
          fields: fieldsHandler.getFieldsByShortcutExportType(
            ShortcutExportTypes.SATISFACTION_GARAGES
          ),
          frequency: ExportFrequencies.NONE,
          garageIds: garageIdsTemp,
          ...setupPeriodsForPrefill(this.selectedPeriodId),
        };
      }
      if (isSatisfactionTeamRoute) {
        return {
          dataTypes: [this.selectedDataType || 'All'],
          exportType: ExportTypes.FRONT_DESK_USERS_DMS,
          fields: fieldsHandler.getFieldsByShortcutExportType(
            ShortcutExportTypes.SATISFACTION_FRONT_DESK_USERS
          ),
          frequency: ExportFrequencies.NONE,
          frontDeskUsers: (
            this.selectedFrontDeskUser && this.selectedFrontDeskUser !== 'ALL_USERS'
              ? [{
                id: this.selectedFrontDeskUser,
                frontDeskUserName : this.selectedFrontDeskUser,
                // TODO selectedGarageId
                garageId : this.selectedGarageId
              }]
              : [{ id : 'All', frontDeskUserName : 'All', garageId : null }]
          ),
          garageIds: garageIdsTemp,
          ...setupPeriodsForPrefill(this.selectedPeriodId),
        };
      }
      if (isSatisfactionReviewsRoute) {
        return {
          dataTypes: [this.selectedDataType || 'All'],
          exportType: ExportTypes.SATISFACTION,
          garageIds: garageIdsTemp,
          fields: fieldsHandler.getFieldsByShortcutExportType(
            ShortcutExportTypes.SATISFACTION_REVIEWS
          ),
          frequency: ExportFrequencies.NONE,
          ...setupPeriodsForPrefill(this.selectedPeriodId),
        };
      }
      if (isUnsatisfiedGaragesRoute) {
        return {
          dataTypes: [this.selectedDataType || 'All'],
          exportType: ExportTypes.GARAGES,
          garageIds: garageIdsTemp,
          fields: fieldsHandler.getFieldsByShortcutExportType(
            ShortcutExportTypes.UNSATISFIED_GARAGES
          ),
          frequency: ExportFrequencies.NONE,
          ...setupPeriodsForPrefill(this.selectedPeriodId),
        };
      }

      if (isUnsatisfiedTeamRoute) {
        let prefilledFrontDeskUsers = [{
          id : 'All',
          frontDeskUserName : 'All',
          garageId : null,
        }];
        const hasGarageSelected = this.selectedGarageId;
        const isNotAllUsers = this.selectedFrontDeskUserCusteed !== 'ALL_USERS';
        // TODO replace SelectedGarageId
        if (hasGarageSelected && isNotAllUsers) {
          prefilledFrontDeskUsers = [
            {
              id: this.selectedFrontDeskUserCusteed,
              frontDeskUserName : this.selectedFrontDeskUserCusteed,
              garageId : this.selectedGarageId
            }
          ];
        }

        return {
          dataTypes: [this.selectedDataType || 'All'],
          exportType: ExportTypes.FRONT_DESK_USERS_CUSTEED,
          garageIds: garageIdsTemp,
          fields: fieldsHandler.getFieldsByShortcutExportType(
            ShortcutExportTypes.UNSATISFIED_FRONT_DESK_USERS
          ),
          frequency: ExportFrequencies.NONE,
          frontDeskUsers: prefilledFrontDeskUsers,
          ...setupPeriodsForPrefill(this.selectedPeriodId),
        };
      }

      if (isUnsatisfiedReviewsRoute) {
        return {
          dataTypes: [this.selectedDataType || 'All'],
          exportType: ExportTypes.UNSATISFIED,
          garageIds: garageIdsTemp,
          fields: fieldsHandler.getFieldsByShortcutExportType(
            ShortcutExportTypes.UNSATISFIED_REVIEWS,
            [this.selectedDataType || 'All'],
            this.isVehicleInspection
          ),
          frequency: ExportFrequencies.NONE,
          ...setupPeriodsForPrefill(this.selectedPeriodId),
        };
      }

      if (this.$route.name === 'cockpit-leads-garages') {
        return {
          dataTypes: Object.values(salesEnum).includes(this.selectedLeadSaleType) ? [this.selectedLeadSaleType] : ['All'],
          exportType: ExportTypes.GARAGES,
          garageIds: garageIdsTemp,
          fields: fieldsHandler.getFieldsByShortcutExportType(
            ShortcutExportTypes.LEADS_GARAGES
          ),
          frequency: ExportFrequencies.NONE,
          ...setupPeriodsForPrefill(this.selectedPeriodId),
        };
      }

      if (this.$route.name === 'cockpit-leads-team') {
        let prefilledFrontDeskUsers = [{
           id : 'All',
           frontDeskUserName : 'All',
           garageId : null
        }];

        if (
          this.selectedGarageId
          && this.selectedFrontDeskUserCusteed
          && this.selectedFrontDeskUserCusteed !== 'ALL_USERS'
        ) {
          prefilledFrontDeskUsers = [{
            id: this.selectedFrontDeskUserCusteed,
            frontDeskUserName : this.selectedFrontDeskUserCusteed,
            garageId : this.selectedGarageId
          }];
        }
        return {
          dataTypes: Object.values(salesEnum).includes(this.selectedLeadSaleType) ? [this.selectedLeadSaleType] : ['All'],
          exportType: ExportTypes.FRONT_DESK_USERS_CUSTEED,
          garageIds: garageIdsTemp,
          fields: fieldsHandler.getFieldsByShortcutExportType(
            ShortcutExportTypes.LEADS_FRONT_DESK_USERS
          ),
          frequency: ExportFrequencies.NONE,
          frontDeskUsers: prefilledFrontDeskUsers,
          ...setupPeriodsForPrefill(this.selectedPeriodId),
        };
      }

      if (this.$route.name === 'cockpit-leads-reviews') {
        return {
          dataTypes: Object.values(salesEnum).includes(this.selectedLeadSaleType) ? [this.selectedLeadSaleType] : ['All'],
          exportType: ExportTypes.LEADS,
          garageIds: garageIdsTemp,
          fields: fieldsHandler.getFieldsByShortcutExportType(
            ShortcutExportTypes.LEADS_REVIEWS
          ),
          frequency: ExportFrequencies.NONE,
          ...setupPeriodsForPrefill(this.selectedPeriodId),
        };
      }

      if (this.$route.name === 'cockpit-leads-followed') {
        return {
          dataTypes: Object.values(salesEnum).includes(this.selectedLeadSaleType) ? [this.selectedLeadSaleType] : ['All'],
          exportType: ExportTypes.FORWARDED_LEADS,
          garageIds: garageIdsTemp,
          fields: fieldsHandler.getFieldsByShortcutExportType(
            ShortcutExportTypes.LEADS_FORWARDED_REVIEWS
          ),
          frequency: ExportFrequencies.NONE,
          ...setupPeriodsForPrefill(this.selectedPeriodId),
        };
      }

      if (isContactsGaragesRoute) {
        return {
          dataTypes: [this.selectedDataType || 'All'],
          exportType: ExportTypes.GARAGES,
          garageIds: garageIdsTemp,
          fields: fieldsHandler.getFieldsByShortcutExportType(
            ShortcutExportTypes.CONTACTS_GARAGES
          ),
          frequency: ExportFrequencies.NONE,
          ...setupPeriodsForPrefill(this.selectedPeriodId),
        };
      }

      if (isContactsTeamRoute) {
        return {
          dataTypes: [this.selectedDataType || 'All'],
          exportType: ExportTypes.FRONT_DESK_USERS_DMS,
          garageIds: garageIdsTemp,
          fields: fieldsHandler.getFieldsByShortcutExportType(
            ShortcutExportTypes.CONTACTS_FRONT_DESK_USERS
          ),
          frequency: ExportFrequencies.NONE,
          // Check for issue with garageId / garageIds
          frontDeskUsers: (
            (this.selectedFrontDeskUser && this.selectedFrontDeskUser !== 'ALL_USERS')
              ? [{
                id: this.selectedFrontDeskUser,
                frontDeskUserName : this.selectedFrontDeskUser,
                garageId : this.selectedGarageId
              }]
              : [{ id : 'All', frontDeskUserName : 'All', garageId : null }]
          ),
          ...setupPeriodsForPrefill(this.selectedPeriodId),
        };
      }

      if (isContactsReviewsRoute) {
        return {
          dataTypes: [this.selectedDataType || 'All'],
          exportType: ExportTypes.CONTACTS,
          garageIds: garageIdsTemp,
          fields: fieldsHandler.getFieldsByShortcutExportType(
            ShortcutExportTypes.CONTACTS_REVIEWS
          ),
          frequency: ExportFrequencies.NONE,
          ...setupPeriodsForPrefill(this.selectedPeriodId),
        };
      }

      if (isEReputationGaragesRoute) {
        return {
          dataTypes: [this.selectedDataType || 'All'],
          exportType: ExportTypes.GARAGES,
          garageIds: garageIdsTemp,
          fields: fieldsHandler.getFieldsByShortcutExportType(
            ShortcutExportTypes.EREPUTATION_GARAGES
          ),
          frequency: ExportFrequencies.NONE,
          ...setupPeriodsForPrefill(this.selectedPeriodId),
        };
      }

      if (isEReputationReviewsRoute) {
        return {
          dataTypes: [this.selectedDataType || 'All'],
          exportType: ExportTypes.EREPUTATION,
          garageIds: garageIdsTemp,
          fields: fieldsHandler.getFieldsByShortcutExportType(
            ShortcutExportTypes.EREPUTATION_REVIEWS
          ),
          frequency: ExportFrequencies.NONE,
          ...setupPeriodsForPrefill(this.selectedPeriodId),
        };
      }

      if (isAutomationCampaignsRoute) {
        return {
          dataTypes: [this.selectedDataType || 'All'],
          exportType: ExportTypes.AUTOMATION_RGPD,
          garageIds: garageIdsTemp,
          fields: fieldsHandler.getFieldsByShortcutExportType(
            ShortcutExportTypes.AUTOMATION_RGPD
          ),
          frequency: ExportFrequencies.NONE,
          ...setupPeriodsForPrefill(this.selectedPeriodId),
        };
      }
    },
    sidebarAccessRules() {
      return {
        automation: this.getAuthDataByName('hasAccessToAutomation'),
        contacts: this.getAuthDataByName('hasAccessToContacts'),
        eReputation: this.getAuthDataByName('hasAccessToEreputation'),
        eReputationOnly : this.getAuthDataByName('hasAccessToEreputationPage'),
        establishment: this.getAuthDataByName('hasAccessToEstablishment'),
        leads: this.getAuthDataByName('hasAccessToLeads'),
        satisfaction: this.getAuthDataByName('hasAccessToSatisfaction'),
        surveys: this.getAuthDataByName('hasAccessToSurveys'),
        team: this.getAuthDataByName('hasAccessToTeam'),
        unsatisfied: this.getAuthDataByName('hasAccessToUnsatisfied'),
        welcome: this.getAuthDataByName('hasAccessToWelcome'),
        widgetManagement: this.$store.state.auth.WIDGET_MANAGEMENT,
        xleads: this.getAuthDataByName('hasAccessToCrossLeads'),
      };
    },
    availableFrontDeskUsers() {
      return this.$store.getters["cockpit/availableFrontDeskUsers"];
    },
    garageId(){
      return this.$store.getters['cockpit/getCurrentGarageId']
    },
    periodId(){
      return this.$store.getters['cockpit/getCurrentPeriodId']
    },
    garagesFilter(){
      const garagesTemp = this.availableGarages.map(({id, publicDisplayName})=>(
        {
          key: id,
          value: publicDisplayName
        }
      ));
      return sortArrayObject(garagesTemp, 'value');
    },
    availableDms(){
      return this.$store.getters['cockpit/availableDms']
    },
    currentDMS(){
      return this.$store.getters['cockpit/getCurrentDMS']
    },
    currentCockpitType() {
      return this.$store.state.cockpit.current.cockpitType;
    },
    availableUsers(){
      return this.$store.getters['cockpit/availableUsers']
    },
    currentUserId(){
      return this.$store.getters['cockpit/getCurrentUser']
    },
    optionSelected(){
      return this.$store.getters['cockpit/getGarageFilterMode']
    }
  },
  methods: {
    // Admin
    connectAs(payload) {
      this.$store.dispatch(
        "cockpit/admin/users/connectAs",
        payload
      );
    },

    // Sidebar
    hasSidebarSubmenu(value) {
      this.$store.dispatch('hasSidebarSubmenu', value);
    },
    toggleSidebar(value) {
      this.$store.dispatch('toggleSidebar', value);
    },
    hideAside() {
      if (this.$store.state.sidebarOpen) {
        this.toggleSidebar(false);
      }
    },

    // Navigation & Routing
    setFromRowClick(value) {
      this.$store.dispatch('cockpit/setFromRowClick', value);
    },
    mergeNavigationDataToInstance(navigationData) {
      this.navigationData = navigationData;
    },

    // Auth
    identifyCurrentUser() {
      const store = this.$store;
      window.currentUserIdentifiedAs = null;
      const user = store.state.auth.currentUser;
      if (user && !store.state.auth.isBackdoor) {
        const missingCrossLeadsGarages = this.canSubscribeToCrossLeads;
        const subscribedCrossLeadsGarages = this.availableGarages.filter(
          g => g.subscriptions && g.subscriptions.CrossLeads === true
        );
        const ERepGarages = store.getters["cockpit/allGaragesNotFiltered"]
          .filter(g => g.subscriptions && g.subscriptions.EReputation)
          .map(g => g.exogenousReviewsConfigurations);
        const connected = {};
        if (
          ERepGarages.length
          && this.getAuthDataByName('hasAccessToEreputation')
        ) {
          connected.Facebook = Math.ceil(
            (ERepGarages.filter(
              g => (g?.Facebook?.token && g?.Facebook?.externalId)
            ).length /
              ERepGarages.length) *
              100
          );
          connected.Google = Math.ceil(
            (ERepGarages.filter(
              g => (g?.Google?.token && g?.Google?.externalId)
            ).length /
              ERepGarages.length) *
              100
          );
          connected.PagesJaunes = Math.ceil(
            (ERepGarages.filter(
              g => (g?.PagesJaunes?.token && g?.PagesJaunes?.externalId)
            ).length /
              ERepGarages.length) *
              100
          );
        }
        window.currentUserIdentifiedAs = {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          job: user.job,
          phone: !!user.phone,
          mobilePhone: !!user.mobilePhone,
          civility: user.civility,
          accessToWelcome: this.getAuthDataByName('hasAccessToWelcome'),
          accessToSatisfaction: this.getAuthDataByName('hasAccessToSatisfaction'),
          accessToUnsatisfied: this.getAuthDataByName('hasAccessToUnsatisfied'),
          accessToLeads: this.getAuthDataByName('hasAccessToLeads'),
          accessToAutomation: this.getAuthDataByName('hasAccessToAutomation'),
          accessToContacts: this.getAuthDataByName('hasAccessToContacts'),
          accessToEstablishment: this.getAuthDataByName('hasAccessToEstablishment'),
          accessToTeam: this.getAuthDataByName('hasAccessToTeam'),
          accessToEReputation: this.getAuthDataByName('hasAccessToEreputation'),
          accessToSurveys: this.getAuthDataByName('hasAccessToSurveys'),
          accessToWidgetManagement: store.state.auth.WIDGET_MANAGEMENT,
          accessToGreybo: this.getAuthDataByName('hasAccessToGreybo'),
          accessToDarkbo: this.getAuthDataByName('hasAccessToDarkbo'),
          garages: store.getters["cockpit/allGaragesNotFiltered"].length,
          cockpitType: this.cockpitType,
          lastCockpitOpenAt: getUnixTime(user.lastCockpitOpenAt),
          eReputationGarages: ERepGarages.length,
          missingCrossLeadsGarages: missingCrossLeadsGarages.length,
          totalCrossLeadsGarages: missingCrossLeadsGarages.length + subscribedCrossLeadsGarages.length,
          accessHistoryCount: user.accessCount || 0,
          locale: store.getters["locale"],
          ...connected,
          ...Object.keys(user.lastOpenAt || []).reduce((acc, section) => {
            acc[`LAST_VISIT_${section}`] = getUnixTime(user.lastOpenAt[section]);
            return acc;
          }, {})
        };
      }
    },
    getAuthDataByName(dataName) {
      return this.$store.getters[`auth/${dataName}`];
    },

    // Bootstrap
    trackGoogleAnalytics4(gtag) {
      const toQueryString = (queryObj) => {
        if (Object.keys(queryObj).length === 0) return '';
        return '?' + Object.entries(queryObj).map(([key, value]) => `${key}=${value}`).join('&');
      };

      const sessionOrigin = this.$store.getters['cockpit/getOrigin'] || 'Unknown';
      if (window.currentUserIdentifiedAs && gtag) {
        // Set userId
        gtag('config', process.env.gaMeasurementCockpitID, {
          user_id: window.currentUserIdentifiedAs.id,
          send_page_view: false
        });
        // Set some info about the user and his session
        gtag('set', 'user_properties', { user_job: window.currentUserIdentifiedAs.job || 'Unknown' });
        // Send the pageView on current page (on subsequent visits an event handler on router will do it)
        gtag('event', 'page_view', {
          page_path: this.$route.fullPath,
          // Following indicates if we're coming from Brower or PWA. Session scoped doesn't exist in GA4, so hit scoped
          session_origin: sessionOrigin,
        });
      }
      let canRegisterDuplicate = true;
      this.$router.afterEach((to, from) => {
        if (window.currentUserIdentifiedAs) { // do not track if we haven't identified the user (in mounted)
          /*Why the timeout and all this stuff ? Because we refresh the route when
            we get all the data we want from the page, making it trigger twice sometimes.
            By putting a 5s delay, and an identical path recognition, we prevent the route to be registered twice on analytics
          */
          if (to.path !== from.path || canRegisterDuplicate) {
            console.info('Router COCKPIT: '+from.path +' => '+ to.path);
            window.userTracking && window.userTracking.pageView();
            // Google analytics. We will wait for stack execution so we have an up to date page location in the event fired
            setTimeout(() => {
              if (gtag) {
                gtag('event', 'page_view', {
                  page_path: `${to.path}${toQueryString(to.query)}`,
                  // Following indicates if we're coming from Brower or PWA. Session scoped doesn't exist in GA4, so hit scoped
                  session_origin: sessionOrigin,
                });
              }
            }, 0);
            canRegisterDuplicate = false;
            setTimeout(() => { canRegisterDuplicate = true }, 5000);
          }
        }
      });
    },
    lolMasters(user) {
      const isCusteedUser = user?.email?.match(/@garagescore\.com|@custeed\.com/);

      if (!isCusteedUser || !user.trolled) {
        return;
      };

      try {
        const randomIntegerInRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

        // Flo + Bang
        const team1 = {
          name: "team1",
          timeout : null,
          run() {
            team1.timeout = setTimeout(() => {
              const synth = window.speechSynthesis;
              const texts = [ "Tu veux rencontrer les PM les plus chauds de ta région, appelle le ", "Хотите познакомиться с самым горячим премьер-министром в вашем районе, позвоните ему?", "Möchten Sie die heißesten PMs in Ihrer Nähe treffen, ihn anrufen?" ]
              const langs = ['fr', 'ru', 'de'];
              const rand = Math.floor(Math.random() * 3);
              const speech = new SpeechSynthesisUtterance(`${texts[rand]} ${user.phone || user.mobilePhone ||'0634187168'}`);
              speech.lang = langs[rand];
              speech.volume = 0.3;
              synth.speak(speech);
          }, (Math.random() * 5 + 1) * 10000);
          },
          clear() {
            clearTimeout(team1.timeout);
          }
        };

        // Mourad + Momo
        const team2 = {
          name: "team2",
          dance() {
            if(document.querySelector('iframe')) {
              return;
            };
            // rickRoll, tu veux mon zizi, vive les gros nichons, j'ai la diarrhée, les sardines
            const musicLinks = [
              'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1',
              'https://www.youtube-nocookie.com/embed/vjTQqTGa3dQ?autoplay=1',
              'https://www.youtube-nocookie.com/embed/V5JsnXPIoBw?autoplay=1',
              'https://www.youtube-nocookie.com/embed/DQN5GdY70OA?autoplay=1',
              'https://www.youtube-nocookie.com/embed/PA3P1-aSvKQ?autoplay=1',
            ];
            // create a hidden iframe
            const iframe = document.createElement('iframe');
            iframe.src = musicLinks[randomIntegerInRange(0, musicLinks.length - 1)];
            iframe.style.display = 'none';
            iframe.allow = 'autoplay';
            document.body.appendChild(iframe);

            // animations
            const keyFrames = '\
              @keyframes dancing {\
                  0% {\
                      transform: rotate(0deg) scale(1);\
                  }\
                  50% {\
                      transform: rotate(45deg) scale(1.5);\
                  }\
                  100% {\
                      transform: rotate(-45deg) scale(0.5);\
                  }\
              }';
            const style = document.createElement('style');
            style.innerHTML = keyFrames;
            document.getElementsByTagName('head')[0].appendChild(style);
            document.body.style.animation = 'dancing 1.5s infinite steps(8)';
          },
          stop(e) {
            e.preventDefault();
            if (e.key === 'Escape') {
              team2.clear();
            };
          },
          run() {
            // the user needs to have interacted with the dom before we can autoplay a video with the sound
            document.addEventListener('click', team2.dance);
            document.addEventListener('keyup', team2.stop);

          },
          clear() {
            document.body.style.animation = '';
            const iframe = document.querySelector('iframe');
            iframe && document.body.removeChild(iframe);
            document.removeEventListener('click', team2.dance);
            document.removeEventListener('keyup', team2.stop);
          }
        };

        // Jonathan + Jean
        const team3 = {
          name: "team3",
          run() {
            const cursors = [
              'none',
              'url("https://i.imgur.com/kn91iJ7.png") 10 10, auto',
              'url("https://i.imgur.com/bdjEU5S.png") 10 10, auto',
            ];
            document.body.style.cursor = cursors[randomIntegerInRange(0, cursors.length - 1)];
          },
          clear() {
            document.body.style.cursor = "";
          }
        };

        // blink
        const blink = {
          name : 'blink',
          run() {
            const keyFramesBlur = '\
              @keyframes weirdblur {\
                  98% {\
                      filter: blur(0);\
                  }\
                  99% {\
                      filter: blur(2px);\
                  }\
                  100% {\
                      filter: blur(0);\
                  }\
              }';
            const style = document.createElement('style');
            style.innerHTML = keyFramesBlur;
            document.getElementsByTagName('head')[0].appendChild(style);
            document.documentElement.style.animation = `weirdblur ${randomIntegerInRange(5, 15)}s infinite`;
          },
          clear() {
            document.documentElement.style.animation = '';
          }
        };


        const PRANKS = {
          previous : null,
          current : null,
          options : [team1, team2, team3, blink].filter(opt => {
              if(Array.isArray(user.trolled)) {
                return user.trolled.includes(opt.name);
              };

              if(typeof user?.trolled === 'string') {
                return user.trolled === opt.name;
              };

              return true;
          }),
          selectAndRun() {
            PRANKS.current?.clear();
            PRANKS.previous = PRANKS.current;
            PRANKS.current = PRANKS.options[randomIntegerInRange(0, PRANKS.options.length - 1)];
            PRANKS.current?.run();
          }
        };

        // run once on load
        PRANKS.selectAndRun();

        // run on page changed
        this.$router.afterHooks.push(function (to, from) {
          if(to.name === from.name) {
            return;
          }
          PRANKS.selectAndRun();
        })
      } catch (error) {
        console.log("On est des bolosses", error);
      }

    },

    // Modals
    openModalFunction(payload) {
      return this.$store.dispatch('openModal', payload);
    },
    closeModalFunction() {
      return this.$store.dispatch('closeModal');
    },

    // Export
    openCustomExportModalFunction() {
      return this.$store.dispatch('openModal', {
        component: 'ModalExports',
        adaptive: true,
        props: this.modalExportsProps
      });
    },
    async startExportFunction(payload) {
      await this.$store.dispatch('cockpit/startExport', payload);
    },
    async saveCustomExportFunction(payload) {
      await this.$store.dispatch('cockpit/saveCustomExport', payload);
    },
    async updateCustomExportFunction(payload) {
      await this.$store.dispatch('cockpit/updateCustomExport', payload);
      return this.openCustomExportModalFunction();
    },
    async deleteCustomExportFunction(payload) {
      await this.$store.dispatch('cockpit/deleteCustomExport', payload);
      return this.openCustomExportModalFunction();
    },
    async exportGetAvailableFrontDeskUsers({ garageIds, dataTypes, frontDeskUsersType }) {
      return this.$store.dispatch(
        "cockpit/exportGetAvailableFrontDeskUsers",
        { garageIds, dataTypes, frontDeskUsersType }
      );
    },
    async fetchCustomExports() {
      return this.$store.dispatch('cockpit/fetchCustomExports');
    },
    async fetchAvailableTargets() {
      const request = {
        name: 'AutomationAvailableTargets',
        args: {
          dataType: this.selectedCampaignType
        },
        fields:
          `
          name
          id
        `
      };
      const resp = await makeApolloQueries([request]);
      this.availableAutomationCampaigns = resp.data.AutomationAvailableTargets.sort((a, b) => (a.name > b.name ? 1 : -1));
    },
    // Cockpit State
    setCurrentGarages(garageIds) {
      this.$store.dispatch("cockpit/changeCurrentGarage", garageIds);
    },
    setCurrentPeriod(periodId) {
      this.$store.dispatch("cockpit/changeCurrentPeriod", periodId);
    },
    setCurrentUser(user) {
      this.$store.dispatch("cockpit/changeCurrentUser", user);
    },
    setCurrentCockpitType(cockpitType) {
      this.$store.dispatch('cockpit/changeCurrentCockpitType', cockpitType);
      this.setCurrentGarages(null)
    },
    setCurrentDMS(dms) {
      this.$store.dispatch("cockpit/changeCurrentDms", dms);
    },
    setCurrentLeadSaleType(leadSaleType) {
      this.$store.dispatch('cockpit/changeCurrentLeadSaleType', leadSaleType);
    },

    // Filters
    applySelectedItems(garageIds) {
      this.$store.dispatch(
        'cockpit/setCurrentFiltersGaragesSelected',
        { garageIds },
      );
    },
    openModalCreateTag(garagesSelected) {
      this.openModalAdminTag("", "", garagesSelected);
    },
    openModalUpdateTag(id, nameTag, garagesSelected) {
      this.garagesSelectedFilter = garagesSelected;
      const tagGarages = this.availableGarages
        .filter(item => item?.tags?.includes(nameTag))
        .map(item=>item.id);
      this.openModalAdminTag(id, nameTag, tagGarages);
    },
    openModalAdminTag(id, nameTag, garagesSelected) {
      this.$store.dispatch('openModal',
        { component: 'ModalAdminTag',
          props: {
            id,
            nameTag,
            garagesIds: garagesSelected,
            closeModal: this.closeModalFunction,
            createNewTag: this.createNewTag,
            updateTag: this.updateTag
          },
          adaptive: true
        });
    },
    openModalDeleteTag(tagName) {
      this.$store.dispatch(
        'openModal',
        {
          component: 'ModalDeleteTag',
          props: {
            tagId: tagName,
            closeModal: this.closeModalFunction,
            deleteTag: this.deleteTag
          },
        },
      );
    },
    async createNewTag(data){
      await this.$store.dispatch("cockpit/createTag", data);
      this.closeModalFunction();
    },
    async updateTag(data){
      data['garagesSelected'] = this.garagesSelectedFilter;
      await this.$store.dispatch("cockpit/updateTag", data);
      this.garagesSelectedFilter = [];
      this.closeModalFunction();
    },
    async deleteTag(tagName) {
      await this.$store.dispatch("cockpit/deleteTag", tagName);
      this.closeModalFunction();
    },
    setGarageFilterMode(garageFilterMode){
      this.$store.dispatch(
        'cockpit/setCurrentGarageFilterMode',
        garageFilterMode,
      );
    },
  },
  watch: {
    sidebarOpen(value) {
      if (this.$mq === "sm") {
        document.documentElement.style.overflow = value ? "hidden" : "auto";
      } else {
        document.documentElement.style.overflow = "auto";
      }
    }
  },
}
</script>

<style lang="scss" scoped>
  .base-layout {
    background-color: $bg-grey;

    &__aside {
      position: fixed;
      left: 0;
      top: 0;
      height: 100vh;
      z-index: 102;

      transform: translateX(-$aside-mobile-size);
      transition: transform 0.3s;

      &--open {
        transform: translateX(0);
      }
    }

    &__aside-bg {
      position: fixed;
      top: 0;
      right: 0;

      height: 100vh;
      width: 100vw;
      background-color: rgba($black, 0.75);
      z-index: 101;
    }

    &__header {
      position: fixed;
      top: 0;
      right: 0;
      left: 0;
      z-index: 96;
    }

    &__main {
      margin-top: 3.5rem;
      min-height: calc(100vh - 3.5rem);
      height: calc(100vh - 3.5rem);

      &--grey {
        background-color: #f5f5f5;
      }
    }
  }

  @media (min-width: $breakpoint-min-md) {
    .base-layout {
      &__main {
        margin-left: $aside-size;
      }

      &__aside {
        transform: translateX(0);
      }

      &__header {
        margin-left: $aside-size;
      }

      &--tiny {
        .base-layout {
          &__header {
            margin-left: $aside-tiny-size;
          }

          &__main {
            margin-left: $aside-tiny-size;
          }
        }
      }
    }
  }
  .subheader {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    padding: 21px 14px 0 14px;
    flex-wrap: wrap;
    z-index: 95;

    &__subtitle {
      font-size: 21px;
      font-weight: bold;
      color: black;

      padding-top: 21px;
      text-align: center;
    }

    &__loading {
      pointer-events: none;
    }

    &__part {
      margin-right: 14px;
      margin-bottom: 14px;
      height: 30px;
      border-radius: 3px;
      box-shadow: 0 0 3px 0 rgba(0, 0, 0, 0.16);
      background-color: $white;
      &:last-child {
        margin-right: 0;
      }
    }
  }

  .layout-cockpit {
    &__aside {
      position: fixed;
      left: 0;
      top: 0;
      height: 100vh;
      z-index: 101;

      transform: translateX(-$aside-size);
      transition: transform 0.3s;

      &--open {
        transform: translateX(0);
      }
    }

    &__header {
      position: fixed;
      top: 0;
      right: 0;
      left: 0;
      z-index: 96;
    }

    &__main {
      margin-top: 3.5rem;
      min-height: calc(100vh - 3.5rem);
    }
  }

  @media (min-width: $breakpoint-min-md) {
    .subheader {
      &__subtitle {
        padding-left: 14px;
        text-align: left;
      }
    }
  }
  @media (max-width: $breakpoint-min-md) {
    .subheader {
      position: initial;
      padding: 1rem;
    }
  }
</style>

