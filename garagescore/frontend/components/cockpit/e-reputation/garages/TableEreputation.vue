<template>
  <div class="ereputation-table">
    <div class="ereputation-table__content">
      <Table :loading="areErepKpisLoading && !areErepKpisLoadingMore" :rows="erepKpis" fixed>
        <template #header>
          <TableEreputationHeader
            :getKpisSort="getKpisSort"
            :kpisLiveSearch="kpisLiveSearch"
            :onKpisSearch="onKpisSearch"
            :onKpisSearchChange="onKpisSearchChange"
            :setKpisSort="setKpisSort"
          />
        </template>
        <template #header-fixed>
          <TableEreputationHeader
            :getKpisSort="getKpisSort"
            :kpisLiveSearch="kpisLiveSearch"
            :onKpisSearch="onKpisSearch"
            :onKpisSearchChange="onKpisSearchChange"
            :setKpisSort="setKpisSort"
          />
        </template>
        <template #row="{ row, index }">
          <TableEreputationRowGarage
            :connectSource="connectSource"
            :index="index"
            :onChangeCurrentGarage="onChangeCurrentGarage"
            :onGoToReviews="onGoToReviews"
            :row="row"
            :setFromRowClick="setFromRowClick"
            :isFrench="isFrench"
          />
        </template>
        <template #row-loading>
          <TableRowCockpitSkeleton v-for="n in 10" :key="n" :columnCount="7" />
        </template>
      </Table>
    </div>

    <!-- LOAD MORE -->
    <div v-if="doesErepKpisHaveMore" class="ereputation-table__footer">
      <Button type="orange-border" :disabled="areErepKpisLoadingMore" fullSized @click="loadMoreErepKpis">
        <template v-if="areErepKpisLoadingMore">
          <i class="icon-gs-loading" />
          {{ $t_locale('components/cockpit/e-reputation/garages/TableEreputation')('Loading') }}
        </template>
        <template v-else>
          {{ $t_locale('components/cockpit/e-reputation/garages/TableEreputation')('LoadMore') }}
        </template>
      </Button>
    </div>
  </div>
</template>


<script>
import TableEreputationHeader from '~/components/cockpit/e-reputation/garages/TableEreputationHeader';
import TableEreputationRowGarage from '~/components/cockpit/e-reputation/garages/TableEreputationRowGarage';
import TableRowCockpitSkeleton from '~/components/global/skeleton/TableRowCockpitSkeleton';

export default {
  components: {
    TableEreputationRowGarage,
    TableEreputationHeader,
    TableRowCockpitSkeleton,
  },
  props: {
    erepKpis: {
      type: Array,
      required: true,
    },
    onChangeCurrentGarage: {
      type: Function,
      required: true,
    },
    setFromRowClick: {
      type: Function,
      required: true,
    },
    areErepKpisLoading: Boolean,
    areErepKpisLoadingMore: Boolean,
    doesErepKpisHaveMore: Boolean,
    loadMoreErepKpis: {
      type: Function,
      required: true,
    },
    getKpisSort: {
      type: Function,
      required: true,
    },
    setKpisSort: {
      type: Function,
      required: true,
    },
    kpisLiveSearch: String,
    onKpisSearch: {
      type: Function,
      required: true,
    },
    onKpisSearchChange: {
      type: Function,
      required: true,
    },
    onGoToReviews: {
      type: Function,
      required: true,
    },
    connectSource: {
      type: Function,
      required: true,
    },
    isFrench: {
      type: Boolean,
    },
  },
};
</script>

<style lang="scss" scoped>
.ereputation-table {
  height: 0px; // IE fix

  &__footer {
    margin: 1rem 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
