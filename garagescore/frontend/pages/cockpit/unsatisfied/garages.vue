<template>
  <div class="page-cockpit custom-scrollbar">
    <div class="page-cockpit__stats">
      <div class="page-cockpit__item">
        <StatsUnsatisfiedUnprocessed
          :chartInfoFilters="mixinChartKpiInfoFilters"
          :chartKpiDataAndConf="mixinChartKpiDataAndConf"
          :onChangeView="mixinChartKpiOnViewChange"
        />
      </div>
      <div class="page-cockpit__item">
        <StatsUnsatisfiedProcessed
          :chartInfoFilters="mixinChartKpiInfoFilters"
          :chartKpiDataAndConf="mixinChartKpiDataAndConf"
          :onChangeView="mixinChartKpiOnViewChange"
        />
      </div>
      <div class="page-cockpit__item">
        <StatsUnsatisfiedSaved
          :chartInfoFilters="mixinChartKpiInfoFilters"
          :chartKpiDataAndConf="mixinChartKpiDataAndConf"
          :onChangeView="mixinChartKpiOnViewChange"
        />
      </div>
    </div>
    <div class="page-cockpit__table">
      <TableUnsatisfiedGarage
        :cockpitType="navigationDataProvider.cockpitType"
        :wwwUrl="navigationDataProvider.wwwUrl"
        :rows="rows"
        :liveSearch="liveSearch"
        :listHasMore="listHasMore"
        :listLoading="listLoading"
        :order="order"
        :orderBy="orderBy"
        :setOrder="setOrder"
        :setSearch="setSearch"
        :setLiveSearch="setLiveSearch"
        :fetchListPage="fetchListPage"
        :fetchNextListPage="fetchNextListPage"
      />
    </div>
  </div>
</template>

<script>
import StatsUnsatisfiedProcessed from '~/components/cockpit/unsatisfied/StatsUnsatisfiedProcessed';
import StatsUnsatisfiedSaved from '~/components/cockpit/unsatisfied/StatsUnsatisfiedSaved';
import StatsUnsatisfiedUnprocessed from '~/components/cockpit/unsatisfied/StatsUnsatisfiedUnprocessed';
import TableUnsatisfiedGarage from '~/components/cockpit/unsatisfied/garages/TableUnsatisfiedGarage';
import { watchersFactory } from '~/mixins/utils';
import { setupHotJar } from '~/util/externalScripts/hotjar';
import { makeApolloQueries } from '~/util/graphql';
import chartsKpiMixin from '~/components/cockpit/mixins/chartsKpiMixin';
import { GARAGES_KPI } from '~/utils/kpi/graphqlQueries';

export default {
  name: "UnsatisfiedGaragesPage",
  components: {
    StatsUnsatisfiedSaved,
    StatsUnsatisfiedUnprocessed,
    StatsUnsatisfiedProcessed,
    TableUnsatisfiedGarage,
  },
  props: {
    navigationDataProvider: { type: Object, required: true },
  },
  inheritAttrs: false,
  middleware: ['hasAccessToUnsatisfied'],
  mixins: [
    chartsKpiMixin('COCKPIT_UNSATISFIED_GARAGES', GARAGES_KPI, { kpiData: { garagesKpi: {} } })
  ],

  async mounted() {
    setupHotJar(this.navigationDataProvider.locale, 'unsatisfied');
    this.navigationDataProvider.refreshRouteParameters();
    return this.refreshView();
  },

  data() {
    return {
      orderBy: 'countUnsatisfied',
      order: 'DESC',
      search: '',
      liveSearch: '',

      paginate: 10,

      list: {
        loading: true,
        hasMore: false,
        currentPage: 1,
        error: '',
        data: [],
      },
    };
  },

  computed: {
    rows() {
      return this.list.data;
    },
    listLoading() {
      return !!(this.list.loading);
    },
    listHasMore() {
      return !!(this.list.hasMore);
    },
  },
  methods: {
    setList(data) {
      this.list.data = data;
    },

    appendList(data) {
      this.list.data = this.list.data.concat(data);
    },

    setListLoading(loading) {
      this.list.loading = loading;
    },
    setListCurrentPage({ page }) {
      this.list.currentPage = page;
    },
    setListHasMore(hasMore) {
      this.list.hasMore = hasMore;
    },

    setOrder({ orderBy, order }) {
      this.$set(this, 'order', order);
      this.$set(this, 'orderBy', orderBy);
    },

    setSearch({ search }) {
      this.search = search;
    },
    setLiveSearch({ search }) {
      this.liveSearch = search;
    },

    async refreshView() {
      if (this.navigationDataProvider.user) {
        return this.navigationDataProvider.changeUser(null);
      } else {
        await this.fetchListPage({ page: 1, append: false });
        return this.navigationDataProvider.fetchFilters();
      }
    },

    async fetchNextListPage() {
      await this.fetchListPage({ page: this.list.currentPage + 1, append: true });
    },

    async fetchListPage({ page, append } = { page: 1, append: false }) {
      this.setListLoading(true);
      const request = {
        name: 'kpiByPeriodGetList',
        args: {
          garageId: this.navigationDataProvider.garageIds,
          dataType: this.navigationDataProvider.dataTypeId,
          periodId: this.navigationDataProvider.periodId,
          cockpitType: this.navigationDataProvider.cockpitType,
          cockpitInterface: 'garages',
          sort: this.orderBy,
          order: this.order,
          search: this.search,
          limit: this.paginate,
          skip: (page - 1) * this.paginate,
          userId: this.navigationDataProvider.user,
          listType: 'unsatisfied',
        },
        fields: `
        list {
          displayName
          externalId
          hideDirectoryPage
          countUnsatisfied
          countUnsatisfiedUntouched
          countUnsatisfiedTouched
          countUnsatisfiedClosedWithResolution
          countUnsatisfiedReactive
          garageId
          userId
          garageSlug
          garagePublicDisplayName
          isDeleted
          isUnassigned
        }
        hasMore
      `,
      };
      const resp = await makeApolloQueries([request]);
      this.setListCurrentPage({ page });
      append
        ? this.appendList(resp.data.kpiByPeriodGetList.list)
        : this.setList(resp.data.kpiByPeriodGetList.list);
      this.setListHasMore(resp.data.kpiByPeriodGetList.hasMore);
      this.setListLoading(false);
    },
  },
  watch: {
    ...watchersFactory({
      'navigationDataProvider.garageIds': ['refreshView'],
      'navigationDataProvider.periodId': ['refreshView'],
      'navigationDataProvider.dataTypeId': ['refreshView'],
      'navigationDataProvider.cockpitType': ['refreshView'],
      'navigationDataProvider.dms.frontDeskUserName': ['refreshView'],
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

  &__item {
    height: 100%;
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

    &__item {
      height: 221px;
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
