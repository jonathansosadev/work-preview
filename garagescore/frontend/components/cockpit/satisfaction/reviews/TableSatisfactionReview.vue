<template>
  <div class="table-satisfaction-review">
    <div class="table-satisfaction-review__content">
      <Table
        :rows="rows"
        :loading="loading && !loadingMore"
        fixed
        separator
        :noResultGodMode="noResultGodMode"
      >
        <template #header>
          <TableSatisfactionReviewHeader
            :filtersDisabled="filtersDisabled"
            :reviewLiveSearch="reviewLiveSearch"
            :fetchReviewsListPage="fetchReviewsListPage"
            :cockpitType="cockpitType"
            :reviewsFilters="filters"
            :changeReviewSearch="changeReviewSearch"
            :changeReviewLiveSearch="changeReviewLiveSearch"
            :changeReviewFilters="changeReviewFilters"
            :openModal="openModal"
            :handleBack="handleBack"
            :hasBackArrow="hasBackArrow"
          />
        </template>
        <template #header-fixed>
          <TableSatisfactionReviewHeader
            :filtersDisabled="filtersDisabled"
            :reviewLiveSearch="reviewLiveSearch"
            :fetchReviewsListPage="fetchReviewsListPage"
            :cockpitType="cockpitType"
            :reviewsFilters="filters"
            :changeReviewSearch="changeReviewSearch"
            :changeReviewLiveSearch="changeReviewLiveSearch"
            :changeReviewFilters="changeReviewFilters"
            :openModal="openModal"
            :handleBack="handleBack"
            :hasBackArrow="hasBackArrow"
          />
        </template>
        <template #row="{row, index}">
          <TableSatisfactionReviewRow
            :data-id="row.id"
            :row="row"
            :cockpitType="cockpitType"
            :index="index"
            :fetchResponses="fetchResponses"
            :changeRowSubview="setRowSubview"
            :getRowSubview="getRowSubview"
            :hasLeadRights="hasLeadRights"
          />
          <!-- SubView -->
          <TableCockpitRowLead
            v-if="getRowSubview(row.id) === 'lead'"
            :lead="row.lead"
            :cockpitType="cockpitType"
          />
          <TableRowFollowupLead
            v-if="getRowSubview(row.id) === 'lead' && getDeep(row, 'surveyFollowupLead.sendAt')"
            v-bind="row"
            :colspan="6"
            :colspan-end="0"
          />
          <TableRowUnsatisfiedCriteria
            v-if="['customer', 'followupUnsatisfied'].includes(getRowSubview(row.id))"
            v-bind="getDeep(row, 'unsatisfied.criteria') || []"
            :colspan="6"
            :colspan-bg="0"
            :colspan-end="0"
          />
          <TableRowFollowUp
            v-if="getRowSubview(row.id) === 'followupUnsatisfied'"
            v-bind="createFollowupUnsatisfiedProps(row)"
            :colspan="6"
            :colspan-bg="0"
            :colspan-end="0"
          />
          <TableRowCustomer
            v-if="getRowSubview(row.id) === 'customer'"
            v-bind="createCustomerProps(row)"
            :colspan="6"
            :colspan-bg="0"
            :colspan-end="0"
            :cockpitType="cockpitType"
          />
          <TableCockpitRowPublicReview
            v-if="getRowSubview(row.id) === 'publicReview'"
            v-bind="getDeep(row, 'review.comment')"
            :id="row.id"
            :submitPublicReviewReport="submitPublicReviewReport"
          />
          <TableCockpitRowPublicReviewComment
            v-if="getRowSubview(row.id) === 'publicReviewComment'"
            v-bind="row"
            :row="row"
            :appendResponses="appendResponses"
            :currentUser="currentUser"
            :rating="rating"
            :configResponsesScore="configResponsesScore"
            :garageSignatures="garageSignatures"
            :hasMoreTemplates="hasMoreTemplates"
            :setRowSubview="setRowSubview"
            :createReviewReply="createReviewReply"
            :updateReviewReply="updateReviewReply"
            :refreshView="refreshView"
            :loadingAdminCustomResponse="loadingAdminCustomResponse"
          />
        </template>
        <template #row-loading>
          <TableRowCockpitSkeleton
            v-for="n in 10"
            :key="n"
            :columnCount="6"
          />
        </template>
      </Table>
    </div>
    <div class="table-satisfaction-review__footer">
      <Button
        type="orange-border"
        :disabled="loadingMore"
        fullSized
        @click="loadMore"
        v-if="hasMore"
      >
        <template v-if="!loadingMore">
          {{ $t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReview')('LoadMore') }}
        </template>
        <template v-else>
          {{ $t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReview')('Loading') }}...
          <i class="icon-gs-time-hour-glass icon-gs-spin" />
        </template>
      </Button>
    </div>
  </div>
</template>

<script>
import TableCockpitRowLead from './TableCockpitRowLead';
import TableCockpitRowPublicReview from './TableCockpitRowPublicReview';
import TableCockpitRowPublicReviewComment from './TableCockpitRowPublicReviewComment';
import TableSatisfactionReviewHeader from './TableSatisfactionReviewHeader';
import TableSatisfactionReviewRow from './TableSatisfactionReviewRow';

import TableRowCustomer from '~/components/global/TableRowCustomer';
import TableRowFollowUp from '~/components/global/TableRowFollowUp';
import TableRowFollowupLead from '~/components/global/TableRowFollowupLead';
import TableRowUnsatisfiedCriteria from '~/components/global/TableRowUnsatisfiedCriteria';
import TableRowCockpitSkeleton from '~/components/global/skeleton/TableRowCockpitSkeleton';
import { getDeepFieldValue as deep } from '~/utils/object';

export default {
  components: {
    TableSatisfactionReviewRow,
    TableSatisfactionReviewHeader,
    TableRowCustomer,
    TableRowUnsatisfiedCriteria,
    TableRowFollowUp,
    TableCockpitRowLead,
    TableRowFollowupLead,
    TableCockpitRowPublicReview,
    TableCockpitRowPublicReviewComment,
    TableRowCockpitSkeleton,
  },

  props: {
    filtersDisabled: { type: Boolean, default: false },
    cockpitType: { type: String, required: true },
    fetchResponses: { type: Function, default: () => {} },
    appendResponses: { type: Function, default: () => {} },
    currentUser: { type: Object, default: () => {} },
    rating: { type: Number, default: 0 },
    reviews: { type: Array, default: () => [] },
    filters: Object,
    loading: { type: Boolean, default: true },
    hasMore: { type: Boolean, default: false },
    noResultGodMode: { type: Boolean, default: false },
    fetchNextPage: { type: Function, required: true },
    configResponsesScore: { type: Array, default: () => [] },
    garageSignatures: { type: Array, default: () => [] },
    hasMoreTemplates: { type: Boolean, default: false },
    getRowSubview: { type: Function, required: true },
    setRowSubview: { type: Function, required: true },
    createReviewReply: { type: Function, required: true },
    updateReviewReply: { type: Function, required: true },
    refreshView: { type: Function, required: true },
    fetchReviewsListPage: { type: Function, required: true },
    changeReviewSearch: { type: Function, required: true },
    changeReviewLiveSearch: { type: Function, required: true },
    changeReviewFilters: { type: Function, required: true },
    openModal: { type: Function, required: true },
    handleBack: { type: Function, required: true },
    hasLeadRights: Boolean,
    loadingAdminCustomResponse: Boolean,
    reviewLiveSearch: String,
    hasBackArrow: Boolean,
    submitPublicReviewReport: { type: Function, required: true },
  },

  data() {
    return {
      loadingMore: false,
    };
  },

  computed: {
    rows() {
      return this.reviews;
    },
  },

  methods: {
    getDeep(row, fieldName) {
      return deep(row, fieldName);
    },

    async loadMore() {
      this.loadingMore = true;
      await this.fetchNextPage();
      this.loadingMore = false;
    },

    createCustomerProps(review) {
      return {
        fullname: deep(review, 'customer.fullName.value'),
        mobile: deep(review, 'customer.contact.mobilePhone.value'),
        email: deep(review, 'customer.contact.email.value'),
        internalId: deep(review, 'service.frontDeskCustomerId'),
        vehicleBrand: deep(review, 'vehicle.make.value'),
        vehicleModel: deep(review, 'vehicle.model.value'),
        vehicleImmat: deep(review, 'vehicle.plate.value'),
        vin: deep(review, 'vehicle.vin.value'),
        type: review.type,
        date: deep(review, 'service.providedAt'),
        serviceFrontDeskUserName: deep(review, 'service.frontDeskUserName'),
        mileage: deep(review, 'vehicle.mileage.value'),
        registrationDate: deep(review, 'vehicle.registrationDate.value'),
      };
    },

    createFollowupUnsatisfiedProps(review) {
      return {
        sendDate: deep(review, 'surveyFollowupUnsatisfied.sendAt'),
        responseDate: deep(review, 'surveyFollowupUnsatisfied.firstRespondedAt'),
        resolved: deep(review, 'followupUnsatisfiedStatus'),
        hasCustomerBeenRecontacted: deep(review, 'unsatisfied.isRecontacted'),
        comment: deep(review, 'review.followupUnsatisfiedComment.text'),
        changeEvaluation: deep(review, 'review.followupChangeEvaluation'),
      };
    },
  },
};
</script>

<style lang="scss" scoped>
.table-satisfaction-review {
  &__button {
    border: 1px solid $white;
    color: $white;
    background-color: transparent;
    border-radius: 3px;
    padding: 0.3rem 0.6rem;
    outline: none;
    cursor: pointer;

    &--active {
      background-color: white;
      color: $blue;
    }
  }

  &__footer {
    margin: 1rem 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  &__button-icon {
    font-size: 1.5rem;
  }

  &__button-group {
    .table-satisfaction-review__button:first-child {
      border-radius: 3px 0 0 3px;
    }

    .table-satisfaction-review__button {
      border-radius: 0;
    }

    .table-satisfaction-review__button:last-child {
      border-radius: 0 3px 3px 0;
    }
  }
}

@media (min-width: $breakpoint-min-md) {
  .table-satisfaction-review {
    &__display-sm {
      display: none;
    }

    &__display-md {
      display: block;
    }
  }
}
</style>
