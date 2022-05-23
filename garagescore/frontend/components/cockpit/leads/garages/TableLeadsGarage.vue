<template>
  <div class="cockpit-table">
    <div class="cockpit-table__content">
      <Table :rows="rows" :loading="loading && !loadingMore" fixed>
        <template #header>
          <TableLeadsGarageHeader
            :cockpitType="cockpitType"
            :order="order"
            :orderBy="orderBy"
            :changeOrder="changeOrder"
            :fetchListPage="fetchListPage"
            :setSearch="setSearch"
            :setLiveSearch="setLiveSearch"
            :liveSearch="liveSearch"
          />
        </template>
        <template #header-fixed>
          <TableLeadsGarageHeader
            :cockpitType="cockpitType"
            :order="order"
            :orderBy="orderBy"
            :changeOrder="changeOrder"
            :fetchListPage="fetchListPage"
            :setSearch="setSearch"
            :setLiveSearch="setLiveSearch"
            :liveSearch="liveSearch"
          />
        </template>
        <template #row="{ row, index }">
          <TableLeadsGarageRow
            :row="row"
            :data-id="row.id"
            :index="index"
            :wwwUrl="wwwUrl"
            :cockpitType="cockpitType"
          />
        </template>
        <template #row-loading>
          <TableRowCockpitSkeleton v-for="n in 10" :key="n" :columnCount="5" />
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
          {{ $t_locale('components/cockpit/leads/garages/TableLeadsGarage')("LoadMore") }}
        </template>
        <template v-else>
          <i class="icon-gs-loading" />
          {{ $t_locale('components/cockpit/leads/garages/TableLeadsGarage')("Loading") }}...
        </template>
      </Button>
    </div>
  </div>
</template>


<script>
import TableLeadsGarageHeader from '~/components/cockpit/leads/garages/TableLeadsGarageHeader';
import TableLeadsGarageRow from '~/components/cockpit/leads/garages/TableLeadsGarageRow';
import TableRowCockpitSkeleton from '~/components/global/skeleton/TableRowCockpitSkeleton';

export default {
  components: {
    TableLeadsGarageHeader,
    TableLeadsGarageRow,
    TableRowCockpitSkeleton,
  },

  props: {
    loading: {
      type: Boolean,
    },
    hasMore: {
      type: Boolean,
    },
    rows: {
      type: Array,
      default: () => [],
    },
    fetchNextListPage: {
      type: Function,
      required: true,
    },
    cockpitType: String,
    order: String,
    orderBy: String,
    changeOrder: { type: Function, required: true },
    fetchListPage: { type: Function, required: true },
    setSearch: { type: Function, required: true },
    setLiveSearch: { type: Function, required: true },
    liveSearch: String,
    wwwUrl: String,
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
