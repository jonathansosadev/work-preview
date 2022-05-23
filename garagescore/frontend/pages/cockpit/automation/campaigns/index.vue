<template>
  <div class="page-automation custom-scrollbar">
    <div class="page-automation__stats">
      <div class="page-automation__item">
        <!-- KPI bloc 1 -->
        <StatsAutomationSent v-bind="statsSentProps" :view="currentView('StatsAutomationSent')" :changeView="changeView" :chartData="chartData"></StatsAutomationSent>
      </div>
      <div class="page-automation__item" v-if="selectedCampaignType === AutomationCampaign.AUTOMATION_MAINTENANCE" >
        <!-- KPI bloc 2 -->
        <StatsAutomationOpened
          v-bind="statsOpenedProps"
          :view="currentView('StatsAutomationOpened')"
          :changeView="changeView"
          :chartData="chartData">
        </StatsAutomationOpened>
      </div>
      <div class="page-automation__item" v-else>
        <!-- KPI bloc 2 -->
        <StatsAutomationLead
          v-bind="statsLeadProps"
          :view="currentView('StatsAutomationLead')"
          :changeView="changeView"
          :chartData="chartData">
        </StatsAutomationLead>
      </div>
      <div class="page-automation__item">
        <!-- KPI bloc 3 -->
        <StatsAutomationConverted
          v-bind="statsConvertedProps"
          :view="currentView('StatsAutomationConverted')"
          :changeView="changeView"
          :chartData="chartData">
        </StatsAutomationConverted>
      </div>
    </div>
    <div class="page__table">
      <!-- Table automation campaigns -->
      <TableAutomationCampaign
        v-bind="campaignsData"
        v-on="campaignsListeners"
      />
    </div>
  </div>
</template>

