<template>
  <div class="table__thead">
    <div class="table__header table__header--top">
      <div class="table__searchbar">
        <Searchbar
          v-model="garage.search"
          @input="onSearchChange"
          @searchClick="onSearch"
        />
      </div>
    </div>
    <div class="table__header table-cockpit-header">
      <TableHeader :style="{ flex: 2 }" :display="['md', 'lg']" />
      <TableHeader center>
        <LabelSort
          type="header"
          v-model="sort"
          field="countUnsatisfied"
        >
          {{ $t_locale('components/cockpit/unsatisfied/garages/TableUnsatisfiedGarageHeader')('NBUnsatisfied') }}
        </LabelSort>
      </TableHeader>
      <TableHeader center>
        <LabelSort
          type="header"
          v-model="sort"
          field="countUnsatisfiedUntouchedPercent"
        >
          {{ $t_locale('components/cockpit/unsatisfied/garages/TableUnsatisfiedGarageHeader')('Untreated') }}
        </LabelSort>
      </TableHeader>
      <TableHeader center>
        <LabelSort
          type="header"
          v-model="sort"
          field="countUnsatisfiedTouchedPercent"
        >
          {{ $t_locale('components/cockpit/unsatisfied/garages/TableUnsatisfiedGarageHeader')('Treated') }}
        </LabelSort>
      </TableHeader>
      <TableHeader center>
        <LabelSort
          type="header"
          v-model="sort"
          field="countUnsatisfiedClosedWithResolutionPercent"
        >
          {{ $t_locale('components/cockpit/unsatisfied/garages/TableUnsatisfiedGarageHeader')('SavedUnsatisfied') }}
        </LabelSort>
      </TableHeader>
      <TableHeader center>
        <LabelSort
          type="header"
          v-model="sort"
          field="countUnsatisfiedReactivePercent"
        >
          {{ $t_locale('components/cockpit/unsatisfied/garages/TableUnsatisfiedGarageHeader')('Reactivity') }}
        </LabelSort>
      </TableHeader>
    </div>
  </div>
</template>


<script>
import LabelSort from '~/components/global/LabelSort';
import Searchbar from '~/components/ui/searchbar/Searchbar';

export default {
  props: {
    liveSearch: String,
    order: String,
    orderBy: String,
    setOrder: Function,
    setSearch: Function,
    setLiveSearch: Function,
    fetchListPage: Function,
  },
  components: {
    LabelSort,
    Searchbar,
  },

  data() {
    return {
      garage: { search: this.liveSearch },
    };
  },

  computed: {
    sort: {
      get() {
        return { column: this.orderBy, order: this.order };
      },

      set(value) {
        this.setOrder({ orderBy: value.column, order: value.order });
        this.fetchListPage({ page: 1, append: false });
      },
    },
  },

  methods: {
    async onSearch() {
      this.setSearch({ search: this.garage.search });
      await this.fetchListPage({ page: 1, append: false });
    },

    onSearchChange() {
      this.setLiveSearch({ search: this.garage.search });
    },
  },
};
</script>
<style lang="scss" scoped>
</style>
