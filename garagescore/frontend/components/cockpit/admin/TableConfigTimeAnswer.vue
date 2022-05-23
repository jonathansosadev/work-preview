<template>
  <div class="table-config-time">
    <div class="table-config-time__content">
      <Table :rows="garagesConfigDelay" :loading="false && !loadingMore" class="table-config-time__content__table">
        <template slot="header">
          <TableConfigTimeAnswerHeader />
        </template>
        <template slot="row" slot-scope="{ row }">
          <TableConfigTimeAnswerRow :row="row" :reponseTime="reponseTime" :saveDelay="saveDelay" />
        </template>
      </Table>
    </div>
    <div class="table-config-time__footer" v-if="hasMoreDataDelay">
      <Button
        type="orange-border"
        fullSized
        :disabled="loadingMore"
        @click.native="appendResponsesDelay"
      >
        <template v-if="!loadingMore">
          {{ $t_locale('components/cockpit/admin/TableConfigTimeAnswer')('seeMore') }}
        </template>
        <template v-else>
          <i class="icon-gs-loading" />
          {{ $t_locale('components/cockpit/admin/TableConfigTimeAnswer')('loading') }}
        </template>
      </Button>
    </div>
  </div>
</template>
<script>
import TableConfigTimeAnswerHeader from './TableConfigTimeAnswerHeader.vue';
import TableConfigTimeAnswerRow from './TableConfigTimeAnswerRow.vue';
export default {
  components: {
    TableConfigTimeAnswerHeader,
    TableConfigTimeAnswerRow,
  },
  props: {
    garagesConfigDelay: {
      type: Array,
      default: [],
    },
    reponseTime: {
      type: Array,
      default: [],
    },
    saveDelay: {
      type: Function,
      default: () => ({}),
    },
    hasMoreDataDelay:{
      type: Boolean,
      default: false
    },
    appendResponsesDelay: {
      type: Function,
      default: () => ({})
    },
    loadingMore: {
      type: Boolean,
      default: false
    }
  },
};
</script>
<style lang="scss" scoped>
  .table-config-time{
    &__footer {
      padding: 1rem 0 2.5rem 0;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
  
</style>
