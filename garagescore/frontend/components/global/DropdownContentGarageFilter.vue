<template>
  <div class="multi-select-list" :class="getClassBinding">
    <div class="multi-select-list__header">
      <div class="multi-select-list__header__search">
        <SearchInput v-show="isGaragesOptionSelected" :placeholder="$t_locale('components/global/DropdownContentGarageFilter')('searchGarage')" :searchItems="searchGarages" />
        <SearchInput v-show="isTagsOptionSelected" :placeholder="$t_locale('components/global/DropdownContentGarageFilter')('searchTag')" :searchItems="searchScope" />
      </div>
      <div class="multi-select-list__header__toogle">
        <ButtonToggle
          :firstOption="firstOptionFilter"
          :secondOption="secondOptionFilter"
          :selectedOption="selectedToggle"
          :optionSelected="optionSelected"
        />
      </div>
    </div>
    <div class="multi-select-list__all">
      <CheckBox
        v-show="isGaragesOptionSelected"
        :checked="areAllGaragesSelected"
        @change="selectAllGarages()"
        :label="$t_locale('components/global/DropdownContentGarageFilter')('allGarages')"
        labelClass="darkGray"
        :bold="true"
      >
      </CheckBox>
      <CheckBox
        v-show="isTagsOptionSelected"
        :checked="areAllTagsSelected"
        @change="selectAllTags()"
        :label="$t_locale('components/global/DropdownContentGarageFilter')('allTags')"
        labelClass="darkGray"
        :bold="true"
      >
      </CheckBox>
    </div>
    <div
      :class="[selectableListContainerClassBinding, getClassBindingListContent]"
      class="custom-scrollbar"
    >
      <SelectableListOfValues
        v-show="isGaragesOptionSelected"
        :updateSelectedItems="updateSelectedGarages"
        :items="listedGarages"
        :initialSelectedItems="selectedGarages"
      />
      <SelectableListOfValues
        v-show="isTagsOptionSelected"
        :updateSelectedItems="updateSelectedTags"
        :items="listedTags"
        :options="true"
        :userRole="userRole"
        :initialSelectedItems="selectedTags"
        :updateOption="updateOption"
        :deleteOption="openModalDeleteTag"
      />
    </div>
    <div
      v-show="isGaragesOptionSelected"
      class="multi-select-list__save"
      v-if="saveOptionProp"
    >
      <CheckBox
        v-tooltip="{ content: messageCantCreate }"
        :disabled="!isEnabledCheckbox"
        :checked="saveOption"
        :label="$t_locale('components/global/DropdownContentGarageFilter')('saveSelection')"
        :labelClass="getClassCheckbox"
        @change="saveOption = !saveOption"
        checkStyle="orange"
        :bold="true"
      >
      </CheckBox>
    </div>
    <div class="multi-select-list__options" >
      <Button
        v-show="!saveOption"
        :content="$t_locale('components/global/DropdownContentGarageFilter')('apply')"
        :disabled="isDisabledButtonApply"
        :fullSizedNoPadding="true"
        :type="typeButtonApply"
        @click="apply()"
        border="round"
        size="options"
      />
      <Button
        v-if="canCreateTag"
        v-show="saveOption"
        :content="$t_locale('components/global/DropdownContentGarageFilter')('save')"
        :fullSizedNoPadding="true"
        @click="createTag()"
        border="round"
        type="contained-orange"
        size="options"
      />
    </div>
  </div>
</template>

