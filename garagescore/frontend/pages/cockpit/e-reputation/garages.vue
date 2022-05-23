<template>
  <div>
    <!-- HAS ACCESS -->
    <section class="page-e-reputation-garages custom-scrollbar">
      <template v-if="isLoading">
        <EReputationPresentationTitleSkeleton v-if="isFrench" class="page-e-reputation-garages__presentation-title" />
        <div class="tiles">
          <TileEreputationSkeleton>
            <EReputationStatsSkeleton />
          </TileEreputationSkeleton>
          <TileEreputationSkeleton>
            <EReputationStatsSkeleton />
          </TileEreputationSkeleton>
          <TileEreputationSkeleton>
            <EReputationStatsSkeleton />
          </TileEreputationSkeleton>
        </div>
      </template>
      <template v-else>
        <EreputationPresentationTile
          v-if="isFrench"
          :chartKpiDataAndConf="mixinChartKpiDataAndConf"
          :onChangeView="mixinChartKpiOnViewChange"
          source="GarageScore"
          :baseKpi="kpiByPeriodSingle"
        />
        <div class="tiles">
          <EreputationTile
            v-if="!isFrench"
            :chartKpiDataAndConf="mixinChartKpiDataAndConf"
            :childModalProps="childModalProps"
            :connectSource="connectSource"
            :erepConnections="erepConnections"
            :hasAccessToEreputation="hasAccessToEreputation"
            :onChangeView="mixinChartKpiOnViewChange"
            :openModal="openModal"
            :selectedGarage="navigationDataProvider.selectedGarage"
            :selectedGarageIds="navigationDataProvider.selectedGarageIds"
            :sourcesInMaintenance="sourcesInMaintenance"
            mright
            source="GarageScore"
          />
          <EreputationTile
            :chartKpiDataAndConf="mixinChartKpiDataAndConf"
            :childModalProps="childModalProps"
            :connectSource="connectSource"
            :erepConnections="erepConnections"
            :hasAccessToEreputation="hasAccessToEreputation"
            :onChangeView="mixinChartKpiOnViewChange"
            :openModal="openModal"
            :selectedGarage="navigationDataProvider.selectedGarage"
            :selectedGarageIds="navigationDataProvider.selectedGarageIds"
            :sourcesInMaintenance="sourcesInMaintenance"
            mright
            source="Google"
          />
          <EreputationTile
            :chartKpiDataAndConf="mixinChartKpiDataAndConf"
            :childModalProps="childModalProps"
            :connectSource="connectSource"
            :erepConnections="erepConnections"
            :hasAccessToEreputation="hasAccessToEreputation"
            :onChangeView="mixinChartKpiOnViewChange"
            :openModal="openModal"
            :selectedGarage="navigationDataProvider.selectedGarage"
            :selectedGarageIds="navigationDataProvider.selectedGarageIds"
            :sourcesInMaintenance="sourcesInMaintenance"
            mright
            source="Facebook"
          />
          <EreputationTile
            v-if="isFrench"
            :chartKpiDataAndConf="mixinChartKpiDataAndConf"
            :childModalProps="childModalProps"
            :connectSource="connectSource"
            :erepConnections="erepConnections"
            :hasAccessToEreputation="hasAccessToEreputation"
            :onChangeView="mixinChartKpiOnViewChange"
            :openModal="openModal"
            :selectedGarage="navigationDataProvider.selectedGarage"
            :selectedGarageIds="navigationDataProvider.selectedGarageIds"
            :sourcesInMaintenance="sourcesInMaintenance"
            mright
            source="PagesJaunes"
          />
        </div>
      </template>
      <TableEreputation
        :areErepKpisLoading="areErepKpisLoading"
        :areErepKpisLoadingMore="areErepKpisLoadingMore"
        :connectSource="connectSource"
        :doesErepKpisHaveMore="doesErepKpisHaveMore"
        :erepKpis="erepKpis"
        :getKpisSort="getKpisSort"
        :isFrench="isFrench"
        :kpisLiveSearch="kpis.liveSearch"
        :loadMoreErepKpis="loadMoreErepKpis"
        :onChangeCurrentGarage="navigationDataProvider.changeGarage"
        :onChangeReviewFilters="() => {}"
        :onGoToReviews="onGoToReviews"
        :onKpisSearch="onKpisSearch"
        :onKpisSearchChange="onKpisSearchChange"
        :setFromRowClick="navigationDataProvider.setFromRowClick"
        :setKpisSort="setKpisSort"
      />
    </section>
  </div>
