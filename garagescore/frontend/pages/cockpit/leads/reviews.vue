<template>
  <div class="page-leads custom-scrollbar">
    <!-- NEW KPIs -->

    <KpiHeader
      :mixinKpiData="mixinKpiData"
      :navigationDataProvider="navigationDataProvider"
      :filterReviews="filterReviews"
      :currentKpiUserIdFilter="currentKpiUserIdFilter"
    />

    <!-- TABLE -->
    <div class="page-leads__table">
      <TableLeads
        :filtersDisabled="navigationDataProvider.isFiltersDisabled"
        :userHasAccessToCrossLeads="userHasAccessToCrossLeads"
        :openCreateLeadModal="openCreateLeadModal"
        :sourceTypeFilterValues="sourceTypeFilterValues"
        :hasAAgentSharingHisLeads="hasAAgentSharingHisLeads"
        :hasMore="hasMore"
        :loading="loadingTable"
        :getRowSubview="getRowSubview"
        :rows="leadsList"
        :noResultGodMode="noResultGodMode"
        :fetchNextPage="fetchNextPage"
        :liveSearch="liveSearch"
        :fetchLeadsList="fetchLeadsList"
        :changeFilters="changeFilters"
        :handleBack="navigationDataProvider.handleBack"
        :changeSearch="changeSearch"
        :changeLiveSearch="changeLiveSearch"
        :hasBackArrow="navigationDataProvider.hasBackArrow(canComeFrom)"
        :currentFilters="filters"
        :isManager="isManager"
        :currentUserId="currentUserId"
        :hasAccessToGreyBo="hasAccessToGreyBo"
        :setRowSubview="setRowSubview"
        :cockpitType="navigationDataProvider.cockpitType"
        :currentGarageIds="selectedGarageIds"
        :changeCurrentGarage="navigationDataProvider.changeGarage"
      />
    </div>
  </div>
</template>

<script>
import TableLeads from '~/components/cockpit/leads/reviews/TableLeads';
import { setupHotJar } from '~/util/externalScripts/hotjar';
import { makeApolloQueries, makeApolloMutations } from '~/util/graphql';
import { generateSubFiltersWithRoute } from '~/util/filters';
import dataTypes from '~/utils/models/data/type/data-types.js';
import SourceTypes from '~/utils/models/source-types';
import { watchersFactory } from '~/mixins/utils';
import kpiMixin from '~/components/cockpit/mixins/kpiMixin';
import { USERS_KPI } from '~/utils/kpi/graphqlQueries';
import KpiHeader from '~/components/cockpit/leads/reviews/KpiHeader';

const filtersConfigReviews = [
  {
    query: 'leadBodyType',
    payload: { filter: 'leadBodyType' },
    callbackValue: null,
  },
  {
    query: 'leadFinancing',
    payload: { filter: 'leadFinancing' },
    callbackValue: null,
  },
  {
    query: 'leadTiming',
    payload: { filter: 'leadTiming' },
    callbackValue: null,
  },
  {
    query: 'leadManager',
    payload: { filter: 'leadManager' },
    callbackValue: null,
  },
  {
    query: 'leadStatus',
    payload: { filter: 'leadStatus' },
    callbackValue: null,
  },
  {
    query: 'leadSource',
    payload: { filter: 'leadSource' },
    callbackValue: null,
  },
];

