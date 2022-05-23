<template>
  <div>
    <!-- HAS ACCESS -->
    <section
      v-if="hasAccessToEreputation"
      class="page-e-reputation-reviews custom-scrollbar"
    >
      <template v-if="isLoading">
        <EReputationPresentationTitleSkeleton
          v-if="isFrench"
          class="page-e-reputation-reviews__presentation-title"
        />
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
            :onChangeReviewFilters="changeReviewFilters"
            :onChangeView="mixinChartKpiOnViewChange"
            :openModal="openModal"
            :refreshEreputationReview="refreshEreputationReview"
            :selectedGarage="navigationDataProvider.selectedGarage"
            :selectedGarageIds="navigationDataProvider.selectedGarageIds"
            :sourcesInMaintenance="sourcesInMaintenance"
            source="GarageScore"
          />
          <EreputationTile
            :chartKpiDataAndConf="mixinChartKpiDataAndConf"
            :childModalProps="childModalProps"
            :connectSource="connectSource"
            :erepConnections="erepConnections"
            :hasAccessToEreputation="hasAccessToEreputation"
            :onChangeReviewFilters="changeReviewFilters"
            :onChangeView="mixinChartKpiOnViewChange"
            :openModal="openModal"
            :refreshEreputationReview="refreshEreputationReview"
            :selectedGarage="navigationDataProvider.selectedGarage"
            :selectedGarageIds="navigationDataProvider.selectedGarageIds"
            :sourcesInMaintenance="sourcesInMaintenance"
            source="Google"
          />
          <EreputationTile
            :chartKpiDataAndConf="mixinChartKpiDataAndConf"
            :childModalProps="childModalProps"
            :connectSource="connectSource"
            :erepConnections="erepConnections"
            :hasAccessToEreputation="hasAccessToEreputation"
            :onChangeReviewFilters="changeReviewFilters"
            :onChangeView="mixinChartKpiOnViewChange"
            :openModal="openModal"
            :refreshEreputationReview="refreshEreputationReview"
            :selectedGarage="navigationDataProvider.selectedGarage"
            :selectedGarageIds="navigationDataProvider.selectedGarageIds"
            :sourcesInMaintenance="sourcesInMaintenance"
            source="Facebook"
          />
          <EreputationTile
            v-if="isFrench"
            :chartKpiDataAndConf="mixinChartKpiDataAndConf"
            :childModalProps="childModalProps"
            :connectSource="connectSource"
            :erepConnections="erepConnections"
            :hasAccessToEreputation="hasAccessToEreputation"
            :onChangeReviewFilters="changeReviewFilters"
            :onChangeView="mixinChartKpiOnViewChange"
            :openModal="openModal"
            :refreshEreputationReview="refreshEreputationReview"
            :selectedGarage="navigationDataProvider.selectedGarage"
            :selectedGarageIds="navigationDataProvider.selectedGarageIds"
            :sourcesInMaintenance="sourcesInMaintenance"
            source="PagesJaunes"
          />
        </div>
      </template>
      <TableEreputationReview
        :allGarages="allGarages"
        :appendResponses="appendResponses"
        :areReviewsLoading="reviews.areLoading"
        :areReviewsLoadingMore="reviews.areLoadingMore"
        :childModalProps="childModalProps"
        :cockpitProps="cockpitProps"
        :configResponsesScore="configResponsesScore"
        :createReviewReply="createReviewReply"
        :currentUser="currentUser"
        :doesReviewsHaveMore="reviews.haveMore"
        :fetchResponses="fetchResponses"
        :fetchReviews="fetchReviews"
        :filters="filters"
        :filtersDisabled="navigationDataProvider.areFiltersDisabled"
        :garageSignatures="garageSignatures"
        :getRowSubview="getRowSubview"
        :handleBack="navigationDataProvider.handleBack"
        :hasBackArrow="navigationDataProvider.hasBackArrow(canComeFrom)"
        :hasMoreTemplates="hasMoreTemplates"
        :isCustomResponseLoading="isCustomResponseLoading"
        :locale="locale"
        :onChangeRowSubview="changeRowSubview"
        :onLoadMore="loadMoreReviews"
        :onReviewsFiltersChange="onReviewsFiltersChange"
        :onSearch="onSearch"
        :onSearchChange="onSearchChange"
        :onSendReviewReply="onSendReviewReply"
        :onUpdateReviewThreadReply="onUpdateReviewThreadReply"
        :openModal="openModal"
        :rating="rating"
        :reviews="reviews"
        :reviewsLiveSearch="reviews.liveSearch"
        :updateReviewReply="updateReviewReply"
      />
    </section>

    <!-- DOES NOT HAVE ACCESS -->
    <section v-else>
      <template>
        <EreputationDemonstration v-bind="layoverProps" :askDemonstration="askDemonstration" />

        <vue-snotify></vue-snotify>
      </template>
