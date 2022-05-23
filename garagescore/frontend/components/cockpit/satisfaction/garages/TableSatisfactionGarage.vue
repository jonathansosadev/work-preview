<template>
  <div class="cockpit-table">
    <div class="cockpit-table__content">
      <Table
        :rows="rows"
        :loading="loading && !loadingMore"
        fixed
      >
        <template slot="header">
          <TableSatisfactionGarageHeader
            :isDisplayed="isDisplayed"
            :fetchKpisPage="fetchKpisPage"
            :changeGarageOrder="changeGarageOrder"
            :currentGarage="currentGarage"
            :liveSearch="liveSearch"
            :changeGarageSearch="changeGarageSearch"
            :changeGarageLiveSearch="changeGarageLiveSearch"
          />
        </template>
        <template slot="header-fixed">
          <TableSatisfactionGarageHeader
            :isDisplayed="isDisplayed"
            :fetchKpisPage="fetchKpisPage"
            :changeGarageOrder="changeGarageOrder"
            :currentGarage="currentGarage"
            :liveSearch="liveSearch"
            :changeGarageSearch="changeGarageSearch"
            :changeGarageLiveSearch="changeGarageLiveSearch"
          />
        </template>
        <template slot="row" slot-scope="{ row, index }">
          <TableSatisfactionGarageRow
            :row="row"
            :data-id="row.id"
            :index="index"
            :isDisplayed="isDisplayed"
            :cockpitType="cockpitType"
            :wwwUrl="wwwUrl"
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
        v-if="hasMore"
      >
        <template v-if="!loadingMore">
          {{ $t_locale('components/cockpit/satisfaction/garages/TableSatisfactionGarage')('LoadMore') }}
        </template>
        <template v-else>
          {{ $t_locale('components/cockpit/satisfaction/garages/TableSatisfactionGarage')('Loading') }}...
          <i class="icon-gs-time-hour-glass icon-gs-spin" />
        </template>
      </Button>
    </div>
  </div>
</template>


<script>
import TableSatisfactionGarageHeader from './TableSatisfactionGarageHeader';
import TableSatisfactionGarageRow from './TableSatisfactionGarageRow';

import TableRowCockpitSkeleton from '~/components/global/skeleton/TableRowCockpitSkeleton';

export default {
  components: {
    TableSatisfactionGarageHeader,
    TableSatisfactionGarageRow,
    TableRowCockpitSkeleton,
  },

  props: {
    fetchNextKpisPage: {
      type: Function,
      required: true,
    },
    fetchKpisPage: {
      type: Function,
      required: true,
    },
    changeGarageOrder: {
      type: Function,
      required: true,
    },
    changeGarageSearch: {
      type: Function,
      required: true,
    },
    changeGarageLiveSearch: {
      type: Function,
      required: true,
    },
    loading: Boolean,
    hasMore: Boolean,
    rows: Array,
    isDisplayed: Boolean,
    currentGarage: Object,
    liveSearch: String,
    cockpitType: String,
    wwwUrl: String,
  },

  data() {
    return {
      loadingMore: false,
    };
  },

  methods: {
    async loadMore() {
      this.loadingMore = true;
      await this.fetchNextKpisPage();
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
