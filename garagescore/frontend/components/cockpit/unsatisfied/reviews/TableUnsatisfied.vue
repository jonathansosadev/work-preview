<template>
  <div class="table-unsatisfied">
    <div class="table-unsatisfied__table">
      <Table
        :rows="rows"
        :loading="loading"
        fixed
        :noResultGodMode="noResultGodMode"
      >
        <template #header>
          <TableUnsatisfiedHeader
            :filtersDisabled="filtersDisabled"
            :search="search"
            :changeFilters="changeFilters"
            :filters="filters"
            :openModalFunction="openModalFunction"
            :onSearchFunction="onSearchFunction"
            :onSearchChangeFunction="onSearchChangeFunction"
            :fetch-unsatisfied-list="fetchUnsatisfiedList"
            :availableGarages="availableGarages"
            :addManualUnsatisfied="addManualUnsatisfied"
            :currentGarageId="currentGarageId"
            :closeModal="closeModal"
            :cockpitType="cockpitType"
            :currentUserId="currentUserId"
            :isManager="isManager"
            :handleBack="handleBack"
            :hasBackArrow="hasBackArrow"
          />
        </template>
        <template #header-fixed>
          <TableUnsatisfiedHeader
            :filtersDisabled="filtersDisabled"
            :search="search"
            :changeFilters="changeFilters"
            :filters="filters"
            :fromRowClick="fromRowClick"
            :openModalFunction="openModalFunction"
            :onSearchFunction="onSearchFunction"
            :onSearchChangeFunction="onSearchChangeFunction"
            :fetch-unsatisfied-list="fetchUnsatisfiedList"
            :availableGarages="availableGarages"
            :addManualUnsatisfied="addManualUnsatisfied"
            :currentGarageId="currentGarageId"
            :closeModal="closeModal"
            :cockpitType="cockpitType"
            :currentUserId="currentUserId"
            :isManager="isManager"
            :handleBack="handleBack"
            :hasBackArrow="hasBackArrow"
          />
        </template>
        <template #row="{ row }">
          <TableUnsatisfiedRow
            :row="row"
            :data-id="row.id"
            :get-row-subview="getRowSubview"
            :changeRowSubview="changeRowSubview"
            :icons="icons"
          />
          <TableRowUnsatisfiedCriteria
            v-if="['customer', 'followupUnsatisfied'].includes(getRowSubview(row.id))"
            v-bind="row.customerProps"
            :colspan="5"
            :colspan-bg="2"
          />
          <TableRowFollowUp
            v-if="getRowSubview(row.id) === 'followupUnsatisfied'"
            v-bind="row.followupUnsatisfiedProps"
            :colspan="5"
            :colspan-bg="2"
          />
          <TableRowCustomer
            v-if="getRowSubview(row.id) === 'customer'"
            v-bind="row.customerProps"
            :colspan="5"
            :colspan-bg="2"
            :colspan-end="1"
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
    <div class="table-unsatisfied__footer" v-if="hasMore">
      <Button
        type="orange-border"
        :disabled="loadingMore"
        fullSized
        @click="loadMore"
        v-if="hasMore"
      >
        <template v-if="loadingMore">
          {{ $t_locale('components/cockpit/unsatisfied/reviews/TableUnsatisfied')('Loading') }}...
          <font-awesome-icon icon="spinner" spin />
        </template>
        <template v-else>
          {{ $t_locale('components/cockpit/unsatisfied/reviews/TableUnsatisfied')('LoadMore') }}
        </template>
      </Button>
    </div>
  </div>
</template>

<script>
import TableUnsatisfiedHeader from '~/components/cockpit/unsatisfied/reviews/TableUnsatisfiedHeader';
import TableUnsatisfiedRow from '~/components/cockpit/unsatisfied/reviews/TableUnsatisfiedRow';
import TableRowCustomer from '~/components/global/TableRowCustomer';
import TableRowFollowUp from '~/components/global/TableRowFollowUp';
import TableRowUnsatisfiedCriteria from '~/components/global/TableRowUnsatisfiedCriteria';
import TableRowCockpitSkeleton from '~/components/global/skeleton/TableRowCockpitSkeleton';
import { getDeepFieldValue } from '~/utils/object.js';

