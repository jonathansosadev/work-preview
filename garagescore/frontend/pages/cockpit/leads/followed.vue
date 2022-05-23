<template>
  <div class="page-cockpit custom-scrollbar">
    <div class="page-cockpit__stats">
      <div class="page-cockpit__item">
        <StatsLeadsUnprocessed
          :chartInfoFilters="mixinChartKpiInfoFilters"
          :chartKpiDataAndConf="mixinChartKpiDataAndConf"
          :onChangeView="mixinChartKpiOnViewChange"
        />
      </div>
      <div class="page-cockpit__item">
        <StatsLeadsProcessed
          :chartInfoFilters="mixinChartKpiInfoFilters"
          :chartKpiDataAndConf="mixinChartKpiDataAndConf"
          :onChangeView="mixinChartKpiOnViewChange"
        />
      </div>
      <div class="page-cockpit__item">
        <StatsLeadConverted
          :chartInfoFilters="mixinChartKpiInfoFilters"
          :chartKpiDataAndConf="mixinChartKpiDataAndConf"
          :onChangeView="mixinChartKpiOnViewChange"
        />
      </div>
    </div>
    <!-- TABLE -->
    <div class="page-leads__table">
      <TableLeadsFollowed
        :filtersDisabled="navigationDataProvider.isFiltersDisabled"
        :hasAAgentSharingHisLeads="hasAAgentSharingHisLeads"
        :hasMore="hasMore"
        :loading="loading.table"
        :getRowSubview="getRowSubview"
        :rows="leadsList"
        :fetchNextPage="fetchNextPage"
        :fetchLeadsList="fetchLeadsList"
        :changeFilters="changeFilters"
        :setSearch="setSearch"
        :setLiveSearch="setLiveSearch"
        :liveSearch="liveSearch"
        :filters="filters"
        :changeRowSubview="changeRowSubview"
        :cockpitType="navigationDataProvider.cockpitType"
        :currentGarageIds="selectedGarageIds"
        :changeCurrentGarage="changeCurrentGarage"
      />
    </div>
  </div>
</template>

