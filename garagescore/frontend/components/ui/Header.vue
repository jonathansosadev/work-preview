<template>
  <div class="header" :class="classBinding">
    <ButtonOpenSidebar @click="toggleSidebar" class="header__button-sidebar" />
    <div class="header__logo">
      <nuxt-link class="header__logo-link" :to="{ name: 'cockpit' }">
        <img class="header__logo-img" src="/logo/logo-custeed-picto.svg" />
      </nuxt-link>
    </div>
    <div class="header__content">
      <slot />
    </div>
  </div>
</template>

<script>
import ButtonOpenSidebar from "./ButtonOpenSidebar";

export default {
  components: { ButtonOpenSidebar },

  computed: {
    classBinding() {
      return {
        "header--tiny": this.$store.getters["sidebarTiny"]
      };
    }
  },

  methods: {
    toggleSidebar() {
      this.$store.dispatch("toggleSidebarTiny", false);
      this.$store.dispatch("toggleSidebar");
    }
  }
};
</script>


<style lang="scss" scoped>
.header {
  background-color: $custeedBrandColor;
  box-shadow: 0 0 40px -20px rgba($black, 0.75);
  height: 3.5rem;
  padding: 0 1rem;

  &__content {
    display: flex;
    flex-flow: row;
    width: 100%;
    align-items: center;
  }

  &__button-sidebar {
    padding-left: 0;
    margin-right: 1rem;
  }

  &__logo {
    height: 100%;
  }

  &__logo-link {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  &__logo-img {
    height: 70%;
    width: auto;
  }
}

@media (min-width: $breakpoint-min-md) {
  .header {
    &__button-sidebar {
      display: none;
    }

    &__logo {
      display: none;
    }
  }
}
@media (max-width: $breakpoint-min-md) {
  .header {
    &__content {
      overflow-x: auto;
    }
    &__logo {
      margin-right: 1rem;
    }
  }
}
</style>