export default {
  name: "LeadsReviewsPage",
  components: {
    KpiHeader,
    TableLeads,
  },
  props: {
    navigationDataProvider: {
      type: Object,
      required: true,
    },
  },
  inheritAttrs: false,
  middleware: ['hasAccessToLeads'],
  mixins: [
    kpiMixin(USERS_KPI, [
      'navigationDataProvider.garageIds',
      'navigationDataProvider.periodId',
      'navigationDataProvider.dataTypeId',
      'navigationDataProvider.cockpitType',
      'navigationDataProvider.dms.frontDeskUserName',
      'navigationDataProvider.user',
    ], {
      kpiData: { usersKpi: {} },
    }),
  ],

  async asyncData({ route }) {
    const finalFilters = generateSubFiltersWithRoute(route, filtersConfigReviews);
    return {
      filters: { ...finalFilters, ...(route.params.leadSource ? { leadSource: route.params.leadSource } : {}) },
    };
  },
  async mounted() {
    setupHotJar(this.navigationDataProvider.locale, 'leads');
    if (!this.$store.getters['auth/isManager'] && !this.getFilters().leadManager) {
      this.setFilter({
        filter: 'leadManager',
        value: this.$store.getters['auth/currentUserId'],
      });
    }
    this.initializeFiltersValues();
    this.refreshRouteParameters();
    await this.fetchCreatedCustomLeadSources();
    return this.refreshView();
  },

  data() {
    return {
      leadsList: [],

      paginate: 10,

      search: '',
      liveSearch: '',
      filters: {
        leadBodyType: null,
        leadFinancing: null,
        leadTiming: null,
        leadManager: null,
        leadStatus: null,
        leadSource: null,
        followupLeadStatus: null,
      },

      loadingTable: true,

      leadsListCursor: null,
      hasMore: true,
      noResultGodMode: false,

      rowSubview: [],

      availableManualLeadSources: null,
      createdCustomLeadSources: null,
    };
  },

  computed: {
    selectedGarageIds() {
      const { selectedGarageIds } = this.navigationDataProvider;

      if (!selectedGarageIds || Array.isArray(selectedGarageIds)) {
        return selectedGarageIds;
      }
      return [selectedGarageIds];
    },
    hasAAgentSharingHisLeads() {
      return this.navigationDataProvider.availableGarages.some((e) => e.isAAgentSharingHisLeads);
    },
    isManager() {
      return this.$store.getters['auth/isManager'];
    },
    currentUserId() {
      return this.$store.state.auth.currentUser.id;
    },
    hasAccessToGreyBo() {
      return this.$store.state.auth.ACCESS_TO_GREYBO;
    },
    userHasAccessToCrossLeads() {
      return this.$store.getters['auth/hasAccessToCrossLeads'];
    },
    sourceTypeFilterValues() {
      return this.getSourceTypeFilterValues();
    },
    currentKpiUserIdFilter() {
      return this.isManager ? 'Team' : this.currentUserId;
    },
    canComeFrom() {
      return ['cockpit-leads-garages', 'cockpit-leads-team', 'cockpit-leads-sources'];
    },
  },
  methods: {
    getSourceTypeFilterValues() {
      const selectedLeadSaleType = this.navigationDataProvider.leadSaleType;
      const createdCustomSourceTypes = this.createdCustomLeadSources || [];

      const enumSourceTypes = SourceTypes.keys()
        .filter((key) => {
          const canHaveLeadTicket = SourceTypes.getProperty(key, 'canHaveLeadTicket');
          if (!canHaveLeadTicket) {
            return false;
          }
          if (!selectedLeadSaleType) {
            return true;
          }
          const saleTypeProp = SourceTypes.getProperty(key, 'saleType');
          if (!saleTypeProp) {
            return true;
          }
          if (Array.isArray(saleTypeProp)) {
            return saleTypeProp.includes(selectedLeadSaleType);
          }
          return saleTypeProp === selectedLeadSaleType;
        })
        // Remove that map if we prefer returning the keys instead
        .sort((keyA, keyB) => {
          return SourceTypes.getProperty(keyA, 'intValue') - SourceTypes.getProperty(keyB, 'intValue');
        })
        .map((key) => SourceTypes[key]);

      return [...enumSourceTypes, ...createdCustomSourceTypes];
    },
    getFilters() {
      const {
        periodId,
        selectedGarageIds,
        cockpitType,
        leadSaleType,
        user,
      } = this.navigationDataProvider;
      return {
        periodId,
        ...(selectedGarageIds === null ? {} : { garageId: selectedGarageIds }),
        ...(cockpitType ? { cockpitType } : {}),
        ...(leadSaleType ? { leadSaleType } : {}),
        ...(this.search ? { search: this.search } : {}),
        ...(this.filters.leadBodyType ? { leadBodyType: this.filters.leadBodyType } : {}),
        ...(this.filters.leadFinancing ? { leadFinancing: this.filters.leadFinancing } : {}),
        ...(this.filters.leadTiming ? { leadTiming: this.filters.leadTiming } : {}),
        ...(this.filters.leadManager || user
          ? { leadManager: user || this.filters.leadManager }
          : {}),
        ...(this.filters.leadStatus ? { leadStatus: this.filters.leadStatus } : {}),
        ...(this.filters.leadSource ? { leadSource: this.filters.leadSource } : {}),
        ...(this.filters.followupLeadStatus ? { followupLeadStatus: this.filters.followupLeadStatus } : {}),
      };
    },
    filterReviews(status = null, manager = null, toggle) {
      this.changeFilters({
        filters: {
          leadBodyType: null,
          leadFinancing: null,
          leadTiming: null,
          leadManager: toggle ? null : manager,
          leadStatus: toggle ? null : status,
          leadSaleType: null,
          leadSource: null,
        },
      });
      this.fetchLeadsList({ append: false });
    },

    getRowSubview(id) {
      const item = this.rowSubview.find((i) => i.id === id);
      return item ? item.view : null;
    },

    openCreateLeadModal() {
      this.$store.dispatch('openModal', {
        component: 'ModalAddLead',
        props: {
          addManualLead: this.addManualLead,
          fetchAvailableManualLeadSources: this.fetchAvailableManualLeadSources,
          cockpitType: this.navigationDataProvider.cockpitType,
          availableGarages: this.navigationDataProvider.availableGarages,
          currentGarageId: this.navigationDataProvider.selectedGarageIds,
        },
      });
    },

    async refreshView() {
      await this.fetchLeadsList({ append: false, filters: this.filters });
      return this.navigationDataProvider.fetchFilters();
    },

    async refreshRouteParameters() {
      const urlParams = {
        leadBodyType: this.filters.leadBodyType || undefined,
        leadFinancing: this.filters.leadFinancing || undefined,
        leadTiming: this.filters.leadTiming || undefined,
        leadManager: this.filters.leadManager || undefined,
        leadStatus: this.filters.leadStatus || undefined,
        leadSource: this.filters.leadSource || undefined,
        followupLeadFilter: this.filters.followupLeadStatus || undefined,
        search: this.search || undefined,
      };
      await this.navigationDataProvider.refreshRouteParameters(urlParams);
    },

    async fetchNextPage() {
      await this.fetchLeadsList({ before: this.leadsListCursor, append: true });
    },

    async fetchLeadsList({ before, append, retrieveOvhCalls, filters }) {
      if (!append) {
        this.setTableLoading(true);
      }

      if (retrieveOvhCalls) {
        const resp = await makeApolloMutations([
          {
            name: 'GarageCreateLiveCallTickets',
            args: {},
            fields: `
          newTickets
        `,
          },
        ]);
        const { GarageCreateLiveCallTickets } = resp.data;
        if (!GarageCreateLiveCallTickets.newTickets) {
          this.setTableLoading(false);
          return false; // Do not reload list if there are no new tickets
        }
      }

      const request = {
        name: 'dataGetLeadsList',
        args: {
          limit: this.paginate,
          before,
          ...{ ...this.getFilters(), ...filters },
          // null value coming from SearchBar filters be messing with the value coming from top filters
          // little hack to perform a band aid fix. Got a cleaner solution? Go ahead !
          leadManager: this.getFilters().leadManager || (filters && filters.leadManager),
        },
        fields: `datas {
          id
          garage {
            id
            publicDisplayName
          }
          source {
            type
            by
            agent {
              id
              publicDisplayName
            }
          }
          review {
            rating {
              value
            }
            comment {
              text
            }
          }
          customer {
            fullName {
              value
            }
            contact {
              mobilePhone {
                value
              }
              email {
                value
              }
            }
            city {
              value
            }
          }
          lead {
            type
          }
          leadTicket {
            saleType
            requestType
            createdAt
            referenceDate
            bodyType
            energyType
            cylinder
            sourceSubtype
            financing
            tradeIn
            timing
            budget
            manager {
              id
              firstName
              lastName
              email
            }
            brandModel
            status
            actions {
              name
              createdAt
              closedForInactivity
              reminderDate
              reminderActionName
              reminderStatus
            }
            followup {
              recontacted
              satisfied
              satisfiedReasons
              notSatisfiedReasons
              appointment
            }
            vehicle {
              makeModel
            }
          }
          surveyFollowupLead {
            sendAt
            firstRespondedAt
          }
          followupLeadStatus
        }
        hasMore
        cursor
        noResultGodMode`,
      };
      const resp = await makeApolloQueries([request]);
      const { datas: leadsList, hasMore, cursor, noResultGodMode } = resp.data.dataGetLeadsList;

      this.setHasMore(hasMore);
      this.setLeadsListCursor(cursor && new Date(cursor));
      this.setNoResultGodMode(noResultGodMode);

      if (append) {
        this.appendLeadsList(leadsList);
      } else {
        this.setTableLoading(false);
        this.setLeadsList(leadsList);
      }
    },

    async fetchAvailableManualLeadSources({ leadSaleType, selectedGarageIds }) {
      // Get current user => if god then set garageId as the selected garageId
      // Looks like it doesn't work...
      // const userIsGod = rootGetters['cockpit/admin/profile/isGod'];
      const request = {
        name: 'dataGetAvailableSources',
        args: {
          leadSaleType,
          ...(selectedGarageIds ? { garageId: selectedGarageIds } : {}),
        },
        fields: `sources`,
      };
      const resp = await makeApolloQueries([request]);
      if (resp.errors) {
        for (const { message } of resp.errors) {
          console.error({ message });
        }
        this.setAvailableManualLeadSources([]);
        return [];
      } else {
        const { sources } = resp.data.dataGetAvailableSources;
        this.setAvailableManualLeadSources(sources);
        return sources;
      }
    },

    async fetchCreatedCustomLeadSources() {
      const { selectedGarageIds } = this.navigationDataProvider;
      const request = {
        name: 'dataGetAvailableSources',
        args: {
          ...(selectedGarageIds ? { garageId: selectedGarageIds } : {}),
          customSourcesOnly: true,
        },
        fields: `sources`,
      };
      const resp = await makeApolloQueries([request]);
      if (resp.errors) {
        for (const { message } of resp.errors) {
          console.error({ message });
          this.setCreatedCustomLeadSources([]);
        }
      } else {
        const { sources } = resp.data?.dataGetAvailableSources;
        this.setCreatedCustomLeadSources(sources);
      }
    },

    async addManualLead({
      fullName,
      email,
      phone,
      garageId,
      leadSaleType,
      sourceType,
      requestType,
      vehicleModel,
      leadTiming,
      brandModel,
      leadFinancing,
      leadTradeIn,
    }) {
      this.setTableLoading(true);
      const request = {
        name: 'dataSetManualTicket',
        args: {
          ticketType: dataTypes.MANUAL_LEAD,
          fullName,
          email,
          phone,
          garageId,
          leadSaleType,
          sourceType,
          requestType,
          vehicleModel,
          leadTiming,
          brandModel,
          leadFinancing,
          leadTradeIn,
        },
        fields: `message
       status
       id`,
      };
      const resp = await makeApolloMutations([request]);
      this.setTableLoading(false);
      if (resp?.data?.dataSetManualTicket?.id) {
        await this.$router.push({
          name: 'cockpit-leads-id',
          params: { id: resp.data.dataSetManualTicket.id },
        });
      } else {
        await this.$store.dispatch(
          'openModal',
          {
            component: 'ModalMessage',
            props: {
              message: `Erreur sur le serveur: ${resp?.data?.dataSetManualTicket?.message}`,
              type: 'danger',
            },
          },
          { root: true }
        );
      }
    },

    changeSearch({ search }) {
      this.search = search;
      this.refreshRouteParameters();
    },
    changeLiveSearch({ search }) {
      this.liveSearch = search;
    },
    changeFilters({ filters }) {
      this.filters = filters;
      this.saveCurrentSubfilters();
    },

    // TODO keep this maybe for futur exports
    // async startExport({ email }) {
    //   const exportType = ExportTypes.LEADS;
    //   const specificFilters = {
    //     leadsSearch: this.search || null,
    //     leadsBodyType: this.filters.leadBodyType || null,
    //     leadsFinancing: this.filters.leadFinancing || null,
    //     leadsTiming: this.filters.leadTiming || null,
    //     leadsSaleType: this.navigationDataProvider.leadSaleType || null,
    //     leadsManager: this.navigationDataProvider.user || this.filters.leadManager || null,
    //     leadsTicketStatus: this.filters.leadStatus || null,
    //     leadsSource: this.filters.leadSource || null,
    //     leadsFollowupStatus: this.filters.followupLeadStatus || null,
    //   };
    //
    //   return this.$store.dispatch('cockpit/startExport', { exportType, email, specificFilters }, { root: true });
    // },

    setTableLoading(val) {
      this.loadingTable = val;
    },

    appendLeadsList(data) {
      this.leadsList = this.leadsList.concat(data);
    },

    setLeadsList(data) {
      this.leadsList = data;
    },

    setHasMore(data) {
      this.hasMore = data;
    },

    setLeadsListCursor(data) {
      this.leadsListCursor = data;
    },

    setNoResultGodMode(data) {
      this.noResultGodMode = data;
    },

    setFilter({ filter, value }) {
      this.filters[filter] = value;
      this.refreshRouteParameters();
    },

    setRowSubview({ id, view }) {
      const item = this.rowSubview.find((i) => i.id === id);

      !item ? this.rowSubview.push({ id, view }) : (item.view = view === item.view && item.view !== null ? null : view);
    },

    setAvailableManualLeadSources(sources) {
      this.availableManualLeadSources = sources;
    },
    setCreatedCustomLeadSources(sources) {
      this.createdCustomLeadSources = sources;
    },
    saveCurrentSubfilters() {
      sessionStorage.setItem(`${this.$route.name}_subfilters`, JSON.stringify(this.filters));
    },
    initializeFiltersValues() {
      const allowedKeys = [
        'leadBodyType',
        'leadFinancing',
        'leadTiming',
        'leadManager',
        'leadStatus',
        'leadSource',
        'followupLeadStatus',
      ];
      const savedEntries = sessionStorage.getItem(`${this.$route.name}_subfilters`);
      Object.entries(savedEntries ? JSON.parse(savedEntries) : {}).forEach(([filter, value]) => {
        if (value !== null && allowedKeys.includes(filter)) {
          this.$set(this.filters, filter, value);
        }
      });
    }
  },
  watch: {
    ...watchersFactory({
      'navigationDataProvider.periodId': ['refreshView'],
      'navigationDataProvider.garageIds': ['refreshView', 'fetchCreatedCustomLeadSources'], // cf. DropdownGarage.vue (fetchCreatedCustomLeadSources)
      'navigationDataProvider.cockpitType': ['refreshView'],
      'navigationDataProvider.leadSaleType': ['refreshView', 'fetchCreatedCustomLeadSources'],
      'navigationDataProvider.dataTypeId': ['refreshView'],
      'navigationDataProvider.user': ['refreshView'],
    }),
  },
};
</script>

<style lang="scss" scoped>
.page-leads {
  position: relative;
  height: calc(100vh - 8.5rem);
  overflow-x: hidden;
  overflow-y: auto;
  top: 1rem;
  padding-top: 0.15rem;
  box-sizing: border-box;

  &__part {
    display: flex;
    flex-flow: column;

    & + & {
      margin-top: 1rem;
    }
  }

  &__part-kpi {
    padding: 0 0.5rem 1rem 1rem;

    * + * {
      margin-top: 1rem;
    }
  }
}

@media (min-width: $breakpoint-min-md) {
  .page-leads {
    &__part {
      flex-flow: row;
    }

    &__part-kpi {
      * + * {
        margin-top: 0;
        margin-left: 1rem;
      }
    }
  }
}

@media (max-width: $breakpoint-min-md) {
  .page-leads {
    top: 0;
    height: calc(100vh - 8.5rem);
  }
}
</style>
