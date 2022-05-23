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
      <TableUnsatisfiedTeam
        :liveSearch="list.liveSearch"
        :cockpitType="navigationDataProvider.cockpitType"
        :setSearch="setSearch"
        :setLiveSearch="setLiveSearch"
        :setOrder="setOrder"
        :currentOrder="currentOrder"
        :filterByUser="filterByUser"
        :rows="list.data"
        :loading="list.loading"
        :hasMore="list.hasMore"
        :openModal="openModal"
        :fetchNextListPage="fetchNextListPage"
        :fetchListPage="fetchListPage"
        :handleBack="navigationDataProvider.handleBack"
        :hasBackArrow="navigationDataProvider.hasBackArrow(canComeFrom)"
      />
    </div>
  </div>
</template>

<script>
import StatsUnsatisfiedProcessed from '~/components/cockpit/unsatisfied/StatsUnsatisfiedProcessed';
import StatsUnsatisfiedSaved from '~/components/cockpit/unsatisfied/StatsUnsatisfiedSaved';
import StatsUnsatisfiedUnprocessed from '~/components/cockpit/unsatisfied/StatsUnsatisfiedUnprocessed';
import TableUnsatisfiedTeam from '~/components/cockpit/unsatisfied/team/TableUnsatisfiedTeam';
import { watchersFactory } from '~/mixins/utils';
import { setupHotJar } from '~/util/externalScripts/hotjar';
import { makeApolloQueries } from '~/util/graphql';
import { USERS_KPI } from '~/utils/kpi/graphqlQueries';
import chartsKpiMixin from '~/components/cockpit/mixins/chartsKpiMixin';

export default {
  name: "UnsatisfiedTeamPage",
  components: {
    TableUnsatisfiedTeam,
    StatsUnsatisfiedProcessed,
    StatsUnsatisfiedUnprocessed,
    StatsUnsatisfiedSaved,
  },
  props: {
    navigationDataProvider: {
      type: Object,
      required: true,
    },
  },
  inheritAttrs: false,
  middleware: ['hasAccessToUnsatisfied'],
  mixins: [
    chartsKpiMixin('COCKPIT_UNSATISFIED_TEAM', USERS_KPI, { kpiData: { usersKpi: {} } })
  ],

  async mounted() {
    this.list.loading = true;
    setupHotJar(this.navigationDataProvider.locale, 'unsatisfied');
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
      orderBy: 'countUnsatisfied',
      order: 'DESC',
      search: '',
      liveSearch: '',
      paginate: 10,
      list: {
        loading: false,
        hasMore: false,
        currentPage: 1,
        error: '',
        data: [],
      },
    };
  },

  computed: {
    canComeFrom() {
      return ['cockpit-unsatisfied-garages'];
    },
    currentOrder() {
      return {
        column: this.orderBy,
        order: this.order,
      };
    },
  },
  methods: {
    setLiveSearch(search) {
      this.liveSearch = search;
    },
    async setSearch(search) {
      this.search = search;
      await this.fetchListPage();
    },
    setOrder({ orderBy, order }) {
      this.order = order;
      this.orderBy = orderBy;
    },
    async filterByUser(row) {
      await this.navigationDataProvider.setFromRowClick(this.$route);
      const route = this.navigationDataProvider.createRoute('cockpit-unsatisfied-reviews', undefined, {
        user: row.userId,
        garageIds: row.garageId
      })

      await this.$router.push(route);
    },
    openModal() {
      this.$store.dispatch('openModal', {
        component: 'ModalSubscriptionLeads',
        props: { isKPI: true },
      });
    },
    async fetchListPage({ page, append } = { page: 1, append: false }) {
      this.list.loading = true;
      const request = {
        name: 'kpiByPeriodGetList',
        args: {
          garageId: this.navigationDataProvider.garageIds,
          dataType: this.navigationDataProvider.dataTypeId,
          periodId: this.navigationDataProvider.periodId,
          cockpitType: this.navigationDataProvider.cockpitType,
          cockpitInterface: 'users',
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
      this.list.currentPage = page;

      this.list.data = append
        ? [...this.list.data, ...resp.data.kpiByPeriodGetList.list]
        : resp.data.kpiByPeriodGetList.list;

      this.list.hasMore = resp.data.kpiByPeriodGetList.hasMore;
      this.list.loading = false;
    },
    async fetchNextListPage() {
      await this.fetchListPage({ page: this.list.currentPage + 1, append: true });
    },
    async refreshView() {
      await this.fetchListPage();
      return this.navigationDataProvider.fetchFilters();
    },
  },
  watch: {
    ...watchersFactory({
      'navigationDataProvider.garageIds': ['refreshView'],
      'navigationDataProvider.dataTypeId': ['refreshView'],
      'navigationDataProvider.periodId': ['refreshView'],
      'navigationDataProvider.cockpitType': ['refreshView'],
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
