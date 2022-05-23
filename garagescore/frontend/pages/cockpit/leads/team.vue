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
    <div class="page-cockpit__table">
      <TableLeadsTeam
        :doesTeamListHasMore="doesTeamListHasMore"
        :getSort="getTableSort"
        :hasBackArrow="navigationDataProvider.hasBackArrow(canComeFrom)"
        :isTeamListLoading="isTeamListLoading"
        :isTeamListLoadingMore="isTeamListLoadingMore"
        :onBack="navigationDataProvider.handleBack"
        :onLoadMore="onLoadMore"
        :onSearch="onTableSearch"
        :onSearchChange="onTableSearchChange"
        :setSort="setTableSort"
        :teamList="teamList"
        :teamSearch="teamSearch"
        :filterByUser="filterByUser"
      />
    </div>
  </div>
</template>

<script>
import StatsLeadConverted from '~/components/cockpit/leads/StatsLeadConverted';
import StatsLeadsProcessed from '~/components/cockpit/leads/StatsLeadsProcessed';
import StatsLeadsUnprocessed from '~/components/cockpit/leads/StatsLeadsUnprocessed';
import TableLeadsTeam from '~/components/cockpit/leads/team/TableLeadsTeam';
import { watchersFactory } from '~/mixins/utils';
import { setupHotJar } from '~/util/externalScripts/hotjar';
import { makeApolloQueries } from '~/util/graphql';
import chartsKpiMixin from '~/components/cockpit/mixins/chartsKpiMixin';
import { GARAGES_AND_USERS_KPI } from '~/utils/kpi/graphqlQueries';

export default {
  name: "LeadsTeamPage",
  components: {
    StatsLeadConverted,
    StatsLeadsProcessed,
    StatsLeadsUnprocessed,
    TableLeadsTeam,
  },
  mixins: [
    chartsKpiMixin(
      'COCKPIT_LEADS_TEAM',
      GARAGES_AND_USERS_KPI,
      { kpiData: { garagesKpi: {}, usersKpi: {} } }
    )
  ],
  props: {
    navigationDataProvider: {
      type: Object,
      required: true,
    },
  },
  inheritAttrs: false,
  middleware: ['hasAccessToLeads'],

  async mounted() {
    setupHotJar(this.navigationDataProvider.locale, 'leads');
    await this.navigationDataProvider.refreshRouteParameters({
      garageIds: undefined,
      user: undefined,
      ...this.$route.query
    });
    await this.navigationDataProvider.syncRouteToState(this.$route);
    await this.refreshView();
  },

  data() {
    return {
      current: {
        orderBy: 'countLeads',
        order: 'DESC',
        search: '',
        liveSearch: '',
      },
      list: {
        isLoading: false,
        isLoadingMore: false,
        hasMore: false,
        currentPage: 1,
        error: '',
        data: [],
      },
      paginate: 10,
    };
  },

  computed: {
    doesTeamListHasMore() {
      return this.list.hasMore;
    },
    canComeFrom() {
      return ['cockpit-leads-garages'];
    },
    isTeamListLoading() {
      return this.list.isLoading;
    },
    isTeamListLoadingMore() {
      return this.list.isLoadingMore;
    },
    teamList() {
      return this.list.data;
    },
    teamSearch() {
      return this.current.liveSearch;
    },
  },
  methods: {
    async refreshView() {
      await this.fetchListPage({ page: 1, append: false });
      return this.navigationDataProvider.fetchFilters();
    },
    async filterByUser(row) {
      await this.navigationDataProvider.setFromRowClick(this.$route);
      const route = this.navigationDataProvider.createRoute('cockpit-leads-reviews', undefined, {
        user: row.userId,
        garageIds: row.garageId
      })

      await this.$router.push(route);
    },
    async fetchNextListPage() {
      await this.fetchListPage({
        page: this.list.currentPage + 1,
        append: true,
      });
    },
    refreshRouteParameters(urlParams = {}) {
      this.navigationDataProvider.refreshRouteParameters(urlParams);
    },
    async fetchListPage({ page, append }) {
      this.list.isLoading = true;

      const {
        cockpitType,
        garageIds,
        leadSaleType,
        periodId,
        user,
      } = this.navigationDataProvider;
      const { order, orderBy } = this.current;
      const request = {
        name: 'kpiByPeriodGetList',
        args: {
          periodId,
          cockpitType,
          garageId: garageIds,
          userId: user,
          dataType: leadSaleType,
          listType: 'lead',
          cockpitInterface: 'users',
          search: this.current.search,
          limit: this.paginate,
          skip: (page - 1) * this.paginate,
          sort: orderBy,
          order,
        },
        fields: `
          list {
            garageId
            displayName
            hideDirectoryPage
            countLeads
            countLeadsUntouched
            countLeadsTouched
            countLeadsClosedWithSale
            countLeadsReactive
            garageSlug
            garagePublicDisplayName
            isDeleted
            isUnassigned
            userId
          }
          hasMore
        `,
      };
      const { data } = await makeApolloQueries([request]);
      const { kpiByPeriodGetList } = data || {};
      this.list.currentPage = page;
      append
        ? this.appendList(kpiByPeriodGetList?.list)
        : this.setList(kpiByPeriodGetList?.list);
      this.list.hasMore = kpiByPeriodGetList.hasMore;
      this.list.isLoading = false;
    },
    changeOrder({ orderBy, order }) {
      this.setOrder({ orderBy, order });
    },
    changeSearch({ search }) {
      this.setSearch({ search });
    },
    changeLiveSearch({ search }) {
      this.setLiveSearch({ search });
    },
    async onLoadMore() {
      this.list.isLoadingMore = true;
      await this.fetchNextListPage();
      this.list.isLoadingMore = false;
    },
    setList(data) {
      this.list.data = data;
    },
    appendList(data) {
      this.list.data = this.list.data.concat(data);
    },
    setOrder({ orderBy, order }) {
      this.current.order = order;
      this.current.orderBy = orderBy;
    },
    setSearch({ search }) {
      this.current.search = search;
    },
    setLiveSearch({ search }) {
      this.current.liveSearch = search;
    },
    getTableSort() {
      return {
        column: this.current.orderBy,
        order: this.current.order,
      };
    },
    async onTableSearch(teamSearch) {
      this.changeSearch({ search: teamSearch });
      await this.fetchListPage({
        page: 1,
        append: false,
      });
    },
    onTableSearchChange(teamSearch) {
      this.changeLiveSearch({
        search: teamSearch,
      });
    },
    setTableSort(value) {
      this.changeOrder({
        orderBy: value.column,
        order: value.order,
      });
      this.fetchListPage({
        page: 1,
        append: false,
      });
    },
  },
  watch: {
    ...watchersFactory({
      'navigationDataProvider.periodId': ['refreshView'],
      'navigationDataProvider.garageIds': ['refreshView'],
      'navigationDataProvider.cockpitType': ['refreshView'],
      'navigationDataProvider.leadSaleType': ['refreshView'],
      'navigationDataProvider.dataTypeId': ['refreshView'],
      'navigationDataProvider.user': ['refreshView'],
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
        margin: 0 0 1rem 0;
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
