<template>
  <BaseLayout>
    <template slot="aside">
      <CockpitSidebar
        :currentUserIsGarageScoreUser="currentUserIsGarageScoreUser"
        :jobsByCockpitType="jobsByCockpitType"
        :availableGarages="availableGarages"
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
        :availableAutomationCampaigns="availableAutomationCampaigns"
        :fetchCustomExports="fetchCustomExports"
      />
      />
    </template>

    <template slot="header">
      <CockpitHeader
        :currentUserIsGarageScoreUser="currentUserIsGarageScoreUser"
        :jobsByCockpitType="jobsByCockpitType"
        :availableDataTypes="availableDataTypes"
        :availableLeadSaleTypes="availableLeadSaleTypes"
        :availableCampaignTypes="availableCampaignTypes"
        :availableGarages="availableGarages"
        :availablePeriods="availablePeriods"
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
        :garageId="garageId"
        :setCurrentGarage="setCurrentGarage"
        :setCurrentPeriod="setCurrentPeriod"
        :periodId="periodId"
        :garagesFilter="garagesFilter"
        :tagsFilter="tagsFilter"
        :openModalCreateTag="openModalCreateTag"
        :openModalUpdateTag="openModalUpdateTag"
        :openModalDeleteTag="openModalDeleteTag"
        :currentGaragesSelected="currentGaragesSelected"
        :applyItemsSelected="applyItemsSelected"
        :availableDms="availableDms"
        :currentDMS="currentDMS"
        :setCurrentDMS="setCurrentDMS"
        :availableUsers="availableUsers"
        :currentUserId="currentUserId"
        :setCurrentUser="setCurrentUser"
      />
    </template>
    <template slot="subheader">
      <div class="subheader" :class="filtersClass" id="filters-inside" v-show="isFiltersVisible">
        <AppFilters
          v-if="isFiltersVisible"
          :loading="loading"
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
          :isAutomation="isAutomation"
          :availableAutomationCampaigns="availableAutomationCampaigns"
          :garageId="garageId"
          :setCurrentGarage="setCurrentGarage"
          :setCurrentPeriod="setCurrentPeriod"
          :periodId="periodId"
          :garagesFilter="garagesFilter"
          :tagsFilter="tagsFilter"
          :openModalCreateTag="openModalCreateTag"
          :openModalUpdateTag="openModalUpdateTag"
          :openModalDeleteTag="openModalDeleteTag"
          :currentGaragesSelected="currentGaragesSelected"
          :applyItemsSelected="applyItemsSelected"
          :availableDms="availableDms"
          :currentDMS="currentDMS"
          :setCurrentDMS="setCurrentDMS"
          :availableCockpitTypes="availableCockpitTypes"
          :currentCockpitType="currentCockpitType"
          :setCurrentCockpitType="setCurrentCockpitType"
          :availableUsers="availableUsers"
          :currentUserId="currentUserId"
          :setCurrentUser="setCurrentUser"
        />
      </div>
    </template>
  </BaseLayout>
</template>

<script>
import gtagAnalytics from '~/util/externalScripts/gtag-analytics';
import { hotjar } from '../util/externalScripts/hotjar';
import userTracking from '../util/externalScripts/user-tracking';
import CockpitSidebar from "~/components/cockpit/CockpitSidebar.vue";
import CockpitHeader from "~/components/cockpit/CockpitHeader.vue";
import AppFilters from "~/components/global/AppFilters.vue";
import CampaignTypes from '../utils/models/automation-campaign.type';
import GarageTypes from '../utils/models/garage.type';
import DataTypes from '../utils/models/data/type/data-types';
import { makeApolloQueries } from "~/util/graphql";

function getUnixTime(date) {
  const unixDate = new Date(date);
  return (unixDate.getTime() / 1000) | 0;
}

