<template>
  <DropdownBase
  class="dropdown-cockpit-type"
  :disabled="!enabled"
  :active="isActive"
  ref="dropdown"
  track-id="topfilter-period"
  type="new-design"
  iconColor="blue"
  caretColor="blue">
    <template slot="icon">
      <i class="icon-gs-car-repair-pin"></i>
    </template>
    <template slot="label">{{ this.labelHelper(currentCockpitType) }}</template>
    <template>
      <DropdownContent :items="items" v-model="activeCockpitType" />
    </template>

    <template slot="dropdown-label">{{ $t_locale('components/global/DropdownCockpitTypes')('dropdownLabel') }}</template>
    <template slot="modal-title">{{ $t_locale('components/global/DropdownCockpitTypes')('placeHolder') }}</template>
    <template slot="mobile-content">
      <SelectList :items="items" v-model="activeCockpitType">
        <template slot="icon">
          <i class="icon-gs-repair"></i>
        </template>
        <template slot="title">{{ $t_locale('components/global/DropdownCockpitTypes')('listLabel') }}</template>
      </SelectList>
    </template>
  </DropdownBase>
</template>

<script>
  import DropdownBase from "./DropdownBase";
  import SelectList from "./SelectList";
  export default {
    name: "DropdownCockpitTypes",
    components: { DropdownBase, SelectList },
    data() {
      return {
        dropdownOpen: false,
      }
    },
    props: {
      availableCockpitTypes: {
        type: Array,
        default: () => []
        },
      currentCockpitType: {
        type: String,
        default: ""
        },
      setCurrentCockpitType: {
        type: Function,
        default: () =>({})
        }
    },
    computed: {
      activeCockpitType: {
        get() {
          return {
            key: this.currentCockpitType,
            label: this.labelHelper(this.currentCockpitType),
            value: this.currentCockpitType
          };
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

          this.setCurrentCockpitType(item.id);

          return item.id;
        }
      },

      items() {
        let items = [];
        items.push(...this.availableCockpitTypes.map(a => ({
          key: a,
          id: a,
          label: this.labelHelper(a)
        })));
        return items;
      },

      isActive() {
        return true;
      },
      enabled() {
        return this.availableCockpitTypes.length > 1
      }
    },

    methods: {
      labelHelper(cockpitType) {
        return this.$t_locale('components/global/DropdownCockpitTypes')(cockpitType);
      }
    }
  }
</script>
