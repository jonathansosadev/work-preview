<template>
  <div class="cockpit-table">
    <div class="cockpit-table__content">
      <Table
        :loading="isTeamListLoading && !isTeamListLoadingMore"
        :rows="rows"
        fixed
      >
        <template #header>
          <TableLeadsTeamHeader
            :getSort="getSort"
            :hasBackArrow="hasBackArrow"
            :onBack="onBack"
            :onSearch="onSearch"
            :onSearchChange="onSearchChange"
            :setSort="setSort"
            :teamSearch="teamSearch"
          />
        </template>
        <template #header-fixed>
          <TableLeadsTeamHeader
            :getSort="getSort"
            :hasBackArrow="hasBackArrow"
            :onBack="onBack"
            :onSearch="onSearch"
            :onSearchChange="onSearchChange"
            :setSort="setSort"
            :teamSearch="teamSearch"
          />
        </template>
        <template #row="{ row, index }">
          <TableLeadsTeamRow
            :index="index"
            :filterByUser="filterByUser"
            :row="row"
          />
        </template>
        <template #row-loading>
          <TableRowCockpitSkeleton
            v-for="n in 10"
            :key="n"
            :columnCount="5"
          />
        </template>
      </Table>
    </div>
    <div v-if="doesTeamListHasMore" class="cockpit-table__footer">
      <Button
        :disabled="isTeamListLoadingMore"
        @click="onLoadMore"
        fullSized
        type="orange-border"
      >
        <template v-if="isTeamListLoadingMore">
          <i class="icon-gs-loading" />
          {{ $t_locale('components/cockpit/leads/team/TableLeadsTeam')("Loading") }}...
        </template>
        <template v-else>
          {{ $t_locale('components/cockpit/leads/team/TableLeadsTeam')("LoadMore") }}
        </template>
      </Button>
    </div>
  </div>
</template>


<script>
import TableLeadsTeamHeader from '~/components/cockpit/leads/team/TableLeadsTeamHeader';
import TableLeadsTeamRow from '~/components/cockpit/leads/team/TableLeadsTeamRow';
import TableRowCockpitSkeleton from '~/components/global/skeleton/TableRowCockpitSkeleton';

export default {
  components: {
    TableLeadsTeamHeader,
    TableLeadsTeamRow,
    TableRowCockpitSkeleton,
  },
  props: {
    doesTeamListHasMore: Boolean,
    getSort: {
      type: Function,
      required: true,
    },
    hasBackArrow: Boolean,
    isTeamListLoadingMore: Boolean,
    isTeamListLoading: Boolean,
    onBack: {
      type: Function,
      required: true,
    },
    onLoadMore: {
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
    setSort: {
      type: Function,
      required: true,
    },
    teamList: Array,
    teamSearch: String,
    filterByUser: { type: Function, required: true },
  },

  computed: {
    rows() {
      return this.teamList;
    },
  },
};
</script>

<style lang="scss" scoped>
  .cockpit-table {
    &__footer {
      margin: 1rem 0;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
</style>