export default {
  components: {
    TableUnsatisfiedHeader,
    TableUnsatisfiedRow,
    TableRowCustomer,
    TableRowFollowUp,
    TableRowUnsatisfiedCriteria,
    TableRowCockpitSkeleton,
  },

  props: {
    filtersDisabled: { type: Boolean, default: false },
    noResultGodMode: { type: Boolean, default: false },
    hasMore: { type: Boolean, default: false },
    loading: { type: Boolean, default: true },
    getRowSubview: { type: Function, required: true },
    changeRowSubview: { type: Function, required: true },
    reviews: { type: Array, default: () => [] },
    fetchNextPage: { type: Function },
    search: String,
    cockpitType: String,
    changeFilters: { type: Function, required: true },
    openModalFunction: { type: Function, required: true },
    onSearchFunction: { type: Function, required: true },
    onSearchChangeFunction: { type: Function, required: true },
    fetchUnsatisfiedList: { type: Function, required: true },
    filters: { type: Object, required: true },
    availableGarages: { type: Array, default: () => [] },
    fromRowClick: Object,
    icons: Object,
    addManualUnsatisfied: { type: Function, required: true },
    closeModal: { type: Function, required: true },
    currentGarageId: {type: Array, default: ()=>[]},
    currentUserId: String,
    isManager: Boolean,
    hasBackArrow: Boolean,
    handleBack: { type: Function, required: true },
  },

  data() {
    return {
      loadingMore: false,
      deep: (row, fieldName) => getDeepFieldValue(row, fieldName),
    };
  },

  methods: {
    async loadMore() {
      this.loadingMore = true;
      await this.fetchNextPage();
      this.loadingMore = false;
    },
  },

  computed: {
    rows() {
      return this.reviews.map((row) => {
        return {
          ...row,
          customerProps: {
            fullname: this.deep(row, 'customer.fullName'),
            mobile: this.deep(row, 'customer.contact.mobilePhone'),
            email: this.deep(row, 'customer.contact.email'),
            internalId: this.deep(row, 'service.frontDeskCustomerId'),
            vehicleBrand: this.deep(row, 'unsatisfiedTicket.vehicle.make'),
            vehicleModel: this.deep(row, 'unsatisfiedTicket.vehicle.model'),
            vehicleImmat: this.deep(row, 'unsatisfiedTicket.vehicle.plate'),
            vin: this.deep(row, 'unsatisfiedTicket.vehicle.vin'),
            saleType: null,
            type: this.deep(row, 'unsatisfiedTicket.type'),
            date: this.deep(row, 'service.providedAt'),
            serviceFrontDeskUserName: this.deep(row, 'unsatisfiedTicket.frontDeskUserName'),
            unsatisfiedCriterias:
              (this.deep(row, 'unsatisfied.criteria')
                ? this.deep(row, 'unsatisfied.criteria')
                : this.deep(row, 'unsatisfiedTicket.criteria')) || [],
            unsatisfiedTicketCreatedAt: this.deep(row, 'unsatisfiedTicket.createdAt'),
            unsatisfiedTicketReferenceDate: this.deep(row, 'unsatisfiedTicket.referenceDate'),
            mileage: this.deep(row, 'unsatisfiedTicket.vehicle.mileage'),
            registrationDate: this.deep(row, 'unsatisfiedTicket.vehicle.registrationDate'),
          },
          followupUnsatisfiedProps: {
            sendDate: this.deep(row, 'surveyFollowupUnsatisfied.sendAt'),
            responseDate: this.deep(row, 'surveyFollowupUnsatisfied.lastRespondedAt'),
            resolved: this.deep(row, 'unsatisfied.followupStatus'),
            hasCustomerBeenRecontacted: this.deep(row, 'unsatisfied.isRecontacted'),
            comment: this.deep(row, 'unsatisfiedTicket.actions.followupUnsatisfiedCommentForManager'),
            changeEvaluation: this.deep(row, 'review.followupChangeEvaluation'),
          },
        };
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.table-unsatisfied {
  &__footer {
    margin: 1rem 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
