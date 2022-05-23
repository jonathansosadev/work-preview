<template>
  <div class="user-profile-content">
    <div class="user-profile-content__body">
      <div class="user-profile-content__user-info">
        <i class="user-profile-content__user-info-icon icon-gs-profile"/>
        <div class="user-profile-content__info">
          <AppText tag="span" bold class="user-profile-content__text">{{ userFullName }}</AppText>
          <AppText tag="span" class="user-profile-content__text user-profile-content__text--email">{{ userEmail }}</AppText>
        </div>
      </div>
      <div class="user-profile-content__user-info">
        <div class="user-profile-content__user-info__role">
          <UserRole :userRole="userRole"/>
        </div>
      </div>
    </div>
    <div class="user-profile-content__footer">
      <div class="user-profile-content__footer-part">
        <Button type="contained-orange" @click="openMyProfile">
          <template slot="left"><i class="icon-gs-user user-profile-content__profile-icon" /></template>
          <span class="user-profile-content__profile-label">{{ $t_locale('components/global/UserProfileContent')("MyAccount") }}</span>
        </Button>
      </div>
      <div class="user-profile-content__footer-part">
        <Button @click="disconnect" :type="mode === 'desktop' ? 'contained-grey': 'white-border'">
          <template slot="left"><i class="icon-gs-leave" /></template>
          <span class="user-profile-content__footer-label"> {{ $t_locale('components/global/UserProfileContent')("Logout") }}</span>
        </Button>
      </div>
    </div>
  </div>
</template>


<script>
import { abbrevateName } from '~/util/user';
import UserRole from "~/components/global/UserRole";

export default {
  name: 'UserProfileContent',
  components: { UserRole },
  props: {
    mode: String,
    currentUser: Object
  },

  computed: {
    userFullName() {
      if (!this.currentUser || !this.currentUser.email) return '';
      return abbrevateName(this.currentUser.firstName, this.currentUser.lastName, this.currentUser.email);
    },
    userEmail() {
      return (this.currentUser && this.currentUser.email) || '';
    },
    userRole() {
      return this.currentUser && this.currentUser.role;
    }
  },

  methods: {
    disconnect() {
      window.location = '/auth/signout';
    },
    openMyProfile() {
      this.$emit('myProfileClick');
      this.$router.push('/cockpit/admin/profile');
    }
  }
}
</script>

<style lang="scss" scoped>
.user-profile-content {
  background: $white;
  border-radius: 5px;

  &__header {
    background-color: $dark-grey;
    width: 100%;
    display: flex;
    flex-flow: column;
    justify-content: center;
    color: $white;
    height: 3.5rem;
  }

  &__header-part {
    padding: 0 0.5rem;
  }

  &__text--email {
    padding-top: .2rem!important;
    font-size: 12px;
  }

  &__body {
    background-color: $dark-grey;
    padding: 1.5rem 1rem 10px 1rem;
    border-radius: 5px;
  }

  &__footer {
    border-top: 1px solid $white;
    background-color: $dark-grey;
    border-radius: 0 0 5px 5px;
    display: flex;
    flex-flow: row;
    align-items: center;
    justify-content: center;
    padding: 1rem 0;
    padding-left: 4rem;
  }

  &__footer-part {
    flex: 1;
    display: flex;
    align-items: stretch;
  }

  &__text {
    display: block;
  }

  &__user-info {
    display: flex;
    flex-flow: row;
    align-items: center;
    color: $white;

    &__role {
      padding-top: .5rem;
      padding-left: 3rem;
    }
  }

  &__user-info-icon {
    font-size: 2.5rem;
    margin-right: .5rem;
  }

  &__actions {
    padding: 0.5rem;
    display: flex;
    margin-left: 3.5rem;
  }
}

@media (min-width: $breakpoint-min-md) {
  .user-profile-content {
    &__header {
      background-color: $very-light-grey;
      border-bottom: 1px solid $light-grey;
    }

    &__header-text {
      color: $dark-grey;
    }

    &__header-part {
      padding: 0 1rem;
    }

    &__body {
      background-color: $white;
    }

    &__footer {
      border-top: 1px solid $light-grey;
      background-color: $white,
    }

    &__header {
      color: $black;
    }

    &__user-info {
      color: $black;
    }

    &__user-info-icon {
      color: $grey;
    }

    &__text {

      &--email {
        color: $dark-grey;
      }
    }

    &__actions {
      padding: 0 0 1rem 0.5rem;
      margin-left: 4rem;
    }
  }
}
</style>
