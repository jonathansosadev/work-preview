<template>
  <DropdownBase 
    class="dropdown-user" 
    :disabled="!enabled" 
    :active="isActive" 
    ref="dropdown" 
    track-id="topfilter-user"
    type="new-design"
    iconColor="blue"
    caretColor="blue"
  >
    <template slot="icon">
      <i class="icon-gs-group"></i>
    </template>
    <template slot="label">{{ displayName(currentUser.name) }}</template>
    <template>
      <DropdownContent
        :items="items"
        v-model="activeUser"
        :searchCallback="searchCallback"
        :limit="30"
      />
    </template>

    <template slot="dropdown-label">{{ $t_locale('components/global/DropdownUser')('dropdownLabel') }}</template>
    <template slot="modal-title">{{ $t_locale('components/global/DropdownUser')('placeHolder') }}</template>
    <template slot="mobile-content">
      <SelectList :items="items" v-model="activeUser" :searchCallback="searchCallback" :limit="30">
        <template slot="icon">
          <i class="icon-gs-group"></i>
        </template>
        <template slot="title">{{ $t_locale('components/global/DropdownUser')('listLabel') }}</template>
      </SelectList>
    </template>
  </DropdownBase>
</template>

<script>
import DropdownBase from "./DropdownBase";
import SelectList from "./SelectList";

export default {
  name: 'DropdownUser',
  components: {
    DropdownBase,
    SelectList
  },
  props:{
    availableUsers: {
      type: Array,
      default: () => []
    },
    currentUserId: {
      type: String,
      default: ''
    },
    setCurrentUser: {
      type: Function,
      default: () => console.error('DropdownUser.vue :: setCurrentUser not set')
    }
  },
  data() {
    return {
      defaultUser: { name: "ALL", userId: null }
    };
  },

  computed: {
    isActive() {
      return this.currentUser.name !== "ALL";
    },

    filteredAvailableUsers() {
      const filteredList = this.availableUsers.filter((e) => e.userId && e.name) || [];
      return filteredList;
    },

    enabled() {
      return this.items.length > 1;
    },

    currentUser() {
      return (
        (this.availableUsers &&
          this.availableUsers.find(
            user => user.userId === this.currentUserId
          )) || { name: "ALL", userId: null }
      );
    },

    items() {
      return [
        {
          label: this.displayName("ALL"),
          key: "ALL",
          value: this.defaultUser
        },
        ...this.filteredAvailableUsers.map(f => ({
          key: f.userId,
          label: this.displayName(f.name),
          value: f
        }))
      ];
    },

    activeUser: {
      get() {
        return {
          key: this.currentUser.userId,
          label: this.displayName(this.currentUser.name),
          value: this.currentUser
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

        this.setUser(item.value.userId);
        return item;
      }
    }
  },

  methods: {
    searchCallback(search, i) {
      if (search) {
        return i && i.label && i.label.toLowerCase().indexOf(search.toLowerCase()) > -1;
      }

      return true;
    },

    displayName(label) {
      return label === "ALL" ? this.$t_locale('components/global/DropdownUser')(label) : label;
    },

    async setUser(user) {
      await this.setCurrentUser(user)
      this.dropdownOpen = false;
    }
  }
};
</script>
