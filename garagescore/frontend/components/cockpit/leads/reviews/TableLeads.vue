<template>
  <div class="table-leads">
    <div class="table-leads__table">
      <Table :rows="rows" :loading="loading" fixed :noResultGodMode="noResultGodMode">
        <template #header>
          <TableLeadsHeader
            :filtersDisabled="filtersDisabled"
            :userHasAccessToCrossLeads="userHasAccessToCrossLeads"
            :openCreateLeadModal="openCreateLeadModal"
            :sourcesList="sourceTypeFilterValues"
            :liveSearch="liveSearch"
            :fetchLeadsList="fetchLeadsList"
            :changeFilters="changeFilters"
            :handleBack="handleBack"
            :changeSearch="changeSearch"
            :changeLiveSearch="changeLiveSearch"
            :hasBackArrow="hasBackArrow"
            :currentFilters="currentFilters"
            :currentUserId="currentUserId"
            :isManager="isManager"
            :hasAccessToGreyBo="hasAccessToGreyBo"
          />
        </template>
        <template #header-fixed>
          <TableLeadsHeader
            :filtersDisabled="filtersDisabled"
            :userHasAccessToCrossLeads="userHasAccessToCrossLeads"
            :openCreateLeadModal="openCreateLeadModal"
            :sourcesList="sourceTypeFilterValues"
            :liveSearch="liveSearch"
            :fetchLeadsList="fetchLeadsList"
            :changeFilters="changeFilters"
            :handleBack="handleBack"
            :changeSearch="changeSearch"
            :changeLiveSearch="changeLiveSearch"
            :hasBackArrow="hasBackArrow"
            :currentFilters="currentFilters"
            :currentUserId="currentUserId"
            :isManager="isManager"
            :hasAccessToGreyBo="hasAccessToGreyBo"
          />
        </template>

        <template #info>
          <BannerInfo v-if="hasAAgentSharingHisLeads" />
        </template>
        <template #row="{ row }">
          <TableLeadsRow
            :row="row"
            :data-id="row.id"
            :setRowSubview="setRowSubview"
            :getRowSubviewFunction="getRowSubview"
            :currentGarageIds="currentGarageIds"
            :changeCurrentGarage="changeCurrentGarage"
            :selectedCockpitType="cockpitType"
          />
          <TableLeadsRowProject
            v-if="getRowSubview(row.id) === 'project'"
            v-bind="row"
            :data-id="row.id"
            :cockpitType="cockpitType"
          />
          <TableRowFollowupLead
            v-else-if="getRowSubview(row.id) === 'followupLead'"
            v-bind="row"
            :colspan="5"
            :colspan-bg="2"
            :colspan-end="1"
          />
        </template>
        <template #row-loading>
          <TableRowCockpitSkeleton v-for="n in 10" :key="n" :columnCount="6" />
        </template>
      </Table>
    </div>
    <div v-if="hasMore" class="table-leads__footer">
      <Button
        type="orange-border"
        :disabled="loadingMore"
        fullSized
        @click="loadMore"
      >
        <template v-if="!loadingMore">
          {{ $t_locale('components/cockpit/leads/reviews/TableLeads')("LoadMore") }}
        </template>
        <template v-else>
          <i class="icon-gs-loading" />
          {{ $t_locale('components/cockpit/leads/reviews/TableLeads')("Loading") }}...
        </template>
      </Button>
    </div>
  </div>
</template>

<script>
import TableRowCockpitSkeleton from '~/components/global/skeleton/TableRowCockpitSkeleton';
import TableLeadsHeader from '~/components/cockpit/leads/reviews/TableLeadsHeader';
import TableLeadsRow from '~/components/cockpit/leads/reviews/TableLeadsRow';
import TableLeadsRowProject from '~/components/cockpit/leads/reviews/TableLeadsRowProject';
import TableRowFollowupLead from '~/components/global/TableRowFollowupLead';
import BannerInfo from '~/components/cockpit/leads/reviews/BannerInfo';

export default {
  components: {
    BannerInfo,
    TableLeadsRow,
    TableLeadsRowProject,
    TableLeadsHeader,
    TableRowFollowupLead,
    TableRowCockpitSkeleton,
  },

  props: {
    filtersDisabled: { type: Boolean, default: false },
    userHasAccessToCrossLeads: { type: Boolean, default: false },
    openCreateLeadModal: { type: Function },
    sourceTypeFilterValues: { type: Array, default: () => [] },
    hasAAgentSharingHisLeads: { type: Boolean, default: false },
    hasMore: { type: Boolean, default: false },
    loading: { type: Boolean, default: true },
    getRowSubview: { type: Function },
    rows: { type: Array, default: () => [] },
    noResultGodMode: { type: Boolean, default: false },
    liveSearch: { type: String },
    fetchLeadsList: { type: Function, required: true },
    fetchNextPage: { type: Function },
    changeFilters: { type: Function, required: true },
    handleBack: { type: Function, required: true },
    changeSearch: { type: Function, required: true },
    changeLiveSearch: { type: Function, required: true },
    hasBackArrow: { type: Boolean },
    isManager: { type: Boolean },
    hasAccessToGreyBo: { type: Boolean },
    currentUserId: { type: String },
    currentFilters: { type: Object },
    setRowSubview: { type: Function, required: true },
    cockpitType: { type: String },
    currentGarageIds: Array,
    changeCurrentGarage: { type: Function, required: true },
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
