<template>
  <div class="sidebar" :class="classBinding">
    <div class="sidebar__header">
      <slot name="header"></slot>
    </div>
    <div class="sidebar__content custom-scrollbar">
      <slot />
    </div>
    <div class="sidebar__footer">
      <div class="sidebar__footer-content">
        <slot name="footer" />
      </div>
      <button
        class="sidebar__footer-sidebar-tiny"
        :class="{ 'sidebar__footer-sidebar-tiny--tiny': tiny }"
        @click="toggleSidebarTiny"
      >
        <i class="icon-gs-right" v-if="tiny"></i>
        <i class="icon-gs-left" v-else></i>
      </button>
    </div>
  </div>
</template>

<script>
import SidebarItem from "./SidebarItem.vue";

export default {
  components: { SidebarItem },

  mounted() {
    window.addEventListener("resize", this.handleResize);
    this.handleResize();
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.handleResize);
  },

  methods: {
    toggleSidebarTiny() {
      this.$store.dispatch("toggleSidebarTiny");
    },

    handleResize() {
      const clientWidth = window.innerWidth;

      // phone breakpoint
      if (clientWidth < 768) {
        this.$store.dispatch("toggleSidebar", false);
      } else if (clientWidth < 1280) {
        this.$store.dispatch("toggleSidebarTiny", true);
      } else {
        this.$store.dispatch("toggleSidebarTiny", false);
      }
    },

    closeSidebar() {
      this.$store.dispatch("toggleSidebarTiny", false);
    }
  },

  computed: {
    tiny() {
      return this.$store.getters["sidebarTiny"];
    },

    classBinding() {
      return {
        "sidebar--tiny": this.tiny
      };
    }
  }
};
</script>


<style lang="scss" scoped>
.sidebar {
  height: 100vh;
  width: $aside-mobile-size;
  box-shadow: 20px 20px 10px -20px rgba(0, 0, 0, 0.3);
  position: relative;

  display: flex;
  flex-flow: column;
  transition: all 0.3s;

  &--tiny {
    width: $aside-tiny-size;
  }

  &__content {
    flex: 1;
    display: flex;
    flex-flow: column;
    background-color: $white;
    overflow: auto;
  }

  &__footer {
    background-color: $white;
    padding-bottom: 3.5rem;
  }

  &__footer-sidebar-tiny {
    width: 100%;
    height: 3.5rem;
    display: none;
    justify-content: flex-end;
    align-items: center;
    border: none;
    background-color: transparent;
    cursor: pointer;
    color: $grey;
    outline: 0;

    &--tiny {
      justify-content: center;
    }
  }
}

@media (min-width: $breakpoint-max-lg) {
  .sidebar {
    width: $aside-size;

    &--tiny {
      width: $aside-tiny-size;
    }

    &__footer {
      padding-bottom: initial;
    }

    &__footer-sidebar-tiny {
      display: flex;
    }
  }
}
</style>
