<template>
  <div class="page-automation custom-scrollbar">
    <div class="page-automation__stats">
      <div class="page-automation__item">
        <!-- KPI bloc 1 -->
        <StatsAutomationSent v-bind="statsSentProps" :view="currentView('StatsAutomationSent')" :changeView="changeView" :chartData="chartData"></StatsAutomationSent>
      </div>
      <div class="page-automation__item" v-if="isAutomationMaintenance" >
        <!-- KPI bloc 2 -->
        <StatsAutomationOpened
          v-bind="statsOpenedProps"
          :view="currentView('StatsAutomationOpened')"
          :changeView="changeView"
          :chartData="chartData">
        </StatsAutomationOpened>
      </div>
      <div class="page-automation__item" v-else >
        <StatsAutomationLead
        v-bind="statsLeadProps"
        :view="currentView('StatsAutomationLead')"
        :changeView="changeView"
        :chartData="chartData">
        ></StatsAutomationLead>
      </div>
      <div class="page-automation__item">
        <!-- KPI bloc 3 -->
        <StatsAutomationConverted v-bind="statsConvertedProps" :view="currentView('StatsAutomationConverted')" :changeView="changeView" :chartData="chartData"></StatsAutomationConverted>
      </div>
    </div>
    <div class="page__table">
      <!-- Table automation garages -->
      <TableAutomationGarage v-bind="garagesData" v-on="garagesDataListeners"></TableAutomationGarage>
    </div>
  </div>
</template>

<script>
import { makeApolloQueries } from '../../../util/graphql';
import TableAutomationGarage from '../../../components/cockpit/automation/TableAutomationGarage.vue';
import StatsAutomationSent from '../../../components/cockpit/automation/StatsAutomationSent.vue';
import StatsAutomationOpened from '../../../components/cockpit/automation/StatsAutomationOpened.vue';
import StatsAutomationLead from '../../../components/cockpit/automation/StatsAutomationLead.vue';
import StatsAutomationConverted from '../../../components/cockpit/automation/StatsAutomationConverted.vue';
import { setupHotJar } from '../../../util/externalScripts/hotjar';
import AutomationCampaign from '../../../utils/models/automation-campaign.type';
import { isEqual } from '~/util/arrayTools.js';

