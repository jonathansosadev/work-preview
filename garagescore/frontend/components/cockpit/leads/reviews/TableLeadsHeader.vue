<template>
  <div class="table__thead">
    <div class="table__header table__header--top">
      <div class="table__searchbar">
        <template v-if="hasBackArrow">
          <div class="table__back">
            <button @click="handleBack()">
              <i class="icon-gs-left-circle" />
              <span class="table__back__label">{{ $t_locale('components/cockpit/leads/reviews/TableLeadsHeader')("back") }}</span>
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
    <div class="table__header table-leads-header">
      <TableHeader :style="{ flex: 2 }" :display="['md', 'lg']">
        <!-- New lead button  -->
        <Button
          class="table-leads-header__add-button"
          type="contained-white"
          @click="openCreateLeadModal"
          v-tooltip.top-start="{ content: $t_locale('components/cockpit/leads/reviews/TableLeadsHeader')('createTooltip') }"
        >
          <template>
            <template slot="left">
              <i class="icon-gs-add-outline-circle" />
            </template>
            <AppText tag="span" bold>{{ $t_locale('components/cockpit/leads/reviews/TableLeadsHeader')('create') }}</AppText>
          </template>
        </Button>
        <!-- Refresh button -->
        <span v-tooltip.right="{ content: hasAccessToGreyBo ? $t_locale('components/cockpit/leads/reviews/TableLeadsHeader')('reloadTip') : $t_locale('components/cockpit/leads/reviews/TableLeadsHeader')('reloadTipClient') }">
          <Button
            class="table-leads-header--refresh"
            type="contained-white"
            v-if="userHasAccessToCrossLeads"
            @click="refreshList"
            :disabled="hasAccessToGreyBo"
          >
            <template>
              <template slot="left">
                <i v-if="!loading" class="icon-gs-help-customer-support" />
                <i v-else class="icon-gs-loading" />
              </template>
              <AppText tag="span" bold v-if="!loading">{{ $t_locale('components/cockpit/leads/reviews/TableLeadsHeader')('refresh') }}</AppText>
              <AppText tag="span" bold v-else>{{ $t_locale('components/cockpit/leads/reviews/TableLeadsHeader')('loading') }} </AppText>
            </template>
          </Button>
        </span>
      </TableHeader>

      <TableHeader center />

      <TableHeader center>
        <TableFiltersLabel filterKey="leadTiming" :filters="filters" :filterOptions="filterOptions" />
      </TableHeader>

      <TableHeader center>
        <TableFiltersLabel filterKey="leadSource" :filters="filters" :filterOptions="filterOptions" />
      </TableHeader>

      <TableHeader center>
        <TableFiltersLabel filterKey="leadManager" :filters="filters" :filterOptions="filterOptions" />
      </TableHeader>

      <TableHeader center>
        <TableFiltersLabel filterKey="leadStatus" :filters="filters" :filterOptions="filterOptions" />
      </TableHeader>

      <TableHeader center>
        <TableFiltersLabel filterKey="followupLeadStatus" :filters="filters" :filterOptions="filterOptions" />
      </TableHeader>
    </div>
  </div>
</template>

<script>
import Searchbar from '~/components/ui/searchbar/Searchbar';
import TableFiltersLabel from '~/components/global/TableFiltersLabel';
import LeadFollowupStatus from '~/utils/models/data/type/lead-followup-status';

import { debounce, isEqual } from 'lodash';

