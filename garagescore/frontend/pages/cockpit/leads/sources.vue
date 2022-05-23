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
      <TableLeadsSource
        :getSourceListSort="getSourceListSort"
        :hasMore="doesSourceListHasMore"
        :isLoading="isSourceListLoading"
        :isLoadingMore="isSourceListLoadingMore"
        :onLoadMore="handleLoadMore"
        :rows="sourceList"
        :setSourceListSort="setSourceListSort"
      />
    </div>
  </div>
</template>

<script>
import { makeApolloQueries } from '~/util/graphql';

import StatsLeadConverted from '~/components/cockpit/leads/StatsLeadConverted';
import StatsLeadsProcessed from '~/components/cockpit/leads/StatsLeadsProcessed';
import StatsLeadsUnprocessed from '~/components/cockpit/leads/StatsLeadsUnprocessed';
import TableLeadsSource from '~/components/cockpit/leads/source/TableLeadsSource';
import { watchersFactory } from '~/mixins/utils';
import { setupHotJar } from '~/util/externalScripts/hotjar';
import chartsKpiMixin from '~/components/cockpit/mixins/chartsKpiMixin';
import { GARAGES_AND_USERS_KPI } from '~/utils/kpi/graphqlQueries';

export default {
  name: "LeadsSourcesPage",
  components: {
    StatsLeadConverted,
    StatsLeadsProcessed,
    StatsLeadsUnprocessed,
    TableLeadsSource,
  },
  mixins: [
    chartsKpiMixin(
      'COCKPIT_LEADS_SOURCES',
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
    this.refreshRouteParameters();
    return this.refreshView();
  },

  data() {
    return {
      current: {
        orderBy: 'countLeads',
        order: 'DESC',
        search: '',
      },
      list: {
        isLoading: false,
        isLoadingMore: false,
        hasMore: false,
        currentPage: 1,
        error: '',
        data: [],
      },
    };
  },

  computed: {
    isSourceListLoadingMore() {
      return this.list.isLoadingMore;
    },
    doesSourceListHasMore() {
      return this.list.hasMore;
    },
    isSourceListLoading() {
      return this.list.isLoading;
    },
    sourceList() {
      return this.list.data;
    },
  },
  methods: {
    changeOrder({ orderBy, order }) {
      this.current.order = order;
      this.current.orderBy = orderBy;
    },
    getSourceListSort() {
      return {
        column: this.current.orderBy,
        order: this.current.order,
      };
    },
    setSourceListSort(value) {
      this.changeOrder({
        orderBy: value.column,
        order: value.order,
      });
      this.fetchListPage({
        page: 1,
        append: false,
      });
    },
    async handleLoadMore() {
      this.list.isLoadingMore = true;
      await this.fetchNextListPage();
      this.list.isLoadingMore = false;
    },
    async refreshView() {
      await this.fetchListPage({ page: 1, append: false });
      return this.navigationDataProvider.fetchFilters();
    },
    refreshRouteParameters() {
      const urlParams = {};
      this.navigationDataProvider.refreshRouteParameters(urlParams);
    },
    async fetchNextListPage() {
      return this.fetchListPage({
        page: this.list.currentPage + 1,
        append: true,
      });
    },
    async fetchListPage({ page }) {
      this.list.isLoading = true;

      const {
        cockpitType,
        garageIds,
        leadSaleType,
        periodId,
      } = this.navigationDataProvider;
      const { order, orderBy } = this.current;
      const request = {
        name: 'kpiByPeriodSourceList',
        args: {
          periodId,
          cockpitType,
          garageId: garageIds,
          leadSaleType,
          sort: orderBy,
          order,
        },
        fields: `
          sourceType
          countLeads
          countLeadsUntouched
          countLeadsTouched
          countLeadsClosedWithSale
          countLeadsReactive
        `,
      };
      const { data } = await makeApolloQueries([request]);
      const { kpiByPeriodSourceList } = data;
      this.list.currentPage = page;
      this.list.data = kpiByPeriodSourceList;
      this.list.hasMore = false;
      this.list.isLoading = false;
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