<script>
  import { makeApolloQueries } from '../../../../util/graphql';
  import TableAutomationCampaign from '../../../../components/cockpit/automation/TableAutomationCampaign.vue';
  import StatsAutomationSent from '../../../../components/cockpit/automation/StatsAutomationSent.vue';
  import StatsAutomationOpened from '../../../../components/cockpit/automation/StatsAutomationOpened.vue';
  import StatsAutomationLead from '../../../../components/cockpit/automation/StatsAutomationLead.vue';
  import StatsAutomationConverted from '../../../../components/cockpit/automation/StatsAutomationConverted.vue';
  import { setupHotJar } from '../../../../util/externalScripts/hotjar'
  import AutomationCampaign from '../../../../utils/models/automation-campaign.type'
  import fieldsHandler from '../../../../../common/lib/garagescore/cockpit-exports/fields/fields-handler'
  import { ExportTypes, ShortcutExportTypes, ExportFrequencies } from '~/utils/enumV2';
  import { AutomationOrange } from '~/assets/style/global.scss';
  import { setupPeriodsForPrefill } from '../../../../utils/exports/period'
  import { isEqual } from '~/util/arrayTools.js';

  export default {
    name: "AutomationCampaignsPage",
    components: {
      TableAutomationCampaign,
      StatsAutomationSent,
      StatsAutomationOpened,
      StatsAutomationConverted,
      StatsAutomationLead
    },
    inheritAttrs: false,
    middleware: ['hasAccessToAutomation'],

    async mounted() {
      setupHotJar(this.$store.getters["locale"], 'automation');
      this.$store.dispatch("cockpit/refreshRouteParameters"),
        await Promise.all([
          this.$store.dispatch("cockpit/fetchFilters"),
          this.$store.dispatch("cockpit/fetchChartData", this.$route.name, { root: true}),
          this.fetchAvailableTargets(),
          this.fetchKpis(),
          this.fetchCampaigns(),
          // this.fetchCustomContents(this.selectedGarageId)
        ]);
    },

    data() {
      return {
        loadingCampaigns: true,
        campaignsRows: [],
        loadingKpis: true,
        kpis: {},
        customContents: [],
        AutomationCampaign: AutomationCampaign,
        availableAutomationCampaigns: []
      };
    },

    computed: {
      cockpitType() { return this.$store.getters['cockpit/cockpitType']; },
      selectedPeriod() { return this.$store.getters['cockpit/selectedPeriod']; },
      selectedCampaignType() { return this.$store.getters['cockpit/selectedAutomationCampaignType']; },
      selectedGarageId() { return this.$store.getters['cockpit/selectedGarageId']; },
      orderBy() { return this.$store.getters['cockpit/automation/campaignsOrderBy']; },
      order() { return this.$store.getters['cockpit/automation/campaignsOrder']; },
      search() { return this.$store.getters['cockpit/automation/campaignsSearch']; },
      liveSearch() { return this.$store.getters['cockpit/automation/campaignsLiveSearch']; },
      hasBackArrow() {
        const canComeFrom = 'cockpit-automation-garages';
        const comingFrom = this.$store.getters['cockpit/fromRowClickName'];
        return canComeFrom === comingFrom;
      },
      availableGarages() { return this.$store.getters['cockpit/availableGarages']; },
      availablePeriods() { return this.$store.getters['cockpit/availablePeriods']; },
      availableFrontDeskUsers() { return this.$store.getters["cockpit/availableFrontDeskUsers"]; },
      currentUser() { return this.$store.getters['auth/currentUser']; },
      customExports() { return this.$store.getters["cockpit/customExports"]; },
      fieldsExportCampaign() {
        return fieldsHandler.getFieldsByShortcutExportType(ShortcutExportTypes.AUTOMATION_CAMPAIGN);
      },
      shortcutExportPayload() {
        return {
          exportType: ExportTypes.AUTOMATION_CAMPAIGN,
          dataTypes: this.selectedDataType ? [this.selectedDataType] : ['All'],
          garageIds: this.selectedGarageId ? [...this.selectedGarageId] : ['All'],
          fields: this.fieldsExportCampaign,
          ...setupPeriodsForPrefill(this.$store.getters['cockpit/selectedPeriod']),
          frequency: ExportFrequencies.NONE
        };
      },

      campaignsData() {
        return {
          campaignsRows: this.campaignsRows,
          orderBy: this.orderBy,
          order: this.order,
          search: this.liveSearch,
          loading: this.loadingCampaigns,
          campaignType: this.selectedCampaignType,
          customContents: this.customContents,
          sortCampaign: this.sortCampaign,
          onSearch: this.onSearch,
          handleBack: this.handleBack,
          hasBackArrow: this.hasBackArrow,
          availableGarages: this.availableGarages,
          availablePeriods: this.availablePeriods,
          availableFrontDeskUsers: this.availableFrontDeskUsers,
          exportGetAvailableFrontDeskUsers: this.exportGetAvailableFrontDeskUsers,
          currentUser: this.currentUser,
          customExports: this.customExports,
          shortcutExportPayload: this.shortcutExportPayload,
          openModalFunction: this.openModalFunction,
          openCustomExportModalFunction: this.openCustomExportModalFunction,
          closeModalFunction: this.closeModalFunction,
          startExportFunction: this.startExportFunction,
          saveCustomExportFunction: this.saveCustomExportFunction,
          updateCustomExportFunction: this.updateCustomExportFunction,
          deleteCustomExportFunction: this.deleteCustomExportFunction,
          displayPreview: this.displayPreview,
          availableAutomationCampaigns: this.availableAutomationCampaigns,
          selectedGarageId: this.selectedGarageId,
        };
      },
      campaignsListeners() {
        return {
          filterByGarage: (garageId) => this.$store.dispatch('cockpit/changeCurrentGarage', garageId),
          goToCampaign: (campaignId) => this.$router.push(`/cockpit/automation/${campaignId}`),
        };
      },
      statsSentProps() {
        return {
          loading: this.loadingKpis,
          automationCountSent: this.kpis &&
            ((this.kpis.KPI_automationCountSentMaintenances || 0) + (this.kpis.KPI_automationCountSentSales || 0)),
        };
      },
      statsOpenedProps() {
        return {
          loading: this.loadingKpis,
          automationCountSent: this.kpis &&
            ((this.kpis.KPI_automationCountSentMaintenances || 0) + (this.kpis.KPI_automationCountSentSales || 0)),
          automationCountOpened:
            (this.kpis.KPI_automationCountOpenedMaintenances || 0),
        };
      },
      statsLeadProps() {
        return {
          loading: this.loadingKpis,
          automationCountSent: this.kpis &&
            ((this.kpis.KPI_automationCountSentMaintenances || 0) + (this.kpis.KPI_automationCountSentSales || 0)),
          automationCountLeadSales: (this.kpis.KPI_automationCountLeadSales || 0),
        };
      },
      statsConvertedProps() {
        return {
          loading: this.loadingKpis,
          automationCountOpened:
            (this.kpis.KPI_automationCountOpenedMaintenances || 0),
          automationCountLeadSales:
            (this.kpis.KPI_automationCountLeadSales || 0),
          automationCountConverted:
            ((this.kpis.KPI_automationCountConvertedMaintenances || 0) + (this.kpis.KPI_automationCountConvertedSales || 0)),
          campaignType: this.selectedCampaignType,
        };
      },
      currentView() {
        const state = this.$store.getters["cockpit/componentsView"];
        return function (componentName) {
          return state[componentName]["view"];
        }
      },
      chartData() {
        const chartData = this.$store.getters["cockpit/chart"];
        chartData.config.labels = chartData.config.labels.map(label => this.$t_locale('pages/cockpit/automation/campaigns/index')(label.split('-')[1]) || label);
        return chartData;
      }
    },
    methods: {
      async fetchCustomContents(garageIds) {
        const request = {
          name: 'AutomationGetCustomContents',
          args: {
            garageIds,
            target: this.$route.params.target
          },
          fields:
            `
              target
              createdAt
              lastModifiedAt
              activeGarageIds
          `
        };
        const resp = await makeApolloQueries([request]);
        this.customContents = resp.data.AutomationGetCustomContents;
      },
      checkRedirect() {
        const currentGarage = this.$store.getters['cockpit/selectedGarage'];
        if (currentGarage && currentGarage.subscriptions && !currentGarage.subscriptions.Automation) {
          setTimeout(() => this.$router.replace({ name: 'cockpit-automation' }), 0);
        }
      },
      async onParamChange(fetchKpis = true) {
        await Promise.all([
          this.$store.dispatch("cockpit/refreshRouteParameters"),
          this.$store.dispatch("cockpit/fetchChartData", this.$route.name, { root: true}),
          this.fetchCampaigns(),
          // this.fetchCustomContents(this.selectedGarageId)
        ]);
        if (fetchKpis) await this.fetchKpis();
      },
      async fetchCampaigns() {
        this.loadingCampaigns = true;
        const campaingsRequest = {
          name: 'AutomationCampaignsList',
          args: {
            cockpitType: this.cockpitType,
            period: this.selectedPeriod,
            type: this.selectedCampaignType,
            garageId: this.selectedGarageId,
            search: this.search,
            orderBy: this.orderBy,
            order: this.order,
          },
          fields:`
            _id
            campaignId
            garageId
            KPI_automationTotalConverted
            KPI_automationTotalOpened
            KPI_automationTotalLead
            KPI_automationTotalSent
            KPI_automationCountSentEmail
            KPI_automationCountSentSms
            KPI_automationCountOpenedEmail
            KPI_automationCountOpenedSms
            KPI_automationCountConvertedEmail
            KPI_automationCountConvertedSms
            KPI_automationCountLeadEmail
            KPI_automationCountLeadSms
            runningEmail
            runningSms
            idleEmail
            idleSms
            totalCampaignsEmail
            totalCampaignsSms
            automationCost
            isConsolidate
            isLastToggledDate
            averageContactCost
          `
        };
        const resp = await makeApolloQueries([campaingsRequest]);
        this.campaignsRows =  resp.data.AutomationCampaignsList
        this.loadingCampaigns = false;
      },
      async fetchKpis() {
        this.loadingKpis = true;
        const kpisRequest = {
          name: 'AutomationKpis',
          args: {
            cockpitType: this.cockpitType,
            period: this.selectedPeriod,
            type: this.selectedCampaignType,
            garageId: this.selectedGarageId
          },
          fields:
            `
          KPI_automationCountSentMaintenances
          KPI_automationCountOpenedMaintenances
          KPI_automationCountConvertedMaintenances
          KPI_automationCountCrossedMaintenances
          KPI_automationCountSentSales
          KPI_automationCountConvertedSales
          KPI_automationCountCrossedSales
          KPI_automationCountLeadSales
        `
        };
        const resp = await makeApolloQueries([kpisRequest]);
        this.kpis = resp.data.AutomationKpis;
        this.loadingKpis = false;
      },
      changeView(componentName, view){
        const route = this.$route.name;
        this.$store.dispatch("cockpit/changeComponentView", { route, componentName, view });
      },
      async sortCampaign(orderBy, order) {
        this.$store.dispatch('cockpit/automation/setCampaignsOrder', { orderBy, order });
        await this.fetchCampaigns();
      },
      async onSearch (search) {
        this.$store.dispatch('cockpit/automation/setCampaignsSearch', search);
        await this.fetchCampaigns()
      },
      async handleBack() {
        await this.$store.dispatch('cockpit/syncRouteToState', this.$store.state.cockpit.fromRowClick);
        this.$router.push({
          name: this.$store.state.cockpit.fromRowClick.name,
          query: this.$store.state.cockpit.fromRowClick.query
        });
      },
      async exportGetAvailableFrontDeskUsers({ fetch, garageIds, dataTypes, frontDeskUsersType }) {
        await this.$store.dispatch("cockpit/exportGetAvailableFrontDeskUsers", { fetch, garageIds, dataTypes, frontDeskUsersType });
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
      async fetchCampaignForSpecificTarget(target, affectedGarageIds) {
        const request = {
          name: 'AutomationGetCampaignsForSpecificTarget',
          args: { target, affectedGarageIds, },
          fields: `
            garageId
            garageName
            status
            contactType
            runDate
            customContentId
            garageLogo
            garageBrand
          `
        };
        const result = await makeApolloQueries([request]);
        if (result) {
          return result.data.AutomationGetCampaignsForSpecificTarget;
        }
        return [];
      },
      async displayPreview(target) {
        const [garageInfo] = await this.fetchCampaignForSpecificTarget(target, this.selectedGarageId);
        const campaign = this.availableAutomationCampaigns.find(({id}) => id === target);

        this.$store.dispatch("openModal", {
          component: "ModalPreviewAutomationCampaignEmail",
          adaptive: true,
          props: {
            logoUrl: garageInfo && garageInfo.garageLogo || '',
            themeColor: AutomationOrange,
            garageName: garageInfo && garageInfo.garageName || '',
            customerName: "John Doe",
            brandName: garageInfo && garageInfo.garageBrand || '',
            target: target,
            campaignName: campaign && campaign.name || '',
          },
        });
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
        this.availableAutomationCampaigns = resp.data.AutomationAvailableTargets.sort((a, b) => (a.name > b.name ? 1 : -1))
      },
    },
    watch: {
      async cockpitType(oldV, newV) { if (newV !== oldV) await this.onParamChange(true); },
      async selectedPeriod(oldV, newV) { if (newV !== oldV) await this.onParamChange(true); },
      async selectedCampaignType(oldV, newV) { if (newV !== oldV) await this.onParamChange(true); },
      async selectedGarageId(oldV, newV) {
        this.checkRedirect();
        if (!isEqual(newV, oldV)) {
          await this.onParamChange(true);
        }
      },
    },
  };
</script>

<style lang="scss" scoped>
  .page-automation {
    position: relative;
    height: calc(100vh - 8.5rem);
    overflow-x: hidden;
    overflow-y: auto;
    top: 1rem;
    padding-top: .15rem;
    box-sizing: border-box;

    &__stats {
      display: flex;
      justify-content: flex-start;
      align-items: stretch;
      flex-flow: column;
      padding: 0 .5rem 1rem 1rem;
    }

    &__subitem {
      flex: 1;

      &:first-child {
        margin-right: 0.25rem;
      }

      &:last-child {
        margin-left: 0.25rem;
      }
    }

    &__item {
      height: 100%;
      width: 100%;

      &:not(:last-child) {
        margin-bottom: 1rem;
      }
    }
  }

  @media (min-width: $breakpoint-min-md) {
    .page-automation {
      &__stats {
        flex-flow: row;
      }

      &__subitem {
        flex: 1;

        &:first-child {
          margin: 0;
          margin-bottom: $separator; //Remove this;
        }

        &:last-child {
          margin: 0;
        }
      }

      &__item {
        flex: 1;
        height: 221px;
        width: 33%;

        margin: 0 0.5rem;

        &:not(:last-child) {
          margin-bottom: 0;
        }

        &:first-child {
          margin: 0 0.5rem 0 0;
        }

        &:last-child {
          margin: 0 0 0 0.5rem;
        }
      }
    }
  }
  @media (max-width: $breakpoint-min-md) {
  .page-automation {
    top: 0;
    height: calc(100vh - 8.5rem);
  }
}
</style>
