<template>
  <div class="table-contacts">
    <div class="table-contacts__content">
      <Table
        :loading="listLoading && !loadingMore"
        :rows="rows"
        fixed
      >
        <template #header>
          <TableGarageContactsHeader
            :changeLiveSearch="changeLiveSearch"
            :changeOrder="changeOrder"
            :changeSearch="changeSearch"
            :fetchListPage="fetchListPage"
            :liveSearch="liveSearch"
            :order="order"
            :orderBy="orderBy"
          />
        </template>
        <template #header-fixed>
          <TableGarageContactsHeader
            :changeLiveSearch="changeLiveSearch"
            :changeOrder="changeOrder"
            :changeSearch="changeSearch"
            :fetchListPage="fetchListPage"
            :liveSearch="liveSearch"
            :order="order"
            :orderBy="orderBy"
          />
        </template>
        <template #row="{ row, index }">
          <TableGarageContactsRow
            :row="row"
            :data-id="row.id"
            :index="index"
            :cockpitType="cockpitType"
            :wwwUrl="wwwUrl"
          />
        </template>
        <template #row-loading>
          <TableRowCockpitSkeleton
            v-for="n in 10"
            :key="n"
            :columnCount="4"
          />
        </template>
      </Table>
    </div>
    <div v-if="listHasMore" class="table-contacts__footer">
      <Button
        :disabled="loadingMore"
        @click="loadMore"
        fullSized
        type="orange-border"
      >
        <template v-if="loadingMore">
          <i class="icon-gs-loading" />
          {{ $t_locale('components/cockpit/contacts/garages/TableGarageContacts')("LoadMore") }}...
        </template>
        <template v-else>
          {{ $t_locale('components/cockpit/contacts/garages/TableGarageContacts')("LoadMore") }}
        </template>
      </Button>
    </div>
  </div>
</template>

<script>
import TableGarageContactsHeader from '~/components/cockpit/contacts/garages/TableGarageContactsHeader';
import TableGarageContactsRow from '~/components/cockpit/contacts/garages/TableGarageContactsRow';
import TableRowCockpitSkeleton from '~/components/global/skeleton/TableRowCockpitSkeleton';

export default {
  props: {
    garages: Array,
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
  },

  components: {
    TableGarageContactsHeader,
    TableGarageContactsRow,
    TableRowCockpitSkeleton,
  },

  data() {
    return {
      loadingMore: false,
    };
  },

  computed: {
    rows() {
      return this.garages.map(
        (row) => ({
          ...row,
          countValidEmailsPercent:
            (this.totalValidEmailsPerRow(row) / this.totalEmailsPerRow(row)) * 100,
          countValidPhonesPercent:
            (this.totalValidPhonesPerRow(row) / this.totalPhonesPerRow(row)) * 100,
        }),
      );
    },
  },

  methods: {
    async loadMore() {
      this.loadingMore = true;
      await this.fetchNextListPage();
      this.loadingMore = false;
    },

    totalEmailsPerRow(row) {
      return (
        row.countValidEmails +
        row.countWrongEmails +
        row.countBlockedByEmail +
        row.countNotPresentEmails
      );
    },
    totalValidEmailsPerRow(row) {
      return row.countValidEmails + row.countBlockedByEmail;
    },

    totalPhonesPerRow(row) {
      return (
        row.countValidPhones +
        row.countWrongPhones +
        row.countBlockedByPhone +
        row.countNotPresentPhones
      );
    },
    totalValidPhonesPerRow(row) {
      return row.countValidPhones + row.countBlockedByPhone;
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
