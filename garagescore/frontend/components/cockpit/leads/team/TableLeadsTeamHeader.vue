<template>
  <div class="table__thead">
    <div class="table__header table__header--top">
      <div class="table__searchbar">
        <template v-if="hasBackArrow">
          <div class="table__back">
            <button @click="onBack">
              <i class="icon-gs-left-circle" />
              <span class="table__back__label">{{ $t_locale('components/cockpit/leads/team/TableLeadsTeamHeader')("back") }}</span>
            </button>
          </div>
        </template>
        <Searchbar
          v-model="search"
          @input="onSearchChange(search)"
          @searchClick="onSearch(search)"
        />
      </div>
    </div>
    <div class="table__header table-cockpit-header">
      <TableHeader :display="['md', 'lg']" :style="{ flex: 2 }" />
      <TableHeader center>
        <LabelSort
          v-model="sort"
          field="countLeads"
          type="header"
        >
          {{ $t_locale('components/cockpit/leads/team/TableLeadsTeamHeader')("NBLeads") }}
        </LabelSort>
      </TableHeader>
      <TableHeader center>
        <LabelSort
          v-model="sort"
          field="countLeadsUntouchedPercent"
          type="header"
        >
          {{ $t_locale('components/cockpit/leads/team/TableLeadsTeamHeader')("Untreated") }}
        </LabelSort>
      </TableHeader>
      <TableHeader center>
        <LabelSort
          v-model="sort"
          field="countLeadsTouchedPercent"
          type="header"
        >
          {{ $t_locale('components/cockpit/leads/team/TableLeadsTeamHeader')("Treated") }}
        </LabelSort>
      </TableHeader>
      <TableHeader center>
        <LabelSort
          v-model="sort"
          field="countLeadsClosedWithSalePercent"
          type="header"
        >
          {{ $t_locale('components/cockpit/leads/team/TableLeadsTeamHeader')("ConvertedProjects") }}
        </LabelSort>
      </TableHeader>
      <TableHeader center>
        <LabelSort
          v-model="sort"
          field="countLeadsReactivePercent"
          type="header"
        >
          {{ $t_locale('components/cockpit/leads/team/TableLeadsTeamHeader')("Reactivity") }}
        </LabelSort>
      </TableHeader>
    </div>
  </div>
</template>


<script>
import LabelSort from "~/components/global/LabelSort";
import Searchbar from "~/components/ui/searchbar/Searchbar";

export default {
  components: {
    LabelSort,
    Searchbar
  },
  props: {
    getSort: {
      type: Function,
      required: true,
    },
    hasBackArrow: Boolean,
    onBack: {
      type: Function,
      required: true,
    },
    onSearch: {
      type: Function,
      required: true,
    },
    onSearchChange: {
      type: Function,
      required: true,
    },
    setSort: {
      type: Function,
      required: true,
    },
    teamSearch: String,
  },

  data() {
    return {
      search: this.teamSearch,
    }
  },

  computed: {
    sort: {
      get() {
        return this.getSort();
      },

      set(value) {
        this.setSort(value);
      }
    },
  },
};
</script>
