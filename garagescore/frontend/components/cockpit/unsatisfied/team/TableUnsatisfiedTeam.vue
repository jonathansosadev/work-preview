<template>
  <div class="cockpit-table">
    <div class="cockpit-table__content">
      <Table
        :rows="rows"
        :loading="loading && !loadingMore"
        fixed
      >
        <template slot="header">
          <TableUnsatisfiedTeamHeader
            :liveSearch="liveSearch"
            :fromRowClick="fromRowClick"
            :cockpitType="cockpitType"
            :setSearch="setSearch"
            :setLiveSearch="setLiveSearch"
            :setOrder="setOrder"
            :currentOrder="currentOrder"
            :fetchListPage="fetchListPage"
            :handleBack="handleBack"
            :hasBackArrow="hasBackArrow"
          />
        </template>
        <template slot="header-fixed">
          <TableUnsatisfiedTeamHeader
            :liveSearch="liveSearch"
            :fromRowClick="fromRowClick"
            :cockpitType="cockpitType"
            :setSearch="setSearch"
            :setLiveSearch="setLiveSearch"
            :setOrder="setOrder"
            :currentOrder="currentOrder"
            :fetchListPage="fetchListPage"
            :handleBack="handleBack"
            :hasBackArrow="hasBackArrow"
          />
        </template>
        <template slot="row" slot-scope="{ row, index }">
          <TableUnsatisfiedTeamRow
            :row="row"
            :data-id="row.id"
            :index="index"
            :cockpit-type="cockpitType"
            :filterByUserFunction="filterByUser"
          />
        </template>
        <template slot="row-loading">
          <TableRowCockpitSkeleton
            v-for="n in 10"
            :key="n"
            :columnCount="5"
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
        v-if="hasMore"
      >
        <template v-if="!loadingMore">
          {{ $t_locale('components/cockpit/unsatisfied/team/TableUnsatisfiedTeam')("LoadMore") }}
        </template>
        <template v-else>
          {{ $t_locale('components/cockpit/unsatisfied/team/TableUnsatisfiedTeam')("Loading") }}...
          <font-awesome-icon icon="spinner" spin />
        </template>
      </Button>
    </div>
  </div>
</template>


<script>
import TableUnsatisfiedTeamHeader from "./TableUnsatisfiedTeamHeader";
import TableUnsatisfiedTeamRow from "./TableUnsatisfiedTeamRow";

import TableRowCockpitSkeleton from "~/components/global/skeleton/TableRowCockpitSkeleton";

export default {
  components: {
    TableUnsatisfiedTeamHeader,
    TableUnsatisfiedTeamRow,
    TableRowCockpitSkeleton
  },

  props: {
    liveSearch: String,
    fromRowClick: Object,
    cockpitType: String,
    currentOrder: Object,
    rows: Array,
    loading: Boolean,
    hasMore: Boolean,
    setSearch: { type: Function, required: true },
    setLiveSearch: { type: Function, required: true },
    setOrder: {type: Function, required: true},
    filterByUser: {type: Function, required: true},
    fetchNextListPage: {type: Function, required: true},
    fetchListPage: {type: Function, required: true},
    hasBackArrow: Boolean,
    handleBack: { type: Function, required: true },
  },

  data() {
    return {
      loadingMore: false
    };
  },

  methods: {
    async loadMore() {
      this.loadingMore = true;
      await this.fetchNextListPage();
      this.loadingMore = false;
    }
  }
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
