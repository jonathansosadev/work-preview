<template>
  <div class="table__thead">
    <div class="table__header table-cockpit-header">
      <TableHeader
        :display="['md', 'lg']"
        :style="{ flex: 2 }"
      />
      <TableHeader center>
        <LabelSort
          v-model="sort"
          field="countLeads"
          type="header"
        >
          {{ $t_locale('components/cockpit/leads/source/TableLeadsSourceHeader')("NBLeads") }}
        </LabelSort>
      </TableHeader>
      <TableHeader center>
        <LabelSort
          v-model="sort"
          field="countLeadsUntouchedPercent"
          type="header"
        >
          {{ $t_locale('components/cockpit/leads/source/TableLeadsSourceHeader')("Untreated") }}
        </LabelSort>
      </TableHeader>
      <TableHeader center>
        <LabelSort
          v-model="sort"
          field="countLeadsTouchedPercent"
          type="header"
        >
          {{ $t_locale('components/cockpit/leads/source/TableLeadsSourceHeader')("Treated") }}
        </LabelSort>
      </TableHeader>
      <TableHeader center>
        <LabelSort
          v-model="sort"
          field="countLeadsClosedWithSalePercent"
          type="header"
        >
          {{ $t_locale('components/cockpit/leads/source/TableLeadsSourceHeader')("ConvertedProjects") }}
        </LabelSort>
      </TableHeader>
      <TableHeader center>
        <LabelSort
          v-model="sort"
          field="countLeadsReactivePercent"
          type="header"
        >
          {{ $t_locale('components/cockpit/leads/source/TableLeadsSourceHeader')("Reactivity") }}
        </LabelSort>
      </TableHeader>
    </div>
  </div>
</template>

<script>
import LabelSort from "~/components/global/LabelSort";

export default {
  components: {
    LabelSort,
  },
  props: {
    setSort: {
      type: Function,
      required: true,
    },
    getSort: {
      type: Function,
      required: true,
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
    }
  }
};
</script>
<style lang="scss" scoped>
</style>
