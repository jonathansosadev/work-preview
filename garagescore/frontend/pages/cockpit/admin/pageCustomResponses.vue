<template>
  <section>
    <section v-if="hasAccessToAdmin && hasAtLeastOneSubscribedGarage">
      <CustomResponse
        :addModel="addModel"
        :closeModal="closeModal"
        :configResponseTemp="configResponseTemp"
        :customResponses="customResponses"
        :deleteModel="deleteModel"
        :garagesOptions="garagesOptions"
        :hasMore="hasMore"
        :itemsTag="itemsTag"
        :loadMore="loadMore"
        :loading="loading"
        :loadingMore="loadingMore"
        :reponseTime="reponseTime"
        :saveGarageDelay="saveGarageDelay"
        :saveModelTemp="saveModelTemp"
        :updateModel="updateModel"
        :appendResponsesDelay="appendResponsesDelay"
        :getHasMoreDataDelay="() => hasMoreDataDelay"
        :getGaragesDelay="() => garagesDelay"
      />
    </section>
    <!-- DOES NOT HAVE ACCESS -->
    <section v-if="subscription">
      <template>
        <EreputationDemonstration v-bind="layoverProps" :askDemonstration="askDemonstration" />
        <vue-snotify />
      </template>
    </section>
    <section v-if="permission">
      <Welcome
        :authorizations="navigationDataProvider.authorizations"
        :cockpitType="navigationDataProvider.cockpitType"
        :dataTypeId="navigationDataProvider.dataTypeId"
        :erepKpis="erepKpis"
        :kpiByPeriodSingle="kpiByPeriodSingle"
        :garagesConversions="garagesConversions"
        :garagesSolvedUnsatisfied="garagesSolvedUnsatisfied"
        :hasAccessToLeads="hasAccessToLeads"
        :hasAccessToSatisfaction="hasAccessToSatisfaction"
        :hasAccessToUnsatisfied="hasAccessToUnsatisfied"
        :isEreputationKpisLoading="isEreputationKpisLoading"
        :isSingleKpiByPeriodLoading="isSingleKpiByPeriodLoading"
        :isGaragesConversionsLoading="isGaragesConversionsLoading"
        :isGaragesSolvedUnsatisfiedLoading="isGaragesSolvedUnsatisfiedLoading"
        :locale="navigationDataProvider.locale"
        :onCloseModal="modalMixin.closeModal"
        :onOpenModal="modalMixin.openModal"
        :childModalProps="childModalProps"
        :ereputationProps="ereputationProps"
      />
    </section>
  </section>
</template>
<script>
import CustomResponse from '~/components/cockpit/admin/CustomResponse.vue';
import Welcome from '~/components/cockpit/admin/welcome/Welcome.vue';
import { searchAndReplaceValues } from '~/util/filters.js'
import { makeApolloMutations, makeApolloQueries } from '~/util/graphql';
import EreputationDemonstration from '~/components/cockpit/e-reputation/EreputationDemonstration';
import { GaragesTest, SourceTypes, OptionResponse, UserRoles } from '~/utils/enumV2.js';
import timeHelper from '../../../../common/lib/util/time-helper.js';