<!--     merge conflict <EreputationSubscription-->
<!--        :availableGarages="availableGarages"-->
<!--        :cgvLink="cgvLink"-->
<!--        :childModalProps="childModalProps"-->
<!--        :erepConnections="erepConnections"-->
<!--        :isPrioritaryProfile="isPrioritaryProfile"-->
<!--        :loading="isLoading"-->
<!--        :locale="locale"-->
<!--        :openModal="openModal"-->
<!--        v-bind="layoverProps"-->
<!--      />-->
    </section>
  </div>
</template>

<script>
import EreputationDemonstration
  from "~/components/cockpit/e-reputation/EreputationDemonstration";
import chartsKpiMixin from '~/components/cockpit/mixins/chartsKpiMixin';
import { GaragesTest } from '~/utils/enumV2';
import EreputationTile from '~/components/cockpit/e-reputation/EreputationTile';
import EreputationPresentationTile
  from '~/components/cockpit/e-reputation/EreputationPresentationTile';
import TableEreputationReview
  from '~/components/cockpit/e-reputation/reviews/TableEreputationReview';
import TileEreputationSkeleton
  from '~/components/global/skeleton/TileEreputationSkeleton';
import EReputationStatsSkeleton
  from '~/components/global/skeleton/EReputationStatsSkeletons';
import EReputationPresentationTitleSkeleton
  from '~/components/global/skeleton/EReputationPresentationTitleSkeleton';
import { watchersFactory } from '~/mixins/utils';
import facebookConnect from '~/util/externalScripts/facebook-connect';
import googlePlatformApi from '~/util/externalScripts/google-platform-api';
import { setupHotJar } from '~/util/externalScripts/hotjar';
import { makeApolloMutations, makeApolloQueries } from '~/util/graphql';
import { generateSubFiltersWithRoute } from '~/util/filters';
import { KPI_BY_PERIOD_GET_SINGLE_AND_EREP_KPI } from '~/utils/kpi/graphqlQueries';

const filtersEreputation = [
  {
    query: 'scoreFilter',
    payload: { filter: 'scoreFilter' },
    callbackValue: null,
  },
  {
    query: 'source',
    payload: { filter: 'source' },
    callbackValue: null,
  },
  {
    query: 'responseFilter',
    payload: { filter: 'publicReviewCommentStatus' },
    callbackValue: null,
  },
];