<script>
import SelectableListOfValues from '~/components/global/SelectableListOfValues.vue';
import CheckBox from '~/components/ui/CheckBox.vue';
import { UserRoles } from '~/utils/enumV2';

  import ButtonToggle from './ButtonToggle'
  import SearchInput from './SearchInput'

  export default {
    name: 'DropdownContentGarageFilter',
    components:{
      ButtonToggle,
      CheckBox,
      SearchInput,
      SelectableListOfValues
    },
    props: {
      isMobile: Boolean,
      selectedOptionToggle:{
        type: Function,
        default: () => console.error('MultiSelectList.vue :: selectedOptionToggle not set')
      },
      applyItemsSelected:{
        type: Function,
        default: () => console.error('MultiSelectList.vue :: applyItemsSelected not set')
      },
      openModalCreateTag: {
        type: Function,
        default: (selectedGarages) => console.error('DropdownGarageFilter.vue :: openModalCreateTag is not set', selectedGarages)
      },
      openModalUpdateTag:{
        type: Function,
        default: (id, nameTag, selectedGarages) => console.error('DropdownGarageFilter.vue :: openModalUpdateTag is not set', id, nameTag, selectedGarages)
      },
      openModalDeleteTag:{
        type: Function,
        default: (tagName) => console.error('DropdownGarageFilter.vue :: openModalDeleteTag is not set', tagName)
      },
      optionSelected: { type: String, default: '' },
      firstOption: { type: Object, default: () => {} },
      secondOption: { type: Object, default: () => {} },
      garages: { type: Array, default: () => [] },
      tags: { type: Array,  default: () => [] },
      userRole: {type: String, default: ''},
      initialSelectedGarageIds: {
        type: Array,
        default: () => []
      },
      initialSelectedTags: {
        type: Array,
        default: () => [],
      },
      height:{
        type: String,
        default: 'lg'
      },
      saveOptionProp: {
        type: Boolean,
        default: true
      },
    },

  mounted() {
    this.checkAllGaragesDefault();
    this.sortGarages();
  },

  data() {
    return {
      saveOption: false,
      selectedGarages: this.initialSelectedGarageIds || [],
      selectedTags: this.initialSelectedTags,
      textTagScope: '',
      textGarageScope: '',
      listedGarages: this.garages
    };
  },
  computed: {
    selectableListContainerClassBinding() {
      return [this.isMobile ? 'multi-select-list__mobile__list' : 'multi-select-list__list'];
    },
    isGaragesOptionSelected() {
      return this.optionSelected === 'garages';
    },
    isTagsOptionSelected() {
      return this.optionSelected === 'tags';
    },
    getClassBinding() {
      const classBinding = {};
      classBinding['multi-select-list__mobile'] = this.isMobile;

      return classBinding;
    },
    messageCantCreate() {
      return !this.canCreateTag ? this.$t_locale('components/global/DropdownContentGarageFilter')('cantCreate') : '';
    },
    isEnabledCheckbox() {
      return (
        this.canCreateTag && this.selectedGarages.length > 1
      );
    },
    getClassCheckbox() {
      return this.isEnabledCheckbox ? 'orange' : 'gray';
    },
    canCreateTag() {
      return UserRoles.USER !== this.userRole;
    },
    listedTags() {
      return this.tags.filter((item) => item?.value?.toUpperCase().includes(this.textTagScope));
    },
    tagsRelatedSelectedGarages() {
      let resultSelectedGarages = [];
      this.selectedTags.forEach((tagSelected) => {
        const garagesIdsTemp = this.tags.find((tag) => tag?.value === tagSelected || tag?.key === tagSelected).garageIds;
        resultSelectedGarages = [...resultSelectedGarages, ...garagesIdsTemp];
      });

      return Array.from(new Set([...resultSelectedGarages]));
    },
    isDisabledButtonApply() {
      const isEmptySelectedGarages = !this.selectedGarages || !this.selectedGarages.length;
      const isEmptySelectedTags = !this.selectedTags || !this.selectedTags.length;
      return isEmptySelectedGarages && isEmptySelectedTags;
    },
    typeButtonApply() {
      return this.isDisabledButtonApply ? '' : 'contained-orange';
    },
    firstOptionFilter() {
      return {
        label: `${this.firstOption.label} (${this.listedGarages.length})`,
        value: this.firstOption.value,
      };
    },
    secondOptionFilter() {
      return {
        label: `${this.secondOption.label} (${this.listedTags.length})`,
        value: this.secondOption.value,
      };
    },
    areAllGaragesSelected() {
      const selectedGaragesTemp = this.listedGarages.filter(garage=>this.selectedGarages?.includes(garage.key));
      return this.listedGarages?.length > 0 && selectedGaragesTemp?.length === this.listedGarages?.length;
    },
    areAllTagsSelected() {
      const selectedTagsTemp = this.listedTags.filter(tag=>this.selectedTags?.includes(tag.key) || this.selectedTags?.includes(tag.value))
      return  this.listedTags?.length > 0 && selectedTagsTemp?.length === this.listedTags?.length;
    },
    getClassBindingListContent(){
      const classBinding = {};  
      classBinding['multi-select-list__list--lg'] = this.height === 'lg';
      classBinding['multi-select-list__list--md'] = this.height === 'md';
      return classBinding;
    },
  },
  methods: {
    searchGarages(text) {
      this.textGarageScope = text.toUpperCase();
      if (this.textGarageScope.length) {
        const textListedGarages = this.garages.filter((item) =>
          item.value.toUpperCase().includes(this.textGarageScope)
        );
        const orderedGarageList = textListedGarages.filter((i) => this.selectedGarages.includes(i.key));

        this.listedGarages = orderedGarageList.concat(textListedGarages.filter((i) => !this.selectedGarages.includes(i.key)));
      }else{
        this.sortGarages();
      }
    },
    searchScope(text) {
      this.textTagScope = text.toUpperCase();
    },
    selectAllGarages(){
      if(this.areAllGaragesSelected){
        this.selectedGarages = [];
      }else{
        this.selectedGarages = this.listedGarages.map(garage=>garage.key);
      }
      this.selectedTags = [];
    },
    selectAllTags(){
      if(this.areAllTagsSelected){
        this.selectedTags = [];
      } else{
        this.selectedTags = this.listedTags.map(tag=>tag.key);
      }
      this.selectedGarages = this.tagsRelatedSelectedGarages;
      this.sortGarages();
    },
    updateSelectedGarages(selectedGarages) {
      this.selectedGarages = selectedGarages;
      this.selectedTags = [];
    },
    updateSelectedTags(selectedTags) {
      this.selectedTags = selectedTags;
      this.selectedGarages = this.tagsRelatedSelectedGarages;
      this.sortGarages();
    },
    updateOption({ key, value }) {
      this.openModalUpdateTag(key, value, this.selectedGarages);
    },
    checkAllGaragesDefault() {
      const hasSelectedGarages = this.initialSelectedGarageIds?.length > 0;
      if (!hasSelectedGarages) {
        this.selectAllGarages();
      }
    },
    apply() {
      const garagesTemp = this.listedGarages
        .filter((garage) => this.selectedGarages.includes(garage.key))
        .map((garage) => garage.key);
      const tagsTemp = this.listedTags
        .filter(tag=>this.selectedTags?.includes(tag.key) || this.selectedTags?.includes(tag.value))
        .map(tag=>tag.key);

      this.applyItemsSelected(garagesTemp, tagsTemp);
    },
    createTag() {
      const garagesTemp = this.listedGarages
        .filter((garage) => this.selectedGarages.includes(garage.key))
        .map((garage) => garage.key);
      this.openModalCreateTag(garagesTemp);
    },
    sortGarages(){
      if (this.selectedGarages?.length>0) {
        const orderedGarageList = this.garages.filter((i) => this.selectedGarages.includes(i.key));
        this.listedGarages = orderedGarageList.concat(this.garages.filter((i) => !this.selectedGarages?.includes(i.key)));
      }else{
        this.listedGarages = this.garages;
      }
    },
    selectedToggle(value){
      this.selectedOptionToggle(value);
      this.restartingSCroll();
    },
    restartingSCroll(){
      const container = this.$el.querySelector('.multi-select-list__list');
      container.scrollTop = 0;
    }
  },
};
</script>

