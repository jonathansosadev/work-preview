<template>
  <div class="table__thead">
    <div class="table__header table__header--top">
      <div class="table__searchbar">
        <Searchbar v-model="garage.search" @input="onSearchChange" @searchClick="onSearch" />
      </div>
    </div>
    <div class="table__header table-cockpit-header">
      <TableHeader
        class="table-cockpit-header__header"
        :class="headerClass"
        :style="{ flex: 2 }"
        :display="['md', 'lg']"
      />
      <TableHeader
        class="table-cockpit-header__header"
        :class="headerClass"
        center
      >
        <LabelSort
          type="header"
          v-model="sort"
          field="countSurveysRespondedPercent"
        >
          {{ $t_locale('components/cockpit/satisfaction/garages/TableSatisfactionGarageHeader')('reviewsCount') }}
        </LabelSort>
      </TableHeader>
      <TableHeader
        class="table-cockpit-header__header"
        :class="headerClass"
        center
      >
        <LabelSort
          type="header"
          v-model="sort"
          field="scoreNPS"
        >
          {{ $t_locale('components/cockpit/satisfaction/garages/TableSatisfactionGarageHeader')('NPS') }}
        </LabelSort>
      </TableHeader>
      <TableHeader center v-if="isDisplayed">
        <LabelSort
          type="header"
          v-model="sort"
          field="scoreAPV"
        >
          {{ $t_locale('components/cockpit/satisfaction/garages/TableSatisfactionGarageHeader')('APVScore') }}
        </LabelSort>
      </TableHeader>
      <TableHeader center v-if="isDisplayed">
        <LabelSort
          type="header"
          v-model="sort"
          field="scoreVN"
        >
          {{ $t_locale('components/cockpit/satisfaction/garages/TableSatisfactionGarageHeader')('VNScore') }}
        </LabelSort>
      </TableHeader>
      <TableHeader center v-if="isDisplayed">
        <LabelSort
          type="header"
          v-model="sort"
          field="scoreVO"
        >
          {{ $t_locale('components/cockpit/satisfaction/garages/TableSatisfactionGarageHeader')('VOScore') }}
        </LabelSort>
      </TableHeader>
      <TableHeader
        class="table-cockpit-header__header"
        :class="headerClass"
        center
      >
        <LabelSort
          type="header"
          v-model="sort"
          field="countPromotorsPercent"
        >
          <span class="table-cockpit-header">{{ $t_locale('components/cockpit/satisfaction/garages/TableSatisfactionGarageHeader')('Promoter') }}</span>
        </LabelSort>
      </TableHeader>
      <TableHeader
        class="table-cockpit-header__header"
        :class="headerClass"
        center
      >
        <LabelSort
          type="header"
          v-model="sort"
          field="countDetractorsPercent"
        >
          <span class="table-cockpit-header">{{ $t_locale('components/cockpit/satisfaction/garages/TableSatisfactionGarageHeader')('Detractors') }}</span>
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
    isDisplayed: Boolean,
    headerClass: String,
    currentGarage: Object,
    liveSearch: String,
    fetchKpisPage: {
      type: Function,
      required: true,
    },
    changeGarageOrder: {
      type: Function,
      required: true,
    },
    changeGarageSearch: {
      type: Function,
      required: true,
    },
    changeGarageLiveSearch: {
      type: Function,
      required: true,
    },
  },

  data() {
    return {
      garage: {
        sort: { column: 'scoreNPS', order: 'DESC' },
        search: this.liveSearch,
      },
    };
  },

  computed: {
    sort: {
      get() {
        const storeCurrentGarage = this.currentGarage;
        return {
          column: storeCurrentGarage.orderBy,
          order: storeCurrentGarage.order,
        };
      },

      set(value) {
        this.changeGarageOrder(value);
        this.fetchKpisPage({
          page: 1,
          append: false,
        });
      },
    },
  },

  methods: {
    async onSearch() {
      this.changeGarageSearch(this.garage.search);
      await this.fetchKpisPage({ page: 1, append: false });
    },

    onSearchChange() {
      this.changeGarageLiveSearch(this.garage.search);
    },
  },
};
</script>
<style lang="scss" scoped>
</style>
