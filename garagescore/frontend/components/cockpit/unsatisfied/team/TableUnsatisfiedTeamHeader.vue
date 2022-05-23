<template>
  <div class="table__thead">
    <div class="table__header table__header--top">
      <div class="table__searchbar">
        <template v-if="hasBackArrow">
          <div class="table__back">
            <button @click="handleBack">
              <i class="icon-gs-solid-left" />
              <span class="table__back__label">{{ $t_locale('components/cockpit/unsatisfied/team/TableUnsatisfiedTeamHeader')('back') }}</span>
            </button>
          </div>
        </template>
        <Searchbar
          v-model="search"
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
          {{ $t_locale('components/cockpit/unsatisfied/team/TableUnsatisfiedTeamHeader')('NBUnsatisfied') }}
        </LabelSort>
      </TableHeader>
      <TableHeader center>
        <LabelSort
          type="header"
          v-model="sort"
          field="countUnsatisfiedUntouchedPercent"
        >
          {{ $t_locale('components/cockpit/unsatisfied/team/TableUnsatisfiedTeamHeader')('Untreated') }}
        </LabelSort>
      </TableHeader>
      <TableHeader center>
        <LabelSort
          type="header"
          v-model="sort"
          field="countUnsatisfiedTouchedPercent"
        >
          {{ $t_locale('components/cockpit/unsatisfied/team/TableUnsatisfiedTeamHeader')('Treated') }}
        </LabelSort>
      </TableHeader>
      <TableHeader center>
        <LabelSort
          type="header"
          v-model="sort"
          field="countUnsatisfiedClosedWithResolutionPercent"
        >
          {{ $t_locale('components/cockpit/unsatisfied/team/TableUnsatisfiedTeamHeader')('SavedUnsatisfied') }}
        </LabelSort>
      </TableHeader>
      <TableHeader center>
        <LabelSort
          type="header"
          v-model="sort"
          field="countUnsatisfiedReactivePercent"
        >
          {{ $t_locale('components/cockpit/unsatisfied/team/TableUnsatisfiedTeamHeader')('Reactivity') }}
        </LabelSort>
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
    liveSearch: String,
    currentOrder: Object,
    setSearch: { type: Function, required: true },
    setLiveSearch: { type: Function, required: true },
    setOrder: { type: Function, required: true },
    hasBackArrow: Boolean,
    handleBack: { type: Function, required: true },
    fetchListPage: { type: Function, required: true },
  },

  data() {
    return {
      search: this.liveSearch,
    };
  },

  computed: {
    sort: {
      get() {
        return this.currentOrder;
      },

      set(value) {
        this.setOrder({ orderBy: value.column, order: value.order });
        this.fetchListPage({ page: 1, append: false });
      },
    },
  },

  methods: {
    async onSearch() {
      await this.setSearch(this.search);
    },

    onSearchChange() {
      this.setLiveSearch(this.search);
    },
  },
};
</script>
<style lang="scss" scoped>
</style>
