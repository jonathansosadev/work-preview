<template>
  <ModalMobile class="mobile-modal-filters" v-on="$listeners">
    <template slot="title">{{ $t_locale('components/ui/searchbar/MobileModalFilters')('filterSelection') }}</template>
    <template>
      <MobileSelectFilters :filters="filters" :options="options" v-model="newFilters" />
    </template>
    <template slot="footer">
      <div class="mobile-modal-filters__actions">
        <Button @click="onCancelClick" type="phantom">{{ $t_locale('components/ui/searchbar/MobileModalFilters')('cancel')}}</Button>
        <template v-if="Object.keys(newFilters).length > 0">
          <div class="mobile-modal-filters__separator" />
          <Button type="phantom" @click="onRemoveClick">{{ $t_locale('components/ui/searchbar/MobileModalFilters')('delete') }}</Button>
        </template>
        <div class="mobile-modal-filters__separator" />
        <Button @click="onApplyClick" type="orange" :disabled="isSameFilters">{{ $t_locale('components/ui/searchbar/MobileModalFilters')('applyFilters') }}</Button>
      </div>
    </template>
  </ModalMobile>
</template>


<script>
import MobileSelectFilters from "./MobileSelectFilters";
import { isEqual } from "lodash";

export default {
  components: { MobileSelectFilters },

  props: {
    filters: {
      type: Object
    },

    options: {
      type: Array
    },

    value: {
      type: Object
    }
  },

  data() {
    return {
      newFilters: this.filters
    };
  },

  computed: {
    isSameFilters() {
      return isEqual(this.filters, this.newFilters);
    }
  },

  methods: {
    onRemoveClick() {
      this.newFilters = {};
    },

    onCancelClick() {
      this.$emit("close");
    },

    onApplyClick() {
      this.$emit("change", this.newFilters);
    }
  }
};
</script>

<style lang="scss" scoped>
.mobile-modal-filters {
  &__actions {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  &__separator {
    height: 2.5rem;
    width: 1px;
    background-color: $grey;
    margin: 0px 1.5rem;
  }
}
</style>