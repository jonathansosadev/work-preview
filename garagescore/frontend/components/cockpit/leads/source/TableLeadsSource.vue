<template>
  <div class="cockpit-table">
    <div class="cockpit-table__content">
      <Table
        :loading="isLoading && !isLoadingMore"
        :rows="rows"
        fixed
      >
        <template slot="header">
          <TableLeadsSourceHeader
            :getSort="getSourceListSort"
            :setSort="setSourceListSort"
          />
        </template>
        <template slot="header-fixed">
          <TableLeadsSourceHeader
            :getSort="getSourceListSort"
            :setSort="setSourceListSort"
          />
        </template>
        <template slot="row" slot-scope="{ row, index }">
          <TableLeadsSourceRow
            :data-id="row.id"
            :index="index"
            :row="row"
          />
        </template>
        <template slot="row-loading">
          <TableRowCockpitSkeleton
            v-for="n in 10"
            :columnCount="5"
            :key="n"
          />
        </template>
      </Table>
    </div>
    <div v-if="hasMore" class="cockpit-table__footer">
      <Button
        type="orange-border"
        :disabled="loadingMore"
        fullSized
        @click="loadMore"
      >
        <template v-if="!loadingMore">
          {{ $t_locale('components/cockpit/leads/source/TableLeadsSource')("LoadMore") }}
        </template>
        <template v-else>
          <i class="icon-gs-loading" />
          {{ $t_locale('components/cockpit/leads/source/TableLeadsSource')("Loading") }}...
        </template>
      </Button>
    </div>
  </div>
</template>


<script>
import TableLeadsSourceHeader
  from "~/components/cockpit/leads/source/TableLeadsSourceHeader";
import TableLeadsSourceRow
  from "~/components/cockpit/leads/source/TableLeadsSourceRow";
import TableRowCockpitSkeleton
  from "~/components/global/skeleton/TableRowCockpitSkeleton";

export default {
  components: {
    TableLeadsSourceHeader,
    TableLeadsSourceRow,
    TableRowCockpitSkeleton,
  },
  props: {
    getSourceListSort: {
      type: Function,
      required: true,
    },
    hasMore: Boolean,
    isLoading: Boolean,
    isLoadingMore: Boolean,
    onLoadMore: {
      type: Function,
      required: true,
    },
    rows: {
      type: Array,
      required: true,
    },
    setSourceListSort: {
      type: Function,
      required: true,
    }
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
