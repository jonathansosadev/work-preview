<template>
  <DropdownBase
    class="dropdown-garage"
    :disabled="hasOnlyOneGarage"
    :labelTop="labelTop"
    :size="width"
    ref="dropdown"
    track-id="topfilter-garage"
    :type="type"
    iconColor="blue"
    caretColor="blue"
    v-bind="isActive"
  >
    <template v-if="icon === true" #icon>
      <i class="icon-gs-garage" ></i>
    </template>
    <template #label>
      <span>{{labelDropdown}}</span>
    </template>
    <template>
      <DropdownContentGarageFilter
        :selectedOptionToggle="selectedOptionToggle"
        :applyItemsSelected="apply"
        :openModalCreateTag="openModalCreate"
        :openModalUpdateTag="openModalUpdate"
        :openModalDeleteTag="openModalDelete"
        :optionSelected="optionSelected"
        :firstOption="firstOption"
        :secondOption="secondOption"
        :garages="garages"
        :tags="tags"
        :userRole="userRole"
        :initialSelectedGarageIds="selectedGarageIds"
        :initialSelectedTags="selectedTags"
        :width="width"
        :height="height"
        :saveOptionProp="saveOption"
      />
    </template>
    <template #dropdown-label>{{ $t_locale('components/global/DropdownGarageFilter')('labelMobile') }}</template>
    <template #modal-title>{{ $t_locale('components/global/DropdownGarageFilter')('selectGarage') }}</template>
    <template #mobile-content class="dropdown-garage__mobile">
      <div class="dropdown-garage__mobile__header">
        <i class="icon-gs-garage"></i>
        <span>{{ $t_locale('components/global/DropdownGarageFilter')('labelMobile') }}</span>
      </div>
      <DropdownContentGarageFilter
        :isMobile="true"
        :selectedOptionToggle="selectedOptionToggle"
        :applyItemsSelected="apply"
        :openModalCreateTag="openModalUpdate"
        :openModalUpdateTag="openModalUpdateTag"
        :openModalDeleteTag="openModalDelete"
        :optionSelected="optionSelected"
        :firstOption="firstOption"
        :secondOption="secondOption"
        :garages="garages"
        :tags="tags"
        :userRole="userRole"
        :initialSelectedGarageIds="selectedGarageIds"
        :initialSelectedTags="selectedTags"
        :width="width"
        :height="height"
        :saveOptionProp="saveOption"
      />
    </template>
  </DropdownBase>
</template>
<script>
import DropdownContentGarageFilter
  from '~/components/global/DropdownContentGarageFilter.vue';
import { garagesValidator } from '~/utils/components/validators';
import { sortArrayObject } from '~/util/arrayTools.js'

import DropdownBase from './DropdownBase';