// set window.currentUserIdentifiedAs
function identifyCurrentUser(store) {
  window.currentUserIdentifiedAs = null;
  const availableGarages = store.getters["cockpit/availableGarages"];
  const user = store.state.auth.currentUser;
  if (user && !store.state.auth.isBackdoor) {
    const allGaragesNotFiltered = store.getters["cockpit/allGaragesNotFiltered"];
    const missingCrossLeadsGarages = store.getters["cockpit/canSubscribeToCrossLeads"];
    const subscribedCrossLeadsGarages = availableGarages.filter(
      ({ subscriptions } = {}) => subscriptions?.CrossLeads === true
    );
    const ERepGarages = allGaragesNotFiltered.reduce(
      (aggregatedGarages, garage) => {
        if (garage?.subscriptions?.EReputation) {
          return [
            ...aggregatedGarages,
            garage.exogenousReviewsConfigurations
          ];
        }
      },
      [],
    );
    const connected = {};
    const hasAccessToEreputation = store.getters["auth/hasAccessToEreputation"];
    const ErepGaragesSize = ERepGarages.length;
    if (ErepGaragesSize && hasAccessToEreputation) {
      const validFacebookERepGarages = ERepGarages.filter(
        ({ Facebook } = {}) => Facebook?.token && Facebook?.externalId
      );
      connected.Facebook = Math.ceil(
        (validFacebookERepGarages.length / ErepGaragesSize) * 100
      );

      const validGoogleERepGarages = ERepGarages.filter(
        ({ Google } = {}) => Google?.token && Google?.externalId
      );
      connected.Google = Math.ceil(
        (validGoogleERepGarages.length / ErepGaragesSize) * 100
      );

      const validPageJaunesERepGarages = ERepGarages.filter(
        ({ PagesJaunes } = {}) => PagesJaunes?.token && PagesJaunes?.externalId
      );
      connected.PagesJaunes = Math.ceil(
        (validPageJaunesERepGarages.length / ERepGarages.length) * 100
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
      accessToWelcome: store.getters["auth/hasAccessToWelcome"],
      accessToSatisfaction: store.getters["auth/hasAccessToSatisfaction"],
      accessToUnsatisfied: store.getters["auth/hasAccessToUnsatisfied"],
      accessToLeads: store.getters["auth/hasAccessToLeads"],
      accessToAutomation: store.getters["auth/hasAccessToAutomation"],
      accessToContacts: store.getters["auth/hasAccessToContacts"],
      accessToEstablishment: store.getters["auth/hasAccessToEstablishment"],
      accessToTeam: store.getters["auth/hasAccessToTeam"],
      accessToEReputation: store.getters["auth/hasAccessToEreputation"],
      accessToSurveys: store.getters["auth/hasAccessToSurveys"],
      accessToWidgetManagement: store.state.auth.WIDGET_MANAGEMENT,
      accessToGreybo: store.getters["auth/hasAccessToGreybo"],
      accessToDarkbo: store.getters["auth/hasAccessToDarkbo"],
      garages: store.getters["cockpit/allGaragesNotFiltered"].length,
      cockpitType: store.getters["cockpit/cockpitType"],
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
}

export default {
  components: {
    CockpitSidebar,
    CockpitHeader,
    AppFilters
  },

  middleware: [
    "appMounted",
    "authenticated",
    "hasAccessToCockpit",
    "cockpit-router-params"
  ],

  data() {
    return {
      availableAutomationCampaigns: [],
      garagesSelectedFilter : [],
    };
  },

  computed: {
    loading() {
      return this.$store.getters["cockpit/isFiltersLoading"];
    },

    isVehicleInspection() {
      return this.$store.getters["cockpit/cockpitType"] === GarageTypes.VEHICLE_INSPECTION;
    },

    availableDataTypes() {
      const dataTypes = [
        { key: "allServices", id: null, label: "allServices" },
        { key: DataTypes.MAINTENANCE, id: DataTypes.MAINTENANCE, label: DataTypes.MAINTENANCE },
        { key: DataTypes.NEW_VEHICLE_SALE, id: DataTypes.NEW_VEHICLE_SALE, label: DataTypes.NEW_VEHICLE_SALE },
        { key: DataTypes.USED_VEHICLE_SALE, id: DataTypes.USED_VEHICLE_SALE, label: DataTypes.USED_VEHICLE_SALE }
      ]
      if (this.isAnalytics) {
        return dataTypes.filter(({key}) => key !== "allServices");
      }
      return dataTypes;
    },

    availableLeadSaleTypes() {
      if (this.isVehicleInspection) {
        return [
          ...this.availableDataTypes.filter((type) => type.key !== DataTypes.MAINTENANCE),
          { id: DataTypes.UNKNOWN, key: DataTypes.UNKNOWN, label: DataTypes.UNKNOWN }
        ]
      }
      return [
        ...this.availableDataTypes,
        { id: DataTypes.UNKNOWN, key: DataTypes.UNKNOWN, label: DataTypes.UNKNOWN }
      ]
    },

    availableCampaignTypes() {
      if (this.isVehicleInspection) return [];
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

    isFiltersVisible() {
      const hideOnErep = this.$route.name.includes('e-reputation') &&
        !this.$store.getters['cockpit/authorizations'].hasEReputationAtLeast;

      if (hideOnErep || this.$route.name.includes('pageCustomResponses')) {
        return false;
      }
      return this.$store.getters['isFiltersVisible'];
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
        availableAutomationCampaigns: this.availableAutomationCampaigns
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
      return this.availableGarages.map(({id, publicDisplayName})=>{
        return {
          key: id,
          value: publicDisplayName
        }
      })
    },
    tagsFilter(){
      return this.$store.getters['cockpit/getTagsFilter']
    },
    currentGaragesSelected(){
      return this.$store.getters['cockpit/getCurrentGaragesSelected']
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
    }
  },

  methods: {
    trackGoogleAnalytics4(gtag) {
      const toQueryString = (queryObj) => {
        if (Object.keys(queryObj).length === 0) return '';
        return '?' + Object.entries(queryObj).map(([key, value]) => `${key}=${value}`).join('&');
      };

      const sessionOrigin = this.$store.getters['cockpit/getOrigin'] || 'Unknown';
      if (window.currentUserIdentifiedAs && gtag) {
        // Set userId
        gtag('config', process.env.gaMeasurementCockpitID, {
          user_id: currentUserIdentifiedAs.id,
          send_page_view: false
        });
        // Set some info about the user and his session
        gtag('set', 'user_properties', { user_job: currentUserIdentifiedAs.job || 'Unknown' });
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
            window.userTracking.pageView();
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
      if (user.email && user.email.match(/@garagescore\.com|@custeed\.com/) && user.trolled) {
        // https://gist.github.com/rlemon/4444273
        // crazy colors
        const trollBgColor = () => {
          function r() {
            return Math.floor(Math.random() * 255);
          }
          function fakk() {
            (this.style.color = ["rgb(", [r(), r(), r()].join(","), ")"].join(
              ""
            )),
              (this.style.backgroundColor = [
                "rgb(",
                [r(), r(), r()].join(","),
                ")"
              ].join(""));
          }
          [].forEach.call(document.all, function(item) {
            setTimeout(function() {
              fakk.call(item);
            }, Math.random() * 500 + 100);
          });
        };
        // edit them all
        const trollEditable = () => {
          document.body.contentEditable = "true";
          document.designMode = "on";
        };
        var dataModified = 0;
        const trollBlinker = () => {
          var divs = document.getElementsByTagName("div");
          var buttons = document.getElementsByTagName("button");

          for (var button of buttons) button.style.cursor = "none";
          for (var div of divs) {
            div.addEventListener('click', function (e) {
              e.target.style.display = "none";
              setTimeout(function () {
                ++dataModified;
                console.warn('modifiedDataCount: ' + dataModified + " (Ne pas faire en prod ATTENTION)");
                e.target.style.display = 'block';
              }, 200)
            })
          }
        };
        const trolls = {
          bgColor: trollBgColor,
          editable: trollEditable,
          blinker: trollBlinker
        };
        if (trolls[user.trolled]) {
          trolls[user.trolled]();
        }
      }
    },
    openModalFunction(payload) {
      return this.$store.dispatch('openModal', payload);
    },
    openCustomExportModalFunction() {
      return this.$store.dispatch('openModal', {
        component: 'ModalExports',
        adaptive: true,
        props: this.modalExportsProps
      });
    },
    closeModalFunction() {
      return this.$store.dispatch('closeModal');
    },
    async startExportFunction(payload) {
      return this.$store.dispatch('cockpit/startExport', payload);
    },
    async saveCustomExportFunction(payload) {
      return this.$store.dispatch('cockpit/saveCustomExport', payload);
    },
    async updateCustomExportFunction(payload) {
      await this.$store.dispatch('cockpit/updateCustomExport', payload);
      return this.openCustomExportModalFunction();
    },
    async deleteCustomExportFunction(payload) {
      await this.$store.dispatch('cockpit/deleteCustomExport', payload);
      return this.openCustomExportModalFunction();
    },
    setCurrentGarage(garageIds) {
      this.$store.dispatch("cockpit/changeCurrentGarage", garageIds);
    },
    async applyItemsSelected(garagesSelected, tagsSelected){
      let garagesToFilter = garagesSelected
      this.tagsFilter.filter(item => tagsSelected.includes(item.key))
        .map(tag => {
          garagesToFilter = [...garagesToFilter, ...tag.garageIds]
        });
      await this.setCurrentGarage(garagesToFilter)
      this.$store.dispatch("cockpit/setCurrentGaragesSelected", garagesSelected);
    },
    openModalCreateTag(garagesSelected){
      this.openModalAdminTag("", "", garagesSelected)
    },
    openModalUpdateTag(id, nameTag, garagesSelected){
      this.garagesSelectedFilter = garagesSelected
      const tagGarages = this.availableGarages.filter(item=>item.tags && item.tags.includes(nameTag))
        .map(item=>item.id)
      this.openModalAdminTag(id, nameTag, tagGarages)
    },
    openModalAdminTag(id, nameTag, garagesSelected){
      this.$store.dispatch('openModal',
        { component: 'ModalAdminTag',
          props: {
            id,
            nameTag,
            garagesIds: garagesSelected,
            closeModal: this.closeModal,
            createNewTag: this.createNewTag,
            updateTag: this.updateTag
          },
          adaptive: true
        });
    },
    openModalDeleteTag(tagName){
      this.$store.dispatch('openModal',
        { component: 'ModalDeleteTag',
          props: {
            tagId: tagName,
            closeModal: this.closeModal,
            deleteTag: this.deleteTag
          }
        });
    },
    async createNewTag(data){
      await this.$store.dispatch("cockpit/createTag", data);
      this.closeModal()
    },
    async updateTag(data){
      data['garagesSelected'] = this.garagesSelectedFilter
      await this.$store.dispatch("cockpit/updateTag", data);
      this.garagesSelectedFilter = []
      this.closeModal()
    },
    async deleteTag(tagName){
      await this.$store.dispatch("cockpit/deleteTag", tagName);
      this.closeModal()
    },
    closeModal(){
      this.$store.dispatch('closeModal');
    },
    async exportGetAvailableFrontDeskUsers({ garageIds, dataTypes, frontDeskUsersType }) {
      return this.$store.dispatch("cockpit/exportGetAvailableFrontDeskUsers", { garageIds, dataTypes, frontDeskUsersType });
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
    setCurrentUser(user) {
      this.$store.dispatch("cockpit/changeCurrentUser", user);
    },
    setCurrentCockpitType(cockpitType) {
      this.$store.dispatch('cockpit/changeCurrentCockpitType', cockpitType);
    },
    async setCurrentPeriod(periodId) {
      await this.$store.dispatch("cockpit/changeCurrentPeriod", periodId);
    },
    setCurrentDMS(dms) {
      this.$store.dispatch("cockpit/changeCurrentDms", dms);
    },
  },

  beforeMount() {
    // Load hotjar ASAP
    hotjar(process.env.hotjarId);
  },

  async mounted() {
    const user = this.$store.state.auth.currentUser;
    identifyCurrentUser(this.$store);
    // Set view from localStorage for chart components
    this.$store.dispatch('cockpit/initChartComponentsView');

    //--- GA4 Tracking
    gtagAnalytics(
      process.env.gaMeasurementCockpitID,
      { send_page_view: false, onGtagConfigured: this.trackGoogleAnalytics4 }
    );
    // Don't send info to userTracking if backdoor
    if (!this.$store.getters["auth/isBackdoor"]) {
      userTracking(process.env.publicAPIUrl, user.id);
    }
    // Fetch automation campaign
    if (this.currentUser.hasAccessToAutomation) {
      await this.fetchAvailableTargets();
    }
    // lol masters
    this.lolMasters(user);

    //formatting tags from availableGarages
    this.$store.dispatch('cockpit/initializeTagsFilter');
  },

  head() {
    const script = [];
    const meta = [];
    const link = [];

    // Some meta
    meta.push({
      name: "google-signin-client_id",
      content: process.env.GOOGLE_OAUTH_CLIENT_ID
    });
    link.push({ rel: "manifest", href: "/manifest.json" });
    return { script, meta, link };
  },
};
</script>

<style lang="scss" scoped>
.subheader {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  padding: 21px 14px 0px 14px;
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
