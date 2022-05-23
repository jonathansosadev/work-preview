<template>
  <div class="table__thead">
    <div class="table__header table__header--top">
      <div class="table__searchbar">
        <template v-if="hasBackArrow">
          <div class="table__back">
            <button @click="handleBack">
              <i class="icon-gs-solid-left" />
              <span class="table__back__label">{{ $t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewHeader')('back') }}</span>
            </button>
          </div>
        </template>
        <Searchbar
          :options="filterOptions"
          :filters="filters"
          v-model="search"
          :filtersDisabled="filtersDisabled"
          @filtersChange="onFiltersChange"
          @input="onSearchChange"
          @searchClick="onSearch"
        />
      </div>
    </div>

    <div class="table__header table-cockpit-header">
      <TableHeader
        class="table-cockpit-header__header"
        :class="headerClass"
        :style="{ flex: 2 }"
        :display="['md', 'lg']"
      />
      <TableHeader center />
      <TableHeader center>
        <TableFiltersLabel
          filterKey="surveySatisfactionLevel"
          :filters="filters"
          :filterOptions="filterOptions"
        />
      </TableHeader>
      <TableHeader center>
        <TableFiltersLabel
          filterKey="publicReviewStatus"
          :filters="filters"
          :filterOptions="filterOptions"
        />
      </TableHeader>
      <TableHeader center>
        <TableFiltersLabel
          filterKey="publicReviewCommentStatus"
          :filters="filters"
          :filterOptions="filterOptions"
        />
      </TableHeader>
      <TableHeader center>
        <TableFiltersLabel
          filterKey="followupUnsatisfiedStatus"
          :filters="filters"
          :filterOptions="filterOptions"
        />
      </TableHeader>
      <TableHeader center>
        <TableFiltersLabel
          filterKey="followupLeadStatus"
          :filters="filters"
          :filterOptions="filterOptions"
        />
      </TableHeader>
    </div>
  </div>
</template>


<script>
import isEqual from 'lodash/isEqual';
import omit from 'lodash/omit';

import TableFiltersLabel from '~/components/global/TableFiltersLabel';
import Searchbar from '~/components/ui/searchbar/Searchbar';
import { watchersFactory } from '~/mixins/utils';
import GarageTypes from '~/utils/models/garage.type.js';
import LeadFollowupStatus from '~/utils/models/data/type/lead-followup-status';
import UnsatisfiedFollowupStatus from '~/utils/models/data/type/unsatisfied-followup-status';

export default {
  components: {
    Searchbar,
    TableFiltersLabel,
  },

  props: {
    filtersDisabled: { type: Boolean, default: false },
    reviewLiveSearch: String,
    cockpitType: String,
    fetchReviewsListPage: { type: Function, required: true },
    changeReviewSearch: { type: Function, required: true },
    changeReviewLiveSearch: { type: Function, required: true },
    changeReviewFilters: { type: Function, required: true },
    handleBack: { type: Function, required: true },
    reviewsFilters: Object,
    hasBackArrow: Boolean,
  },

  data() {
    return {
      search: this.reviewLiveSearch,
      filterOptions: [
        {
          key: 'surveySatisfactionLevel',
          label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewHeader')('Score'),
          icon: 'icon-gs-gauge-dashboard',
          values: [
            { label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewHeader')('Promoter'), value: 'Promoter' },
            { label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewHeader')('Neutral'), value: 'Neutral' },
            { label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewHeader')('Detractor'), value: 'Detractor' },
          ],
        },
        {
          key: 'publicReviewStatus',
          label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewHeader')('Publication'),
          icon: 'icon-gs-web-share',
          values: [
            { label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewHeader')('Published'), value: 'Approved' },
            { label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewHeader')('Rejected'), value: 'Rejected' },
          ],
        },
        {
          key: 'publicReviewCommentStatus',
          label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewHeader')('ReviewComment'),
          icon: 'icon-gs-edit',
          values: [
            { label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewHeader')('Approved'), value: 'Approved' },
            { label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewHeader')('NoResponse'), value: 'NoResponse' },
          ],
        },
        {
          key: 'followupUnsatisfiedStatus',
          label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewHeader')('Followup'),
          icon: 'icon-gs-sad',
          values: [
            { label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewHeader')(UnsatisfiedFollowupStatus.NEW_UNSATISFIED), value: UnsatisfiedFollowupStatus.NEW_UNSATISFIED },
            { label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewHeader')(UnsatisfiedFollowupStatus.RESOLVED), value: UnsatisfiedFollowupStatus.RESOLVED },
            { label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewHeader')(UnsatisfiedFollowupStatus.IN_PROGRESS), value: UnsatisfiedFollowupStatus.IN_PROGRESS },
            { label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewHeader')(UnsatisfiedFollowupStatus.NOT_RESOLVED), value: UnsatisfiedFollowupStatus.NOT_RESOLVED },
            {
              label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewHeader')(UnsatisfiedFollowupStatus.UNSATISFIED_WITHOUT_ANSWER),
              value: UnsatisfiedFollowupStatus.UNSATISFIED_WITHOUT_ANSWER,
            },
          ],
        },
        {
          key: 'followupLeadStatus',
          label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewHeader')('FollowupLeads'),
          icon: 'icon-gs-car-repair',
          values: [
            { label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewHeader')(LeadFollowupStatus.NEW_LEAD), value: LeadFollowupStatus.NEW_LEAD },
            { label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewHeader')(LeadFollowupStatus.YES_PLANNED), value: LeadFollowupStatus.YES_PLANNED },
            { label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewHeader')(LeadFollowupStatus.YES_DONE), value: LeadFollowupStatus.YES_DONE },
            { label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewHeader')(LeadFollowupStatus.NOT_RECONTACTED), value: LeadFollowupStatus.NOT_RECONTACTED },
            { label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewHeader')(LeadFollowupStatus.NOT_PROPOSED), value: LeadFollowupStatus.NOT_PROPOSED },
            { label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewHeader')(LeadFollowupStatus.LEAD_CONVERTED), value: LeadFollowupStatus.LEAD_CONVERTED },
            { label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewHeader')(LeadFollowupStatus.LEAD_WITHOUT_ANSWER), value: LeadFollowupStatus.LEAD_WITHOUT_ANSWER },
          ],
        },
      ],
    };
  },

  computed: {
    filters() {
      const filtersValue = {};
      const filters = [
        'surveySatisfactionLevel',
        'publicReviewStatus',
        'publicReviewCommentStatus',
        'followupUnsatisfiedStatus',
        'followupLeadStatus',
      ];

      filters.map(f => {
        const stateValue = this.reviewsFilters[f];
        if (stateValue) {
          filtersValue[f] = stateValue;
        }
      });

      return filtersValue;
    },

    headerClass() {
      return [GarageTypes.VEHICLE_INSPECTION].includes(this.cockpitType)
        ? 'table-cockpit-header__header--vehicle-inspection' : '';
    },
  },

  methods: {
    async onSearch() {
      this.changeReviewSearch({ search: this.search });
      await this.fetchReviewsListPage({ append: false });
    },

    onSearchChange() {
      this.changeReviewLiveSearch({ search: this.search });
    },

    onFiltersChange(newFilters) {
      const sameFilters = isEqual(this.filters, newFilters);

      if (!sameFilters) {
        this.changeReviewFilters({ filters: newFilters });
        this.fetchReviewsListPage({ append: false });
      }
    },

    // eslint-disable-next-line vue/no-unused-properties
    updateFilters() {
      this.onFiltersChange(omit(this.filters, 'followupLeadStatus'));
      const filterOptionsFiltered = this.filterOptions?.filter(f => f.key !== 'followupLeadStatus');
      this.filterOptions = [
        ...filterOptionsFiltered,
        ...(GarageTypes.VEHICLE_INSPECTION === this.cockpitType ? [
          {
            key: 'followupLeadStatus',
            label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewHeader')('FollowupLeads'),
            icon: 'icon-gs-car-checked',
            values: [
              { type: 'primary', label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewHeader')(LeadFollowupStatus.NEW_LEAD), value: LeadFollowupStatus.NEW_LEAD },
              {
                type: 'muted',
                label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewHeader')(LeadFollowupStatus.LEAD_WITHOUT_ANSWER),
                value: LeadFollowupStatus.LEAD_WITHOUT_ANSWER,
              },
            ],
          },
        ] : [
          {
            key: 'followupLeadStatus',
            label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewHeader')('FollowupLeads'),
            icon: 'icon-gs-car-checked',
            values: [
              { label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewHeader')(LeadFollowupStatus.NEW_LEAD), value: LeadFollowupStatus.NEW_LEAD },
              { label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewHeader')(LeadFollowupStatus.YES_PLANNED), value: LeadFollowupStatus.YES_PLANNED },
              { label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewHeader')(LeadFollowupStatus.YES_DONE), value: LeadFollowupStatus.YES_DONE },
              { label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewHeader')(LeadFollowupStatus.NOT_RECONTACTED), value: LeadFollowupStatus.NOT_RECONTACTED },
              { label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewHeader')(LeadFollowupStatus.NOT_PROPOSED), value: LeadFollowupStatus.NOT_PROPOSED },
              { label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewHeader')(LeadFollowupStatus.LEAD_CONVERTED), value: LeadFollowupStatus.LEAD_CONVERTED },
              { label: this.$t_locale('components/cockpit/satisfaction/reviews/TableSatisfactionReviewHeader')(LeadFollowupStatus.LEAD_WITHOUT_ANSWER), value: LeadFollowupStatus.LEAD_WITHOUT_ANSWER },
            ],
          },
        ]),
      ];
    },
  },

  watch: {
    ...watchersFactory({
      'cockpitType': ['updateFilters'],
    }),
  },
};
</script>
<style lang="scss" scoped>
</style>
