<template>
  <Profile
    :currentUser="currentUser"
    :lastRoute="lastRoute"
    :currentUserSubscriptionStatus="currentUserSubscriptionStatus"
    :isGod="isGod"
    :idInQuery="idInQuery"
    :garages="garages"
    :garagesFromCurrentUser="garagesFromCurrentUser"
    :agents="agents"
    :user="user"
    :userRole="userRole"
    :authorization="authorization"
    :defaultManagerGaragesIds="defaultManagerGaragesIds"
    :classBindingSideBarTiny="classBindingSideBarTiny"
    :currentUserIsGarageScoreUser="currentUserIsGarageScoreUser"
    :userJobs="userJobs"
    :UserSubscriptionStatus="UserSubscriptionStatus"
    :pick="pick"
    :loading="loading"
    :conditions="conditions"
  />
</template>

<script>
import Profile from '~/components/cockpit/user/Profile';
import { setupHotJar } from '~/util/externalScripts/hotjar';
import { pick } from 'lodash';
import UserSubscriptionStatus from '~/utils/models/user-subscription-status.js';

export default {
  name: 'user_id',
  components: { Profile },

  data() {
    return {
      error: '',
      loading: true,
      UserSubscriptionStatus,
      pick,
      prevRoute: null
    }
  },

  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.prevRoute = from;
    })
  },

  async mounted () {
    try {
      const admin = window.location.href.includes('profile') ? 'admin_profil' : 'admin_user';
      setupHotJar(this.$store.getters["locale"], admin);
    } catch (err) {
      console.error(err)
    }
    await this.fetchData();
  },

  watch: {
    '$route': 'fetchData'  // call again the method if the route changes
  },

  methods: {
    async fetchData() {
      this.loading = true;
      try {
        if (this.idInQuery === this.$store.state.auth.currentUser.id) {
          this.error = this.$t_locale('pages/cockpit/admin/user/_id')('noAccessUser');
          return;
        }
        else if (!this.idInQuery && (this.$route.name !== 'cockpit-admin-profile')) {
          this.error = this.$t_locale('pages/cockpit/admin/user/_id')('noAccessURL');
          return;
        }
        await this.$store.dispatch('cockpit/admin/profile/fetchUser', { id: this.idInQuery ? this.idInQuery : this.$store.state.auth.currentUser.id });
        await this.$store.dispatch('cockpit/admin/profile/fetchGarages');
        await this.$store.dispatch('cockpit/admin/profile/fetchAgents');
        await this.$store.dispatch('cockpit/admin/profile/fetchGaragesConditions');
        this.error = null;
      } catch (e) {
        console.error(e);
        this.error = this.$t_locale('pages/cockpit/admin/user/_id')('noAccessUser');
        return;
      }
      this.loading = false;
    }
  },

  computed: {
    lastRoute() {
      return (this.prevRoute && this.prevRoute.name) || 'cockpit-admin-users';
    },
    currentUserSubscriptionStatus() {
      return this.$store.getters['auth/currentUserSubscriptionStatus'];
    },
    currentUser() {
      return this.$store.state.auth.currentUser;
    },
    isGod() {
      return this.$store.getters['cockpit/admin/profile/isGod'];
    },
    idInQuery() {
      return this.$route.params.id || this.$route.query.id;
    },
    garages() {
      return this.$store.state.cockpit.admin.profile.garages;
    },
    garagesFromCurrentUser() {
      return this.$store.state.cockpit.admin.profile.availableGarages;
    },
    agents() {
      return this.$store.getters['cockpit/admin/profile/agents'];
    },
    user() {
      return this.$store.state.cockpit.admin.profile.user;
    },
    userRole() {
      return this.user && this.user.role;
    },
    authorization() {
      return pick(this.user, [
        'authorization.ACCESS_TO_COCKPIT',
        'authorization.ACCESS_TO_WELCOME',
        'authorization.ACCESS_TO_SATISFACTION',
        'authorization.ACCESS_TO_UNSATISFIED',
        'authorization.ACCESS_TO_LEADS',
        'authorization.ACCESS_TO_AUTOMATION',
        'authorization.ACCESS_TO_CONTACTS',
        'authorization.ACCESS_TO_E_REPUTATION',
        'authorization.ACCESS_TO_ESTABLISHMENT',
        'authorization.ACCESS_TO_TEAM',
        'authorization.ACCESS_TO_ADMIN',
        'authorization.WIDGET_MANAGEMENT',
        'authorization.ACCESS_TO_DARKBO',
        'authorization.ACCESS_TO_GREYBO',
      ]).authorization;
    },
    defaultManagerGaragesIds() {
      return (this.user && this.user.defaultManagerGaragesIds) || [];
    },
    classBindingSideBarTiny() {
      return this.$store.getters["sidebarTiny"];
    },
    currentUserIsGarageScoreUser() {
      return !!this.$store.getters['auth/isGaragescoreUser'];
    },
    userJobs() {
      return this.$store.getters['profile/jobs'] || [];
    },
    conditions() {
      return this.$store.state.cockpit.admin.profile.conditions;
    }
  }
}
</script>