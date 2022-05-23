<template>
  <Sidebar class="greybo-sidebar" :class="classBinding">
    <template slot="header">
      <div class="greybo-sidebar__header">
        <UserProfileContent class="greybo-sidebar__header-user-profile" :currentUser="currentUser"/>
        <div class="greybo-sidebar__header-logo">
          <nuxt-link class="greybo-sidebar__header-logo-link" :to="{ name: 'cockpit' }">
            <img src="/logo/logo-custeed-long.svg" class="greybo-sidebar__logo" v-if="!tiny"/>
            <img src="/logo/logo-custeed-picto.svg" class="greybo-sidebar__logo" v-else/>
          </nuxt-link>
        </div>
      </div>
    </template>

    <SidebarItem v-for="(item, index) in menu" :key="index" v-bind="item" @click="item.onClick ? item.onClick : (e) => {}"/>
  </Sidebar>
</template>


<script>
import UserProfileContent from '~/components/global/UserProfileContent';

export default {
  components: { UserProfileContent },
  props: {
    currentUser: Object
  },

  computed: {
    classBinding() {
      return {
        'grey-bo-sidebar--tiny': this.tiny,
      }
    },

    tiny() {
      return this.$store.getters['sidebarTiny'];
    },

    hasAccessToGreyboRGPD() {
      return this.$store.getters["auth/hasAccessToGreyboRGPD"];
    },

    menu() {
      const menu = [
        { code: 'menu_greybo_release', icon: 'fas fa-road', to: 'https://custeed.notion.site/1d4c620d990a4e93aaacba41f5430e26?v=77a387a3494247e6bcbcba923a47ec02' },
        { code: 'menu_greybo_products', icon: 'fas fa-road', to: 'https://custeed.notion.site/1d4c620d990a4e93aaacba41f5430e26?v=2ba272d2da1344e9b884d1fdeffe6790' },
        { code: 'menu_greybo_ideabox', icon: 'fas fa-lightbulb', to: '/grey-bo/ideabox' },
        { code: 'menu_greybo_survey', icon: 'icon-gs-phone-email', to: '/grey-bo/test-survey' },
        { code: 'menu_greybo_campaing_preview', icon: 'icon-gs-eye', to: '/grey-bo/campaingPreview' },
        { code: 'menu_greybo_billing', icon: 'icon-gs-money-card', to: '/grey-bo/automatic-billing' },
        { code: 'menu_greybo_monthly_summary', icon: 'icon-gs-file-text', to: '/grey-bo/monthly-summary' },
      ];
      if (this.hasAccessToGreyboRGPD) {
        menu.push({ code: 'menu_greybo_rgpd', icon: 'icon-gs-user-square', to: '/grey-bo/rgpd' });
      }
      return menu;
    },
  },

  methods: {
    goTo(route) {
      return () => this.$router.push(route);
    }
  }
}
</script>

<style lang="scss" scoped>
.greybo-sidebar {
  &__footer-actions {
    display: flex;
    align-items: center;
    justify-content: center;

    border-bottom: 1px solid $grey;
    padding-bottom: 1rem;
  }

  &__header-logo {
    background-color: $custeedBrandColor;
    height: 3.5rem;
    display: none;
  }

  &__header-logo-link {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  &__logo {
    width: auto;
    height: 100%;
    box-sizing: border-box;
    padding: 0.25rem;
  }

  &__header-user-profile {
    display: block;
  }
}

@media (min-width: $breakpoint-min-md) {
  .greybo-sidebar {
    &__header-user-profile {
      display: none;
    }

    &__header-logo {
      display: block;
    }
  }
}
</style>
