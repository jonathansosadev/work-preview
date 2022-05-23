<template>
  <div class="page-contacts custom-scrollbar">
    <div class="page-contacts__stats">
      <div class="page-contacts__item">
        <StatsResponded
          :chartInfoFilters="mixinChartKpiInfoFilters"
          :chartKpiDataAndConf="mixinChartKpiDataAndConf"
          :onChangeView="mixinChartKpiOnViewChange"
        />
      </div>
      <div class="page-contacts__item">
        <StatsValidEmails
          :chartInfoFilters="mixinChartKpiInfoFilters"
          :chartKpiDataAndConf="mixinChartKpiDataAndConf"
          :onChangeView="mixinChartKpiOnViewChange"
        />
      </div>
      <div class="page-contacts__item">
        <StatsNotContactable
          :chartInfoFilters="mixinChartKpiInfoFilters"
          :chartKpiDataAndConf="mixinChartKpiDataAndConf"
          :onChangeView="mixinChartKpiOnViewChange"
        />
      </div>
    </div>
    <div class="page__table">
      <TableTeamContacts
        :list="list.data"
        :listLoading="list.loading"
        :listHasMore="list.hasMore"
        :liveSearch="liveSearch"
        :fetchNextListPage="fetchNextListPage"
        :fetchListPage="fetchListPage"
        :orderBy="orderBy"
        :order="order"
        :changeOrder="setOrder"
        :changeSearch="setSearch"
        :changeLiveSearch="setLiveSearch"
        :cockpitType="navigationDataProvider.cockpitType"
        :wwwUrl="navigationDataProvider.wwwUrl"
        :handleBack="navigationDataProvider.handleBack"
        :hasBackArrow="navigationDataProvider.hasBackArrow(canComFrom)"
        :filterByDms="filterByDms"
      />
    </div>
  </div>
</template>

<script>
import StatsNotContactable from '~/components/cockpit/contacts/StatsNotContactable.vue';
import StatsResponded from '~/components/cockpit/contacts/StatsResponded.vue';
import StatsValidEmails from '~/components/cockpit/contacts/StatsValidEmails.vue';
import TableTeamContacts from '~/components/cockpit/contacts/team/TableTeamContacts.vue';
import { watchersFactory } from '~/mixins/utils';
import { setupHotJar } from '~/util/externalScripts/hotjar';
import { makeApolloQueries } from '~/util/graphql';
import chartsKpiMixin from '~/components/cockpit/mixins/chartsKpiMixin';
import { KPI_BY_PERIOD_SINGLE_KPI } from '~/utils/kpi/graphqlQueries';
import { KpiTypes } from '~/utils/enumV2';

export default {
  name: 'ContactsTeamPage',
  components: {
    TableTeamContacts,
    StatsResponded,
    StatsValidEmails,
    StatsNotContactable,
  },
  props: {
    navigationDataProvider: {
      type: Object,
      required: true,
    },
  },
  inheritAttrs: false,
  middleware: ['hasAccessToContacts'],
  mixins: [chartsKpiMixin('COCKPIT_CONTACTS_TEAM', KPI_BY_PERIOD_SINGLE_KPI, { kpiByPeriodSingle: {} })],

  async mounted() {
    setupHotJar(this.navigationDataProvider.locale, 'contact');
    this.navigationDataProvider.refreshRouteParameters();
    await this.refreshView();
  },

  data() {
    return {
      orderBy: 'countSurveysRespondedPercent',
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
    canComFrom() {
      return ['cockpit-contacts-garages'];
    },
  },
  methods: {
    async filterByDms(row) {
      await this.navigationDataProvider.setFromRowClick(this.$route);
      await this.$router.push({ name: 'cockpit-contacts-reviews', query: { ...this.$route.query, ...{ garageIds: [row.garageId], dms: row.frontDesk } }});
    },

    async refreshView() {
      await this.fetchListPage({ page: 1, append: false });
      return this.navigationDataProvider.fetchFilters();
    },

    async fetchNextListPage() {
      return this.fetchListPage({ page: this.list.currentPage + 1, append: true });
    },

    async fetchListPage({ page, append }) {
      this.setListLoading(true);
      const request = {
        name: 'kpiByPeriodGetKpis',
        fields: `
          list {
              garageId
              externalId
              frontDesk
              garageSlug
              garagePublicDisplayName
              hideDirectoryPage
              countValidEmails
              countValidPhones
              countNotContactable
              countNotContactablePercent
              countSurveysResponded
              countSurveysRespondedPercent
              countBlockedByEmail
              countWrongEmails
              countNotPresentEmails
              countBlockedByPhone
              countWrongPhones
              countNotPresentPhones
          }
          hasMore
      `,
        args: {
          frontDeskUserName: this.navigationDataProvider.dms && this.navigationDataProvider.dms.frontDeskUserName,
          garageIds: this.navigationDataProvider.garageIds,
          periodId: this.navigationDataProvider.periodId,
          cockpitType: this.navigationDataProvider.cockpitType,
          type: this.navigationDataProvider.dataTypeId,
          kpiOrderBy: this.orderBy,
          kpiOrder: this.order,
          search: this.search,
          limit: this.paginate,
          skip: (page - 1) * this.paginate,
          allUsers: true,
          kpiType: KpiTypes.FRONT_DESK_USER_KPI,
        },
      };

      const resp = await makeApolloQueries([request]);
      this.setListCurrentPage({ page });
      const { data: { kpiByPeriodGetKpis: { list, hasMore } = {} } = {} } = resp;
      append ? this.appendList(list) : this.setList(list);
      this.setListHasMore(hasMore);
      this.setListLoading(false);
    },

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
      this.order = order;
      this.orderBy = orderBy;
    },

    setSearch({ search }) {
      this.search = search;
    },
    setLiveSearch({ search }) {
      this.liveSearch = search;
    },
  },
  watch: {
    ...watchersFactory({
      'navigationDataProvider.garageIds': ['refreshView'],
      'navigationDataProvider.periodId': ['refreshView'],
      'navigationDataProvider.dataTypeId': ['refreshView'],
      'navigationDataProvider.cockpitType': ['refreshView'],
      'navigationDataProvider.dms.frontDeskUserName': ['refreshView'],
      'navigationDataProvider.user': ['refreshView'],
    }),
  },
};
</script>

<style lang="scss" scoped>
.page-contacts {
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

    &:first-child {
      margin-right: 0.25rem;
    }

    &:last-child {
      margin-left: 0.25rem;
    }
  }

  &__item {
    height: 221px;
    width: 100%;

    &:not(:last-child) {
      margin-bottom: 1rem;
    }
  }
}

@media (min-width: $breakpoint-min-md) {
  .page-contacts {
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
      width: 33%;
      flex: 1;
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
  .page-contacts {
    top: 0;
    height: calc(100vh - 8.5rem);
  }
}
</style>