export default {
  name: 'DropdownGarageFilter',
  components: {
    DropdownBase,
    DropdownContentGarageFilter,
  },
  props: {
    availableGarages: {
      type: Array,
      default: () => [],
    },
    garages: {
      type: Array,
      default: () => [],
    },
    applyItemsSelected: {
      type: Function,
      default: (garagesSelected, tagsSelected) =>
        console.error(
          'DropdownGarageFilter.vue :: applySelected is not set',
          garagesSelected,
          tagsSelected
        ),
    },
    openModalCreateTag: {
      type: Function,
      default: (garagesSelected) =>
        console.error(
          'DropdownGarageFilter.vue :: openModalCreateTag is not set',
          garagesSelected,
        ),
    },
    openModalUpdateTag: {
      type: Function,
      default: (id, nameTag, garagesSelected) =>
        console.error(
          'DropdownGarageFilter.vue :: openModalUpdateTag is not set',
          id,
          nameTag,
          garagesSelected,
        ),
    },
    openModalDeleteTag: {
      type: Function,
      default: (tagName) => console.error(
        'DropdownGarageFilter.vue :: openModalDeleteTag is not set',
        tagName,
      ),
    },
    userRole: {
      type: String,
      default: '',
    },
    selectedGarageIds: {
      required: true,
      validator: garagesValidator,
    },
    selectedTags:{
      type: Array,
      default: () => []
    },
    width:{
      type: String,
      default: ''
    },
    height:{
      type: String,
      default: 'lg'
    },
    saveOption: {
      type: Boolean,
      default: true
    },
    optionSelected: {
      type: String,
      default: 'garages'
    },
    setGarageFilterMode: {
      type: Function,
      default: ()=>console.error('DropdownGarageFilter.vue :: setGarageFilterMode is not set')
    },
    setSelectedTags: {
      type: Function,
      default: ()=>console.error('DropdownGarageFilter.vue :: setSelectedTags is not set')
    },
    icon: {
      type: Boolean,
      default: true
    },
    labelTop: String,
    type: {
      type: String,
      default: 'new-design',
    },
  },
  computed: {
    hasOnlyOneGarage() {
      return this.garages?.length === 1;
    },
    firstOption() {
      return {
        label: this.$t_locale('components/global/DropdownGarageFilter')('garages'),
        value: 'garages',
      };
    },
    secondOption() {
      return {
        label: this.$t_locale('components/global/DropdownGarageFilter')('tags'),
        value: 'tags',
      };
    },
    labelDropdown() {
      if (this.selectedGarageIds === null) {
        return this.$t_locale('components/global/DropdownGarageFilter')('allGarage', { nGarages: this.garages.length });
      }
      if (this.selectedGarageIds.length === 1) {
        const name = this.garages.find(
          ({ key }) => key === this.selectedGarageIds[0]
        ).value;
        return `${name} (1)`;
      }
      return `${this.$t_locale('components/global/DropdownGarageFilter')('garages')} (${this.selectedGarageIds.length })`;
    },
    isActive() {
      if (
        this.selectedGarageIds?.length
      ) {
        return { active: true };
      }
    },
    tags(){
      return [...this.getTags(), ...this.brands];
    },
    brands(){
       //look for the first branName you can find
      const brands = this.availableGarages
        .filter((garage) => garage.brandNames && garage.brandNames.length).map(garage => garage.brandNames[0]);
      let uniqueBrands = [...(new Set(...[brands]))];
      uniqueBrands = uniqueBrands.map(brandName => {
        return !brandName ? 'NC' : brandName;
      })
      uniqueBrands.sort();
      const tempTags = uniqueBrands.map((brandName, index) => {
        return {
          key: (brandName + index.toString()),
          value: brandName,
          garageIds: this.availableGarages.filter((garage) => garage.brandNames.includes(brandName)).map((garage) => garage.id),
          brand: true,
        };
      });
      return tempTags;
    }
  },
  methods: {
    selectedOptionToggle(value) {
      this.setGarageFilterMode(value);
    },
    closeDropdown() {
      // Close dropdown mobile on change
      this.$refs?.dropdown?.$refs?.dropdownMobile?.closeDropdown?.();
      // Close dropdown desktop on change
      this.$refs?.dropdown?.$refs?.dropdown?.closeDropdown?.();
    },
    apply(selectedGarages, selectedTags) {
      this.applyItemsSelected(selectedGarages);
      this.setSelectedTags(selectedTags)
      this.closeDropdown();
    },
    openModalCreate(selectedGarages) {
      this.openModalCreateTag(selectedGarages);
      this.closeDropdown();
    },
    openModalUpdate(id, nameTag, selectedGarages) {
      this.openModalUpdateTag(id, nameTag, selectedGarages);
    },
    openModalDelete(tagName) {
      this.openModalDeleteTag(tagName);
    },
    getTags() {
      const tagsTemp = {};
      this.availableGarages.forEach(({ id, tags }) => {
        if (tags) {
          for (const tag of tags) {
            tagsTemp[tag] = !tagsTemp[tag] ? [id] : [...tagsTemp[tag], id]
          }
        }
      });

      let tempTags = Object.keys(tagsTemp).map((item, index) => {
        return {
          key: (item + index.toString()),
          value: item,
          garageIds: tagsTemp[item],
          brand: false,
        }
      });
      tempTags = sortArrayObject(tempTags, 'value');
      return tempTags;
    },
  },
};
</script>
<style lang="scss" scoped>
  .dropdown-garage {

    &__placeholder {
      display: flex;
      margin-bottom: .5rem;
    }
  }
</style>
