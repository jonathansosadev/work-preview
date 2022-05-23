<template>
  <DropdownBase
    class="dropdown-dms"
    :disabled="!enabled"
    :active="isActive"
    ref="dropdown"
    track-id="topfilter-dms"
    type="new-design"
    iconColor="blue"
    caretColor="blue"
  >
    <template slot="icon">
      <i class="icon-gs-group"></i>
    </template>
    <template slot="label">{{ displayName(currentDMS.frontDeskUserName) }}</template>
    <template>
      <DropdownContent
        :items="items"
        v-model="activeDMS"
        :searchCallback="searchCallback"
        :limit="30"
      />
    </template>

    <template slot="dropdown-label">{{ $t_locale('components/global/DropdownDMS')('dropdownLabel') }}</template>
    <template slot="modal-title">{{ $t_locale('components/global/DropdownDMS')('placeHolder') }}</template>
    <template slot="mobile-content">
      <SelectList :items="items" v-model="activeDMS" :searchCallback="searchCallback" :limit="30">
        <template slot="icon">
          <i class="icon-gs-group"></i>
        </template>
        <template slot="title">{{ $t_locale('components/global/DropdownDMS')('listLabel') }}</template>
      </SelectList>
    </template>
  </DropdownBase>
</template>

<script>
import DropdownBase from "./DropdownBase";
import SelectList from "./SelectList";

export default {
  name: "DropdownDMS",
  components: {
    DropdownBase,
    SelectList
  },
  props: {
    availableDms: {
      type: Array,
      default: () => []
    },
    currentGarageId:{
      type: String,
      default: ''
    },
    currentDMS:{
      type: Object,
      default: () => {}
    },
    setCurrentDMS: {
      type: Function,
      default: () => console.error('DropdownDMS.vue :: setCurrentDMS not set')
    }
  },
  data() {
    return {
      defaultDms: { frontDeskUserName: "ALL_USERS", garageId: null }
    };
  },

  computed: {
    isActive() {
      return this.currentDMS.frontDeskUserName !== "ALL_USERS";
    },

    enabled() {
      return this.items.length > 2
    },

    filteredAvailableDms() {
      let filteredList = this.availableDms.filter((e) => e.frontDeskUserName) || [];
      return filteredList;
    },

    items() {
      return [
        {
          label: this.displayName("ALL_USERS"),
          key: "ALL_USERS",
          value: this.defaultDms
        },
        ...this.filteredAvailableDms.map(f => ({
          key: f.frontDeskUserName,
          label: this.displayName(f.frontDeskUserName),
          value: f
        }))
      ];
    },

    activeDMS: {
      get() {
        return {
          key: this.currentDMS.frontDeskUserName,
          label: this.displayName(
            this.currentDMS.frontDeskUserName
          ),
          value: this.currentDMS
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

        this.setCurrentDMS(item.value);
        return item;
      }
    }
  },

  methods: {
    displayName(label) {
      return label === "UNDEFINED" || label === "ALL_USERS"
        ? this.$t_locale('components/global/DropdownDMS')(label)
        : label;
    },

    searchCallback(search, i) {
      if (search) {
        return (i.label || "").toLowerCase().indexOf(search.toLowerCase()) > -1;
      }
      return true;
    },
  }
};
</script>
