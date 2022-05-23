<template>
  <div v-if="isExternalLink"  class="sidebar-item" >
    <a target="_blank" :href="to" class="sidebar-item__item">
      <div class="sidebar-item__icon">
        <i class="sidebar-item__icon-i" :class="icon"></i>
      </div>
      <div class="sidebar-item__label">
        <div class="sidebar-item__label-value"> {{ $t_locale('components/ui/sidebar/SidebarItem')(code, {}, code) }}</div>
      </div>
    </a>
    <div class="sidebar-item__separator"></div>
  </div>
  <div v-else class="sidebar-item" :class="classBinding" v-on="listeners">
    <nuxt-link
      class="sidebar-item__item"
      :class="classBindingItem"
      :to="to"
      :event="mainMenuDisabled ? null : 'click'"
      :exact-active-class="isExactSidebarItem"
      :active-class="isActiveSidebarItem"
      :exact="exact"
    >
      <div class="sidebar-item__icon">
        <i v-if="icon" class="sidebar-item__icon-i" :class="icon" />
        <img v-else-if="iconSvg" :src="iconSvg" class="sidebar-item__icon-i sidebar-item__icon-i--svg" />
      </div>
      <div class="sidebar-item__label">
        <div class="sidebar-item__label-value">{{ $t_locale('components/ui/sidebar/SidebarItem')(code, {}, code) }}</div>
        <div v-if="preorder" class="sidebar-item__label-preorder">{{ $t_locale('components/ui/sidebar/SidebarItem')("preorder") }}</div>
      </div>
    </nuxt-link>
    <div class="sidebar-item__submenu" v-if="showSubmenu && !tiny">
      <nuxt-link
        class="sidebar-item__submenu-item"
        :class="classBindingSubItem(item)"
        :exact-active-class="isExactSidebarSubItem"
        :active-class="isActiveSidebarSubItem"
        v-for="(item, index) in submenu"
        :key="index"
        :to="item.to"
        :event="disabled ? null : 'click'"
        @click.native.stop="onSubmenuItemClick(item)"
      >
        <span class="sidebar-item__submenu-item-label">
          {{ $t_locale('components/ui/sidebar/SidebarItem')(item.code, {}, item.code) }}
        </span>
        <div v-if="item.preorder" class="sidebar-item__label-preorder">{{ $t_locale('components/ui/sidebar/SidebarItem')("preorder") }}</div>

      </nuxt-link>
    </div>
    <div class="sidebar-item__separator"></div>
  </div>
</template>

