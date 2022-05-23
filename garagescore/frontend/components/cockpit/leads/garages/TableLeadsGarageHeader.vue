<template>
  <div class="table__thead">
    <div class="table__header table__header--top">
      <div class="table__searchbar">
        <Searchbar v-model="garage.search" @input="onSearchChange" @searchClick="onSearch" />
      </div>
    </div>
    <div class="table__header table-cockpit-header">
      <TableHeader :style="{ flex: 2 }" :display="['md', 'lg']" />
      <TableHeader center>
        <LabelSort type="header" v-model="sort" field="countLeads">{{ $t_locale('components/cockpit/leads/garages/TableLeadsGarageHeader')('NBLeads') }}</LabelSort>
      </TableHeader>
      <TableHeader center>
        <LabelSort type="header" v-model="sort" field="countLeadsUntouchedPercent">{{ $t_locale('components/cockpit/leads/garages/TableLeadsGarageHeader')('Untreated') }}</LabelSort>
      </TableHeader>
      <TableHeader center>
        <LabelSort type="header" v-model="sort" field="countLeadsTouchedPercent">{{ $t_locale('components/cockpit/leads/garages/TableLeadsGarageHeader')('Treated') }}</LabelSort>
      </TableHeader>
      <TableHeader center>
        <LabelSort type="header" v-model="sort" field="countLeadsClosedWithSalePercent">
          {{ $t_locale('components/cockpit/leads/garages/TableLeadsGarageHeader')('ConvertedProjects') }}
        </LabelSort>
      </TableHeader>
      <TableHeader center>
        <LabelSort type="header" v-model="sort" field="countLeadsReactivePercent">{{ $t_locale('components/cockpit/leads/garages/TableLeadsGarageHeader')('Reactivity') }}</LabelSort>
      </TableHeader>
    </div>
  </div>
</template>

<script>
import LabelSort from '~/components/global/LabelSort';
import Searchbar from '~/components/ui/searchbar/Searchbar';

export default {
  components: {
    LabelSort,
    Searchbar,
  },

  props: {
    order: String,
    orderBy: String,
    changeOrder: { type: Function, required: true },
    fetchListPage: { type: Function, required: true },
    setSearch: { type: Function, required: true },
    setLiveSearch: { type: Function, required: true },
    liveSearch: String,
  },

  data() {
    return {
      garage: {
        search: this.liveSearch,
      },
    };
  },

  computed: {
    sort: {
      get() {
        return {
          column: this.orderBy,
          order: this.order,
        };
      },

      async set(value) {
        this.changeOrder(value);
        await this.fetchListPage({
          page: 1,
          append: false,
        });
      },
    },
  },

  methods: {
    async onSearch() {
      this.setSearch(this.garage.search);
      await this.fetchListPage({
        page: 1,
        append: false,
      });
    },

    onSearchChange() {
      this.setLiveSearch(this.garage.search);
    },
  },
};
</script>
<style lang="scss" scoped></style>
