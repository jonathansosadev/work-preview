<template>
  <div class="page-cockpit custom-scrollbar">
    <div class="page-cockpit__stats">
      <div class="page-cockpit__item">
        <StatsNPS
          :chartInfoFilters="mixinChartKpiInfoFilters"
          :chartKpiDataAndConf="mixinChartKpiDataAndConf"
          :onChangeView="mixinChartKpiOnViewChange"
        />
      </div>
      <div class="page-cockpit__item">
        <StatsPromotors
          :chartInfoFilters="mixinChartKpiInfoFilters"
          :chartKpiDataAndConf="mixinChartKpiDataAndConf"
          :onChangeView="mixinChartKpiOnViewChange"
        />
      </div>
      <div class="page-cockpit__item">
        <StatsDetractors
          :chartInfoFilters="mixinChartKpiInfoFilters"
          :chartKpiDataAndConf="mixinChartKpiDataAndConf"
          :onChangeView="mixinChartKpiOnViewChange"
        />
      </div>
    </div>
    <div class="page-cockpit__table">
      <TableSatisfactionTeam
        :currentCockpitType="navigationDataProvider.cockpitType"
        :openModal="openModal"
        :teamList="teamList.data"
        :teamSearch="team.search"
        :teamOrder="team.order"
        :teamOrderBy="team.orderBy"
        :teamLiveSearch="team.liveSearch"
        :teamListLoading="teamList.loading"
        :teamListHasMore="teamList.hasMore"
        :setTeamOrder="setTeamOrder"
        :setTeamSearch="setTeamSearch"
        :setTeamLiveSearch="setTeamLiveSearch"
        :fetchTeamListPage="fetchTeamListPage"
        :fetchNextTeamListPage="fetchNextTeamListPage"
        :handleBack="navigationDataProvider.handleBack"
        :hasBackArrow="hasBackArrow"
        :filterByDms="filterByDms"
      />
    </div>
  </div>
</template>

<script>
import StatsDetractors from '~/components/cockpit/satisfaction/StatsDetractors.vue';
import StatsNPS from '~/components/cockpit/satisfaction/StatsNPS.vue';
import StatsPromotors from '~/components/cockpit/satisfaction/StatsPromotors.vue';
import TableSatisfactionTeam from '~/components/cockpit/satisfaction/team/TableSatisfactionTeam.vue';
import { watchersFactory } from '~/mixins/utils';
import { setupHotJar } from '~/util/externalScripts/hotjar';
import { makeApolloQueries } from '~/util/graphql';
import chartsKpiMixin from '~/components/cockpit/mixins/chartsKpiMixin';
import { KPI_BY_PERIOD_SINGLE_KPI } from '~/utils/kpi/graphqlQueries';
import { KpiTypes } from '~/utils/enumV2';

export default {
  name: 'SatisfactionTeamPage',
  components: {
    StatsNPS,
    StatsDetractors,
    StatsPromotors,
    TableSatisfactionTeam,
  },
  props: {
    navigationDataProvider: {
      type: Object,
      required: true,
    },
  },
  inheritAttrs: false,
  mixins: [chartsKpiMixin('COCKPIT_SATISFACTION_TEAM', KPI_BY_PERIOD_SINGLE_KPI, { kpiByPeriodSingle: {} })],
  middleware: ['hasAccessToSatisfaction'],

  async mounted() {
    setupHotJar(this.navigationDataProvider.locale, 'satisfaction');
    await this.navigationDataProvider.refreshRouteParameters({
      garageIds: undefined,
      dms: undefined,
      ...this.$route.query
    });
    await this.navigationDataProvider.syncRouteToState(this.$route);
    await this.refreshView();
  },

  data() {
    return {
      team: {
        orderBy: 'scoreNPS',
        order: 'DESC',
        search: '',
        liveSearch: '',
      },

      teamList: {
        loading: true,
        hasMore: false,
        currentPage: 1,
        error: '',
        data: [],
      },

      paginate: {
        team: 10,
      },
    };
  },

  computed: {
    hasBackArrow() {
      const canComeFrom = ['cockpit-satisfaction-garages'];
      return this.navigationDataProvider.hasBackArrow(canComeFrom);
    },
  },

  methods: {
    async filterByDms(row) {
      await this.navigationDataProvider.setFromRowClick(this.$route);
      const route = this.navigationDataProvider.createRoute('cockpit-satisfaction-reviews', undefined, {
        dms: row.frontDesk,
        garageIds: row.garageId
      })

      await this.$router.push(route);
    },
    openModal(payload) {
      this.$store.dispatch('openModal', payload);
    },
    async fetchTeamListPage({ page, append } = { page: 1, append: false }) {
      this.setTeamListLoading(true);
      const { cockpitType, dataTypeId, dms, garageIds, periodId } = this.navigationDataProvider;
      const request = {
        name: 'kpiByPeriodGetKpis',
        fields: `
          list {
            id
            frontDesk
            hideDirectoryPage
            garageId
            garageSlug
            garagePublicDisplayName
            externalId
            scoreNPS
            scoreAPV
            scoreVN
            scoreVO
            countSurveyPromotor
            countSurveyDetractor
            countSurveysResponded
            countSurveyRespondedAll
            countReceivedAndScheduledSurveys
          }
          hasMore
      `,
        args: {
          frontDeskUserName: dms?.frontDeskUserName,
          garageIds,
          periodId,
          type: dataTypeId,
          cockpitType,
          kpiOrderBy: this.team.orderBy,
          kpiOrder: this.team.order,
          search: this.team.search,
          allUsers: true,
          limit: this.paginate.team,
          skip: (page - 1) * this.paginate.team,
          kpiType: KpiTypes.FRONT_DESK_USER_KPI,
        },
      };

      const resp = await makeApolloQueries([request]);

      this.setTeamListCurrentPage({ page });
      const { data: { kpiByPeriodGetKpis: { list, hasMore } = {} } = {} } = resp;
      if (list) {
        append ? this.appendTeamList(list) : this.setTeamList(list);
        this.setTeamListHasMore(hasMore);
      }
      this.setTeamListLoading(false);
    },
    async fetchNextTeamListPage() {
      await this.fetchTeamListPage({
        page: this.teamList.currentPage + 1,
        append: true,
      });
    },
    async refreshView() {
      await this.fetchTeamListPage({ page: 1, append: false });
      return this.navigationDataProvider.fetchFilters();
    },
    setTeamListCurrentPage({ page }) {
      this.teamList.currentPage = page;
    },
    setTeamList(data) {
      this.teamList.data = data;
    },
    appendTeamList(data) {
      this.teamList.data = this.teamList.data.concat(data);
    },
    setTeamListHasMore(hasMore) {
      this.teamList.hasMore = hasMore;
    },
    setTeamListLoading(loading) {
      this.teamList.loading = loading;
    },
    setTeamOrder({ orderBy, order }) {
      this.$set(this.team, 'order', order);
      this.$set(this.team, 'orderBy', orderBy);
    },
    setTeamSearch({ search }) {
      this.team.search = search;
    },
    setTeamLiveSearch({ search }) {
      this.team.liveSearch = search;
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
