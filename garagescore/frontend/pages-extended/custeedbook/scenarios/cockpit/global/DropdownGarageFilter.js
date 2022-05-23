import Vue from 'vue'
import DropdownGarageFilter from '~/components/global/DropdownGarageFilter.vue';
import SelectableListOfValues from "~/components/global/SelectableListOfValues.vue";
import { UserRoles } from "~/utils/enumV2";

const test = Vue.component("DropdownGarageFilter", {
  name: 'DropdownGarageFilter',
  render: function (createElement) {
    return createElement(
      'div',
      [
        createElement(DropdownGarageFilter, {
          ref: 'DropdownGarageFilter',
          props: {
            userRole: this.userRole,
            garages: this.garages,
            availableGArages: this.availableGArages,
            applyItemsSelected: this.applySelected,
            createNewTag: this.createTag,

            selectedGarageIds: this.selectedGarageIds,
            selectedTags: this.selectedTags,
            setGarageFilterMode: this.setGarageFilterMode,
            optionSelected: this.optionSelected,
            setSelectedGarages: this.setSelectedGarages,
            width: this.width,
            height: this.height,
            saveOption: this.saveOption,
          },
        }),
        createElement('hr'),
        createElement('div', this.result)
      ]
    )
  },
  components: { DropdownGarageFilter },
  props: {
    garages: {
      type: Array,
      default: () => []
    },
    availableGArages: {
      type: Array,
      default: () =>[]
    },
    userRole: {
      type: String,
      default: ''
    },
    selectedGarageIds: {
      type: Array,
      default: () => []
    },
    selectedTags: {
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
  },
  data: function() {
		return {
      result: '',
      optionSelected: 'garages',
		}
  },
  methods: {
    applySelected(garagesSelected) {
      this.result = `Filters values: Garages(${JSON.stringify(garagesSelected)})}) `
      this.selectedGarageIds = garagesSelected
      this.closeDropdown()
    },
    createTag(garagesSelected) {
      this.result = `Open modal with this values: Garages(${JSON.stringify(garagesSelected)})`
      this.closeDropdown()
    },
    closeDropdown() {
      // Close dropdown mobile on change
      this.$refs.DropdownGarageFilter &&
      this.$refs.DropdownGarageFilter.$refs.dropdown &&
      this.$refs.DropdownGarageFilter.$refs.dropdown.$refs.dropdownMobile &&
      this.$refs.DropdownGarageFilter.$refs.dropdown.$refs.dropdownMobile.closeDropdown();

      // Close dropdown desktop on change
      this.$refs.DropdownGarageFilter &&
      this.$refs.DropdownGarageFilter.$refs.dropdown &&
      this.$refs.DropdownGarageFilter.$refs.dropdown.$refs.dropdown &&
      this.$refs.DropdownGarageFilter.$refs.dropdown.$refs.dropdown.closeDropdown();
    },
    setGarageFilterMode(optionSelected) {
      this.optionSelected = optionSelected;
    },
  },
  
});

export default {
  component: test,
  props: [
    {
      label: 'userRole',
      value: UserRoles.SUPER_ADMIN,
      inputType: 'select',
      inputOptions: UserRoles.values()
    },
    {
      label: 'garages',
      value: [
        { key: '1', value: 'Dupont' },
        { key: '2', value: 'Smith' },
        { key: '3', value: 'Smith 2' },
        { key: '4', value: 'Smith 3' },
        { key: '5', value: 'Smith 4' },
        { key: '6', value: 'Smith 5' },
      ],
      inputType: 'json',
    },
    {
      label: 'availableGArages',
      value: [
        { id: '1', brandNames: 'Dupont', tags :['1', '2'] },
        { id: '2', brandNames: 'Smith', tags: ['3']},
        { id: '2', brandNames: 'Smith', tags:['4', '5'] },
        { id: '3', brandNames: 'Smith 2' },
        { id: '4', brandNames: 'Smith 3' },
        { id: '5', brandNames: 'Smith 4' },
        { id: '6', brandNames: 'Smith 5' },
      ],
      value: [
        { key: '1', value: 'Plaque1', garageIds:['1', '2'] },
        { key: '2', value: 'Plaque2', garageIds:['3'] },
        { key: '3', value: 'plaque3', garageIds:['4', '5'] },
      ],
      inputType: 'json',
    },
    {
      label: 'selectedGarageIds',
      value: ['1', '3'],
      inputType: 'json',
    },
    {
      label: 'width',
      value: null,
      inputType: 'select',
      inputOptions: [
        null,
        'max-width'
      ]
    },
    {
      label: 'height',
      value: 'lg',
      inputType: 'select',
      inputOptions: [
        'lg',
        'md'
      ]
    },
    {
      label: 'saveOption',
      value: true,
      inputType: 'checkbox'
    },
  ],
};