export default {
  name: 'PageCustomResponses',
  components: {
    CustomResponse,
    EreputationDemonstration,
    Welcome,
  },
  props: {
    navigationDataProvider: {
      type: Object,
      required: true,
    },
    modalMixin: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      erepKpis: [],
      kpiByPeriodSingle: {},
      garagesConversions: {},
      garagesSolvedUnsatisfied: {},
      kpiByPeriod: [],
      isEreputationKpisLoading: false,
      isSingleKpiByPeriodLoading: false,
      isGaragesConversionsLoading: false,
      isGaragesSolvedUnsatisfiedLoading: false,
      isKpiByPeriodLoading: false,
      permission: false,
      subscription: false,
      ADMIN_VALUES: [UserRoles.ADMIN, UserRoles.SUPER_ADMIN],
      SOURCES_VALUES: [
        SourceTypes.DATAFILE,
        SourceTypes.GOOGLE,
        SourceTypes.FACEBOOK,
      ],
      singleKpi: {
        data: {}
      },
      TIME_DEFAULT: 0,
      reviews: {
        paginate: 10,
        loading: true,
        currentPage: 1,
        hasMore: false,
        error: "",
        data: [],
        search: "",
        liveSearch: "",
        filters: {
          surveySatisfactionLevel: null,
          publicReviewCommentStatus: null,
          source: null
        }
      },
      loadingMessage: '',
      loadingLogo: '',
      isLoading: false,
    };
  },

  created() {
    this.fetchEreputationKpisData();
    this.fetchSingleKpiByPeriodData();
    this.fetchGaragesConversionData();
    this.fetchGaragesSolvedUnsatisfiedData();
    this.fetchKpiData();
  },
  async mounted() {
    this.verifyAccesibility();
    await this.$store.dispatch('cockpit/admin/customResponse/initialPage');
    await this.$store.dispatch('cockpit/admin/customResponse/fetchModelResponse', false);
    await this.$store.dispatch('cockpit/admin/customResponse/fetchResponsesDelay');
  },

  computed: {
    ereputationProps() {
      return {
        refreshEreputationRouteParameters: this.refreshEreputationRouteParameters,
        fetchReviews: this.fetchReviews,
        changeReviewFilters: this.changeReviewFilters,
        singleKpi: this.singleKpiData,
        connectSource: this.connectSource,
        sourcesInMaintenance: this.sourcesInMaintenance,
      };
    },
    singleKpiData() {
      return this.singleKpi.data;
    },
    childModalProps() {
      return {
        ModalConnectGarages: {
          erepConnections: {},
          hasPendingSubscriptionRequest: false,
          connectSource:this.connectSource,
          openModal: this.openModalFunction,
          closeModal: this.closeModal,
        },
        ModalDisconnectService: {
          closeModal: this.closeModal,
          deleteExogenousConfiguration: () => {
            console.error('Cannot delete configuration in demo mode');
          },
          refreshView: () => {
            console.error('Cannot refresh view in demo mode');
          },
        },
        ModalMaintenance: {
          closeModal: this.closeModal,
        },
      };
    },
    customResponses() {
      const configResponses = this.$store.getters['cockpit/admin/customResponse/configResponses'];
      return configResponses.map((item) => {
        return { ...item, contentTemp: this.formatContent(item) };
      });
    },
    configResponseTemp() {
      return this.$store.getters['cockpit/admin/customResponse/configResponseTemp'];
    },
    loading() {
      return this.$store.getters['cockpit/admin/customResponse/loading'];
    },
    loadingMore() {
      return this.$store.getters['cockpit/admin/customResponse/loadingMore'];
    },
    hasMore() {
      return this.$store.getters['cockpit/admin/customResponse/hasMoreTemplates'];
    },
    hasAtLeastOneSubscribedGarage() {
      return this.access.atLeastOneGarage;
    },
    hasAccessToAdmin() {
      return this.access.isAdmin;
    },
    hasAccessToLeads() {
      return this.$store.getters['auth/hasAccessToLeads'];
    },
    hasAccessToSatisfaction() {
      return this.$store.getters['auth/hasAccessToSatisfaction'];
    },
    hasAccessToUnsatisfied() {
      return this.$store.getters['auth/hasAccessToUnsatisfied'];
    },
    access() {
      const temp = this.$store.getters['auth/currentUser'].role;
      return {
        isAdmin: this.ADMIN_VALUES.includes(temp),
        atLeastOneGarage: this.$store.getters['cockpit/authorizations'].hasEReputationAtLeast,
      };
    },
    reponseTime() {
      let data = [{ label: this.$t_locale('pages/cockpit/admin/pageCustomResponses')('NotDefined'), value: 0 }];

      data.push({ label: this.$t_locale('pages/cockpit/admin/pageCustomResponses')('Immediate'), value: timeHelper.oneMinute });

      //for hours
      for (let i = 1; i < 24; i++) {
        const label = this.$t_locale('pages/cockpit/admin/pageCustomResponses')('Afterh') + i + (i === 1 ? this.$t_locale('pages/cockpit/admin/pageCustomResponses')('Hour') : this.$t_locale('pages/cockpit/admin/pageCustomResponses')('Hours'));
        data.push({ label: label, value: timeHelper.oneHour * i });
      }
      //for days
      for (let i = 1; i < 4; i++) {
        const label = this.$t_locale('pages/cockpit/admin/pageCustomResponses')('After' + i + 'j');
        data.push({ label: label, value: timeHelper.oneDay * i });
      }
      return data;
    },
    garagesConfigDelay() {
      return this.$store.getters['cockpit/admin/customResponse/configResponsesDelay'];
    },
    garagesOptions() {
      return this.$store.getters['cockpit/allGaragesNotFiltered'].map((item) => {
        const disabled = !(item.subscriptions && item.subscriptions.EReputation);
        const label = disabled ? `${item.publicDisplayName} - ${this.$t_locale('pages/cockpit/admin/pageCustomResponses')('NotSuscribed')}` : item.publicDisplayName;
        return {
          label: label,
          value: item.id,
          $isDisabled: disabled,
        };
      });
    },
    itemsTag() {
      return [
        { label: this.$t_locale('pages/cockpit/admin/pageCustomResponses')(OptionResponse.INITIAL_NAME), value: OptionResponse.INITIAL_NAME, disabled: false },
        { label: this.$t_locale('pages/cockpit/admin/pageCustomResponses')(OptionResponse.GARAGE_NAME), value: OptionResponse.GARAGE_NAME, disabled: false },
        { label: this.$t_locale('pages/cockpit/admin/pageCustomResponses')(OptionResponse.LAST_NAME), value: OptionResponse.LAST_NAME, disabled: false },
        { label: this.$t_locale('pages/cockpit/admin/pageCustomResponses')(OptionResponse.FIRST_NAME), value: OptionResponse.FIRST_NAME, disabled: false },
        { label: this.$t_locale('pages/cockpit/admin/pageCustomResponses')(OptionResponse.SIGN), value: OptionResponse.SIGN, disabled: false },
        { label: this.$t_locale('pages/cockpit/admin/pageCustomResponses')(OptionResponse.GROUP_NAME), value: OptionResponse.GROUP_NAME, disabled: false },
      ];
    },
    /*
     * Method that return props for EreputationDemonstration component
     */
    layoverProps() {
      return {
        loading: this.loading,
        availableGarages: this.availableGarages,
        isPrioritaryProfile: this.isPrioritaryProfile,
      };
    },
    availableGarages() {
      return this.$store.getters['cockpit/availableGarages'] || [];
    },
    isPrioritaryProfile() {
      return this.$store.getters['auth/isPriorityProfile'];
    },
    garagesDelay() {
      if (this.garagesConfigDelay) {
        return this.garagesConfigDelay.map((item) => {
          return {
            id: item._id,
            name: item.publicDisplayName,
            automaticReviewResponseDelay: item.automaticReviewResponseDelay || this.TIME_DEFAULT,
            disabled: !this.hasEreputation(item._id),
          };
        });
      }
      return [];
    },
    hasMoreDataDelay() {
      return this.$store.getters['cockpit/admin/customResponse/hasMoreDataDelay'];
    },
    sourcesInMaintenance() {
      return process.env.EREP_SOURCES_IN_MAINTENANCE;
    },
  },

  methods: {
    setLoadingLogo(logo) {
      this.loadingLogo = logo;
    },
    setLoadingMessage(message) {
      this.loadingMessage = (message || null);
    },
    setLoading(value) {
      this.isLoading = value;
    },
    toggleLoadingScreen({ message, logo, value }) {
      this.closeModal();
      this.setLoadingMessage(message);
      this.setLoadingLogo(logo);
      this.setLoading(value);
    },
    async postExogenousConfiguration({ garageId, source, code }) {
      const sourcesWhichNeedMatching = ["Google", "Facebook"];

      this.toggleLoadingScreen({
        message: source,
        logo: source,
        value: true
      });
      const request = {
          name: 'garageSetExogenousConfiguration',
          args: { garageId, source, code },
          fields:
          `garagesToMatch {
            name
            externalId
          }
          baseGarageId
          rejectionReason
          `
      };
      const defaultLoadingScreenPayload = {
        message: null,
        logo: null,
        value: false
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
        redirect_uri: "postmessage",
        scope: "profile https://www.googleapis.com/auth/plus.business.manage"
      });
      await this.postExogenousConfiguration({
        garageId: garageId,
        source: "Google",
        code: response.code
      });
    },
    async connectFacebook({ garageId }) {
      const response = await new Promise(resolve =>
        // eslint-disable-next-line no-undef
        FB.login(e => resolve(e),
          {
            scope: "pages_manage_metadata,pages_read_engagement,pages_read_user_content,pages_manage_posts,pages_manage_engagement"
          })
      );
      if (
        response &&
        response.authResponse &&
        response.authResponse.accessToken
      ) {
        await this.postExogenousConfiguration({
          garageId: garageId,
          source: 'Facebook',
          code: response.authResponse.accessToken,
        });
      }
    },
    async connectPagesJaunes({ garageId }) {
      this.openModal({
        component: "ModalConnectWithUrl",
        props: {
          source: "PagesJaunes",
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
          component: "ModalMaintenance",
          props: {
            closeModal: this.closeModal,
            source,
          },
        });
      }
      const connectFunction = this[`connect${source}`];
      return connectFunction
        ? connectFunction({
          garageId
        })
        : null;
    },
    setReviewFilters(filters) {
      this.$set(this.reviews, "filters", filters);
    },
    changeReviewFilters(filters) {
      this.setReviewFilters(Object.assign({}, filters));
      this.refreshEreputationRouteParameters();
    },
    setReviews(reviews) {
      this.$set(this.reviews, "data", reviews);
    },
    appendReviews(reviews) {
      this.$set(this.reviews, "data", [...this.reviews.data, ...reviews]);
    },
    setReviewsHasMore(value) {
      this.$set(this.reviews, "hasMore", value);
    },
    setReviewsLoading(value) {
      this.$set(this.reviews, "areLoading", value);
    },
    setReviewsCurrentPage({ page }) {
      if (this.reviews) {
        this.reviews.currentPage = page;
      } else {
        this.reviews = { currentPage: page };
      }
    },
    async fetchReviews({ page, append }) {
      this.setReviewsLoading(true);
      const {
        cockpitType,
        garageId,
        periodId,
      } = this.navigationDataProvider;
      const {
        publicReviewCommentStatus,
        source,
        surveySatisfactionLevel,
      } = this.reviews.filters;
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
          ...(garageId !== null ? { garageId } : {}),
          ...(surveySatisfactionLevel
            ? { score: surveySatisfactionLevel }
            : {}
          ),
          ...(publicReviewCommentStatus
            ? { response: publicReviewCommentStatus }
            : {}
          ),
          ...(source ? { source } : {})
        }
      };
      const { data } = await makeApolloQueries([reviewsRequest]);
      const { ErepReviews } = data || {};
      if (!ErepReviews || ErepReviews.Error || !ErepReviews.Reviews) {
        const errorMessage = (ErepReviews?.Error) || 'BAD RESPONSE FROM APOLLO SERVER';
        console.error(`[STORE/EREPUTATION] ERROR : ${errorMessage}`);
      } else {
        append
          ? this.appendReviews(ErepReviews.Reviews)
          : this.setReviews(ErepReviews.Reviews);
        this.setReviewsCurrentPage({ page });
        this.setReviewsHasMore(ErepReviews.HasMore);
        this.setReviewsLoading(false);
      }
      return Promise.resolve();
    },
    refreshEreputationRouteParameters() {
      const { reviews } = this;
      const { filters } = reviews || {};
      const urlParams = {
        scoreFilter: filters.surveySatisfactionLevel || undefined,
        source: filters.source || undefined,
        responseFilter: filters.publicReviewCommentStatus || undefined,
        publicReviewFilter: undefined,
        followupUnsatisfiedFilter: undefined,
        followupLeadFilter: undefined,
        search: this.reviews.search || undefined,
        dataTypeId: undefined,
        startDate: undefined,
        endDate: undefined,
      };
      this.$store.dispatch(
        "cockpit/refreshRouteParameters",
        urlParams,
        { root: true },
      );
    },
    async fetchEreputationKpisData() {
      this.isEreputationKpisLoading = true;
      const { navigationDataProvider: { cockpitType, garageId, periodId } = {} } = this;

      const kpisRequest = {
        name: 'ErepKpis',
        args: {
          period: periodId,
          garageId,
          cockpitType,
        },
        fields: `source
          rating
          countReviews
          countRecommend
          countDetractorsWithoutResponse
          countDetractors
        `,
      };
      const { data } = await makeApolloQueries([kpisRequest]);
      const { ErepKpis } = data || {};
      this.erepKpis = ErepKpis;
      this.isEreputationKpisLoading = false;
    },
    async fetchGaragesSolvedUnsatisfiedData() {
      this.isGaragesSolvedUnsatisfiedLoading = true;
      const { navigationDataProvider: { cockpitType, garageId } = {} } = this;
      const request = {
        name: 'kpiByPeriodGetSolvedUnsatisfied',
        args: {
          garageIds: garageId,
          cockpitType,
        },
        fields: ` countUnsatisfied
          countSolvedAPVUnsatisfied
          countSolvedVNUnsatisfied
          countSolvedVOUnsatisfied
        `,
      };
      const { data } = await makeApolloQueries([request]);
      const { kpiByPeriodGetSolvedUnsatisfied } = data || {};
      this.garagesSolvedUnsatisfied = kpiByPeriodGetSolvedUnsatisfied;
      this.isGaragesSolvedUnsatisfiedLoading = false;
    },
    async fetchSingleKpiByPeriodData() {
      const { navigationDataProvider: { cockpitType, dataTypeId, frontDeskUserName, garageId, periodId } = {} } = this;

      this.isSingleKpiByPeriodLoading = true;
      const request = {
        name: 'kpiByPeriodGetSingle',
        args: {
          periodId,
          garageIds: garageId,
          type: dataTypeId,
          cockpitType,
          frontDesk: frontDeskUserName,
        },
        fields: ` totalShouldSurfaceInCampaignStats
            countEmails
            countSurveys
            countReceivedSurveys
            countSurveysResponded
            countSurveySatisfied
            countSurveyUnsatisfied
            countSurveyLead
            countSurveyLeadVo
            countSurveyLeadVn
            countValidEmails
            countBlockedByEmail
            countBlockedLastMonthEmail
            countUnsubscribedByEmail
            countWrongEmails
            countNotPresentEmails
            countValidPhones
            countBlockedByPhone
            countWrongPhones
            countNotPresentPhones
            countBlocked
            countNotContactable
            countSurveyRespondedAPV
            countSurveyRespondedVN
            countSurveyRespondedVO
            countScheduledContacts
        `,
      };
      const { data } = await makeApolloQueries([request]);
      const { kpiByPeriodGetSingle } = data || {};
      this.kpiByPeriodSingle = kpiByPeriodGetSingle;
      this.isSingleKpiByPeriodLoading = false;
    },
    async fetchGaragesConversionData() {
      this.isGaragesConversionsLoading = true;
      const { navigationDataProvider: { cockpitType, garageId } = {} } = this;
      const request = {
        name: 'kpiByPeriodGetGaragesConversions',
        args: {
          cockpitType,
          garageIds: garageId,
        },
        fields: `
          countConvertedLeadsPct
          countConversionsTradeInsPct
          countConversionsVO
          countConversionsVN
          countConversionsLeads
          countConversionsTradeins
          countLeads
        `,
      };
      const { data } = await makeApolloQueries([request]);
      const { kpiByPeriodGetGaragesConversions } = data || {};
      this.garagesConversions = kpiByPeriodGetGaragesConversions;
      this.isGaragesConversionsLoading = false;
    },
    async fetchKpiData() {
      this.isKpiByPeriodLoading = true;
      const { navigationDataProvider: { cockpitType, garageId, periodId, user: userId } = {} } = this;
      const request = {
        name: 'kpiByPeriodGetKpi',
        args: {
          periodId,
          garageId,
          cockpitType,
          userId,
        },
        fields: `garagesKpi {
          countLeads
          countLeadsUnassigned
          countLeadsAssigned
          countLeadsUntouched
          countLeadsUntouchedOpen
          countLeadsTouched
          countLeadsTouchedOpen
          countLeadsTouchedClosed
          countLeadsReactive
          countLeadsWaitingForContact
          countLeadsContactPlanned
          countLeadsWaitingForMeeting
          countLeadsMeetingPlanned
          countLeadsWaitingForProposition
          countLeadsPropositionPlanned
          countLeadsWaitingForClosing
          countLeadsClosedWithoutSale
          countLeadsClosedWithSale
          countLeadsClosedWithSaleWasInterested
          countLeadsClosedWithSaleWasInContactWithVendor
          countLeadsClosedWithSaleWasAlreadyPlannedOtherBusiness
          countLeadsApv
          countLeadsUnassignedApv
          countLeadsAssignedApv
          countLeadsUntouchedApv
          countLeadsUntouchedOpenApv
          countLeadsTouchedApv
          countLeadsTouchedOpenApv
          countLeadsTouchedClosedApv
          countLeadsReactiveApv
          countLeadsWaitingForContactApv
          countLeadsContactPlannedApv
          countLeadsWaitingForMeetingApv
          countLeadsMeetingPlannedApv
          countLeadsWaitingForPropositionApv
          countLeadsPropositionPlannedApv
          countLeadsWaitingForClosingApv
          countLeadsClosedWithoutSaleApv
          countLeadsClosedWithSaleApv
          countLeadsClosedWithSaleWasInterestedApv
          countLeadsClosedWithSaleWasInContactWithVendorApv
          countLeadsClosedWithSaleWasAlreadyPlannedOtherBusinessApv
          countLeadsVn
          countLeadsUnassignedVn
          countLeadsAssignedVn
          countLeadsUntouchedVn
          countLeadsUntouchedOpenVn
          countLeadsTouchedVn
          countLeadsTouchedOpenVn
          countLeadsTouchedClosedVn
          countLeadsReactiveVn
          countLeadsWaitingForContactVn
          countLeadsContactPlannedVn
          countLeadsWaitingForMeetingVn
          countLeadsMeetingPlannedVn
          countLeadsWaitingForPropositionVn
          countLeadsPropositionPlannedVn
          countLeadsWaitingForClosingVn
          countLeadsClosedWithoutSaleVn
          countLeadsClosedWithSaleVn
          countLeadsClosedWithSaleWasInterestedVn
          countLeadsClosedWithSaleWasInContactWithVendorVn
          countLeadsClosedWithSaleWasAlreadyPlannedOtherBusinessVn
          countLeadsVo
          countLeadsUnassignedVo
          countLeadsAssignedVo
          countLeadsUntouchedVo
          countLeadsUntouchedOpenVo
          countLeadsTouchedVo
          countLeadsTouchedOpenVo
          countLeadsTouchedClosedVo
          countLeadsReactiveVo
          countLeadsWaitingForContactVo
          countLeadsContactPlannedVo
          countLeadsWaitingForMeetingVo
          countLeadsMeetingPlannedVo
          countLeadsWaitingForPropositionVo
          countLeadsPropositionPlannedVo
          countLeadsWaitingForClosingVo
          countLeadsClosedWithoutSaleVo
          countLeadsClosedWithSaleVo
          countLeadsClosedWithSaleWasInterestedVo
          countLeadsClosedWithSaleWasInContactWithVendorVo
          countLeadsClosedWithSaleWasAlreadyPlannedOtherBusinessVo
          countLeadsUnknown
          countLeadsUnassignedUnknown
          countLeadsAssignedUnknown
          countLeadsUntouchedUnknown
          countLeadsUntouchedOpenUnknown
          countLeadsTouchedUnknown
          countLeadsTouchedOpenUnknown
          countLeadsTouchedClosedUnknown
          countLeadsReactiveUnknown
          countLeadsWaitingForContactUnknown
          countLeadsContactPlannedUnknown
          countLeadsWaitingForMeetingUnknown
          countLeadsMeetingPlannedUnknown
          countLeadsWaitingForPropositionUnknown
          countLeadsPropositionPlannedUnknown
          countLeadsWaitingForClosingUnknown
          countLeadsClosedWithoutSaleUnknown
          countLeadsClosedWithSaleUnknown
          countLeadsClosedWithSaleWasInterestedUnknown
          countLeadsClosedWithSaleWasInContactWithVendorUnknown
          countLeadsClosedWithSaleWasAlreadyPlannedOtherBusinessUnknown
          countUnsatisfied
          countUnsatisfiedAssigned
          countUnsatisfiedOpenUnassigned
          countUnsatisfiedWaitingForContact
          countUnsatisfiedContactPlanned
          countUnsatisfiedWaitingForVisit
          countUnsatisfiedVisitPlanned
          countUnsatisfiedWaitingForClosing
          countUnsatisfiedClosedWithoutResolution
          countUnsatisfiedClosedWithResolution
          countUnsatisfiedUntouched
          countUnsatisfiedUntouchedOpen
          countUnsatisfiedTouched
          countUnsatisfiedTouchedOpen
          countUnsatisfiedTouchedClosed
          countUnsatisfiedReactive
          countUnsatisfiedApv
          countUnsatisfiedAssignedApv
          countUnsatisfiedOpenUnassignedApv
          countUnsatisfiedWaitingForContactApv
          countUnsatisfiedContactPlannedApv
          countUnsatisfiedWaitingForVisitApv
          countUnsatisfiedVisitPlannedApv
          countUnsatisfiedWaitingForClosingApv
          countUnsatisfiedClosedWithoutResolutionApv
          countUnsatisfiedClosedWithResolutionApv
          countUnsatisfiedUntouchedApv
          countUnsatisfiedUntouchedOpenApv
          countUnsatisfiedTouchedApv
          countUnsatisfiedTouchedOpenApv
          countUnsatisfiedTouchedClosedApv
          countUnsatisfiedReactiveApv
          countUnsatisfiedVo
          countUnsatisfiedAssignedVo
          countUnsatisfiedOpenUnassignedVo
          countUnsatisfiedWaitingForContactVo
          countUnsatisfiedContactPlannedVo
          countUnsatisfiedWaitingForVisitVo
          countUnsatisfiedVisitPlannedVo
          countUnsatisfiedWaitingForClosingVo
          countUnsatisfiedClosedWithoutResolutionVo
          countUnsatisfiedClosedWithResolutionVo
          countUnsatisfiedUntouchedVo
          countUnsatisfiedUntouchedOpenVo
          countUnsatisfiedTouchedVo
          countUnsatisfiedTouchedOpenVo
          countUnsatisfiedTouchedClosedVo
          countUnsatisfiedReactiveVo
          countUnsatisfiedVn
          countUnsatisfiedAssignedVn
          countUnsatisfiedOpenUnassignedVn
          countUnsatisfiedWaitingForContactVn
          countUnsatisfiedContactPlannedVn
          countUnsatisfiedWaitingForVisitVn
          countUnsatisfiedVisitPlannedVn
          countUnsatisfiedWaitingForClosingVn
          countUnsatisfiedClosedWithoutResolutionVn
          countUnsatisfiedClosedWithResolutionVn
          countUnsatisfiedUntouchedVn
          countUnsatisfiedUntouchedOpenVn
          countUnsatisfiedTouchedVn
          countUnsatisfiedTouchedOpenVn
          countUnsatisfiedTouchedClosedVn
          countUnsatisfiedReactiveVn
        }
        usersKpi {
          countLeads
          countLeadsUnassigned
          countLeadsAssigned
          countLeadsUntouched
          countLeadsUntouchedOpen
          countLeadsTouched
          countLeadsTouchedOpen
          countLeadsTouchedClosed
          countLeadsReactive
          countLeadsWaitingForContact
          countLeadsContactPlanned
          countLeadsWaitingForMeeting
          countLeadsMeetingPlanned
          countLeadsWaitingForProposition
          countLeadsPropositionPlanned
          countLeadsWaitingForClosing
          countLeadsClosedWithoutSale
          countLeadsClosedWithSale
          countLeadsClosedWithSaleWasInterested
          countLeadsClosedWithSaleWasInContactWithVendor
          countLeadsClosedWithSaleWasAlreadyPlannedOtherBusiness
          countLeadsApv
          countLeadsUnassignedApv
          countLeadsAssignedApv
          countLeadsUntouchedApv
          countLeadsUntouchedOpenApv
          countLeadsTouchedApv
          countLeadsTouchedOpenApv
          countLeadsTouchedClosedApv
          countLeadsReactiveApv
          countLeadsWaitingForContactApv
          countLeadsContactPlannedApv
          countLeadsWaitingForMeetingApv
          countLeadsMeetingPlannedApv
          countLeadsWaitingForPropositionApv
          countLeadsPropositionPlannedApv
          countLeadsWaitingForClosingApv
          countLeadsClosedWithoutSaleApv
          countLeadsClosedWithSaleApv
          countLeadsClosedWithSaleWasInterestedApv
          countLeadsClosedWithSaleWasInContactWithVendorApv
          countLeadsClosedWithSaleWasAlreadyPlannedOtherBusinessApv
          countLeadsVn
          countLeadsUnassignedVn
          countLeadsAssignedVn
          countLeadsUntouchedVn
          countLeadsUntouchedOpenVn
          countLeadsTouchedVn
          countLeadsTouchedOpenVn
          countLeadsTouchedClosedVn
          countLeadsReactiveVn
          countLeadsWaitingForContactVn
          countLeadsContactPlannedVn
          countLeadsWaitingForMeetingVn
          countLeadsMeetingPlannedVn
          countLeadsWaitingForPropositionVn
          countLeadsPropositionPlannedVn
          countLeadsWaitingForClosingVn
          countLeadsClosedWithoutSaleVn
          countLeadsClosedWithSaleVn
          countLeadsClosedWithSaleWasInterestedVn
          countLeadsClosedWithSaleWasInContactWithVendorVn
          countLeadsClosedWithSaleWasAlreadyPlannedOtherBusinessVn
          countLeadsVo
          countLeadsUnassignedVo
          countLeadsAssignedVo
          countLeadsUntouchedVo
          countLeadsUntouchedOpenVo
          countLeadsTouchedVo
          countLeadsTouchedOpenVo
          countLeadsTouchedClosedVo
          countLeadsReactiveVo
          countLeadsWaitingForContactVo
          countLeadsContactPlannedVo
          countLeadsWaitingForMeetingVo
          countLeadsMeetingPlannedVo
          countLeadsWaitingForPropositionVo
          countLeadsPropositionPlannedVo
          countLeadsWaitingForClosingVo
          countLeadsClosedWithoutSaleVo
          countLeadsClosedWithSaleVo
          countLeadsClosedWithSaleWasInterestedVo
          countLeadsClosedWithSaleWasInContactWithVendorVo
          countLeadsClosedWithSaleWasAlreadyPlannedOtherBusinessVo
          countLeadsUnknown
          countLeadsUnassignedUnknown
          countLeadsAssignedUnknown
          countLeadsUntouchedUnknown
          countLeadsUntouchedOpenUnknown
          countLeadsTouchedUnknown
          countLeadsTouchedOpenUnknown
          countLeadsTouchedClosedUnknown
          countLeadsReactiveUnknown
          countLeadsWaitingForContactUnknown
          countLeadsContactPlannedUnknown
          countLeadsWaitingForMeetingUnknown
          countLeadsMeetingPlannedUnknown
          countLeadsWaitingForPropositionUnknown
          countLeadsPropositionPlannedUnknown
          countLeadsWaitingForClosingUnknown
          countLeadsClosedWithoutSaleUnknown
          countLeadsClosedWithSaleUnknown
          countLeadsClosedWithSaleWasInterestedUnknown
          countLeadsClosedWithSaleWasInContactWithVendorUnknown
          countLeadsClosedWithSaleWasAlreadyPlannedOtherBusinessUnknown
          countUnsatisfied
          countUnsatisfiedAssigned
          countUnsatisfiedOpenUnassigned
          countUnsatisfiedWaitingForContact
          countUnsatisfiedContactPlanned
          countUnsatisfiedWaitingForVisit
          countUnsatisfiedVisitPlanned
          countUnsatisfiedWaitingForClosing
          countUnsatisfiedClosedWithoutResolution
          countUnsatisfiedClosedWithResolution
          countUnsatisfiedUntouched
          countUnsatisfiedUntouchedOpen
          countUnsatisfiedTouched
          countUnsatisfiedTouchedOpen
          countUnsatisfiedTouchedClosed
          countUnsatisfiedReactive
          countUnsatisfiedApv
          countUnsatisfiedAssignedApv
          countUnsatisfiedOpenUnassignedApv
          countUnsatisfiedWaitingForContactApv
          countUnsatisfiedContactPlannedApv
          countUnsatisfiedWaitingForVisitApv
          countUnsatisfiedVisitPlannedApv
          countUnsatisfiedWaitingForClosingApv
          countUnsatisfiedClosedWithoutResolutionApv
          countUnsatisfiedClosedWithResolutionApv
          countUnsatisfiedUntouchedApv
          countUnsatisfiedUntouchedOpenApv
          countUnsatisfiedTouchedApv
          countUnsatisfiedTouchedOpenApv
          countUnsatisfiedTouchedClosedApv
          countUnsatisfiedReactiveApv
          countUnsatisfiedVo
          countUnsatisfiedAssignedVo
          countUnsatisfiedOpenUnassignedVo
          countUnsatisfiedWaitingForContactVo
          countUnsatisfiedContactPlannedVo
          countUnsatisfiedWaitingForVisitVo
          countUnsatisfiedVisitPlannedVo
          countUnsatisfiedWaitingForClosingVo
          countUnsatisfiedClosedWithoutResolutionVo
          countUnsatisfiedClosedWithResolutionVo
          countUnsatisfiedUntouchedVo
          countUnsatisfiedUntouchedOpenVo
          countUnsatisfiedTouchedVo
          countUnsatisfiedTouchedOpenVo
          countUnsatisfiedTouchedClosedVo
          countUnsatisfiedReactiveVo
          countUnsatisfiedVn
          countUnsatisfiedAssignedVn
          countUnsatisfiedOpenUnassignedVn
          countUnsatisfiedWaitingForContactVn
          countUnsatisfiedContactPlannedVn
          countUnsatisfiedWaitingForVisitVn
          countUnsatisfiedVisitPlannedVn
          countUnsatisfiedWaitingForClosingVn
          countUnsatisfiedClosedWithoutResolutionVn
          countUnsatisfiedClosedWithResolutionVn
          countUnsatisfiedUntouchedVn
          countUnsatisfiedUntouchedOpenVn
          countUnsatisfiedTouchedVn
          countUnsatisfiedTouchedOpenVn
          countUnsatisfiedTouchedClosedVn
          countUnsatisfiedReactiveVn
        }`,
      };
      const { data } = await makeApolloQueries([request]);
      const { kpiByPeriodGetKpi } = data || {};
      this.kpiByPeriod = kpiByPeriodGetKpi;
      this.isKpiByPeriodLoading = false;
    },
    async askDemonstration() {
      const request = {
        name: 'garageAskProductDemo',
        args: {
          productName: 'ERep',
        },
        fields: `
          message
          status
        `,
      };
      const resp = await makeApolloMutations([request]);
      if (resp.data.garageAskProductDemo.status) {
        this.$snotify.success(this.$t_locale('pages/cockpit/admin/pageCustomResponses')('demo_success_content'), this.$t_locale('pages/cockpit/admin/pageCustomResponses')('demo_success_title'));
        setTimeout(() => {
          this.$router.push('/cockpit/welcome');
        }, 4000);
      } else {
        this.$snotify.error(this.$t_locale('pages/cockpit/admin/pageCustomResponses')('demo_fail_content', { error: resp.data.garageAskProductDemo.message.toString()}), this.$t_locale('pages/cockpit/admin/pageCustomResponses')('demo_fail_title'));
      }
    },
    hasEreputation(id) {
      const item = this.$store.getters['cockpit/allGaragesNotFiltered'].find((item) => item.id === id);
      return item.subscriptions && item.subscriptions.EReputation;
    },
    formatDate(date) {
      const dateTemp = date.substring(0, 10);
      const [year, month, day] = dateTemp.split('-');
      return `${day}/${month}/${year}`;
    },
    closeModal() {
      this.$store.dispatch('closeModal');
    },
    openModalFunction(payload) {
      this.$store.dispatch('openModal', payload);
    },
    verifyAccesibility() {
      if (this.hasAccessToAdmin && !this.$store.getters['cockpit/authorizations'].hasEReputationAtLeast) {
        this.openModalFunction({
          component: 'ModalAccessDenied',
          props: {
            reason: 'noSubscribedGarages',
            closeModal: this.closeModal,
            openSubscription: this.openSubscription,
          },
        });
      }
      if (!this.hasAccessToAdmin) {
        this.permission = true;
        this.openModalFunction({
          component: 'ModalAccessDenied',
          props: {
            reason: 'insufficientClearance',
            closeModal: this.closeModal,
          },
        });
      }
    },
    openSubscription() {
      this.subscription = true;
      this.closeModal();
    },
    highlightText(text) {
      let tempText = text;
      this.itemsTag.map(({ value, label }) => {
        if (tempText.includes(value)) {
          const replaceValue = `<span class="highlightText">@${label}</span>`;
          const searchString = `@${value}`;
          tempText = searchAndReplaceValues(searchString, replaceValue, tempText);
        }
      });
      return tempText;
    },
    async addModel() {
      if (!this.configResponseTemp.automated) {
        this.saveModelTemp('sources', this.SOURCES_VALUES);
      }
      await this.$store.dispatch('cockpit/admin/customResponse/saveModelResponse', this.configResponseTemp);
      this.closeModal();
    },
    async updateModel(parameters) {
      if (!parameters.automated) {
        parameters.garageIds = [];
        parameters.sources = this.SOURCES_VALUES;
      }
      await this.$store.dispatch('cockpit/admin/customResponse/updateModelResponse', parameters);
      this.closeModal();
    },
    async deleteModel(templateId) {
      await this.$store.dispatch('cockpit/admin/customResponse/deleteModelResponse', templateId);
      this.closeModal();
    },
    async loadMore() {
      await this.$store.dispatch('cockpit/admin/customResponse/fetchNextModelResponse');
    },
    saveModelTemp(field, value) {
      this.$store.dispatch('cockpit/admin/customResponse/saveConfigResponseTemp', { field, value });
    },
    async saveGarageDelay(garages) {
      for (const { id, automaticReviewResponseDelay } of garages) {
        await this.$store.dispatch('cockpit/admin/customResponse/updateModelResponseDelay', {
          garageId: id,
          automaticReviewResponseDelay,
        });
      }
      this.closeModal();
    },
    formatContent(item) {
      return `<div class="title">${item.title}</div><div class="body">${this.highlightText(
        item.content
      )}</div><div class="footer">${this.getModelResponseFooter(item)}</div>`;
    },
    getModelResponseFooter({createdAt, updatedAt, createdBy, updatedBy}) {
      if(updatedAt === createdAt) {
        return `${this.$t_locale('pages/cockpit/admin/pageCustomResponses')('Created')} ${this.formatDate(createdAt)} ${this.$t_locale('pages/cockpit/admin/pageCustomResponses')('By')} ${createdBy}`;
      }
      return `${this.$t_locale('pages/cockpit/admin/pageCustomResponses')('Changed')} ${this.formatDate(updatedAt)} ${this.$t_locale('pages/cockpit/admin/pageCustomResponses')('By')} ${updatedBy}`;
    },
    async appendResponsesDelay() {
      await this.$store.dispatch('cockpit/admin/customResponse/appendResponsesDelay');
    },
  },
};
</script>
