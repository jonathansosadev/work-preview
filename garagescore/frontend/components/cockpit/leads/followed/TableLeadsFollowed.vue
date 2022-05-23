<template>
  <div class="table-leads">
    <div class="table-leads__table">
      <Table
        :loading="loading"
        :rows="rows"
        fixed
      >
        <template #header>
          <TableLeadsFollowedHeader
            :changeFilters="changeFilters"
            :fetchLeadsList="fetchLeadsList"
            :filters="filters"
            :filtersDisabled="filtersDisabled"
            :liveSearch="liveSearch"
            :setLiveSearch="setLiveSearch"
            :setSearch="setSearch"
          />
        </template>
        <template #header-fixed>
          <TableLeadsFollowedHeader
            :filtersDisabled="filtersDisabled"
            :fetchLeadsList="fetchLeadsList"
            :changeFilters="changeFilters"
            :setSearch="setSearch"
            :setLiveSearch="setLiveSearch"
            :liveSearch="liveSearch"
            :filters="filters"
          />
        </template>
        <template #row="{ row }">
          <TableLeadsFollowedRow
            :row="row"
            :data-id="row.id"
            :changeRowSubview="changeRowSubview"
            :getRowSubview="getRowSubview"
            :currentGarageIds="currentGarageIds"
            :changeCurrentGarage="changeCurrentGarage"
          />
          <TableLeadsFollowedRowProject
            v-if="getRowSubview(row.id) === 'project'"
            :cockpitType="cockpitType"
            v-bind="row"
            :data-id="row.id"
          />
          <TableRowFollowupLead
            v-else-if="getRowSubview(row.id) === 'followupLead'"
            v-bind="row"
            :colspan="5"
            :colspan-bg="2"
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
    <div v-if="hasMore" class="table-leads__footer">
      <Button
        :disabled="loadingMore"
        @click="loadMore"
        fullSized
        type="orange-border"
      >
        <template v-if="loadingMore">
          <i class="icon-gs-loading" />
          {{ $t_locale('components/cockpit/leads/followed/TableLeadsFollowed')('Loading') }}...
        </template>
        <template v-else>
          {{ $t_locale('components/cockpit/leads/followed/TableLeadsFollowed')('LoadMore') }}
        </template>
      </Button>
    </div>
  </div>
</template>

<script>
import TableLeadsFollowedHeader
  from '~/components/cockpit/leads/followed/TableLeadsFollowedHeader';
import TableLeadsFollowedRow
  from '~/components/cockpit/leads/followed/TableLeadsFollowedRow';
import TableLeadsFollowedRowProject
  from '~/components/cockpit/leads/followed/TableLeadsFollowedRowProject';
import TableRowFollowupLead
  from '~/components/global/TableRowFollowupLead';
import TableRowCockpitSkeleton
  from '~/components/global/skeleton/TableRowCockpitSkeleton';

export default {
  name: "TableLeadsFollowed",
  components: {
    TableLeadsFollowedRow,
    TableLeadsFollowedRowProject,
    TableLeadsFollowedHeader,
    TableRowFollowupLead,
    TableRowCockpitSkeleton,
  },

  props: {
    filtersDisabled: {
      type: Boolean,
      default: false,
    },
    hasMore: Boolean,
    loading: Boolean,
    getRowSubview: {
      type: Function,
      required: true,
    },
    rows: {
      type: Array,
      default: () => [],
    },
    changeRowSubview: {
      type: Function,
      required: true,
    },
    fetchNextPage: {
      type: Function,
      required: true,
    },
    fetchLeadsList: {
      type: Function,
      required: true,
    },
    changeFilters: {
      type: Function,
      required: true,
    },
    setSearch: {
      type: Function,
      required: true,
    },
    setLiveSearch: {
      type: Function,
      required: true,
    },
    liveSearch: {
      type: String,
      required: true,
    },
    filters: {
      type: Object,
      required: true,
    },
    cockpitType: String,
    currentGarageIds: Array,
    changeCurrentGarage: {
      type: Function,
      required: true,
    },
  },

  data() {
    return {
      loadingMore: false,
    };
  },

  methods: {
    async loadMore() {
      this.loadingMore = true;
      await this.fetchNextPage();
      this.loadingMore = false;
    },
  },
};
</script>

<style lang="scss" scoped>
  .table-leads {
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
</style>
