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
      <TableSatisfactionReview
        :filtersDisabled="navigationDataProvider.isFiltersDisabled"
        :cockpitType="navigationDataProvider.cockpitType"
        :currentUser="currentUser"
        :configResponsesScore="configResponsesScore"
        :garageSignatures="navigationDataProvider.garageSignatures"
        :hasMoreTemplates="hasMoreTemplates"
        :hasLeadRights="hasLeadRights"
        :loadingAdminCustomResponse="loadingAdminCustomResponse"
        :openModal="openModal"
        :handleBack="navigationDataProvider.handleBack"
        :hasBackArrow="hasBackArrow"
        :rating="rating"
        :reviews="reviews"
        :filters="filters"
        :loading="loadingReviews"
        :hasMore="hasMore"
        :noResultGodMode="noResultGodMode"
        :reviewLiveSearch="reviewLiveSearch"
        :getRowSubview="getRowSubview"
        :appendResponses="appendResponses"
        :setRowSubview="setRowSubview"
        :createReviewReply="createReviewReply"
        :updateReviewReply="updateReviewReply"
        :refreshView="refreshView"
        :changeReviewSearch="changeReviewSearch"
        :changeReviewLiveSearch="changeReviewLiveSearch"
        :changeReviewFilters="changeReviewFilters"
        :submitPublicReviewReport="submitPublicReviewReport"
        :fetchResponses="fetchResponses"
        :fetchReviewsListPage="fetchReviewsListPage"
        :fetchNextPage="fetchNextReviewsListPage"
      />
    </div>
  </div>
</template>

<script>
import StatsDetractors from '~/components/cockpit/satisfaction/StatsDetractors.vue';
import StatsNPS from '~/components/cockpit/satisfaction/StatsNPS.vue';
import StatsPromotors from '~/components/cockpit/satisfaction/StatsPromotors.vue';
import TableSatisfactionReview from '~/components/cockpit/satisfaction/reviews/TableSatisfactionReview.vue';
import { watchersFactory } from '~/mixins/utils';
import { setupHotJar } from '~/util/externalScripts/hotjar';
import { generateSubFiltersWithRoute } from '~/util/filters';
import { makeApolloMutations, makeApolloQueries } from '~/util/graphql';
import chartsKpiMixin from '~/components/cockpit/mixins/chartsKpiMixin';
import { KPI_BY_PERIOD_SINGLE_KPI } from '~/utils/kpi/graphqlQueries';

const filtersConfigReviews = [
  {
    query: 'scoreFilter',
    payload: { filter: 'surveySatisfactionLevel' },
    callbackValue: null,
  },
  {
    query: 'publicReviewFilter',
    payload: { filter: 'publicReviewStatus' },
    callbackValue: null,
  },
  {
    query: 'responseFilter',
    payload: { filter: 'publicReviewCommentStatus' },
    callbackValue: null,
  },
  {
    query: 'followupUnsatisfiedFilter',
    payload: { filter: 'followupUnsatisfiedStatus' },
    callbackValue: null,
  },
  {
    query: 'followupLeadFilter',
    payload: { filter: 'followupLeadStatus' },
    callbackValue: null,
  },
];

