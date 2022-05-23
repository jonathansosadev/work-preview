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
      <TableLeadsGarage
        :loading="list.loading"
        :hasMore="list.hasMore"
        :rows="list.data"
        :fetchNextListPage="fetchNextListPage"
        :cockpitType="navigationDataProvider.cockpitType"
        :order="order"
        :orderBy="orderBy"
        :changeOrder="changeOrder"
        :fetchListPage="fetchListPage"
        :setSearch="setSearch"
        :setLiveSearch="setLiveSearch"
        :liveSearch="liveSearch"
        :wwwUrl="navigationDataProvider.wwwUrl"
      />
    </div>
  </div>
</template>

<script>
import TableLeadsGarage from '~/components/cockpit/leads/garages/TableLeadsGarage';
import StatsLeadsUnprocessed from '~/components/cockpit/leads/StatsLeadsUnprocessed';
import StatsLeadsProcessed from '~/components/cockpit/leads/StatsLeadsProcessed';
import StatsLeadConverted from '~/components/cockpit/leads/StatsLeadConverted';
import { setupHotJar } from '~/util/externalScripts/hotjar';
import { makeApolloQueries } from '~/util/graphql';
import { watchersFactory } from '~/mixins/utils';
import chartsKpiMixin from '~/components/cockpit/mixins/chartsKpiMixin';
import { GARAGES_AND_USERS_KPI } from '~/utils/kpi/graphqlQueries';

export default {
  name: "LeadsGaragesPage",
  components: {
    StatsLeadsUnprocessed,
    StatsLeadsProcessed,
    StatsLeadConverted,
    TableLeadsGarage,
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
      'COCKPIT_LEADS_GARAGES',
      GARAGES_AND_USERS_KPI,
      { kpiData: { garagesKpi: {}, usersKpi: {} } }
    )
  ],

  async mounted() {
    setupHotJar(this.navigationDataProvider.locale, 'leads');
    this.navigationDataProvider.refreshRouteParameters();
    return this.refreshView();
  },

  data() {
    return {
      orderBy: 'countLeads',
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

  methods: {
    async fetchListPage({ page, append }) {
      this.list.loading = true;
      const request = {
        name: 'kpiByPeriodGetList',
        args: {
          periodId: this.navigationDataProvider.periodId,
          cockpitType: this.navigationDataProvider.cockpitType,
          garageId: this.navigationDataProvider.garageIds,
          userId: this.navigationDataProvider.user,
          dataType: this.navigationDataProvider.leadSaleType,
          listType: 'lead',
          cockpitInterface: 'garages',
          search: this.search,
          limit: this.paginate,
          skip: ((page - 1) * this.paginate) || 0,
          sort: this.orderBy,
          order: this.order,
        },
        fields: `
        list {
          garageId
          externalId
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
      const {
        data: {
          kpiByPeriodGetList = {},
        } = {}
      } = await makeApolloQueries([request]);

      const { list, hasMore } = kpiByPeriodGetList;
      const finalList = list || [];

      this.list = {
        ...this.list,
        currentPage: page,
        data: append
          ? [
            ...this.list.data,
            ...finalList,
          ]
          : finalList,
        hasMore,
        loading: false,
      };
    },

    async fetchNextListPage() {
      await this.fetchListPage({
        page: this.list.currentPage + 1,
        append: true,
      });
    },
    changeOrder(value) {
      this.orderBy = value.column;
      this.order = value.order;
    },
    setSearch(search) {
      this.search = search;
    },
    setLiveSearch(liveSearch) {
      this.liveSearch = liveSearch;
    },
    async refreshView() {
      if (this.navigationDataProvider.user) {
        return Promise.all([
          this.navigationDataProvider.changeUser(null),
          this.navigationDataProvider.refreshRouteParameters(),
        ]);
      } else {
        await this.fetchListPage({ page: 1, append: false });
        return this.navigationDataProvider.fetchFilters();
      }
    },
  },
  watch: {
    ...watchersFactory({
      'navigationDataProvider.periodId': ['refreshView'],
      'navigationDataProvider.cockpitType': ['refreshView'],
      'navigationDataProvider.garageIds': ['refreshView'],
      'navigationDataProvider.user': ['refreshView'],
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
