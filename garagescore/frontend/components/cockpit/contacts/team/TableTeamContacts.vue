<template>
  <div class="table-contacts">
    <div class="table-contacts__content">
      <Table
        :rows="list"
        :loading="listLoading && !loadingMore"
        fixed
      >
        <template slot="header">
          <TableTeamContactsHeader
            :liveSearch="liveSearch"
            :changeOrder="changeOrder"
            :changeSearch="changeSearch"
            :fetchListPage="fetchListPage"
            :changeLiveSearch="changeLiveSearch"
            :orderBy="orderBy"
            :order="order"
            :handleBack="handleBack"
            :hasBackArrow="hasBackArrow"
          />
        </template>
        <template slot="header-fixed">
          <TableTeamContactsHeader
            :liveSearch="liveSearch"
            :changeOrder="changeOrder"
            :changeSearch="changeSearch"
            :fetchListPage="fetchListPage"
            :changeLiveSearch="changeLiveSearch"
            :orderBy="orderBy"
            :order="order"
            :handleBack="handleBack"
            :hasBackArrow="hasBackArrow"
          />
        </template>
        <template slot="row" slot-scope="{ row, index }">
          <TableTeamContactsRow
            :row="row"
            :data-id="row.id"
            :index="index"
            :cockpitType="cockpitType"
            :wwwUrl="wwwUrl"
            :filterByDms="filterByDms"
          />
        </template>
        <template slot="row-loading">
          <TableRowCockpitSkeleton
            v-for="n in 10"
            :key="n"
            :columnCount="4"
          />
        </template>
      </Table>
    </div>
    <div class="table-contacts__footer">
      <Button
        type="orange-border"
        :disabled="loadingMore"
        fullSized
        @click="loadMore"
        v-if="listHasMore"
      >
        <template v-if="!loadingMore">
          {{ $t_locale('components/cockpit/contacts/team/TableTeamContacts')('LoadMore') }}
        </template>
        <template v-else>
          {{ $t_locale('components/cockpit/contacts/team/TableTeamContacts')('LoadMore') }}...
          <font-awesome-icon icon="spinner" spin />
        </template>
      </Button>
    </div>
  </div>
</template>


<script>
import TableTeamContactsHeader from '~/components/cockpit/contacts/team/TableTeamContactsHeader';
import TableTeamContactsRow from '~/components/cockpit/contacts/team/TableTeamContactsRow';
import TableRowCockpitSkeleton from '~/components/global/skeleton/TableRowCockpitSkeleton';

export default {
  props: {
    list: Array,
    listLoading: Boolean,
    listHasMore: Boolean,
    fetchNextListPage: Function,
    fetchListPage: Function,
    liveSearch: String,
    orderBy: String,
    order: String,
    changeOrder: Function,
    changeSearch: Function,
    changeLiveSearch: Function,
    cockpitType: String,
    wwwUrl: String,
    handleBack: Function,
    filterByDms: Function,
    hasBackArrow: Boolean,
  },
  components: {
    TableTeamContactsHeader,
    TableTeamContactsRow,
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
      await this.fetchNextListPage();
      this.loadingMore = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.table-contacts {
  &__footer {
    margin: 1rem 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
