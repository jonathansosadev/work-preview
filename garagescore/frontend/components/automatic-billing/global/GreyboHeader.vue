<template>
  <div class="app-header">
    <Header class="app-header__main">
      <div class="app-header__left">
      </div>
      <div class="app-header__right">
        <a
          class="app-header__link"
          href="/cockpit"
          target="_blank"
          v-tooltip="{ content: 'Cockpit' }"
        >
          <i class="app-header__icon icon-gs-gauge-dashboard" />
        </a>
        <div class="app-header__user-profile">
          <UserProfile mode="desktop" :currentUser="currentUser" />
        </div>
      </div>
    </Header>
  </div>
</template>

<script>
import UserProfile from '~/components/global/UserProfile.vue';

export default {
  components: { UserProfile },
  props: {
    currentUser: Object
  }
}
</script>

<style lang="scss" scoped>
.app-header {

  &__icon {
    color: $white;
    display: block;
    margin-right:1rem;
    font-size:1.5rem;
  }

  &__link {
    text-decoration:none;
  }

  &__main {
    display: flex;
    flex-flow: row;
    justify-content: space-between;
    align-items: center;
  }

  &__left {
    display: flex;
    height: 100%;
  }

  &__right {
    height: 100%;
    display: none;
    justify-content: flex-end;
    align-content: center;
    align-items: center;
    margin-right: $separator; // REMOVE THIS
  }
}

@media (min-width: $breakpoint-min-md) {
  .app-header {
    &__right {
      flex: 1;
      display: flex;
    }

    &__left {
      flex: initial;
    }

    &__link {
      display: block;
    }


    &__user-profile {
      display: block;
    }
  }
}
</style>