export default {
  name: "AutomationGaragesPage",
  components: {
    TableAutomationGarage,
    StatsAutomationSent,
    StatsAutomationOpened,
    StatsAutomationConverted,
    StatsAutomationLead
  },
  inheritAttrs: false,
  middleware: ['hasAccessToAutomation'],

  async mounted() {
    // Setup HotJar
    setupHotJar(this.$store.getters["locale"], 'automation');
    // Fetching data
    await Promise.all([
      this.$store.dispatch("cockpit/fetchFilters"),
      this.$store.dispatch("cockpit/refreshRouteParameters"),
      this.$store.dispatch("cockpit/fetchChartData", this.$route.name, { root: true}),
      this.fetchKpis(),
      this.fetchGaragesData(),
    ]);
  },

  data() {
    return {
      defaultLimit: 100,
      currentSkip: 0,
      loadingGaragesData: true,
      loadingMoreGaragesData: false,
      hasMoreGaragesData: true,
      garagesDataRows: [],
      loadingKpis: true,
      kpis: {},
    };
  },

    computed: {
      cockpitType() { return this.$store.getters['cockpit/cockpitType']; },
      selectedPeriod() { return this.$store.getters['cockpit/selectedPeriod']; },
      selectedCampaignType() { return this.$store.getters['cockpit/selectedAutomationCampaignType']; },
      selectedGarageId() { return this.$store.getters['cockpit/selectedGarageId']; },
      orderBy() { return this.$store.getters['cockpit/automation/garagesOrderBy']; },
      order() { return this.$store.getters['cockpit/automation/garagesOrder']; },
      search() { return this.$store.getters['cockpit/automation/garagesSearch']; },
      liveSearch() { return this.$store.getters['cockpit/automation/garagesLiveSearch']; },
      isAutomationMaintenance() {
        return this.selectedCampaignType === AutomationCampaign.AUTOMATION_MAINTENANCE
      },
      garagesData() {
        return {
          rows: this.garagesDataRows,
          orderBy: this.orderBy,
          order: this.order,
          search: this.liveSearch,
          loading: this.loadingGaragesData,
          loadingMore: this.loadingMoreGaragesData,
          hasMore: this.hasMoreGaragesData,
          campaignType: this.selectedCampaignType,
          selectedGarageId: this.selectedGarageId,
        };
      },
      garagesDataListeners() {
        return {
          loadMore: () => this.fetchGaragesData(true),
          onSort: ({ orderBy, order }) => this.$store.dispatch('cockpit/automation/setGaragesOrder', { orderBy, order }),
          onSearch: (search) => this.$store.dispatch('cockpit/automation/setGaragesSearch', search),
          onSearchInput: (search) => this.$store.dispatch('cockpit/automation/setGaragesLiveSearch', search),
        };
      },
      statsSentProps() {
        return {
          loading: this.loadingKpis,
          automationCountSent: this.kpis &&
            ((this.kpis.KPI_automationCountSentMaintenances || 0) + (this.kpis.KPI_automationCountSentSales || 0))
        };
      },
      statsOpenedProps() {
        return {
          loading: this.loadingKpis,
          automationCountSent: this.kpis &&
            ((this.kpis.KPI_automationCountSentMaintenances || 0) + (this.kpis.KPI_automationCountSentSales || 0)),
          automationCountOpened:
            (this.kpis.KPI_automationCountOpenedMaintenances || 0)
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
        chartData.config.labels = chartData.config.labels.map(label => this.$t_locale('pages/cockpit/automation/garages')(label.split('-')[1]) || label);
        return chartData;
      }
    },
    methods: {
      checkRedirect() {
        const currentGarage = this.$store.getters["cockpit/selectedGarage"];
        if (currentGarage && currentGarage.subscriptions && !currentGarage.subscriptions.Automation) {
          setTimeout(() => this.$router.replace({ name: 'cockpit-automation' }), 0);
        }
      },
      async onParamChange(fetchKpis = true) {
        await Promise.all([
          this.$store.dispatch("cockpit/fetchChartData", this.$route.name, { root: true}),
          ...(fetchKpis ? [this.fetchKpis()] : []),
          this.fetchGaragesData(),
        ]);
      },
      async fetchGaragesData(append = false) {
        if (append) {
          this.loadingMoreGaragesData = true;
          this.currentSkip += this.defaultLimit;
        } else {
          this.loadingGaragesData = true;
          this.currentSkip = 0;
        }

        const args = {
          cockpitType: this.cockpitType,
          period: this.selectedPeriod,
          type: this.selectedCampaignType,
          garageId: this.selectedGarageId,
          search: this.search,
          orderBy: this.orderBy,
          order: this.order,
          limit: this.defaultLimit,
          skip: this.currentSkip
        };

        const garagesDataRequest = {
          name: 'AutomationGaragesList',
          args,
          fields:
            `
              garageSlug,
              hideDirectoryPage,
              garageId,
              garagePublicDisplayName,
              garageHasSubscription,
              automationCountCampaigns,
              KPI_automationCountSentMaintenances,
              KPI_automationCountOpenedMaintenances,
              KPI_automationCountConvertedMaintenances,
              KPI_automationCountSentSales,
              KPI_automationCountConvertedSales,
              KPI_automationCountLeadSales,
              KPI_automationCountConverted,
              automationCountRunningCampaigns,
              automationCost,
              isConsolidate,
              isLastToggledDate,
              contactCost,
          `
        };
        const resp = await makeApolloQueries([garagesDataRequest]);
        const newRows = resp.data.AutomationGaragesList;
        this.garagesDataRows = append ? [...this.garagesDataRows, ...newRows] : newRows;
        this.loadingGaragesData = false;
        this.loadingMoreGaragesData = false;
        this.hasMoreGaragesData = (newRows.length === this.defaultLimit);
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
        // TODO add automationTotalCost
        const resp = await makeApolloQueries([kpisRequest]);
        this.kpis = resp.data.AutomationKpis;
        this.loadingKpis = false;
      },
      changeView(componentName, view){
        const route = this.$route.name;
        this.$store.dispatch("cockpit/changeComponentView", { route, componentName, view });
      },
    },
    watch: {
      async cockpitType(oldV, newV) { if (newV !== oldV) await this.onParamChange(true) },
      async selectedPeriod(oldV, newV) { if (newV !== oldV) await this.onParamChange(true) },
      async selectedCampaignType(oldV, newV) { if (newV !== oldV) await this.onParamChange(true) },
      async selectedGarageId(oldV, newV) {
        this.checkRedirect();
        if (!isEqual(newV, oldV)) {
          await this.onParamChange(true);
        }
      },
      async orderBy(oldV, newV) { if (newV !== oldV) await this.onParamChange(false) },
      async order(oldV, newV) { if (newV !== oldV) await this.onParamChange(false) },
      async search(oldV, newV) { if (newV !== oldV) await this.onParamChange(false) }
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
