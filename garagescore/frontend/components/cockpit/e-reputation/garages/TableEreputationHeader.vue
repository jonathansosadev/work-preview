<template>
  <div class="table__thead">
    <div class="table__header table__header--top">
      <div class="table__searchbar">
        <Searchbar
          v-model="search"
          @input="onKpisSearchChange(search)"
          @searchClick="onKpisSearch(search)"
        />
      </div>
    </div>
    <div class="table__header table-cockpit-header">
      <TableHeader :style="{ flex: 2.1 }" />
      <TableHeader center>
        <LabelSort
          type="header"
          v-model="sort"
          field="countReviews"
        >
          {{ this.$t_locale('components/cockpit/e-reputation/garages/TableEreputationHeader')("reviews") }}
        </LabelSort>
      </TableHeader>
      <TableHeader center>
        <LabelSort
          type="header"
          v-model="sort"
          field="scoreNPS"
        >
          {{ this.$t_locale('components/cockpit/e-reputation/garages/TableEreputationHeader')("nps") }}
        </LabelSort>
      </TableHeader>
      <TableHeader center>
        <LabelSort
          type="header"
          v-model="sort"
          field="score"
        >
          {{ this.$t_locale('components/cockpit/e-reputation/garages/TableEreputationHeader')("score5") }}
        </LabelSort>
      </TableHeader>
      <TableHeader center>
        <LabelSort
          type="header"
          v-model="sort"
          field="recommendPercent"
        >
          {{ this.$t_locale('components/cockpit/e-reputation/garages/TableEreputationHeader')("reco") }}
        </LabelSort>
      </TableHeader>
      <TableHeader center>
        <LabelSort
          type="header"
          v-model="sort"
          field="promotorsPercent"
        >
          {{ this.$t_locale('components/cockpit/e-reputation/garages/TableEreputationHeader')("promoter") }}
        </LabelSort>
      </TableHeader>
      <TableHeader center>
        <LabelSort
          type="header"
          v-model="sort"
          field="neutralsPercent"
        >
          {{ this.$t_locale('components/cockpit/e-reputation/garages/TableEreputationHeader')("neutral") }}
        </LabelSort>
      </TableHeader>
      <TableHeader center>
        <LabelSort
          type="header"
          v-model="sort"
          field="detractorsPercent"
        >
          {{ this.$t_locale('components/cockpit/e-reputation/garages/TableEreputationHeader')("detractor") }}
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
    getKpisSort: {
      type: Function,
      required: true,
    },
    kpisLiveSearch: String,
    setKpisSort: {
      type: Function,
      required: true,
    },
    onKpisSearch: {
      type: Function,
      required: true,
    },
    onKpisSearchChange: {
      type: Function,
      required: true,
    }
  },

  data() {
    return {
      search: this.kpisLiveSearch,
    };
  },

  computed: {
    sort: {
      get() {
        return this.getKpisSort();
      },
      set(value) {
        this.setKpisSort(value)
      }
    }
  },
};
</script>

<style lang="scss" scoped>

@media (max-width: $breakpoint-max-sm) {
  .table {
    &__header-item {
      &:first-child {
        display: none;
      }
    }
  }
}
</style>
