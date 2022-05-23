<template>
  <div class="dropdown-user-profile" v-click-outside="closeDropdown" @closeDropdown="closeDropdown">
    <button type="button" class="dropdown-user-profile__button" @click="toggleDropdown">
      <div class="dropdown-user-profile__label">
        <span class="dropdown-user-profile__username">{{ userShortName }}</span>
        <i class="icon-gs-down dropdown-user-profile__icon-chevron"></i>

        <i class="icon-gs-profile dropdown-user-profile__icon"></i>
      </div>
    </button>
    <div class="dropdown-user-profile__dropdown" v-if="dropdownOpen">
      <UserProfileContent @myProfileClick="dropdownOpen = false" :mode="mode" :currentUser="currentUser"/>
    </div>
  </div>
</template>


<script>
import { abbrevateName } from "~/util/user";
import UserProfileContent from "~/components/global/UserProfileContent.vue";

export default {
  components: { UserProfileContent },

  props: {
    mode: String,
    currentUser: Object
  },

  data() {
    return {
      dropdownOpen: false
    };
  },

  computed: {
    userShortName() {
      if (this.currentUser && this.currentUser.email) {
        return abbrevateName(this.currentUser.firstName, this.currentUser.lastName, this.currentUser.email);
      }
      return "";
    },
  },

  methods: {

    toggleDropdown() {
      this.dropdownOpen = !this.dropdownOpen;
    },

    closeDropdown() {
      this.dropdownOpen = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.dropdown-user-profile {
  position: relative;
  min-width: auto;
  height: 100%;
  color: $white;
  display: flex;
  align-items: center;

  &__button {
    display: block;
    background-color: transparent;
    border: none;
    color: inherit;
    height: 100%;
    width: 100%;
    outline: 0;

    &:hover {
      cursor: pointer;
    }

    * + * {
      margin-left: 7px;
    }

    padding: 0;
  }

  &__icon {
    color: inherit;

    font-weight: bold;
    color: inherit;
    position: relative;
    top: 0.1rem;
    font-size: 1.5rem;
    padding-right: 0.5rem;
  }

  &__icon-chevron {
    color: inherit;
    font-size: 10px;
  }

  &__username {
    display: block;
    flex-grow: 1;
    color: inherit;
    font-weight: 700;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    text-align: left;
  }

  &__dropdown {
    position: absolute;
    bottom: -1rem;
    transform: translateY(100%);
    right: 0;
    min-width: 100%;
    max-height: 80vh;
    background-color: $white;
    color: $black;
    box-shadow: 0 0 3px 0 rgba($black, 0.16);
    z-index: 2;
    width: 25rem;
    border-radius: 5px;
  }

  &__label {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height: 100%;
    min-width: 4rem;
    max-width: 10rem;
    margin-left: 1rem;
  }
}
</style>