export default {
  components: {
    Searchbar,
    TableFiltersLabel,
  },

  props: {
    filtersDisabled: { type: Boolean, default: false },
    userHasAccessToCrossLeads: { type: Boolean, default: false },
    openCreateLeadModal: { type: Function, required: true },
    sourcesList: { type: Array, default: () => [] },
    liveSearch: { type: String },
    fetchLeadsList: { type: Function, required: true },
    changeFilters: { type: Function, required: true },
    handleBack: { type: Function, required: true },
    changeSearch: { type: Function, required: true },
    changeLiveSearch: { type: Function, required: true },
    hasBackArrow: { type: Boolean },
    hasAccessToGreyBo: { type: Boolean },
    isManager: { type: Boolean },
    currentUserId: { type: String },
    currentFilters: { type: Object },
  },

  data() {
    return {
      loading: false,
      debouncedFetch: debounce(() => {
        this.fetchLeadsList({ append: false });
      }, 500),

      search: this.liveSearch,
    };
  },

  methods: {
    async refreshList() {
      if (!this.loading) {
        this.loading = true;
        await this.fetchLeadsList({
          append: false,
          retrieveOvhCalls: true,
        });
        this.loading = false;
      }
    },
    onFiltersChange(newFilters) {
      const sameFilters = isEqual(this.filters, newFilters);

      if (!sameFilters) {
        this.changeFilters({ filters: newFilters });
        this.debouncedFetch();
      }
    },

    async onSearch() {
      this.changeSearch({ search: this.search });
      await this.fetchLeadsList({ append: false });
    },

    onSearchChange() {
      this.changeLiveSearch({ search: this.search });
    },
  },

  computed: {
    filters() {
      const filtersValue = {};
      const filters = [
        'leadBodyType',
        'leadFinancing',
        'leadTiming',
        'leadSource',
        'leadManager',
        'leadStatus',
        'followupLeadStatus',
      ];

      filters.map((f) => {
        const stateValue = this.currentFilters[f];
        if (stateValue) {
          filtersValue[f] = stateValue;
        }
      });

      return filtersValue;
    },

    filterOptions() {
      return [
        {
          icon: 'icon-gs-time-hour-glass',
          label: this.$t_locale('components/cockpit/leads/reviews/TableLeadsHeader')('leadTiming'),
          key: 'leadTiming',
          values: [
            { label: this.$t_locale('components/cockpit/leads/reviews/TableLeadsHeader')('Now'), value: 'Now' },
            { label: this.$t_locale('components/cockpit/leads/reviews/TableLeadsHeader')('ShortTerm'), value: 'ShortTerm' },
            { label: this.$t_locale('components/cockpit/leads/reviews/TableLeadsHeader')('MidTerm'), value: 'MidTerm' },
            { label: this.$t_locale('components/cockpit/leads/reviews/TableLeadsHeader')('LongTerm'), value: 'LongTerm' },
          ],
        },

        this.sourceTypeFilter,

        {
          icon: 'icon-gs-user',
          label: this.$t_locale('components/cockpit/leads/reviews/TableLeadsHeader')('leadManager'),
          key: 'leadManager',
          values: [
            {
              label: this.$t_locale('components/cockpit/leads/reviews/TableLeadsHeader')('Mes dossiers'),
              value: this.currentUserId,
            },
            ...(this.isManager ? [{ label: this.$t_locale('components/cockpit/leads/reviews/TableLeadsHeader')('Mon équipe'), value: 'Team' }] : []),
            { label: this.$t_locale('components/cockpit/leads/reviews/TableLeadsHeader')('Non attribué'), value: 'Unassigned' },
          ],
        },

        {
          icon: ' icon-gs-folder',
          label: this.$t_locale('components/cockpit/leads/reviews/TableLeadsHeader')('leadStatus'),
          key: 'leadStatus',
          values: [
            { label: this.$t_locale('components/cockpit/leads/reviews/TableLeadsHeader')('Contact'), value: 'Contact' },
            { label: this.$t_locale('components/cockpit/leads/reviews/TableLeadsHeader')('Meeting'), value: 'Meeting' },
            { label: this.$t_locale('components/cockpit/leads/reviews/TableLeadsHeader')('Proposition'), value: 'Proposition' },
            { label: this.$t_locale('components/cockpit/leads/reviews/TableLeadsHeader')('Closing'), value: 'Closing' },
            { label: this.$t_locale('components/cockpit/leads/reviews/TableLeadsHeader')('Sold'), value: 'Sold' },
            { label: this.$t_locale('components/cockpit/leads/reviews/TableLeadsHeader')('Closed'), value: 'Closed' },
          ],
        },

        {
          icon: 'icon-gs-car-repair',
          label: this.$t_locale('components/cockpit/leads/reviews/TableLeadsHeader')('FollowupLeads'),
          key: 'followupLeadStatus',
          values: [
            { label: this.$t_locale('components/cockpit/leads/reviews/TableLeadsHeader')(LeadFollowupStatus.NEW_LEAD), value: LeadFollowupStatus.NEW_LEAD },
            { label: this.$t_locale('components/cockpit/leads/reviews/TableLeadsHeader')(LeadFollowupStatus.YES_PLANNED), value: LeadFollowupStatus.YES_PLANNED },
            { label: this.$t_locale('components/cockpit/leads/reviews/TableLeadsHeader')(LeadFollowupStatus.YES_DONE), value: LeadFollowupStatus.YES_DONE },
            { label: this.$t_locale('components/cockpit/leads/reviews/TableLeadsHeader')(LeadFollowupStatus.NOT_RECONTACTED), value: LeadFollowupStatus.NOT_RECONTACTED },
            { label: this.$t_locale('components/cockpit/leads/reviews/TableLeadsHeader')(LeadFollowupStatus.NOT_PROPOSED), value: LeadFollowupStatus.NOT_PROPOSED },
            { label: this.$t_locale('components/cockpit/leads/reviews/TableLeadsHeader')(LeadFollowupStatus.LEAD_CONVERTED), value: LeadFollowupStatus.LEAD_CONVERTED },
            { label: this.$t_locale('components/cockpit/leads/reviews/TableLeadsHeader')(LeadFollowupStatus.LEAD_WITHOUT_ANSWER), value: LeadFollowupStatus.LEAD_WITHOUT_ANSWER },
          ],
        },
      ];
    },

    sourceTypeFilter() {
      return {
        icon: 'icon-gs-web',
        label: this.$t_locale('components/cockpit/leads/reviews/TableLeadsHeader')('leadSource'),
        key: 'leadSource',
        values: this.sourcesList
          .map((value) => ({ label: this.$t_locale('components/cockpit/leads/reviews/TableLeadsHeader')(value, {}, value), value }))
          .sort(({ label: labelA }, { label: labelB }) => labelA.localeCompare(labelB)),
      };
    },
  },
};
</script>

<style lang="scss" scoped>
.table-leads-header {
  padding-left: 1rem;
  padding-right: 1rem;
  border-bottom: 1px solid rgba($grey, 0.5);
  &__add-button {
    margin-right: 10px;
  }
  &__footer {
    margin: 1rem 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  &--refresh {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    font-size: .9rem;
    font-weight: bold;
    font-stretch: normal;
    font-style: normal;
    line-height: 1.23;
    letter-spacing: normal;
    text-align: left;
    color: $dark-grey;
    padding: 0 10px;
    height: 30px;
    border-radius: 20px;
    box-shadow: 0 0 3px 0 rgba($black, .16);
    background-color: $white;
    border: none;
    cursor: pointer;

    i {
      vertical-align: middle;
      margin-right: 0.4rem;
    }
    svg {
      margin-right: 0.4rem;
    }
    &:hover {
      background-color: $light-grey;
      transition: background-color 0.3s ease-in;
    }
    &:disabled {
      &:hover {
        cursor: not-allowed;
        background-color: $white;
      }
    }
  }
}
</style>
