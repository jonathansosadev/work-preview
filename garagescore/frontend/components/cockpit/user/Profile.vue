<template>
  <div class="admin-profile">
    <HeaderNavFolder class="admin-profile__header" :routeList="lastRoute" v-if="idInQuery" :sidebarTiny="classBindingSideBarTiny"/>
    <div class="admin-profile__body" v-if="!loading" :class="{ 'admin-profile__body--mt': idInQuery }">
      <div class="admin-profile__part" v-if="!currentUserSubscriptionStatus || idInQuery !== undefined || [UserSubscriptionStatus.INITIALIZED, UserSubscriptionStatus.TERMINATED].includes(currentUserSubscriptionStatus)">
        <FormUserProfile
          :user="user"
          :currentUserIsGarageScoreUser="currentUserIsGarageScoreUser"
          :userJobs="userJobs"
          ref="formUserProfile"
        />
      </div>
      <div class="admin-profile__part admin-profile__garage" v-if="!currentUserSubscriptionStatus || idInQuery !== undefined || currentUserSubscriptionStatus === UserSubscriptionStatus.TERMINATED">
        <CardUserGarage :isGod="isGod" :garages="garages" :garagesFromCurrentUser="garagesFromCurrentUser" :edit="idInQuery !== undefined" :default-manager-garages-ids="defaultManagerGaragesIds"/>
      </div>
      <div class="admin-profile__part" v-if="agents && agents.length && (!currentUserSubscriptionStatus || currentUserSubscriptionStatus === UserSubscriptionStatus.TERMINATED)">
        <CardUserAgent :agents="agents"/>
      </div>
      <div class="admin-profile__part" v-if="idInQuery">
        <CardUserAuthorization :authorization="authorization" :conditions="conditions"/>
      </div>
      <div class="admin-profile__part" v-if="idInQuery">
        <CardUserRole :userRole="user.role" :currentUserRole="currentUser.role" />
      </div>
      <div class="admin-profile__part" v-if="!currentUserSubscriptionStatus || idInQuery !== undefined || currentUserSubscriptionStatus === UserSubscriptionStatus.TERMINATED">
        <CardUserAlerts :user="user" :conditions="conditions"/>
      </div>
    </div>
    <template v-if="error">
      <AppText class="admin-profile__error" tag="span" bold align="center" type="danger" size="lg">{{ error }}</AppText>
    </template>
    <PlaceholderLoading v-if="!error && loading" fullScreen/>
  </div>
</template>

<script>
import CardUserGarage from '~/components/cockpit/admin/CardUserGarage';
import CardUserAgent from '~/components/cockpit/admin/CardUserAgent';
import CardUserAlerts from '~/components/cockpit/admin/CardUserAlerts';
import CardUserAuthorization from '~/components/cockpit/admin/CardUserAuthorization';
import CardUserRole from "~/components/cockpit/admin/CardUserRole.vue";
import FormUserProfile from '~/components/cockpit/admin/FormUserProfile';
import HeaderNavFolder from '~/components/global/HeaderNavFolder';

export default {
  name: 'Profile',
  layout: 'cockpit',

  components: { CardUserGarage, CardUserAlerts, CardUserAuthorization, FormUserProfile, HeaderNavFolder, CardUserAgent, CardUserRole },

  props: {
    UserSubscriptionStatus: Function,
    pick: Function,
    userRole: String,
    lastRoute: String,
    currentUserSubscriptionStatus: String,
    idInQuery: String,
    currentUser: Object,
    user: Object,
    authorization: Object,
    conditions: Object,
    garages: Array,
    userJobs: Array,
    agents: Array,
    garagesFromCurrentUser: Array,
    defaultManagerGaragesIds: Array,
    isGod: Boolean,
    classBindingSideBarTiny: Boolean,
    currentUserIsGarageScoreUser: Boolean,
    loading: Boolean,
  },

  data() {
    return {
      error: '',
      prevRoute: null
    }
  },

  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.prevRoute = from;
    })
  },

  async beforeRouteLeave (to, from, next) {
    (!this.loading) ? next(await this.$refs.formUserProfile.checkBeforeExit()) : next();
  },

  mounted () {},

  methods: {},

  computed: {}
}
</script>

<style lang="scss">
.admin-profile {
  background-color: $bg-grey;
  min-height: 100vh;

  display: flex;
  flex-flow: column;

  ::v-deep.card {
    box-sizing: border-box;
    height: 100%;
    width: 100%;
  }

  &__error {
    position: absolute;
    top: 50%;
    left: calc(50% - 83px);
  }

  &__header {
    position: fixed;
    top: 3.5rem;
  }

  &__body {
    padding: 1rem;

    &--mt {
      padding-top: 4.5rem;
    }
  }

  &__part {
    > * {
      flex: 1;
    }

    & + & {
      margin-top: 1rem;
    }

    display: flex;
    flex-direction: row;
  }

  &__garage {
    overflow: initial;
  }
}
</style>