<style lang="scss" scoped>
.multi-select-list {
  background-color: $white;
  min-width: 250px;
  width: 100%;
  border-radius: 5px;
  box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.16);
  display: table;
  &__mobile {
    width: 100%;
    border-radius: 5px;
    box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.16);
    display: table;
    &--max-width{
      min-width: 250px;
      width: 100%;
    }
    &__mobile {
      width: 100%;
      border-radius: 5px;
      box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.16);
      background: $white;
      &__list {
        padding: 0.5rem 1rem;
        border-bottom: solid 1px rgba(188, 188, 188, 0.5);
        height: 27.714rem;
        overflow-y: scroll;
      }
    }

    &__header {
      padding: .5rem 1rem;
      border-bottom: solid 1px rgba(188, 188, 188, 0.5);
      background-color: rgba(188, 188, 188, 0.1);
      &__search{
        margin-bottom: 0.571rem;
      }
    }
    &__all {
      padding: 0.5rem 1rem;
      border-bottom: solid 1px rgba(188, 188, 188, 0.5);
    }
    &__list {
      padding: 0.5rem 1rem;
      border-bottom: solid 1px rgba(188, 188, 188, 0.5);
      overflow-y: scroll;
      height: 22.357rem;
    }
  }

  &__header {
    padding: 0.5rem 1rem;
    border-bottom: solid 1px rgba(188, 188, 188, 0.5);
    background-color: rgba(188, 188, 188, 0.1);
    &__search {
      margin-bottom: 0.571rem;
    }
  }
  &__all {
    padding: 0.5rem 1rem;
    border-bottom: solid 1px rgba(188, 188, 188, 0.5);
  }
  &__list {
    padding: 0.5rem 1rem;
    border-bottom: solid 1px rgba(188, 188, 188, 0.5);
    overflow-y: scroll;
    &--lg{
      height: 22.357rem;
    }
    &--md{
      height: 8.357rem;
    }
  }
  &__save {
    padding: 0.5rem 1rem;
    border-bottom: solid 1px rgba(188, 188, 188, 0.5);
  }
  &__options {
    padding: 0.5rem 1rem;
    border-bottom: solid 1px rgba(188, 188, 188, 0.5);
  }
}
</style>
