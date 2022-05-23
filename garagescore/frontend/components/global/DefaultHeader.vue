<template>
  <div class="app-header">
    <Header class="app-header__main">
      <div class="app-header__left">
      </div>
      <div class="app-header__right">
        <UserProfile/>
      </div>
    </Header>
  </div>
</template>

<script>
import UserProfile from './UserProfile.vue';

export default {
  components: { UserProfile }
}
</script>

<style lang="scss" scoped>
.app-header {

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
    display: flex;
    justify-content: flex-end;
    margin-right: 1rem;
  }


  &__part {
    &:not(:last-child) {
      border-right: 1px solid lighten($black, 25);
    }
  }
}
</style>
