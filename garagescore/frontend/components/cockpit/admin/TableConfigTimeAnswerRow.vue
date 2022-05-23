<template>
  <TableRow class="table-admin-response" :class="{ disabled: deep('disabled') }">
    <TableRowCell>
      <AppText type="black" tag="p" :bold="true" class="table-admin-response__garage">
        {{ deep('name') }}
      </AppText>
    </TableRowCell>
    <TableRowCell :style="{ flex: 1 }" ></TableRowCell>
    <TableRowCell right class="table-admin-response__list">
      <DropdownBtn
        :items="reponseTime"
        :label="getLabelDropdown"
        :dropdownSelectedTime="dropdownSelectedTime"
        :disabled="deep('disabled')"
        v-tooltip.top="{ content: deep('disabled') ? $t_locale('components/cockpit/admin/TableConfigTimeAnswerRow')('DontHaveEREputation') : '' }"
      />
    </TableRowCell>
  </TableRow>
</template>
<script>
import DropdownBtn from '~/components/global/DropdownBtn.vue';
import { getDeepFieldValue} from "~/utils/object";
export default {
  components: {
    DropdownBtn,
  },
  props: {
    row: {
      type: Object,
      default: () => {},
    },
    reponseTime: {
      type: Array,
      default: () => [],
    },
    saveDelay: {
      type: Function,
      default: () => ({}),
    },
  },
  data() {
    return {
      label: '',
      itemSelected: {},
      deep: (fieldName) => getDeepFieldValue(this.row, fieldName)
    };
  },
  computed: {
    getLabelDropdown() {
      const { label = '' } =
        this.reponseTime.find((data) => data.value === this.deep('automaticReviewResponseDelay')) || {};
      return label;
    },
  },
  methods: {
    dropdownSelectedTime(itemSelected) {
      const item = {
        id: this.deep('id'),
        automaticReviewResponseDelay: itemSelected.value,
      };
      this.saveDelay(item);
    },
  },
};
</script>
<style lang="scss" scoped>
.table-admin-response {
  display: flex;
  align-items: center;
  background-color: $white;
  cursor: pointer;
  &__list {
    overflow: inherit !important;
  }
  &__garagage {
    font-size: 1rem;
  }
}
.disabled {
  cursor: inherit;
}
</style>
