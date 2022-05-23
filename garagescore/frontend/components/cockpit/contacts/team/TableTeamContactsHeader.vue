<template>
  <div class="table__thead">
    <div class="table__header table__header--top">
      <div class="table__searchbar">
        <template v-if="hasBackArrow">
          <div class="table__back">
            <button @click="handleBack">
              <i class="icon-gs-solid-left" />
              <span class="table__back__label">{{ $t_locale('components/cockpit/contacts/team/TableTeamContactsHeader')('back') }}</span>
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
      <TableHeader
        center
        :style="{ flex: 2 }"
        :display="['md', 'lg']"
      />
      <TableHeader center>
        <LabelSort
          type="header"
          v-model="sort"
          field="countSurveysRespondedPercent"
        >
          {{ this.$t_locale('components/cockpit/contacts/team/TableTeamContactsHeader')('surveysResponded')  }}
        </LabelSort>
      </TableHeader>
      <TableHeader center>
        <LabelSort
          type="header"
          v-model="sort"
          field="countValidEmailsPercent"
        >
          {{ this.$t_locale('components/cockpit/contacts/team/TableTeamContactsHeader')('validEmail')  }}
        </LabelSort>
      </TableHeader>
      <TableHeader center>
        <LabelSort
          type="header"
          v-model="sort"
          field="countValidPhonesPercent"
        >
          {{ this.$t_locale('components/cockpit/contacts/team/TableTeamContactsHeader')('validPhones')  }}
        </LabelSort>
      </TableHeader>
      <TableHeader center>
        <LabelSort
          type="header"
          v-model="sort"
          field="countNotContactablePercent"
        >
          {{ this.$t_locale('components/cockpit/contacts/team/TableTeamContactsHeader')('notContactable')  }}
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
    changeOrder: Function,
    changeSearch: Function,
    fetchListPage: Function,
    changeLiveSearch: Function,
    orderBy: String,
    order: String,
    handleBack: Function,
    hasBackArrow: Boolean,
  },

  components: {
    Searchbar,
    LabelSort,
  },

  data() {
    return {
      search: this.liveSearch,
    };
  },

  methods: {
    async onSearch() {
      this.changeSearch({ search: this.search });
      await this.fetchListPage({ page: 1, append: false });
    },

    onSearchChange() {
      this.changeLiveSearch({ search: this.search });
    },
  },

  computed: {

    sort: {
      get() {
        return { column: this.orderBy, order: this.order };
      },

      set(value) {
        this.changeOrder({ orderBy: value.column, order: value.order });
        this.fetchListPage({ page: 1, append: false });
      },
    },
  },
};
</script>
<style lang="scss" scoped>
</style>