</template>

<script>
import chartsKpiMixin from '~/components/cockpit/mixins/chartsKpiMixin';
import { makeApolloMutations, makeApolloQueries } from '~/util/graphql';
import { GaragesTest } from '~/utils/enumV2';
import EreputationPresentationTile from '~/components/cockpit/e-reputation/EreputationPresentationTile';
import EreputationTile from '~/components/cockpit/e-reputation/EreputationTile';
import TableEreputation from '~/components/cockpit/e-reputation/garages/TableEreputation';
import EReputationStatsSkeleton from '~/components/global/skeleton/EReputationStatsSkeletons.vue';
import EReputationPresentationTitleSkeleton from '~/components/global/skeleton/EReputationPresentationTitleSkeleton';
import TileEreputationSkeleton from '~/components/global/skeleton/TileEreputationSkeleton.vue';
import { watchersFactory } from '~/mixins/utils';
import facebookConnect from '~/util/externalScripts/facebook-connect';
import googlePlatformApi from '~/util/externalScripts/google-platform-api';
import { setupHotJar } from '~/util/externalScripts/hotjar';
import { KPI_BY_PERIOD_GET_SINGLE_AND_EREP_KPI } from '~/utils/kpi/graphqlQueries';

export default {
  name: "EreputationGaragesPage",
  components: {
    EreputationPresentationTile,
    EReputationPresentationTitleSkeleton,
    EReputationStatsSkeleton,
    EreputationTile,
    TableEreputation,
    TileEreputationSkeleton,
  },
  inheritAttrs: false,
  props: {
    navigationDataProvider: {
      type: Object,
      required: true,
    },
  },
  middleware: ["hasAccessToEreputation"],
  mixins: [
    chartsKpiMixin(
      'COCKPIT_E_REPUTATION_GARAGES',
      KPI_BY_PERIOD_GET_SINGLE_AND_EREP_KPI,
      {
        erepKpis: [],
        kpiByPeriodGetSingle: {},
      },
    ),
  ],

  beforeMount() {
    googlePlatformApi();
    facebookConnect(process.env.facebookOauthClientId);
    this.retrieveSearchFromSession();
  },
  async mounted() {
    setupHotJar(this.locale, 'ereputation');
    this.navigationDataProvider.refreshRouteParameters();
    await this.refreshView();
  },

  data() {
    return {
      kpis: {
        paginate: 10,
        areLoading: false,
        areLoadingMore: false,
        currentPage: 1,
        haveMore: false,
        error: '',
        data: [],
        search: '',
        liveSearch: '',
        orderBy: 'scoreNPS',
        order: 'DESC',
      },
      erepConnections: {},
      isLoading: false,
      loadingMessage: null,
      loadingLogo: null,
      sourcesInMaintenance: process.env.EREP_SOURCES_IN_MAINTENANCE
        ? process.env.EREP_SOURCES_IN_MAINTENANCE.split(',')
        : [],
    };
  },
  computed: {
    areErepKpisLoadingMore() {
      return this.kpis.areLoadingMore;
    },
    isEreputationFirstVisit() {
      return this.$store.getters['auth/isEreputationFirstVisit'];
    },
    isFrench() {
      return this.locale === 'fr';
    },
    kpiByPeriodSingle() {
      return this.$store.getters["cockpit/kpiByPeriodSingle"];
    },
    currentGarageHasEreputation() {
      if (this.navigationDataProvider.garageIds !== null) {
        return this.navigationDataProvider.authorizations.currentHasEreputation;
      }
      return true;
    },
    hasAccessToEreputation() {
      return (
        this.$store.getters['auth/hasAccessToEreputation']
        && this.currentGarageHasEreputation
      );
    },
    availableGarages() {
      return this.navigationDataProvider.availableGarages || [];
    },
    cgvLink() {
      if (['ca', 'es'].includes(this.locale)) {
        return `${ this.navigationDataProvider.wwwUrl }/CGV-es.pdf`;
      }
      return `${ this.navigationDataProvider.wwwUrl }/CGV.pdf`;
    },
    isPrioritaryProfile() {
      return this.$store.getters['auth/isPriorityProfile'];
    },
    layoverProps() {
      return {
        availableGarages: this.availableGarages,
        cgvLink: this.cgvLink,
        isPrioritaryProfile: this.isPrioritaryProfile,
        loading: this.isLoading,
      };
    },
    locale() {
      return this.navigationDataProvider.locale;
    },
    areErepKpisLoading() {
      return this.kpis.areLoading;
    },
    doesErepKpisHaveMore() {
      return this.kpis.haveMore;
    },
    erepKpis() {
      return this.kpis.data;
    },
    hasPendingSubscriptionRequest() {
      return this.$store.state.auth.PENDING_ACCESS_TO_E_REPUTATION;
    },
    childModalProps() {
      return {
        ModalConnectGarages: {
          closeModal: this.closeModal,
          connectSource: this.connectSource,
          erepConnections: this.erepConnections,
          hasPendingSubscriptionRequest: this.hasPendingSubscriptionRequest,
          openModal: this.openModal,
        },
        ModalMaintenance: {
          closeModal: this.closeModal,
        },
        ModalConfirmSubscription: {
          changeAutorization: this.changeAutorization,
          changeAutorizationContent: this.changeAutorizationContent,
          changeGaragesSubscription: this.changeGaragesSubscription,
          openModal: this.openModal,
          closeModal: this.closeModal,
          erepConnections: this.erepConnections,
          isPriorityProfile: this.isPrioritaryProfile,
          locale: this.locale,
          refreshView: this.refreshView,
          subscribeToEreputation: this.subscribeToEreputation,
          subscriptionIsLoading: this.isLoading,
          toggleLoadingScreen: this.toggleLoadingScreen,
          wwwUrl: this.navigationDataProvider.wwwUrl,
        },
        ModalWelcome: {
          closeModal: this.closeModal,
          connectSource: this.connectSource,
          openModal: this.openModal,
          garageId: this.navigationDataProvider.garageIds?.[0] || null,
        },
        ModalRequestAccepted: {
          closeModal: this.closeModal,
        },
        ModalDisconnectService: {
          closeModal: this.closeModal,
          deleteExogenousConfiguration: this.deleteExogenousConfiguration,
          refreshView: this.refreshView,
        },
      };
    },
  },
  methods: {
    async deleteExogenousConfiguration({ garageId, source }) {
      const request = {
        name: 'garageSetDisconnectFromSource',
        args: { garageId, source },
        fields: `
            baseGarageId
            message
          `,
      };
      const { data } = await makeApolloMutations([request]);
      return data.garageSetDisconnectFromSource.message;
    },
    async subscribeToEreputation() {
      const request = {
        name: 'userSetSubscribeToErep',
        fields: `
          message
          success
          unauthorized
        `,
        args: {},
      };
      const resp = await makeApolloMutations([request]);
      return resp?.data?.userSetSubscribeToErep;
    },
    setLoadingLogo({ logo }) {
      this.loadingLogo = logo;
    },
    setLoadingMessage({ message }) {
      this.loadingMessage = message || null;
    },
    toggleLoadingScreen({ message, logo, value }) {
      this.closeModal();
      this.setLoadingMessage({ message });
      this.setLoadingLogo({ logo });
      this.setLoading(value);
    },
    changeAutorization(payload) {
      this.$store.dispatch('auth/changeAutorization', payload);
    },
    changeAutorizationContent(payload) {
      this.$store.dispatch('auth/changeAutorizationContent', payload);
    },
    changeGaragesSubscription(payload) {
      this.navigationDataProvider.changeGaragesSubscription(payload);
    },
    async onKpisSearch(search) {
      await this.changeGarageSearch({ search });
      await this.fetchKpis({
        page: 1,
        append: false,
      });
    },
    setGarageLiveSearch(search) {
      this.kpis.liveSearch = search;
    },
    setGarageSearch(search) {
      this.kpis.search = search;
      this.saveSearch(search);
    },
    changeGarageLiveSearch({ search }) {
      this.setGarageLiveSearch(search);
    },
    changeGarageSearch({ search }) {
      this.setGarageSearch(search);
      this.navigationDataProvider.refreshRouteParameters();
    },
    onKpisSearchChange(search) {
      this.changeGarageLiveSearch({ search });
    },
    getKpisSort() {
      return {
        column: this.kpis.orderBy,
        order: this.kpis.order,
      };
    },
    setGarageOrder({ orderBy, order }) {
      this.kpis.order = order;
      this.kpis.orderBy = orderBy;
    },
    setKpisSort(value) {
      this.setGarageOrder({
        orderBy: value.column,
        order: value.order,
      });
      this.fetchKpis({
        page: 1,
        append: false,
      });
    },
    async fetchErepConnections() {
      const { cockpitType, garageIds } = this.navigationDataProvider;
      const connectionRequest = {
        name: 'ErepConnections',
        fields: `
          totalGarages
          sources {
            name
            countConnectedGarages
            connectedGarages
          }
          garages {
            garageId
            garagePublicDisplayName
            hasSubscription
            connectedSources {
              name
              externalId
            }
          }
        `,
        args: { cockpitType, garageId: garageIds },
      };
      const { data } = await makeApolloQueries([connectionRequest]);
      const { ErepConnections } = data || {};
      this.erepConnections = ErepConnections;
      return ErepConnections;
    },

    setKpisLoading(value) {
      this.kpis.areLoading = value;
    },
    setKpisHaveMore(value) {
      this.kpis.haveMore = value;
    },
    setKpisCurrentPage({ page }) {
      if (this.kpis) {
        this.kpis.currentPage = page;
      } else {
        this.kpis = {
          currentPage: page,
        };
      }
    },
    appendKpis(kpis) {
      this.kpis.data = [...this.kpis.data, ...kpis];
    },
    setKpis(kpis) {
      this.kpis.data = kpis;
    },
    async fetchKpis({ page, append }) {
      console.log('fetch kpi');
      this.setKpisLoading(true);
      const { cockpitType, garageIds, periodId } = this.navigationDataProvider;
      const kpisRequest = {
        name: 'kpiByPeriodGetErepKpiList',
        fields: `
          kpiList {
            garageId
            externalId
            garageSlug
            garagePublicDisplayName
            hasSubscription
            score
            scoreNPS
            countReviews
            countReviewsWithScore
            countReviewsWithRecommendation
            countPromotors
            countDetractors
            countDetractorsWithResponse
            countNeutrals
            promotorsPercent
            detractorsPercent
            neutralsPercent
            countRecommend
            recommendPercent
            kpisBySource {
              Google {
                countReviews
                countReviewsWithScore
                countReviewsWithRecommendation
                countPromotors
                countDetractors
                countDetractorsWithResponse
                countNeutrals
                score
                scoreNPS
                promotorsPercent
                detractorsPercent
                neutralsPercent
                countRecommend
                recommendPercent
                connection {
                  connected
                  error
                  lastRefresh
                }
              }
              Facebook {
                countReviews
                countReviewsWithScore
                countReviewsWithRecommendation
                countPromotors
                countDetractors
                countDetractorsWithResponse
                countNeutrals
                score
                scoreNPS
                promotorsPercent
                detractorsPercent
                neutralsPercent
                countRecommend
                recommendPercent
                connection {
                  connected
                  error
                  lastRefresh
                }
              }
              PagesJaunes {
                countReviews
                countReviewsWithScore
                countReviewsWithRecommendation
                countPromotors
                countDetractors
                countDetractorsWithResponse
                countNeutrals
                score
                scoreNPS
                promotorsPercent
                detractorsPercent
                neutralsPercent
                countRecommend
                recommendPercent
                connection {
                  connected
                  error
                  lastRefresh
                }
              }
            }
          }
          hasMore
        `,
        args: {
          period: periodId.toString(),
          garageId: garageIds,
          cockpitType,
          orderBy: this.kpis.orderBy,
          order: this.kpis.order,
          skip: (page - 1) * this.kpis.paginate,
          limit: this.kpis.paginate,
          search: this.kpis.search,
        },
      };
      const { data } = await makeApolloQueries([kpisRequest]);
      const { kpiByPeriodGetErepKpiList } = data || {};
      const { kpiList, hasMore } = kpiByPeriodGetErepKpiList || {};
      append ? this.appendKpis(kpiList || []) : this.setKpis(kpiList || []);
      this.setKpisCurrentPage({ page });
      this.setKpisHaveMore(hasMore);
      this.setKpisLoading(false);
      return Promise.resolve();
    },
    setLoading(value) {
      this.isLoading = value;
    },
    async changeFirstVisit({ firstVisit, value }) {
      await this.$store.dispatch('auth/changeFirstVisit', { firstVisit: 'EREPUTATION', val: false }, { root: true });

      const request = {
        name: 'userSetFirstVisit',
        args: { firstVisit, value },
        fields: `success
          error
          `,
      };
      const { data } = await makeApolloMutations([request]);
      const { userSetFirstVisit } = data || {};

      return userSetFirstVisit?.success;
    },
    handleFirstVisit() {
      setTimeout(async () => {
        if (this.isEreputationFirstVisit) {
          this.openModal({
            component: 'ModalWelcome',
            props: {
              source: 'Google',
              stats: this.erepConnections,
              openModal: this.openModal,
              closeModal: this.closeModal,
              connectSource: this.connectSource,
              garageId: this.navigationDataProvider.garageIds,
              childModalProps: this.childModalProps,
            },
          });

          await this.changeFirstVisit({
            firstVisit: 'EREPUTATION',
            value: false,
          });
        }
      }, 1000);
    },
    async refreshView() {
      this.setLoading(true);
      this.setKpisLoading(true);
      if (this.hasAccessToEreputation) {
        await Promise.all([
          this.fetchErepConnections(),
          this.fetchKpis({ page: 1, append: false }),
        ]);
        this.handleFirstVisit();
      }
      this.setLoading(false);
      this.setKpisLoading(false);
    },
    openModal(modalOptions) {
      this.$store.dispatch('openModal', modalOptions, { root: true });
    },
    closeModal() {
      this.$store.dispatch('closeModal');
    },
    setGarageIsConnected({ garageId, externalId, source }) {
      const allGarages = this.erepConnections.garages;
      const matchedExternalId = allGarages.find(({ connectedSources }) =>
        connectedSources.some(({ name, externalId: extId }) => name === source && externalId === extId),
      );
      if (matchedExternalId) {
        matchedExternalId.connectedSources = matchedExternalId.connectedSources.filter(({ name }) => name !== source);
      }
      const matchedGarageId = allGarages.find((garage) => garage.garageId === garageId);
      const existingSourceInGarageId = matchedGarageId.connectedSources.find(
        ({ name, externalId: extId }) => name === source && externalId === extId,
      );

      if (existingSourceInGarageId) {
        existingSourceInGarageId.externalId = externalId;
      } else {
        matchedGarageId.connectedSources.push({ name: source, externalId });
      }
    },
    async sendMatchGarages(options = {}) {
      const { garageId, oldGarageId, externalGarageId, baseGarageId, source } = options;
      const request = {
        name: 'garageSetMatch',
        args: {
          garageId,
          oldGarageId,
          externalGarageId,
          baseGarageId,
          source,
        },
        fields: `success
          `,
      };
      const resp = await makeApolloMutations([request]);
      if (resp?.data?.garageSetMatch?.success) {
        this.setGarageIsConnected({
          garageId,
          externalId: externalGarageId,
          source,
        });
      }
      return resp.data.garageSetMatch.success;
    },
    matchGarages({ data: { garagesToMatch, baseGarageId }, source }) {
      const sourcesWhichNeedMatching = ['Google', 'Facebook'];
      const availableGarages = this.erepConnections.garages;
      const matchings = Object.fromEntries(
        garagesToMatch.map(({ externalId: idToMatch }) => {
          const matchedGarage = availableGarages.find(({ connectedSources }) =>
            connectedSources.some(({ name, externalId }) => name === source && externalId === idToMatch),
          );
          if (matchedGarage) {
            const { connectedSources, garageId, garagePublicDisplayName } = matchedGarage;
            const { externalId } = connectedSources.find(({ name }) => name === source);
            return [
              externalId,
              {
                value: garageId,
                oldValue: garageId,
                name: garagePublicDisplayName,
                state: 'Saved',
              },
            ];
          }
          return [
            idToMatch,
            {
              value: '',
              oldValue: '',
              name: '',
              state: 'Unsaved',
            },
          ];
        }),
      );

      if (sourcesWhichNeedMatching.includes(source)) {
        this.openModal({
          component: 'ModalMatchGarages',
          props: {
            baseGarageId,
            garagesToMatch,
            matchings,
            source,
            closeModal: this.closeModal,
            refreshView: this.refreshView,
            erepConnections: this.erepConnections,
            sendMatchGarages: this.sendMatchGarages,
          },
        });
      }
    },
    async postExogenousConfiguration({ garageId, source, code }) {
      const sourcesWhichNeedMatching = ['Google', 'Facebook'];

      this.toggleLoadingScreen({
        message: source,
        logo: source,
        value: true,
      });
      const request = {
        name: 'garageSetExogenousConfiguration',
        args: { garageId, source, code },
        fields: `garagesToMatch {
            name
            externalId
          }
          baseGarageId
          rejectionReason
          `,
      };
      const defaultLoadingScreenPayload = {
        message: null,
        logo: null,
        value: false,
      };
      const { data } = await makeApolloMutations([request]);
      if (!sourcesWhichNeedMatching.includes(source)) {
        await this.refreshView();
        this.toggleLoadingScreen(defaultLoadingScreenPayload);
      } else {
        this.toggleLoadingScreen(defaultLoadingScreenPayload);
        await this.matchGarages({
          data: data.garageSetExogenousConfiguration,
          source,
        });
      }
      await this.refreshView();
    },
    async connectGoogle({ garageId }) {
      // Global variable
      // eslint-disable-next-line no-undef
      const response = await gapi.auth2.getAuthInstance().grantOfflineAccess({
        redirect_uri: 'postmessage',
        scope: 'https://www.googleapis.com/auth/business.manage',
      });

      await this.postExogenousConfiguration({
        garageId: garageId,
        source: 'Google',
        code: response.code,
      });
    },
    async connectFacebook({ garageId }) {
      const response = await new Promise(resolve =>
        // Global variable
        // eslint-disable-next-line no-undef
        FB.login(e => resolve(e),
          {
            scope: 'pages_manage_metadata,pages_read_engagement,pages_read_user_content,pages_manage_posts,pages_manage_engagement',
          }),
      );
      if (response?.authResponse?.accessToken) {
        await this.postExogenousConfiguration({
          garageId: garageId,
          source: 'Facebook',
          code: response.authResponse.accessToken,
        });
      }
    },
    async connectPagesJaunes({ garageId }) {
      this.openModal({
        component: 'ModalConnectWithUrl',
        props: {
          source: 'PagesJaunes',
          garage: { garageId },
          postExogenousConfiguration: this.postExogenousConfiguration,
        },
      });
    },
    async connectSource({ garageId, source }) {
      const isSourceUnderMaintenance = this.sourcesInMaintenance.includes(source);
      const isNotTestGarage = !GaragesTest.hasValue(garageId);
      if (isSourceUnderMaintenance && isNotTestGarage) {
        return this.openModal({
          component: 'ModalMaintenance',
          props: {
            closeModal: this.closeModal,
            source,
          },
        });
      }

      const FunctionNames = Object.freeze({
        connectFacebook: "connectFacebook",
        connectGoogle: "connectGoogle",
        connectPagesJaunes: "connectPagesJaunes"
      });

      const functionsConnect = {
        [FunctionNames.connectFacebook]: this.connectFacebook,
        [FunctionNames.connectGoogle]: this.connectGoogle,
        [FunctionNames.connectPagesJaunes]: this.connectPagesJaunes,
      };

      const connectFunction = functionsConnect[`connect${ source }`];
      return connectFunction ? connectFunction({ garageId, }) : null;
    },
    async onGoToReviews(garageId) {
      await this.navigationDataProvider.setFromRowClick(this.$route);
      await this.$router.push({
        name: 'cockpit-e-reputation-reviews',
        query: { garageIds: [garageId] },
      });
    },
    async fetchNextKpisPage() {
      await this.fetchKpis({
        page: this.kpis.currentPage + 1,
        append: true,
      });
    },
    async loadMoreErepKpis() {
      this.kpis.areLoadingMore = true;
      await this.fetchNextKpisPage();
      this.kpis.areLoadingMore = false;
    },
    async saveSearch() {
      sessionStorage?.setItem(
        `${ this.$route.name }_search`,
        this.kpis.search,
      );
    },
    retrieveSearchFromSession() {
      const search = sessionStorage?.getItem(
        `${ this.$route.name }_search`,
      );
      if (search) {
        this.$set(this.kpis, 'search', search);
        this.$set(this.kpis, 'liveSearch', search);
      }
    },
  },
  watch: {
    ...
      watchersFactory({
        'navigationDataProvider.garageIds': ['refreshView'],
        'navigationDataProvider.periodId': ['refreshView'],
        'navigationDataProvider.dataTypeId': ['refreshView'],
        'navigationDataProvider.cockpitType': ['refreshView'],
        'navigationDataProvider.dms.frontDeskUserName': ['refreshView'],
      }),
  },
}
;
</script>

<style lang="scss" scoped>
.page-e-reputation-garages {
  display: flex;
  flex-direction: column;
  position: relative;
  height: calc(100vh - 8.5rem);
  overflow-x: hidden;
  overflow-y: auto;
  top: 1rem;
  padding-top: 0.15rem;
  box-sizing: border-box;

  .tiles {
    display: flex;
    align-items: center;
    padding: 1rem 0.5rem 1rem 1rem;
    flex-direction: column;

    & > * {
      flex: 1;
      width: 100%;
    }

    & > * + * {
      margin-top: 1rem;
    }

    @media (min-width: $breakpoint-min-lg) {
      flex-direction: row;

      & > * {
        width: 33%;
      }
      & > * + * {
        margin-top: 0;
        margin-left: 1rem;
      }
    }
  }
}

@media (max-width: $breakpoint-min-md) {
  .page-e-reputation {
    top: 0;
    height: calc(100vh - 8.5rem);
  }
}
</style>
