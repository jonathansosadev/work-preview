<template>
  <div class="table-custom-response">
    <div class="table-custom-response__content">
      <Table :rows="customResponses" :loading="loading && !loadingMore" :noResultText="noResultText" fixed separator>
        <template slot="header">
          <TableCustomResponseHeader />
        </template>
        <template slot="row" slot-scope="{ row }">
          <TableCustomResponseRow
            :row="row"
            :confirmDeleteModelResponse="confirmDeleteModelResponseTemplate"
            :updateModelAnswer="updateModelAnswerTemplate"
            :setIdRow="setIdRow"
            :selectedRowId="selectedRowId"
            :garagesOptions="garagesOptions"
          />
        </template>
      </Table>
    </div>
    <div class="table-custom-response__footer" v-if="hasMore">
      <Button
        type="orange-border"
        fullSized
        :disabled="loadingMore"
        @click.native="loadMore"
      >
        <template v-if="!loadingMore">
          {{ $t_locale('components/cockpit/admin/TableCustomResponse')('seeMore') }}
        </template>
        <template v-else>
          <i class="icon-gs-loading" />
          {{ $t_locale('components/cockpit/admin/TableCustomResponse')('loading') }}
        </template>
      </Button>
    </div>
  </div>
</template>
<script>
import TableCustomResponseHeader from './TableCustomResponseHeader.vue';
import TableCustomResponseRow from './TableCustomResponseRow.vue';
export default {
  components: {
    TableCustomResponseHeader,
    TableCustomResponseRow,
  },
  props: {
    customResponses: {
      type: Array,
      default: [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
    noResultText: {
      type: String,
      default: '',
    },
    hasMore: {
      type: Boolean,
      default: false,
    },
    loadingMore: {
      type: Boolean,
      default: false,
    },
    loadMore: {
      type: Function,
      default: () => ({}),
    },
    confirmDeleteModelResponse: {
      type: Function,
      default: () => ({}),
    },
    updateModelAnswer: {
      type: Function,
      default: () => ({}),
    },
    garagesOptions: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      selectedRowId: null,
    };
  },
  methods: {
    setIdRow(id) {
      if (id === this.selectedRowId) {
        this.selectedRowId = null;
      } else {
        this.selectedRowId = id;
      }
    },
    confirmDeleteModelResponseTemplate(id, garagesCount) {
      this.confirmDeleteModelResponse(id, garagesCount);
      this.selectedRowId = null;
    },
    updateModelAnswerTemplate(row) {
      this.updateModelAnswer(row);
      this.selectedRowId = null;
    },
  },
};
</script>
<style lang="scss" scoped>
.table-custom-response {
  &__footer {
    padding: 1rem 0 2.5rem 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
