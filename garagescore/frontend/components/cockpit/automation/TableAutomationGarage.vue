<template>
  <div class="cockpit-table">
    <div class="cockpit-table__content">
      <Table :rows="rows" :loading="loading && !loadingMore" fixed>
        <template slot="header">
          <TableAutomationGarageHeader v-bind="headerProps" v-on="headerListeners" />
        </template>
        <template slot="header-fixed">
          <TableAutomationGarageHeader v-bind="headerProps" v-on="headerListeners" />
        </template>
        <template slot="row" slot-scope="{ row, index }">
          <TableAutomationGarageRow :row="row" :campaignType="campaignType" :index="index" />
        </template>
        <template slot="row-loading">
          <TableRowCockpitSkeleton v-for="n in 10" :key="n" :columnCount="4" />
        </template>
      </Table>
    </div>
    <div v-if="hasMore" class="cockpit-table__footer">
      <Button 
        :disabled="loadingMore"
        type="orange-border"
        fullSized
        @click="loadMore"
      >
        <template v-if="!loadingMore">
          {{ $t_locale('components/cockpit/automation/TableAutomationGarage')("LoadMore") }}
        </template>
        <template v-else>
          <i class="icon-gs-loading" />
          {{ $t_locale('components/cockpit/automation/TableAutomationGarage')("Loading") }}...
        </template>
      </Button>
    </div>
  </div>
</template>

<script>
import TableRowCockpitSkeleton from "~/components/global/skeleton/TableRowCockpitSkeleton";
import TableAutomationGarageHeader from "./TableAutomationGarageHeader";
import TableAutomationGarageRow from "./TableAutomationGarageRow";

export default {
  components: {
    TableAutomationGarageHeader,
    TableAutomationGarageRow,
    TableRowCockpitSkeleton
  },

  props: {
    rows: Array,
    loading: Boolean,
    loadingMore: Boolean,
    hasMore: Boolean,
    orderBy: String,
    order: String,
    search: String,
    campaignType: String,
    selectedGarageId: Array,
  },

  data() {
    return {};
  },
  computed: {
    contactCost() {
      return this.rows.length > 0 && this.rows[0].contactCost || 0;
    },
    headerProps() {
      return {
        initialOrderBy: this.orderBy,
        initialOrder: this.order,
        initialSearch: this.search,
        campaignType: this.campaignType,
        contactCost: this.contactCost,
        selectedGarageId: this.selectedGarageId,
      }
    },
    headerListeners() {
      return {
        onSort: ({ orderBy, order }) => this.$emit('onSort', { order, orderBy }),
        onSearch: (search) => this.$emit('onSearch', search),
        onSearchInput: (search) => this.$emit('onSearchInput', search)
      }
    }
  },

  methods: {
    loadMore() {
      this.$emit('loadMore');
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
