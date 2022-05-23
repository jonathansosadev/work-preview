<template>
  <div class="cockpit-table">
    <div class="cockpit-table__content">
      <Table
        :rows="rows"
        :loading="listLoading && !loadingMore"
        fixed
      >
        <template slot="header">
          <TableUnsatisfiedGarageHeader
            :cockpitType="cockpitType"

            :liveSearch="liveSearch"
            :order="order"
            :orderBy="orderBy"

            :setOrder="setOrder"
            :setSearch="setSearch"
            :setLiveSearch="setLiveSearch"
            :fetchListPage="fetchListPage"
          />
        </template>
        <template slot="header-fixed">
          <TableUnsatisfiedGarageHeader
            :cockpitType="cockpitType"

            :liveSearch="liveSearch"
            :order="order"
            :orderBy="orderBy"

            :setOrder="setOrder"
            :setSearch="setSearch"
            :setLiveSearch="setLiveSearch"
            :fetchListPage="fetchListPage"
          />
        </template>
        <template slot="row" slot-scope="{ row, index }">
          <TableUnsatisfiedGarageRow
            :row="row"
            :data-id="row.id"
            :index="index"

            :cockpitType="cockpitType"
            :wwwUrl="wwwUrl"
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
        v-if="listHasMore"
      >
        <template v-if="!loadingMore">
          {{ $t_locale('components/cockpit/unsatisfied/garages/TableUnsatisfiedGarage')('LoadMore') }}
        </template>
        <template v-else>
          {{ $t_locale('components/cockpit/unsatisfied/garages/TableUnsatisfiedGarage')('Loading') }}...
          <font-awesome-icon icon="spinner" spin />
        </template>
      </Button>
    </div>
  </div>
</template>


<script>

import TableUnsatisfiedGarageHeader from './TableUnsatisfiedGarageHeader';
import TableUnsatisfiedGarageRow from './TableUnsatisfiedGarageRow';

import TableRowCockpitSkeleton from '~/components/global/skeleton/TableRowCockpitSkeleton';

export default {
  props: {
    cockpitType: String,
    wwwUrl: String,
    liveSearch: String,
    order: String,
    orderBy: String,
    rows: Array,
    listHasMore: Boolean,
    listLoading: Boolean,
    setOrder: Function,
    setSearch: Function,
    setLiveSearch: Function,
    fetchListPage: Function,
    fetchNextListPage: Function,
  },
  components: {
    TableUnsatisfiedGarageHeader,
    TableUnsatisfiedGarageRow,
    TableRowCockpitSkeleton,
  },

  data() {
    return {
      loadingMore: false,
    };
  },

  computed: {},

  methods: {
    async loadMore() {
      this.loadingMore = true;
      await this.fetchNextListPage();
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