export default {
  name: "EreputationReviewsPage",
  components: {
    EreputationPresentationTile,
    EReputationPresentationTitleSkeleton,
    EReputationStatsSkeleton,
    EreputationTile,
    TableEreputationReview,
    EreputationDemonstration,
    TileEreputationSkeleton,
  },
  inheritAttrs: false,
  middleware: ["hasAccessToEreputation"],
  mixins: [
    chartsKpiMixin(
      'COCKPIT_E_REPUTATION_REVIEWS',
      KPI_BY_PERIOD_GET_SINGLE_AND_EREP_KPI,
      {
        erepKpis: [],
        kpiByPeriodGetSingle: {},
      },
    ),
  ],

  props: {
    navigationDataProvider: {
      type: Object,
      required: true,
    },
  },

  async asyncData({ route }) {
    const finalFilters = generateSubFiltersWithRoute(route, filtersEreputation);
    return { filters: finalFilters };
  },
  beforeMount() {
    googlePlatformApi();
    facebookConnect(process.env.facebookOauthClientId);
  },
  async mounted() {
    await this.navigationDataProvider.fetchGarageSignatures();
    setupHotJar(this.locale, 'ereputation');
    this.refreshRouteParameters();
    this.initializeFiltersValues();
    await this.refreshView();
  },

  data() {
    return {
      isLoading: true,
      rating: 0,
      filters: {
        scoreFilter: null,
        publicReviewCommentStatus: null,
        source: null,
      },
      reviews: {
        paginate: 10,
        areLoading: true,
        areLoadingMore: false,
        currentPage: 1,
        haveMore: false,
        error: '',
        data: [],
        search: '',
        liveSearch: '',
      },
      erepConnections: {},
      loadingMessage: null,
      loadingLogo: null,
      rowSubview: [],
      sourcesInMaintenance: process.env.EREP_SOURCES_IN_MAINTENANCE
        ? process.env.EREP_SOURCES_IN_MAINTENANCE.split(',')
        : [],
    };
  },

  computed: {
    cockpitProps() {
      return {
        selectedGarageId: this.navigationDataProvider.selectedGarageIds,
        allGaragesNotFiltered: this.allGarages,
        changeCurrentGarage: this.navigationDataProvider.changeGarage,
        refreshRouteParameters: this.refreshRouteParameters,
      };
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
          garageId: this.navigationDataProvider.garageId,
        },
        ModalRequestAccepted: {
          closeModal: this.closeModal,
        },
        ModalDisconnectService: {
          closeModal: this.closeModal,
          deleteExogenousConfiguration: this.deleteExogenousConfiguration,
          refreshView: this.refreshView,
        },
        ModalDeleteReply: {
          closeModal: this.closeModal,
          removeReviewReply: this.removeReviewReply,
        },
      };
    },
    isCustomResponseLoading() {
      return Boolean(this.$store.getters['cockpit/admin/customResponse/loading']);
    },
    locale() {
      return this.navigationDataProvider.locale;
    },
    isFrench() {
      return this.locale === 'fr';
    },
    kpiByPeriodSingle() {
      return this.$store.getters["cockpit/kpiByPeriodSingle"];
    },
    hasAccessToEreputation() {
      return (
        this.$store.getters['auth/hasAccessToEreputation']
        && this.currentGarageHasEreputation
      );
    },
    currentGarageHasEreputation() {
      if (this.navigationDataProvider.garageIds !== null) {
        return this.navigationDataProvider.authorizations.currentHasEreputation;
      }
      return true;
    },
    layoverProps() {
      return {
        loading: this.isLoading,
        availableGarages: this.availableGarages,
        isPrioritaryProfile: this.isPrioritaryProfile
      };
    },
    availableGarages() {
      return this.navigationDataProvider.availableGarages || [];
    },
    wwwUrl() {
      return this.navigationDataProvider.wwwUrl;
    },
    cgvLink() {
      if (['ca', 'es'].includes(this.locale)) {
        return `${ this.wwwUrl }/CGV-es.pdf`;
      }
      return `${ this.wwwUrl }/CGV.pdf`;
    },
    isPrioritaryProfile() {
      return this.$store.getters['auth/isPriorityProfile'];
    },
    garageSignatures() {
      return this.navigationDataProvider.garageSignatures;
    },
    currentUser() {
      const user = this.$store.getters['auth/currentUser'];
      return {
        firstName: user.firstName,
        lastName: user.lastName,
      };
    },
    allGarages() {
      return this.navigationDataProvider.allGaragesNotFiltered;
    },
    configResponsesScore() {
      return this.$store.getters['cockpit/admin/customResponse/configResponsesScore'];
    },
    hasMoreTemplates() {
      return this.$store.getters['cockpit/admin/customResponse/hasMoreTemplates'];
    },
    canComeFrom() {
      return ['cockpit-e-reputation-garages'];
    },
  },
  methods: {
    getReviewIndex(review) {
      return this.reviews.data.findIndex(
        ({ id }) => review.id === id
      );
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
    changeGaragesSubscription(payload) {
      this.navigationDataProvider.changeGaragesSubscription(payload);
    },
    changeAutorization(payload) {
      this.$store.dispatch('auth/changeAutorization', payload);
    },
    changeAutorizationContent(payload) {
      this.$store.dispatch('auth/changeAutorizationContent', payload);
    },
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
    async removeReviewReply({ review }) {
      this.setReviewsLoading(true);
      const request = {
        name: 'dataSetDeleteReply',
        fields: `
          publicReviewComment
          publicReviewCommentStatus
          publicReviewCommentRejectionReason
          publicReviewCommentApprovedAt
        `,
        args: { reviewId: review.id, exogenous: true },
      };
      const { data } = await makeApolloMutations([request]);
      this.setReviewReply({ review, reply: data.dataSetDeleteReply });
      this.setReviewsLoading(false);
    },
    updateReviewThread({ review, thread, publicReviewCommentRejectionReason }) {
      if (publicReviewCommentRejectionReason) {
        review.publicReviewCommentRejectionReason = publicReviewCommentRejectionReason;
      }
      const index = this.getReviewIndex(review);
      this.$set(this.reviews.data[index], 'thread', thread);
    },
    async updateThreadReply({ commentId, review, text, replyId = undefined }) {
      this.setReviewsLoading(true);
      const request = {
        name: 'dataSetUpdateReply',
        args: { reviewId: review.id, comment: text, commentId, replyId },
        fields: ` reviewReplyRejectedReason
            updatedThread {
              text
              approvedAt
              author
              id
              attachment
              isFromOwner
              replies {
                text
                approvedAt
                author
                id
                attachment
                isFromOwner
              }
            }
          `,
      };
      const { data } = await makeApolloMutations([request]);
      this.updateReviewThread({
        review,
        thread: data.dataSetUpdateReply.updatedThread,
      });
      this.setReviewsLoading(false);
    },
    async onUpdateReviewThreadReply(options) {
      await this.updateThreadReply(options);
    },
    async sendThreadReply({ reviewId, commentId, review, text, replyId }) {
      this.setReviewsLoading(true);
      const request = {
        name: 'dataSetCreateReply',
        args: {
          reviewId,
          commentId,
          comment: text,
          replyId,
        },
        fields: `
          publicReviewCommentRejectionReason
          updatedThread {
            text
            approvedAt
            author
            id
            attachment
            isFromOwner
            replies {
              text
              approvedAt
              author
              id
              attachment
              isFromOwner
            }
          }
        `,
      };
      const { data } = await makeApolloMutations([request]);
      const { dataSetCreateReply: { updatedThread, publicReviewCommentRejectionReason } = {} } = data || {};
      this.updateReviewThread({
        review,
        thread: updatedThread,
        publicReviewCommentRejectionReason,
      });
      this.setReviewsLoading(false);
    },
    async onSendReviewReply(options) {
      await this.sendThreadReply(options);
    },
    setReviewReply({ review, reply }) {
      const editedReviewIndex = this.getReviewIndex(review);
      this.$set(this.reviews.data[editedReviewIndex], 'publicReviewComment', reply.publicReviewComment || '');
      this.$set(this.reviews.data[editedReviewIndex], 'publicReviewCommentStatus', reply.publicReviewCommentStatus || '');
      this.$set(this.reviews.data[editedReviewIndex], 'publicReviewCommentRejectionReason', reply.publicReviewCommentRejectionReason || '');
      this.$set(this.reviews.data[editedReviewIndex], 'publicReviewCommentApprovedAt', reply.publicReviewCommentApprovedAt || null);
    },
    async createReviewReply({ review, comment }) {
      this.setReviewsLoading(true);
      const request = {
        name: 'dataSetCreateReply',
        args: {
          reviewId: review.id,
          comment,
          exogenous: true,
        },
        fields: `publicReviewComment
            publicReviewCommentStatus
            publicReviewCommentRejectionReason
            publicReviewCommentApprovedAt
          `,
      };
      const { data: { dataSetCreateReply } = {} } = await makeApolloMutations([request]);
      this.setReviewReply({
        review,
        reply: dataSetCreateReply,
      });
      this.setReviewsLoading(false);
    },
    async updateReviewReply({ review, comment }) {
      this.setReviewsLoading(true);
      const request = {
        name: 'dataSetUpdateReply',
        args: {
          reviewId: review.id,
          comment,
          exogenous: true,
        },
        fields: `publicReviewComment
          publicReviewCommentStatus
          publicReviewCommentRejectionReason
          publicReviewCommentApprovedAt
        `,
      };
      const { data: { dataSetUpdateReply } = {} } = await makeApolloMutations([request]);
      this.setReviewReply({ review, reply: dataSetUpdateReply });
      this.setReviewsLoading(false);
    },
    onReviewsFiltersChange({ filters }) {
      this.setReviewFilters(Object.assign({}, filters));
      this.refreshRouteParameters();
    },
    setReviewSearch(search) {
      this.reviews.search = search;
    },
    changeReviewSearch({ search }) {
      this.setReviewSearch(search);
      this.refreshRouteParameters();
    },
    async onSearch(searchValue) {
      await this.changeReviewSearch({ search: searchValue });
      await this.fetchReviews({
        page: 1,
        append: false,
      });
    },
    async loadMoreReviews() {
      this.reviews.areLoadingMore = true;
      await this.fetchNextReviewsPage();
      this.reviews.areLoadingMore = false;
    },
    async fetchNextReviewsPage() {
      await this.fetchReviews({
        page: this.reviews.currentPage + 1,
        append: true,
      });
    },
    setReviewLiveSearch(search) {
      this.reviews.liveSearch = search;
    },
    changeReviewLiveSearch({ search }) {
      this.setReviewLiveSearch(search);
    },
    async onSearchChange(searchValue) {
      await this.changeReviewLiveSearch({
        search: searchValue,
      });
    },
    changeRowSubview({ id, view }) {
      this.setRowSubview({ id, view });
    },
    setRowSubview({ id, view }) {
      const item = this.rowSubview.find((i) => i.id === id);
      !item ? this.rowSubview.push({ id, view }) : (item.view = view === item.view && item.view !== null ? null : view);
    },
    handleFirstVisitCase() {
      setTimeout(() => {
        if (this.isEreputationFirstVisit) {
          this.openModal({
            component: 'ModalWelcome',
            props: {
              source: 'Google',
              stats: this.erepConnections,
              openModal: this.openModal,
              closeModal: this.closeModal,
              connectSource: this.connectSource,
              garageId: this.navigationDataProvider.garageId,
              childModalProps: this.childModalProps,
            },
          });
          this.changeFirstVisit({
            firstVisit: 'EREPUTATION',
            value: false,
          });
        }
      }, 1000);
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
    async refreshView() {
      this.setLoading(true);
      this.setReviewsLoading(true);
      if (this.hasAccessToEreputation) {
        await Promise.all([
          this.fetchErepConnections(),
          this.fetchReviews({ page: 1, append: false }),
        ]);
        this.handleFirstVisitCase();
      }
      this.setLoading(false);
      this.setReviewsLoading(false);
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
    setLoading(value) {
      this.isLoading = value;
    },
    getRowSubview(id) {
      const item = this.rowSubview.find((i) => i.id === id);
      return item ? item.view : null;
    },
    setReviewFilters(filters) {
      this.filters = filters;
      this.saveCurrentSubFilters();
    },
    changeReviewFilters(filters) {
      this.setReviewFilters(Object.assign({}, filters));
      this.refreshRouteParameters();
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
        fields: `success`,
      };
      const resp = await makeApolloMutations([request]);
      if (resp?.data?.garageSetMatch?.success) {
        this.setGarageIsConnected({
          garageId,
          externalId: externalGarageId,
          source,
        });
      }
      return resp?.data?.garageSetMatch?.success;
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
      // eslint-disable-next-line no-undef
      const response = await gapi.auth2.getAuthInstance().grantOfflineAccess({
        redirect_uri: 'postmessage',
        scope: 'profile https://www.googleapis.com/auth/plus.business.manage',
      });
      await this.postExogenousConfiguration({
        garageId: garageId,
        source: 'Google',
        code: response.code,
      });
    },
    async connectFacebook({ garageId }) {
      const response = await new Promise(resolve =>
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
        connectPagesJaunes: "connectPagesJaunes",
      });

      const functionsConnect = {
        [FunctionNames.connectFacebook]: this.connectFacebook,
        [FunctionNames.connectGoogle]: this.connectGoogle,
        [FunctionNames.connectPagesJaunes]: this.connectPagesJaunes,
      };

      const connectFunction = functionsConnect[`connect${ source }`];
      return connectFunction ? connectFunction({ garageId, }) : null;
    },
    openModal(modalOptions) {
      this.$store.dispatch('openModal', modalOptions, { root: true });
    },
    closeModal() {
      this.$store.dispatch('closeModal');
    },
    refreshRouteParameters() {
      const {
        publicReviewCommentStatus,
        source,
        scoreFilter,
      } = this.filters;
      const { search } = this.reviews;
      const urlParams = {
        scoreFilter: scoreFilter || undefined,
        source: source || undefined,
        responseFilter: publicReviewCommentStatus || undefined,
        publicReviewFilter: undefined,
        followupUnsatisfiedFilter: undefined,
        followupLeadFilter: undefined,
        search: search || undefined,
        dataTypeId: undefined,
        startDate: undefined,
        endDate: undefined,
      };
      return this.navigationDataProvider.refreshRouteParameters(urlParams);
    },
    setReviewsLoading(value) {
      this.reviews.areLoading = value;
    },
    refreshEreputationReview() {
      this.fetchReviews({
        page: 1,
        append: false,
      });
    },
    async fetchReviews({ page, append }) {
      this.setReviewsLoading(true);
      const { cockpitType, garageIds, periodId } = this.navigationDataProvider;
      const {
        publicReviewCommentStatus,
        source,
        scoreFilter,
      } = this.filters;
      const reviewsRequest = {
        name: 'ErepReviews',
        fields: `
          Reviews {
            id,
            garageId,
            garagePublicDisplayName,
            source,
            surveyComment,
            surveyRespondedAt,
            surveyScore,
            recommend,
            surveyOriginalScore,
            surveyOriginalScale,
            customerFullName,
            publicReviewComment,
            publicReviewCommentStatus,
            publicReviewCommentRejectionReason,
            publicReviewCommentApprovedAt,
            thread {
              text,
              status,
              approvedAt,
              rejectedReason,
              author,
              id,
              authorId,
              attachment,
              isFromOwner,
              replies {
                text,
                status,
                approvedAt,
                rejectedReason,
                author,
                id,
                authorId,
                attachment,
                isFromOwner,
              }
            }
            frontDeskUserName
          },
          HasMore,
          Error
        `,
        args: {
          limit: this.reviews.paginate,
          skip: (page - 1) * this.reviews.paginate,
          period: periodId.toString(),
          search: this.reviews.search,
          cockpitType,
          ...(garageIds !== null ? { garageId: garageIds } : {}),
          ...(scoreFilter ? { score: scoreFilter } : {}),
          ...(publicReviewCommentStatus ? { response: publicReviewCommentStatus } : {}),
          ...(source ? { source } : {}),
        },
      };
      const { data } = await makeApolloQueries([reviewsRequest]);
      const { ErepReviews } = data || {};
      if (!ErepReviews || ErepReviews.Error || !ErepReviews.Reviews) {
        const errorMessage = ErepReviews?.Error || 'BAD RESPONSE FROM APOLLO SERVER';
        console.error(`[STORE/EREPUTATION] ERROR : ${ errorMessage }`);
      } else {
        append ? this.appendReviews(ErepReviews.Reviews) : this.setReviews(ErepReviews.Reviews);
        this.setReviewsCurrentPage({ page });
        this.setReviewsHasMore(ErepReviews.HasMore);
        this.setReviewsLoading(false);
      }
      return Promise.resolve();
    },
    setReviewsCurrentPage({ page }) {
      if (this.reviews) {
        this.reviews.currentPage = page;
      } else {
        this.reviews = { currentPage: page };
      }
    },
    setReviewsHasMore(value) {
      this.reviews.haveMore = value;
    },
    setReviews(reviews) {
      this.reviews.data = reviews;
    },
    appendReviews(reviews) {
      this.reviews.data = [...this.reviews.data, ...reviews];
    },
    async fetchResponses(rating, garageIds) {
      await this.$store.dispatch('cockpit/admin/customResponse/fetchResponses', { rating, garageId: garageIds });
      this.rating = rating;
    },
    async appendResponses() {
      if (this.hasMoreTemplates) {
        await this.$store.dispatch('cockpit/admin/customResponse/appendResponsesByScore', this.rating);
      }
    },
    saveCurrentSubFilters() {
      sessionStorage?.setItem(
        `${ this.$route.name }_subfilters`,
        JSON.stringify(this.filters),
      );
    },
    initializeFiltersValues() {
      const allowedKeys = [
        'scoreFilter',
        'source',
        'publicReviewCommentStatus'
      ];

      const savedEntries = sessionStorage?.getItem(
        `${ this.$route.name }_subfilters`
      );
      Object.entries(savedEntries ? JSON.parse(savedEntries) : {}).forEach(
        ([filter, value]) => {
          if (value !== null && allowedKeys.includes(filter)) {
            this.$set(this.filters, filter, value);
          }
        }
      );
    },
    async askDemonstration() {
      const request = {
        name: 'garageAskProductDemo',
        args: {
          productName: 'ERep'
        },
        fields: `
          message
          status
        `
      };
      const resp = await makeApolloMutations([request]);
      if (resp.data.garageAskProductDemo.status) {
        this.$snotify.success(this.$t_locale('pages/cockpit/e-reputation/reviews')('demo_success_content'), this.$t_locale('pages/cockpit/e-reputation/reviews')('demo_success_title'));
        setTimeout(() => {
          this.$router.push('/cockpit/welcome');
        }, 4000);
      } else {
        this.$snotify.error(this.$t_locale('pages/cockpit/e-reputation/reviews')('demo_fail_content', { error: resp.data.garageAskProductDemo.message.toString()}), this.$t_locale('pages/cockpit/e-reputation/reviews')('demo_fail_title'));
      }
    }
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
.page-e-reputation-reviews {
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

    @media (min-width: $breakpoint-min-md) {
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
