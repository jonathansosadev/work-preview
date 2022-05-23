<template>
  <div class="table__thead">
    <div class="table__header table__header--top">
      <div class="table__searchbar">
        <template v-if="hasBackArrow">
          <div class="table__back">
            <button @click="handleBack()">
              <i class="icon-gs-solid-left" />
              <span class="table__back__label">{{ $t_locale('components/cockpit/satisfaction/team/TableSatisfactionTeamHeader')('back') }}</span>
            </button>
          </div>
        </template>
        <Searchbar
          v-model="team.search"
          @input="onSearchChange"
          @searchClick="onSearch"
        />
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
          {{ $t_locale('components/cockpit/satisfaction/team/TableSatisfactionTeamHeader')('reviewsCount') }}
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
          {{ $t_locale('components/cockpit/satisfaction/team/TableSatisfactionTeamHeader')('NPS') }}
        </LabelSort>
      </TableHeader>
      <TableHeader center v-if="isDisplayed">
        <LabelSort
          type="header"
          v-model="sort"
          field="scoreAPV"
        >
          {{ $t_locale('components/cockpit/satisfaction/team/TableSatisfactionTeamHeader')('APVScore') }}
        </LabelSort>
      </TableHeader>
      <TableHeader center v-if="isDisplayed">
        <LabelSort
          type="header"
          v-model="sort"
          field="scoreVN"
        >
          {{ $t_locale('components/cockpit/satisfaction/team/TableSatisfactionTeamHeader')('VNScore') }}
        </LabelSort>
      </TableHeader>
      <TableHeader center v-if="isDisplayed">
        <LabelSort
          type="header"
          v-model="sort"
          field="scoreVO"
        >
          {{ $t_locale('components/cockpit/satisfaction/team/TableSatisfactionTeamHeader')('VOScore') }}
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
          <span class="table-cockpit-header">{{ $t_locale('components/cockpit/satisfaction/team/TableSatisfactionTeamHeader')('Promoter') }}</span>
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
          <span class="table-cockpit-header">{{ $t_locale('components/cockpit/satisfaction/team/TableSatisfactionTeamHeader')('Detractors') }}</span>
        </LabelSort>
      </TableHeader>
    </div>
  </div>
</template>


<script>
import LabelSort from '~/components/global/LabelSort';
import Searchbar from '~/components/ui/searchbar/Searchbar';
import GarageTypes from '~/utils/models/garage.type.js';

export default {
  props: {
    currentCockpitType: String,
    teamLiveSearch: String,
    teamOrder: String,
    teamOrderBy: String,
    setTeamOrder: { type: Function, required: true },
    setTeamSearch: { type: Function, required: true },
    setTeamLiveSearch: { type: Function, required: true },
    fetchTeamListPage: { type: Function, required: true },
    handleBack: { type: Function, required: true },
    hasBackArrow: Boolean,
  },
  components: {
    LabelSort,
    Searchbar,
  },

  data() {
    return {
      team: {
        search: this.teamLiveSearch,
      },
    };
  },

  computed: {
    headerClass() {
      return [GarageTypes.VEHICLE_INSPECTION].includes(this.currentCockpitType)
        ? 'table-cockpit-header__header--vehicle-inspection'
        : '';
    },
    sort: {
      get() {
        return {
          column: this.teamOrderBy,
          order: this.teamOrder,
        };
      },

      set(value) {
        this.setTeamOrder({
          orderBy: value.column,
          order: value.order,
        });
        this.fetchTeamListPage({
          page: 1,
          append: false,
        });
      },
    },

    isDisplayed() {
      return ![GarageTypes.VEHICLE_INSPECTION].includes(this.currentCockpitType);
    },
  },

  methods: {
    async onSearch() {
      this.setTeamSearch({
        search: this.team.search,
      });
      await this.fetchTeamListPage({ page: 1, append: false },
      );
    },

    onSearchChange() {
      this.setTeamLiveSearch({
        search: this.team.search,
      });
    },
  },
};
</script>
<style lang="scss" scoped>
</style>
