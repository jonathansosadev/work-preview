<template>
  <div class="cockpit-table">
    <div class="cockpit-table__content">
      <Table
        :rows="teamList"
        :loading="teamListLoading && !loadingMore"
        fixed
      >
        <template slot="header">
          <TableSatisfactionTeamHeader
            :currentCockpitType="currentCockpitType"
            :teamLiveSearch="teamLiveSearch"
            :teamOrder="teamOrder"
            :teamOrderBy="teamOrderBy"
            :setTeamOrder="setTeamOrder"
            :setTeamSearch="setTeamSearch"
            :setTeamLiveSearch="setTeamLiveSearch"
            :fetchTeamListPage="fetchTeamListPage"
            :handleBack="handleBack"
            :hasBackArrow="hasBackArrow"
          />
        </template>
        <template slot="header-fixed">
          <TableSatisfactionTeamHeader
            :currentCockpitType="currentCockpitType"
            :teamLiveSearch="teamLiveSearch"
            :teamOrder="teamOrder"
            :teamOrderBy="teamOrderBy"
            :setTeamOrder="setTeamOrder"
            :setTeamSearch="setTeamSearch"
            :setTeamLiveSearch="setTeamLiveSearch"
            :fetchTeamListPage="fetchTeamListPage"
            :handleBack="handleBack"
            :hasBackArrow="hasBackArrow"
          />
        </template>
        <template slot="row" slot-scope="{ row, index }">
          <TableSatisfactionTeamRow
            :row="row"
            :data-id="row.id"
            :index="index"
            :filterByDms="filterByDms"
            :currentCockpitType="currentCockpitType"
          />
        </template>

        <template slot="row-loading">
          <TableRowCockpitSkeleton
            v-for="n in 10"
            :key="n"
            :columnCount="7"
          />
        </template>
      </Table>
    </div>
    <div class="cockpit-table__footer">
      <Button
        type="orange-border"
        :disabled="loadingMore"
        fullSized
        @click="loadMore"
        v-if="teamListHasMore"
      >
        <template v-if="!loadingMore">
          {{ $t_locale('components/cockpit/satisfaction/team/TableSatisfactionTeam')('LoadMore') }}
        </template>
        <template v-else>
          {{ $t_locale('components/cockpit/satisfaction/team/TableSatisfactionTeam')('Loading') }}...
          <i class="icon-gs-time-hour-glass icon-gs-spin" />
        </template>
      </Button>
    </div>
  </div>
</template>


<script>
import TableSatisfactionTeamHeader from './TableSatisfactionTeamHeader';
import TableSatisfactionTeamRow from './TableSatisfactionTeamRow';

import TableRowCockpitSkeleton from '~/components/global/skeleton/TableRowCockpitSkeleton';

export default {
  props: {
    currentCockpitType: String,
    teamList: Array,
    teamOrder: String,
    teamOrderBy: String,
    teamLiveSearch: String,
    teamListLoading: Boolean,
    teamListHasMore: Boolean,
    setTeamOrder: { type: Function, required: true },
    setTeamSearch: { type: Function, required: true },
    setTeamLiveSearch: { type: Function, required: true },
    fetchTeamListPage: { type: Function, required: true },
    fetchNextTeamListPage: { type: Function, required: true },
    handleBack: { type: Function, required: true },
    hasBackArrow: Boolean,
    filterByDms: { type: Function, required: true },
  },
  components: {
    TableSatisfactionTeamHeader,
    TableSatisfactionTeamRow,
    TableRowCockpitSkeleton,
  },

  data() {
    return {
      loadingMore: false,
    };
  },
  methods: {
    async loadMore() {
      this.loadingMore = true;
      await this.fetchNextTeamListPage();
      this.loadingMore = false;
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
