<template>
  <div class="form-user-profile">
    <Card class="form-user-profile">
      <div class="form-user-profile__part">
        <div class="form-user-profile__subpart">
          <CardUserData
            v-bind.sync="userData"
            :currentUserIsGarageScoreUser="currentUserIsGarageScoreUser"
            :userJobs="userJobs"
            class="form-user-profile__card"/>
        </div>
        <div class="form-user-profile__subpart">
          <CardUserJobPlace v-bind.sync="userJobPlace" class="form-user-profile__card"/>
        </div>
      </div>
      <div class="form-user-profile__part" :class="buttonClass">
        <Button
          type="orange"
          :disabled="!userData.isValid || !userJobPlace.isValid"
          @click="updateUser"
        >
          <i v-if="pending" class="icon-gs-loading" />
          <span v-if="!subscriptionProcessInProgress">{{$t_locale('components/cockpit/admin/FormUserProfile')("Save")}}</span>
          <span v-if="subscriptionProcessInProgress">{{$t_locale('components/cockpit/admin/FormUserProfile')("Confirm")}}</span>
        </Button>
      </div>
    </Card>
  </div>
</template>


<script>
import CardUserData from '~/components/cockpit/admin/CardUserData';
import CardUserJobPlace from '~/components/cockpit/admin/CardUserJobPlace';
import UserSubscriptionStatus from '~/utils/models/user-subscription-status.js';

export default {
  props: {
    user: Object,
    currentUserIsGarageScoreUser: Boolean,
    userJobs: Array
  },

  computed: {
    subscriptionProcessInProgress() {
      return this.user.id === this.$store.getters['auth/currentUserId'] && this.user.subscriptionStatus === UserSubscriptionStatus.INITIALIZED;
    },
    buttonClass() {
      return this.subscriptionProcessInProgress ? 'form-user-profile__part--right' : 'form-user-profile__part--center'
    },
    isMyProfile() {
      return (this.$store.state.route.name === 'cockpit-admin-profile');
    },
    subscriptionStatus() {
      return this.user.subscriptionStatus;
    }
  },

  components: {
    CardUserData,
    CardUserJobPlace,
  },

  data() {
    return {
      pending: false,
      displayModalAddFavorite: false,
      userData: {
        civility: this.user.civility,
        firstname: this.user.firstName,
        lastname: this.user.lastName,
        email: this.user.email,
        job: this.user.job,
        phone: this.user.phone,
        mobile: this.user.mobilePhone,

        isValid: false,
      },

      userJobPlace: {
        businessName: this.user.businessName,
        address: this.user.address,
        postCode: this.user.postCode,
        city: this.user.city,

        isValid: false,
      },
    }
  },

  methods: {
    async checkBeforeExit() {
      if (!this.displayModalAddFavorite) {
        const haveUnsavedChange = this.userData.civility !== this.user.civility
          || this.userData.firstname !== this.user.firstName
          || this.userData.lastname !== this.user.lastName
          || this.userData.email !== this.user.email
          || this.userData.job !== this.user.job
          || this.userData.phone !== this.user.phone
          // || this.userData.mobile !== this.user.mobilePhone
          || this.userJobPlace.address !== this.user.address
          || this.userJobPlace.businessName !== this.user.businessName
          || this.userJobPlace.postCode !== this.user.postCode
          || this.userJobPlace.city !== this.user.city;


        if (haveUnsavedChange && this.isMyProfile && (!this.userData.isValid || !this.userJobPlace.isValid)) {
          alert(this.$t_locale('components/cockpit/admin/FormUserProfile')('alert'));
          return false;
        }

        if (haveUnsavedChange) {
          const isConfirm = confirm(this.$t_locale('components/cockpit/admin/FormUserProfile')('confirm'));
          if (isConfirm) {
            await this.updateUser();
          }
        }

        return true;
      }
      
    },

    async updateUser() {
      this.pending = true;

      if (this.subscriptionStatus === UserSubscriptionStatus.INITIALIZED) {
        this.displayModalAddFavorite = true;
      }

      const res = await this.$store.dispatch('cockpit/admin/profile/updateUser', {
        civility: this.userData.civility,
        lastName: this.userData.lastname ? this.userData.lastname.trim() : null,
        firstName: this.userData.firstname ? this.userData.firstname.trim() : null,
        email: this.userData.email ? this.userData.email.trim() : null,
        phone: this.userData.phone,
        mobilePhone: this.userData.mobile,
        job: this.userData.job,

        businessName: this.userJobPlace.businessName ? this.userJobPlace.businessName.trim() : null,
        address: this.userJobPlace.address ? this.userJobPlace.address.trim() : null,
        postCode: this.userJobPlace.postCode ? this.userJobPlace.postCode.trim() : null,
        city: this.userJobPlace.city ? this.userJobPlace.city.trim(): null,
      });
      if (res.status === true) {
        alert(this.$t_locale('components/cockpit/admin/FormUserProfile')('updateUserSuccess'));
        } else {
        const [message, arg] = res.message.split('|');
        alert(this.$t_locale('components/cockpit/admin/FormUserProfile')(message, { arg }));
      }
      this.pending = false;
      if (!res) return;
      if (this.displayModalAddFavorite) {
        this.$store.dispatch('openModal', { component: 'ModalAddFavorite', props: {} })
      }
    },
  }
}
</script>

<style lang="scss" scoped>
.form-user-profile {
  display: flex;
  flex-direction: column;

  &__card {
    min-height: 21rem;
  }

  &__part {
    & + & {
      margin-top: 2rem;
      padding-top: 1rem;
      display: flex;
      justify-content: flex-end;
      border-top: 1px solid rgba($grey, .5);
    }

    &--center {
      justify-content: center;
      align-items: center;
    }

    &--right {
      justify-content: flex-end;
    }
  }

  &__subpart {
    flex: 1;

    & + & {
      margin-top: 10px;
    }
  }
}

@media (min-width: $breakpoint-min-md) {
  .form-user-profile {
    &__part {
      display: flex;
      flex-flow: row;
    }

    &__subpart {
      & + & {
        margin-top: 0px;
      }
    }
  }
}

@media (max-width: $breakpoint-min-md) {
  .form-user-profile {

    &__card {
      min-height: 0;
    }
    &__subpart {
      & + & {
        margin-top: 2.5rem
      }
    }
  }
}
</style>
