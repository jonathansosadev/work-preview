<template>
  <div class="table__thead">
    <div class="table__header table__header--top">
      <div class="table__searchbar">
        <Searchbar
          :options="filterOptions"
          :filters="currentFilters"
          v-model="search"
          :filtersDisabled="filtersDisabled"
          @filtersChange="onFiltersChange"
          @input="onSearchChange"
          @searchClick="onSearch"
        />
      </div>
    </div>
    <div class="table__header table-leads-header">
      <TableHeader class="table-leads-header--15" />

      <TableHeader center class="table-leads-header--10">
        {{ this.$t_locale('components/cockpit/leads/followed/TableLeadsFollowedHeader')('leadSaleType') }}
      </TableHeader>

      <TableHeader center class="table-leads-header--10">
        {{ this.$t_locale('components/cockpit/leads/followed/TableLeadsFollowedHeader')('leadTiming') }}
      </TableHeader>

      <TableHeader center class="table-leads-header--manager">
        {{ this.$t_locale('components/cockpit/leads/followed/TableLeadsFollowedHeader')('leadManager') }}
      </TableHeader>

      <TableHeader center class="table-leads-header--15">
        {{ this.$t_locale('components/cockpit/leads/followed/TableLeadsFollowedHeader')('leadStatus') }}
      </TableHeader>
    </div>
  </div>
</template>

<script>
import Searchbar from '~/components/ui/searchbar/Searchbar';
import { debounce, isEqual } from 'lodash';

export default {
  components: {
    Searchbar,
  },

  props: {
    filtersDisabled: { type: Boolean, default: false },
    fetchLeadsList: { type: Function, required: true },
    changeFilters: { type: Function, required: true },
    setSearch: { type: Function, required: true },
    setLiveSearch: { type: Function, required: true },
    liveSearch: { type: String, required: true },
    filters: { type: Object, required: true },
  },

  data() {
    return {
      debouncedFetch: debounce(() => {
        this.fetchLeadsList({ append: false });
      }, 500),

      search: this.liveSearch,

      filterOptions: [
        {
          icon: 'icon-gs-time-hour-glass',
          label: this.$t_locale('components/cockpit/leads/followed/TableLeadsFollowedHeader')('leadTiming'),
          key: 'leadTiming',
          values: [
            { label: this.$t_locale('components/cockpit/leads/followed/TableLeadsFollowedHeader')('Now'), value: 'Now' },
            { label: this.$t_locale('components/cockpit/leads/followed/TableLeadsFollowedHeader')('ShortTerm'), value: 'ShortTerm' },
            { label: this.$t_locale('components/cockpit/leads/followed/TableLeadsFollowedHeader')('MidTerm'), value: 'MidTerm' },
            { label: this.$t_locale('components/cockpit/leads/followed/TableLeadsFollowedHeader')('LongTerm'), value: 'LongTerm' },
          ],
        },

        {
          icon: ' icon-gs-folder',
          label: this.$t_locale('components/cockpit/leads/followed/TableLeadsFollowedHeader')('leadStatus'),
          key: 'leadStatus',
          values: [
            { label: this.$t_locale('components/cockpit/leads/followed/TableLeadsFollowedHeader')('Contact'), value: 'Contact' },
            { label: this.$t_locale('components/cockpit/leads/followed/TableLeadsFollowedHeader')('Meeting'), value: 'Meeting' },
            { label: this.$t_locale('components/cockpit/leads/followed/TableLeadsFollowedHeader')('Proposition'), value: 'Proposition' },
            { label: this.$t_locale('components/cockpit/leads/followed/TableLeadsFollowedHeader')('Closing'), value: 'Closing' },
            { label: this.$t_locale('components/cockpit/leads/followed/TableLeadsFollowedHeader')('Sold'), value: 'Sold' },
            { label: this.$t_locale('components/cockpit/leads/followed/TableLeadsFollowedHeader')('Closed'), value: 'Closed' },
          ],
        },
      ],
    };
  },

  methods: {
    onFiltersChange(newFilters) {
      const sameFilters = isEqual(this.filters, newFilters);

      if (!sameFilters) {
        this.changeFilters(newFilters);

        this.debouncedFetch();
      }
    },

    async onSearch() {
      this.setSearch(this.search);
      await this.fetchLeadsList({ append: false });
    },

    onSearchChange() {
      this.setLiveSearch(this.search);
    },
  },

  computed: {
    currentFilters() {
      const filtersValue = {};
      ['leadTiming', 'leadStatus'].forEach((f) => {
        const stateValue = this.filters[f];
        if (stateValue) {
          filtersValue[f] = stateValue;
        }
      });
      return filtersValue;
    },
  },
};
</script>

<style lang="scss" scoped>
.table-leads-header {
  padding-left: 1rem;
  padding-right: 1rem;
  border-bottom: 1px solid rgba($grey, 0.5);

  &--10 {
    width: 15%;
  }

  &--manager {
    width: 20%;
  }

  &--15 {
    width: 27%;
  }

  &__footer {
    margin: 1rem 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  &__before-row {
    width: 100%;
    border-top: 1px solid $white;
    padding: 0.5rem 1rem;
    background-color: $black;
  }
}

@media (min-width: $breakpoint-min-md) {
  .table-leads-header {
    &--10 {
      width: 10%;
    }

    &--manager {
      width: 10%;
    }

    &--15 {
      width: 15%;
    }
  }
}
</style>