<script>
export default {
  props: {
    activeSidebarCode: String,
    alias: { required: false },
    code: String,
    disabled: { type: Boolean, default: false },
    exact: { type: Boolean, default: true },
    hasSidebarSubmenu: Function,
    icon: String,
    iconSvg: String,
    isNew: { type: Boolean, default: false },
    preorder: { type: Boolean, default: false },
    setFromRowClick: Function,
    showSubmenu: Boolean,
    sidebarTiny: Boolean,
    submenu: {
      type: Array,
      default() {
        return [];
      }
    },
    to: [String, Object],
    toggleSidebar: Function,
  },

  data() {
    return {
      restoreTiny: false
    };
  },

  computed: {
    mainMenuDisabled() {
      return this.haveSubMenu || this.disabled;
    },
    haveSubMenu() {
      return this.submenu?.length > 0;
    },
    isExternalLink() {
      return typeof this.to === 'string' && this.to.indexOf('http') === 0
    },
    tiny() {
      return this.sidebarTiny;
    },

    listeners() {
      return {
        ...this.$listeners,

        click: () => {
          this.onSetFromRowClick(null);
          if (this.submenu.length === 0) {
            this.onToggleSidebar(false);
          }
          // this.$listeners.click; Why ?
          this.onHasSidebarSubmenu(this.submenu && this.submenu.length > 0);
        }
      };
    },

    isActiveSidebarItem() {
      if (this.code === this.activeSidebarCode) {
        return 'sidebar-item__item--active'
      }
      return '';
    },

    isActiveSidebarSubItem() {
      if (this.code === this.activeSidebarCode) {
        return 'sidebar-item__submenu-item--active'
      }
      return '';
    },

    isExactSidebarSubItem() {
      if (this.code === this.activeSidebarCode) {
        return 'sidebar-item__submenu-item--exact'
      }
      return '';
    },

    isExactSidebarItem() {
      if (this.code === this.activeSidebarCode) {
        return 'sidebar-item__item--exact'
      }
      return '';
    },

    classBinding() {
      return {
        'sidebar-item--tiny': this.tiny
      };
    },

    classBindingItem() {
      return {
        'sidebar-item__item--disabled': this.disabled
      };
    }
  },

  methods: {
    onSubmenuItemClick(item) {
      this.onSetFromRowClick(null);
      this.onToggleSidebar(false);
      this.onHasSidebarSubmenu(false);
      this.$router.push(item.to);
    },
    onToggleSidebar(value) {
      if (this.toggleSidebar) {
        this.toggleSidebar(value);
      } else {
        this.$store.dispatch('toggleSidebar', value);
      }
    },
    onHasSidebarSubmenu(value) {
      if (this.hasSidebarSubmenu) {
        this.hasSidebarSubmenu(value);
      } else {
        this.$store.dispatch('hasSidebarSubmenu', value);
      }
    },
    onSetFromRowClick(value) {
      if (this.setFromRowClick) {
        this.setFromRowClick(value);
      } else {
        this.$store.dispatch('cockpit/setFromRowClick', value);
      }
    },
    classBindingSubItem(item) {
      return {
        'sidebar-item__submenu-item--active':
          this.isActive(item.to) || this.isActive(item.alias) // vue-router didn't handle query properly
      };
    },

    isActive(to) {
      return (
        (to && this.$route.path === to) ||
        (to === '/cockpit/admin/users' &&
          this.$route.path === '/cockpit/admin/garages')
      );
    }
  }
};
</script>

<style lang="scss" scoped>
$padding: 1.5rem;

.sidebar-item {
  &__separator {
    height: 1px;
    width: 90%;
    background-color: rgba($grey, .5);
    // position: absolute;
    margin-left: 5%;
  }

  &__item {
    height: 3.5rem;
    padding-left: $padding;
    display: flex;
    flex-flow: row;
    align-items: center;
    user-select: none;
    cursor: pointer;

    background-color: $white;
    color: $dark-grey;
    font-size: 1.15rem;
    text-decoration: none;

    &--active {
      background-color: rgba($grey, 0.2);
      color: $blue!important;
      font-weight: 700;
    }

    &:hover {
      color: $greyish-brown;
      background-color: rgba($grey, 0.2);
    }

    &--exact,
    &--active-item {
      font-weight: 700;
      color: $blue!important;
      background-color: rgba($grey, 0.2);
    }

    &:focus {
      font-weight: 700;
      color: $blue!important;
      background-color: rgba($grey, 0.2);
    }

    &--disabled {
      color: $grey;
      cursor: help;
      user-select: none;

      &:hover,
      &:focus {
        color: $grey;
      }
    }
  }

  &__icon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 1rem;
  }

  &__icon-i {
    font-size: 1.3rem;
    &--svg {
      max-width: 1.3rem;
    }
  }

  &__label {
    flex: 1;
    color: inherit;
    white-space: nowrap;
    margin-left: 1rem;

    &-new, &-preorder {
      font-size: 0.7rem;
      font-weight: 400;
      color: $orange;
    }
  }

  // --------------------
  // Submenu ------------
  // --------------------

  &__submenu {
    display: flex;
    flex-flow: column;
  }

  &__submenu-item {
    padding: 0.5rem;
    padding-left: 3.6rem;
    text-decoration: none;
    color: $dark-grey;

    &--active {
      color: $blue!important;
      font-weight: 700;
    }

    &:hover,
    &:focus {
      color: $blue!important;
    }
  }

  &--tiny {
    .sidebar-item {
      &__label {
        display: none;
      }

      &__item {
        padding-left: 0;
      }

      &__icon {
        width: 100%;
      }
    }
  }
}
</style>
