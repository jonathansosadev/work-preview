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
      <TableSatisfactionGarage
        :changeGarageLiveSearch="changeLiveSearch"
        :changeGarageOrder="changeGarageOrder"
        :changeGarageSearch="changeGarageSearch"
        :cockpitType="navigationDataProvider.cockpitType"
        :currentGarage="garage"
        :fetchKpisPage="fetchKpisPage"
        :fetchNextKpisPage="fetchNextKpisPage"
        :Kpis="Kpis.data"
        :hasMore="Kpis.hasMore"
        :headerClass="headerClass"
        :isDisplayed="isDisplayed"
        :liveSearch="garage.liveSearch"
        :loading="Kpis.loading"
        :rows="Kpis.data"
        :wwwUrl="navigationDataProvider.wwwUrl"
      />
    </div>
  </div>
</template>

<script>
import StatsDetractors from '~/components/cockpit/satisfaction/StatsDetractors.vue';
import StatsNPS from '~/components/cockpit/satisfaction/StatsNPS.vue';
import StatsPromotors from '~/components/cockpit/satisfaction/StatsPromotors.vue';
import TableSatisfactionGarage from '~/components/cockpit/satisfaction/garages/TableSatisfactionGarage.vue';
import { watchersFactory } from '~/mixins/utils';
import { setupHotJar } from '~/util/externalScripts/hotjar';
import { makeApolloQueries } from '~/util/graphql';
import { KpiTypes } from '~/utils/enumV2';
import GarageTypes from '~/utils/models/garage.type.js';
import chartsKpiMixin from '~/components/cockpit/mixins/chartsKpiMixin';
import { KPI_BY_PERIOD_SINGLE_KPI } from '~/utils/kpi/graphqlQueries';

export default {
  name: 'SatisfactionGaragesPage',
  components: {
    StatsDetractors,
    StatsNPS,
    StatsPromotors,
    TableSatisfactionGarage,
  },
  props: {
    navigationDataProvider: {
      type: Object,
      required: true,
    },
  },
  inheritAttrs: false,
  middleware: ['hasAccessToSatisfaction'],
  mixins: [chartsKpiMixin('COCKPIT_SATISFACTION_GARAGES', KPI_BY_PERIOD_SINGLE_KPI, { kpiByPeriodSingle: {} })],

  data() {
    return {
      Kpis: {
        loading: false,
        hasMore: false,
        currentPage: 1,
        error: '',
        data: [],
      },
      garage: {
        orderBy: 'scoreNPS',
        order: 'DESC',
        search: '',
        liveSearch: '',
      },
      paginate: {
        garage: 10,
      },
    };
  },

  async mounted() {
    setupHotJar(this.navigationDataProvider.locale, 'satisfaction');
    this.navigationDataProvider.refreshRouteParameters();
    await this.refreshView();
  },

  computed: {
    headerClass() {
      const { cockpitType } = this.navigationDataProvider;
      return cockpitType === GarageTypes.VEHICLE_INSPECTION ? 'table-cockpit-header__header--vehicle-inspection' : '';
    },
    isDisplayed() {
      const { cockpitType } = this.navigationDataProvider;
      return cockpitType !== GarageTypes.VEHICLE_INSPECTION;
    },
  },
  methods: {
    changeGarageOrder(value) {
      this.garage = {
        ...this.garage,
        orderBy: value.column,
        order: value.order,
      };
    },
    changeGarageSearch(search) {
      this.garage.search = search;
    },
    changeLiveSearch(liveSearch) {
      this.garage.liveSearch = liveSearch;
    },

    async fetchKpisPage({ page, append } = { page: 1, append: false }) {
      this.Kpis.loading = true;
      const { cockpitType, dataTypeId, garageIds, periodId } = this.navigationDataProvider;
      const request = {
        name: 'kpiByPeriodGetKpis',
        fields: `
          list {
            id
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
          garageIds,
          periodId,
          type: dataTypeId,
          cockpitType,
          kpiOrderBy: this.garage.orderBy,
          kpiOrder: this.garage.order,
          search: this.garage.search,
          limit: this.paginate.garage,
          skip: (page - 1) * this.paginate.garage,
          kpiType: KpiTypes.GARAGE_KPI,
        },
      };
      const { data } = await makeApolloQueries([request]);
      const { kpiByPeriodGetKpis: { hasMore, list: KpisList } = {} } = data || {};

      if (!KpisList) {
        return;
      }

      this.Kpis = {
        ...this.Kpis,
        currentPage: page,
        data: append ? [...this.Kpis.data, ...KpisList] : KpisList,
        loading: false,
        hasMore,
      };
    },
    async fetchNextKpisPage() {
      await this.fetchKpisPage({
        page: this.Kpis.currentPage + 1,
        append: true,
      });
    },

    async refreshView() {
      await this.fetchKpisPage();
      return this.navigationDataProvider.fetchFilters();
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
