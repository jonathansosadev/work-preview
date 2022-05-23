<template>
  <DropdownBase
    class="dropdown-garage"
    :disabled="availableGarages.length === 1"
    :active="isActive"
    ref="dropdown"
    track-id="topfilter-garage"
    type="new-design"
    iconColor="blue"
    caretColor="blue"
  >
    <template slot="icon">
      <i class="icon-gs-garage"></i>
    </template>
    <template slot="label">{{ currentGarage.publicDisplayName }}</template>
    <template>
      <DropdownContent
        :items="items"
        v-model="activeGarage"
        :searchCallback="filteredAvailablesGarages"
        :placeholder="$t_locale('components/global/DropdownGarage')('garageName')"
        class="dropdown-garage__content"
      />
    </template>

    <template slot="dropdown-label">{{ $t_locale('components/global/DropdownGarage')('dropdownLabel') }}</template>
    <template slot="modal-title">{{ $t_locale('components/global/DropdownGarage')('placeHolder') }}</template>
    <template slot="mobile-content">
      <SelectList
        :items="items"
        v-model="activeGarage"
        :searchCallback="filteredAvailablesGarages"
        :limit="30"
      >
        <template slot="icon">
          <i class="icon-gs-garage"></i>
        </template>
        <template slot="title">{{ $t_locale('components/global/DropdownGarage')('listLabel') }}</template>
      </SelectList>
    </template>
  </DropdownBase>
</template>

<script>
import DropdownBase from "./DropdownBase";
import SelectList from "./SelectList";

export default {
  name: 'DropdownGarage',
  components: {
    DropdownBase,
    SelectList
  },
  props:{
    availableGarages:{
      type: Array,
      default: () => []
    },
    garageIds:{
      type: Array,
      default: () => []
    },
    setCurrentGarage:{
      type: Function,
      default: () => console.error('DropdownGarage.vue :: setCurrentGarage not set')
    }
  },
  computed: {
    activeGarage: {
      get() {
        const g = this.garageIds && this.availableGarages.find(
          g => this.garageIds && this.garageIds.includes(g.id)
        );
        return g
          ? {
              key: g.id,
              label: g.publicDisplayName,
              value: g
            }
          : { key: null, value: { id: null }, label: this.defaultGarageLabel };
      },

      set(item) {
        // Close dropdown mobile on change
        this.$refs.dropdown &&
          this.$refs.dropdown.$refs.dropdownMobile &&
          this.$refs.dropdown.$refs.dropdownMobile.closeDropdown();

        // Close dropdown desktop on change
        this.$refs.dropdown &&
          this.$refs.dropdown.$refs.dropdown &&
          this.$refs.dropdown.$refs.dropdown.closeDropdown();

        this.setCurrentGarage(item.value.id);
        return item;
      }
    },

    isActive() {
      return this.garageIds !== null;
    },

    items() {
      return [
        { key: null, value: { id: null }, label: this.defaultGarageLabel },
        ...this.availableGarages.map(a => ({
          key: a.id,
          externalId: a.externalId,
          label: a.publicDisplayName,
          value: a
        }))
      ];
    },

    defaultGarageLabel() {
      return `${this.$t_locale('components/global/DropdownGarage')("allGarages")} (${
        this.availableGarages.length
      })`;
    },

    currentGarage() {
      const selectedGarage = this.availableGarages.find(
        g =>  this.garageIds && this.garageIds.includes(g.id)
      );

      return selectedGarage
        ? selectedGarage
        : {
            id: null,
            publicDisplayName: this.defaultGarageLabel
          };
    }
  },

  methods: {
    filteredAvailablesGarages(search, i) {
      const dataType = this.$store.getters["cockpit/selectedDataType"];
      const regexp = this.getSearchFilterRegexp(search || "", true);
      return (i.label && i.label.match(regexp)) || (i.externalId && i.externalId.match(regexp));
    },

    getSearchFilterRegexp(
      searchedWord,
      getRegexpObject,
      removeSpaces,
      replaceSpacesByOr
    ) {
      let result = searchedWord;
      if (removeSpaces) {
        result = stringUtil.removeSpaces(result);
      }
      if (replaceSpacesByOr) {
        result = result.replace(" ", "|");
      }
      result = result.replace(/[aàâ]/gi, "[aàâ]");
      result = result.replace(/[eéèëê]/gi, "[eéèëê]");
      result = result.replace(/[iîï]/gi, "[iîï]");
      result = result.replace(/[oôö]/gi, "[oôö]");
      result = result.replace(/[uùû]/gi, "[uùû]");
      result = result.replace(/[cç]/gi, "[cç]");
      result = result.replace(/\*/g, "\\*");
      if (getRegexpObject) {
        result = new RegExp(`(${result})`, "i");
      } else {
        result = `/${result}/i`;
      }
      return result;
    },
  }
};
</script>

<style lang="scss" scoped>
.dropdown-garage {

  &__content {
    min-width: 300px !important;
    box-shadow: 0 0 6px 0 rgba($black, .16);
  }
}
</style>
