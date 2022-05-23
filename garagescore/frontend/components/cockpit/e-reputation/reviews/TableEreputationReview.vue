<template>
  <div class="ereputation-table">
    <div class="ereputation-table__content">
      <Table
        :loading="areReviewsLoading && !areReviewsLoadingMore"
        :rows="rows"
        fixed
      >
        <template #header>
          <TableEreputationReviewHeader
            :filtersDisabled="filtersDisabled"
            :reviewsLiveSearch="reviewsLiveSearch"
            :fetchReviews="fetchReviews"
            :reviewFilters="filters"
            :hasBackArrow="hasBackArrow"
            :handleBack="handleBack"
            :locales="locale"
            :onSearch="onSearch"
            :onSearchChange="onSearchChange"
            :onReviewsFiltersChange="onReviewsFiltersChange"
          />
        </template>
        <template #header-fixed>
          <TableEreputationReviewHeader
            :filtersDisabled="filtersDisabled"
            :reviewsLiveSearch="reviewsLiveSearch"
            :fetchReviews="fetchReviews"
            :reviewFilters="filters"
            :hasBackArrow="hasBackArrow"
            :handleBack="handleBack"
            :locales="locale"
            :onSearch="onSearch"
            :onSearchChange="onSearchChange"
            :onReviewsFiltersChange="onReviewsFiltersChange"
          />
        </template>
        <template #row="{ row }">
          <TableEreputationRowReview
            :border="getRowSubview(row.id) !== 'publicReviewComment'"
            :fetchResponses="fetchResponses"
            :row="row"
            :onChangeRowSubview="onChangeRowSubview"
            :getRowSubview="getRowSubview"
            :cockpitProps="cockpitProps"
          />
          <TableEreputationRowPublicReviewComment
            v-if="getRowSubview(row.id) === 'publicReviewComment'"
            :allGarages="allGarages"
            :appendResponses="appendResponses"
            :configResponsesScore="configResponsesScore"
            :currentUser="currentUser"
            :garageSignatures="garageSignatures"
            :hasMoreTemplates="hasMoreTemplates"
            :rating="rating"
            :review="row"
            :isCustomResponseLoading="isCustomResponseLoading"
            :openModal="openModal"
            :changeRowSubview="onChangeRowSubview"
            :createReviewReply="createReviewReply"
            :updateReviewReply="updateReviewReply"
            :onSendReviewReply="onSendReviewReply"
            :onUpdateReviewThreadReply="onUpdateReviewThreadReply"
            :childModalProps="childModalProps"
          />
        </template>
        <template #row-loading>
          <TableRowCockpitSkeleton
            v-for="n in 10"
            :key="n"
            :columnCount="3"
          />
        </template>
      </Table>
    </div>

    <!-- LOAD MORE -->
    <div v-if="doesReviewsHaveMore" class="ereputation-table__footer">
      <Button
        :disabled="areReviewsLoadingMore"
        @click="onLoadMore"
        fullSized
        type="orange-border"
      >
        <template v-if="areReviewsLoadingMore">
          <i class="icon-gs-loading" />
          {{ $t_locale('components/cockpit/e-reputation/reviews/TableEreputationReview')("Loading") }}
        </template>
        <template v-else>
          {{ $t_locale('components/cockpit/e-reputation/reviews/TableEreputationReview')("LoadMore") }}
        </template>
      </Button>
    </div>
  </div>
</template>


<script>
import TableEreputationReviewHeader
  from '~/components/cockpit/e-reputation/reviews/TableEreputationReviewHeader';
import TableEreputationRowReview
  from '~/components/cockpit/e-reputation/reviews/TableEreputationRowReview';
import TableEreputationRowPublicReviewComment
  from '~/components/cockpit/e-reputation/reviews/TableEreputationRowPublicReviewComment.vue';
import TableRowCockpitSkeleton
  from '~/components/global/skeleton/TableRowCockpitSkeleton';

export default {
  name: 'TableEreputationReview',
  components: {
    TableEreputationRowReview,
    TableEreputationReviewHeader,
    TableEreputationRowPublicReviewComment,
    TableRowCockpitSkeleton,
  },
  props: {
    cockpitProps: {
      type: Object,
      required: true,
    },
    onLoadMore: {
      type: Function,
      required: true,
    },
    createReviewReply: {
      type: Function,
      required: true,
    },
    updateReviewReply: {
      type: Function,
      required: true,
    },
    openModal: {
      type: Function,
      required: true,
    },
    isCustomResponseLoading: Boolean,
    onChangeRowSubview: {
      type: Function,
      required: true,
    },
    filtersDisabled: {
      type: Boolean,
      default: false,
    },
    fetchResponses: {
      type: Function,
      default: () => ({}),
    },
    appendResponses: {
      type: Function,
      default: () => ({}),
    },
    hasMoreTemplates: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
    },
    garageSignatures: {
      type: Array,
      default: () => [],
    },
    currentUser: {
      type: Object,
      default: () => {},
    },
    allGarages: {
      type: Array,
      default: () => [],
    },
    configResponsesScore: {
      type: Array,
      default: () => [],
    },
    getRowSubview: {
      type: Function,
      required: true,
    },
    doesReviewsHaveMore: Boolean,
    reviews: {
      type: Object,
      required: true,
    },
    filters: {
      type: Object,
      default: () => ({}),
    },
    areReviewsLoading: Boolean,
    areReviewsLoadingMore: Boolean,
    reviewsLiveSearch: String,
    fetchReviews: {
      type: Function,
      required: true,
    },
    onSearch: {
      type: Function,
      required: true,
    },
    onSearchChange: {
      type: Function,
      required: true,
    },
    hasBackArrow: Boolean,
    handleBack: {
      type: Function,
      required: true,
    },
    locale: String,
    onReviewsFiltersChange: {
      type: Function,
      required: true,
    },
    onSendReviewReply: {
      type: Function,
      required: true,
    },
    onUpdateReviewThreadReply: {
      type: Function,
      required: true,
    },
    childModalProps: Object,
  },

  computed: {
    rows() {
      return this.reviews.data;
    },
  },
};
</script>

<style lang="scss" scoped>
.ereputation-table {
  height: 0px; // IE fix

  &__footer {
    margin: 1rem 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