<script>
import TableLeadsFollowed from '~/components/cockpit/leads/followed/TableLeadsFollowed';
import StatsLeadsProcessed from '~/components/cockpit/leads/StatsLeadsProcessed';
import StatsLeadsUnprocessed from '~/components/cockpit/leads/StatsLeadsUnprocessed';
import StatsLeadConverted from '~/components/cockpit/leads/StatsLeadConverted';
import { setupHotJar } from '~/util/externalScripts/hotjar';
import { generateSubFiltersWithRoute } from '~/util/filters';
import { makeApolloQueries } from '~/util/graphql';
import { watchersFactory } from '~/mixins/utils';
import chartsKpiMixin from '~/components/cockpit/mixins/chartsKpiMixin';
import { GARAGES_AND_USERS_KPI } from '~/utils/kpi/graphqlQueries';

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
  name: "LeadsFollowedPage",
  components: {
    TableLeadsFollowed,
    StatsLeadsProcessed,
    StatsLeadsUnprocessed,
    StatsLeadConverted,
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
    chartsKpiMixin(
      'COCKPIT_LEADS_FOLLOWED',
      GARAGES_AND_USERS_KPI,
      { kpiData: { garagesKpi: {}, usersKpi: {} } }
    )
  ],

  async asyncData({ route }) {
    const finalFilters = generateSubFiltersWithRoute(route, filtersConfigReviews);
    return { filters: finalFilters };
  },
  async mounted() {
    setupHotJar(this.navigationDataProvider.locale, 'leads');
    this.initializeFiltersValues();
    this.refreshRouteParameters();
    return this.refreshView();
  },

  data() {
    return {
      leadsList: [],

      paginate: 10,

      search: '',
      liveSearch: '',
      filters: {
        leadTiming: null,
        leadStatus: null,
      },

      loading: {
        table: true,
      },

      leadsListCursor: null,
      hasMore: true,

      rowSubview: [],
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
    currentView() {
      const state = this.$store.getters['cockpit/componentsView'];
      return function (componentName) {
        return state[componentName]['view'];
      };
    },
    chartData() {
      const chartData = this.$store.getters['cockpit/chart'];
      chartData.config.labels = chartData.config.labels.map((label) => this.$t_locale('pages/cockpit/leads/followed')(label.split('-')[1]) || label);
      return chartData;
    },
    userLeadsKpi() {
      return this.$store.getters['cockpit/usersLeadsKpi'];
    },
    garagesLeadsKpi() {
      return this.$store.getters['cockpit/garagesLeadsKpi'];
    },
    hasAAgentSharingHisLeads() {
      return this.navigationDataProvider.availableGarages.some((e) => e.isAAgentSharingHisLeads);
    },
  },
  methods: {
    changeCurrentGarage(garageId) {
      this.navigationDataProvider.changeGarage(garageId);
    },
    getRowSubview(id) {
      const item = this.rowSubview.find((i) => i.id === id);
      return item ? item.view : null;
    },
    changeRowSubview({ id, view }) {
      const item = this.rowSubview.find((i) => i.id === id);
      !item ? this.rowSubview.push({ id, view }) : (item.view = view === item.view && item.view !== null ? null : view);
    },
    getFilters() {
      const {
        route,
        garageIds,
        cockpitType,
        leadSaleType,
        periodId,
      } = this.navigationDataProvider;
      const isFollowedLeadsRoute = route?.name?.includes('cockpit-leads-followed');

      return {
        periodId,
        ...(garageIds !== null ? { garageId: garageIds } : {}),
        ...(cockpitType ? { cockpitType } : {}),
        ...(leadSaleType ? { leadSaleType } : {}),
        ...(this.search ? { search: this.search } : {}),
        ...(this.filters.leadTiming ? { leadTiming: this.filters.leadTiming } : {}),
        ...(this.filters.leadStatus ? { leadStatus: this.filters.leadStatus } : {}),
        ...(isFollowedLeadsRoute ? { followed: true } : {}),
      };
    },
    async fetchLeadsList({ before, append }) {
      if (!append) {
        this.loading.table = true;
      }

      const request = {
        name: 'dataGetLeadsList',
        args: {
          limit: this.paginate,
          before,
          ...this.getFilters(),
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
        cursor`,
      };
      const resp = await makeApolloQueries([request]);
      const { datas: leadsList, hasMore, cursor } = resp.data.dataGetLeadsList;

      this.hasMore = hasMore;
      this.leadsListCursor = cursor && new Date(cursor);

      this.leadsList = append ? [...this.leadsList, ...leadsList] : leadsList;
      this.loading.table = false;
    },
    async fetchNextPage() {
      await this.fetchLeadsList({
        before: this.leadsListCursor,
        append: true,
      });
    },
    changeFilters(newFilters) {
      this.filters = newFilters;
      this.saveCurrentSubfilters();
    },
    setSearch(search) {
      this.search = search;
      this.refreshRouteParameters();
    },
    setLiveSearch(liveSearch) {
      this.liveSearch = liveSearch;
    },
    async refreshView() {
      await this.fetchLeadsList({ append: false });
      return this.navigationDataProvider.fetchFilters();
    },
    refreshRouteParameters() {
      const urlParams = {
        leadTiming: this.filters.leadTiming || undefined,
        leadStatus: this.filters.leadStatus || undefined,
        search: this.search || undefined,
      };
      this.navigationDataProvider.refreshRouteParameters(urlParams);
    },
    saveCurrentSubfilters() {
      sessionStorage.setItem(`${this.$route.name}_subfilters`, JSON.stringify(this.filters));
    },
    initializeFiltersValues() {
      const allowedKeys = ['leadTiming', 'leadStatus'];
      const savedEntries = sessionStorage.getItem(`${this.$route.name}_subfilters`);
      Object.entries(savedEntries ? JSON.parse(savedEntries) : {}).forEach(([filter, value]) => {
        if (value !== null && allowedKeys.includes(filter)) {
          this.$set(this.filters, filter, value);
        }
      });
    },
    //    async startExport({ state, dispatch, rootState }, { email }) {
    //   const exportType = ExportTypes.FORWARDED_LEADS;
    //   const specificFilters = {
    //     leadsSearch: state.search || null,
    //     leadsSaleType: rootState.cockpit.current.leadSaleType || null,
    //     leadsTiming: state.filters.leadTiming || null,
    //     leadsTicketStatus: state.filters.leadStatus || null
    //   };

    //   return dispatch('cockpit/startExport', { exportType, email, specificFilters }, { root: true });
    // }
  },
  watch: {
    ...watchersFactory({
      'navigationDataProvider.periodId': ['refreshView'],
      'navigationDataProvider.garageIds': ['refreshView'],
      'navigationDataProvider.cockpitType': ['refreshView'],
      'navigationDataProvider.leadSaleType': ['refreshView'],
    }),
  },
};
</script>

<style lang="scss" scoped>
.page-cockpit {
  position: relative;
  height: calc(100vh - 8.5rem);
  overflow-x: hidden;
  overflow-y: auto;
  top: 1rem;
  padding-top: 0.15rem;
  box-sizing: border-box;

  &__stats {
    display: flex;
    justify-content: flex-start;
    align-items: stretch;
    flex-flow: column;
    padding: 0 0.5rem 1rem 1rem;
  }

  &__subitem {
    flex: 1;
    margin-bottom: 1rem;
    &--a {
      flex: 1.5;
    }
    &:last-child {
      margin: 0;
    }
  }

  &__item {
    height: 221px;
    width: 100%;

    &--split {
      margin-bottom: 0;
    }

    &:not(:last-child) {
      margin-bottom: 1rem;
    }
  }
}

@media (min-width: $breakpoint-min-md) {
  .page-cockpit {
    &__stats {
      flex-flow: row;
      /* height: 14rem; //IE FIX */
    }

    &__subitem {
      margin-bottom: 1rem;

      &:first-child {
        margin: 0;
        margin-bottom: 1rem;
      }

      &:last-child {
        margin: 0;
      }
    }

    &__item {
      width: 33%;
      flex: 1;
      /* height: 14rem; //IE FIX */
      margin: 0 1rem 0 1rem;

      &--split {
        display: flex;
        flex-flow: column;
      }

      &:not(:last-child) {
        margin: 0;
      }

      &:first-child {
        margin: 0 1rem 0 0;
      }

      &:last-child {
        margin: 0 0 0 1rem;
      }

      &--twice {
        flex-direction: column;
      }
    }
  }
}
@media (max-width: $breakpoint-min-md) {
  .page-cockpit {
    top: 0;
    height: calc(100vh - 8.5rem);
  }
}
</style>