export default {
  name: 'SatisfactionReviewsPage',
  components: {
    StatsNPS,
    StatsDetractors,
    StatsPromotors,
    TableSatisfactionReview,
  },
  props: {
    navigationDataProvider: {
      type: Object,
      required: true,
    },
  },
  inheritAttrs: false,
  mixins: [chartsKpiMixin('COCKPIT_SATISFACTION_REVIEWS', KPI_BY_PERIOD_SINGLE_KPI, { kpiByPeriodSingle: {} })],
  middleware: ['hasAccessToSatisfaction'],

  async asyncData({ route }) {
    const finalFilters = generateSubFiltersWithRoute(route, filtersConfigReviews);
    return { filters: finalFilters };
  },

  data() {
    return {
      rating: 0,
      rowSubview: [],
      search: '',
      liveSearch: '',
      filters: {
        surveySatisfactionLevel: null,
        publicReviewStatus: null,
        publicReviewCommentStatus: null,
        followupUnsatisfiedStatus: null,
        followupLeadStatus: null,
        email: null,
        mobile: null,
        campaign: null,
        contactDetails: null,
        processing: null,
      },

      paginate: 10,

      reviewsList: {
        loading: true,
        hasMore: false,
        cursor: null,
        noResultGodMode: false,
        error: '',
        data: [],
      },
    };
  },

  head() {
    return {
      meta: [{ name: 'robots', content: 'noindex' }],
    };
  },

  async mounted() {
    const { fetchGarageSignatures, locale } = this.navigationDataProvider;

    await fetchGarageSignatures();
    setupHotJar(locale, 'satisfaction');
    this.initializeFiltersValues();
    this.refreshRouteParameters();
    await this.refreshView();
  },

  computed: {
    configResponsesScore() {
      return this.$store.getters['cockpit/admin/customResponse/configResponsesScore'];
    },
    currentUser() {
      const user = this.$store.getters['auth/currentUser'];
      return {
        firstName: user.firstName,
        lastName: user.lastName,
      };
    },
    hasBackArrow() {
      const { hasBackArrow } = this.navigationDataProvider;
      const canComeFrom = ['cockpit-satisfaction-garages', 'cockpit-satisfaction-team'];
      return hasBackArrow(canComeFrom);
    },
    hasLeadRights() {
      const { hasLeadAtLeast, hasMaintenanceAtLeast, hasViAtLeast } = this.navigationDataProvider.authorizations;
      return (hasLeadAtLeast && hasMaintenanceAtLeast) || hasViAtLeast;
    },
    hasMore() {
      return this.reviewsList.hasMore;
    },
    hasMoreTemplates() {
      return this.$store.getters['cockpit/admin/customResponse/hasMoreTemplates'];
    },
    loadingAdminCustomResponse() {
      return this.$store.getters['cockpit/admin/customResponse/loading'];
    },
    loadingReviews() {
      return this.reviewsList.loading;
    },
    reviewLiveSearch() {
      return this.liveSearch;
    },
    noResultGodMode() {
      return this.reviewsList.noResultGodMode;
    },
    reviews() {
      return this.reviewsList.data;
    },
  },

  methods: {
    async appendResponses() {
      await this.$store.dispatch('cockpit/admin/customResponse/appendResponsesByScore', this.rating);
    },
    async createReviewReply({ id, comment }) {
      console.warn('createReviewReply', { id, comment });
      const request = {
        name: 'dataSetCreateReply',
        args: { reviewId: id, comment },
        fields: `message
          status
          reviewReplyStatus
          reviewReplyRejectedReason
        `,
      };
      const resp = await makeApolloMutations([request]);
      const { data: { dataSetCreateReply } = {} } = resp;
      if (dataSetCreateReply?.status) {
        this.localUpdateReviewReply({
          id,
          comment,
          status: dataSetCreateReply.reviewReplyStatus,
          rejectionReason: dataSetCreateReply.reviewReplyRejectedReason,
        });
      }
      return dataSetCreateReply?.status;
    },
    async fetchNextReviewsListPage() {
      await this.fetchReviewsListPage({
        before: this.reviewsList.cursor,
        append: true,
      });
    },
    async fetchResponses(rating, garageIds) {
      await this.$store.dispatch('cockpit/admin/customResponse/fetchResponses', {
        rating,
        garageId: garageIds,
      });
      this.rating = rating;
    },
    async fetchReviewsListPage({ before, append } = {}) {
      this.setReviewsListLoading(true);
      const kpisRequest = {
        name: 'dataGetReviewsList',
        fields: `
          datas {
            id
            type
            followupUnsatisfiedStatus
            followupLeadStatus
            garage {
              id
              type
              ratingType
              publicDisplayName
            }
            review {
              createdAt
              fromCockpitContact
              followupChangeEvaluation
              surveyComment
              comment {
                text
                status
                rejectedReason
              }
              reply {
                text
                status
                rejectedReason
              }
              rating {
                value
              }
              followupUnsatisfiedComment {
                text
              }
            }
            vehicle {
              model {
                value
              }
              make {
                value
              }
              plate {
                value
              }
              vin {
                value
              }
              mileage {
                value
              }
              registrationDate {
                value
              }
            }
            isApv
            isVn
            isVo
            lead {
              potentialSale
              timing
              saleType
              knowVehicle
              brands
              bodyType
              energyType
              cylinder
              tradeIn
              financing
              type
              conversion {
                sale {
                  type
                  vehicle {
                    model {
                      value
                    }
                    make {
                      value
                    }
                    plate {
                      value
                    }
                  }
                  service {
                    providedAt
                    frontDeskUserName
                  }
                }
                tradeIn {
                  customer {
                    fullName {
                      value
                    }
                    contact {
                      mobilePhone {
                        value
                      }
                      email {
                        value
                      }
                    }
                  }
                  vehicle {
                    make {
                      value
                    }
                    model {
                      value
                    }
                    plate {
                      value
                    }
                  }
                  service {
                    providedAt
                    frontDeskUserName
                  }
                }
              }
            }
            service {
              frontDeskUserName
              providedAt
              frontDeskCustomerId
            }
            leadTicket {
              followup {
                recontacted
                satisfied
                satisfiedReasons
                notSatisfiedReasons
                appointment
              }
            }
            customer {
              fullName {
                value
              }
              city {
                value
              }
              contact {
                email {
                  value
                }
                mobilePhone {
                  value
                }
              }
            }
            unsatisfied {
              isRecontacted
              criteria {
                label
                values
              }
            }
            surveyFollowupUnsatisfied {
              sendAt
              firstRespondedAt
            }
            surveyFollowupLead {
              sendAt
              firstRespondedAt
            }
          }
          hasMore
          cursor
          noResultGodMode`,
        args: {
          limit: this.paginate,
          before,
          ...this.getReviewFilters(),
        },
      };
      const resp = await makeApolloQueries([kpisRequest]);
      const { data: { dataGetReviewsList: { datas, hasMore, cursor, noResultGodMode } = {} } = {} } = resp;
      if (datas) {
        append ? this.appendReviewsList(datas) : this.setReviewsList(datas);
        this.setReviewsListHasMore(hasMore);
        this.setReviewsListCursor(cursor);
      }
      this.setNoResultGodMode(noResultGodMode);
      this.setReviewsListLoading(false);
    },
    async refreshView() {
      await this.fetchReviewsListPage({ cursor: null, append: false });
      return this.navigationDataProvider.fetchFilters();
    },
    async submitPublicReviewReport({ id, message }) {
      try {
        const request = {
          name: 'dataSetReviewReport',
          args: { id, comment: message },
          fields: `message
            status
            `,
        };
        const resp = await makeApolloMutations([request]);
        return resp?.data?.dataSetReviewReport;
      } catch (err) {
        console.error(err);
      }
    },
    async updateReviewReply({ id, comment }) {
      const request = {
        name: 'dataSetUpdateReply',
        args: { reviewId: id, comment },
        fields: `message
          status
          reviewReplyStatus
          reviewReplyRejectedReason
        `,
      };
      const resp = await makeApolloMutations([request]);
      const { data: { dataSetUpdateReply } = {} } = resp;
      if (dataSetUpdateReply?.status) {
        this.localUpdateReviewReply({
          id,
          comment,
          status: dataSetUpdateReply.reviewReplyStatus,
          rejectionReason: dataSetUpdateReply.reviewReplyRejectedReason,
        });
      }
      return resp.data;
    },
    appendReviewsList(data) {
      this.reviewsList.data = this.reviewsList.data.concat(data);
    },
    changeReviewFilters({ filters }) {
      this.setReviewFilters({ filters: Object.assign({}, filters) });
      // tracking filter in url
      this.refreshRouteParameters();
    },
    changeReviewLiveSearch({ search }) {
      this.setReviewLiveSearch({ search });
    },
    changeReviewSearch({ search }) {
      this.setReviewSearch({ search });
      this.refreshRouteParameters();
    },
    getReviewFilters() {
      const { cockpitType, dataTypeId, dms, garageIds, periodId } = this.navigationDataProvider;

      return {
        periodId,
        frontDeskUserName: (dms?.frontDeskUserName !== 'ALL_USERS' && dms?.frontDeskUserName) || undefined,
        search: this.search,
        ...(cockpitType ? { cockpitType } : {}),
        ...(garageIds ? { garageId: garageIds } : {}),
        ...(dataTypeId ? { type: dataTypeId } : {}),
        ...(this.filters.surveySatisfactionLevel
          ? { surveySatisfactionLevel: this.filters.surveySatisfactionLevel }
          : {}),
        ...(this.filters.publicReviewStatus ? { publicReviewStatus: this.filters.publicReviewStatus } : {}),
        ...(this.filters.publicReviewCommentStatus
          ? { publicReviewCommentStatus: this.filters.publicReviewCommentStatus }
          : {}),
        ...(this.filters.followupUnsatisfiedStatus
          ? { followupUnsatisfiedStatus: this.filters.followupUnsatisfiedStatus }
          : {}),
        ...(this.filters.followupLeadStatus ? { followupLeadStatus: this.filters.followupLeadStatus } : {}),

        //
        // Contacts
        //
        ...(this.filters.email ? { email: this.filters.email } : {}),

        ...(this.filters.mobile ? { mobile: this.filters.mobile } : {}),

        ...(this.filters.campaign ? { campaign: this.filters.campaign } : {}),

        ...(this.filters.contactDetails ? { contactDetails: this.filters.contactDetails } : {}),

        ...(this.filters.processing ? { processing: this.filters.processing } : {}),
      };
    },
    getRowSubview(id) {
      const item = this.rowSubview.find((i) => i.id === id);
      return item?.view || null;
    },
    localUpdateReviewReply({ id, comment, status, rejectionReason }) {
      const item = this.reviewsList.data.find((i) => i.id === id);
      item.publicReviewComment = comment;
      item.publicReviewCommentStatus = status;
      item.publicReviewCommentRejectionReason = rejectionReason;
    },
    openModal(payload) {
      this.$store.dispatch('openModal', payload);
    },
    refreshRouteParameters() {
      const urlParams = {
        scoreFilter: this.filters.surveySatisfactionLevel || undefined,
        publicReviewFilter: this.filters.publicReviewStatus || undefined,
        responseFilter: this.filters.publicReviewCommentStatus || undefined,
        followupUnsatisfiedFilter: this.filters.followupUnsatisfiedStatus || undefined,
        followupLeadFilter: this.filters.followupLeadStatus || undefined,
        search: this.filters.search || undefined,
        dms: this.$route.query.dms
      };
      this.navigationDataProvider.refreshRouteParameters(urlParams);
    },
    setNoResultGodMode(data) {
      this.reviewsList.noResultGodMode = data;
    },
    setReviewsListCursor(cursor) {
      this.reviewsList.cursor = cursor;
    },
    setReviewsListHasMore(hasMore) {
      this.reviewsList.hasMore = hasMore;
    },
    setReviewsList(data) {
      this.reviewsList.data = data;
    },
    setReviewsListLoading(loading) {
      this.reviewsList.loading = loading;
    },
    setReviewSearch({ search }) {
      this.search = search;
    },
    setReviewLiveSearch({ search }) {
      this.liveSearch = search;
    },
    setReviewFilters({ filters }) {
      this.filters = filters;
      this.saveCurrentSubfilters();
    },
    setRowSubview({ id, view }) {
      const item = this.rowSubview.find((i) => i.id === id);
      if (item) {
        const isSameNonNullView = view === item?.view && item.view !== null;
        item.view = isSameNonNullView ? null : view;
      } else {
        this.rowSubview.push({ id, view });
      }
    },
    saveCurrentSubfilters() {
      sessionStorage?.setItem(`${this.$route.name}_subfilters`, JSON.stringify(this.filters));
    },
    initializeFiltersValues() {
      const allowedKeys = [
        'surveySatisfactionLevel',
        'publicReviewStatus',
        'publicReviewCommentStatus',
        'followupUnsatisfiedStatus',
        'followupLeadStatus',
        'email',
        'mobile',
        'campaign',
        'contactDetails',
        'processing',
      ];

      const savedEntries = sessionStorage?.getItem(`${this.$route.name}_subfilters`);
      Object.entries(savedEntries ? JSON.parse(savedEntries) : {}).forEach(([filter, value]) => {
        if (value !== null && allowedKeys.includes(filter)) {
          this.$set(this.filters, filter, value);
        }
      });
    },
    // TODO Maybe in future use specificFilters for exports
    // async startExport({ email }) {
    //   const exportType = ExportTypes.SATISFACTION;
    //   const specificFilters = {
    //     satisfactionSearch: this.search || null,
    //     satisfactionScore: this.filters.surveySatisfactionLevel || null,
    //     satisfactionReviewStatus: this.filters.publicReviewStatus || null,
    //     satisfactionResponseStatus: this.filters.publicReviewCommentStatus || null,
    //     satisfactionUnsatisfiedFollowupStatus: this.filters.followupUnsatisfiedStatus || null,
    //     satisfactionLeadFollowupStatus: this.filters.followupLeadStatus || null,
    //   };
    //
    //   return this.$store.dispatch('cockpit/startExport', { exportType, email, specificFilters }, { root: true });
    // },
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
