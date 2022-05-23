<template>
  <div class="page-cockpit-leads">
    <PlaceholderLoading v-if="loading" fullScreen />
    <TableAdminUsersUsers
      :currentUserIsGarageScoreUser="currentUserIsGarageScoreUser"
      :jobsByCockpitType="jobsByCockpitType"
      :userRole="userRole"
      :currentUser="currentUser"
      :users="users"
      :hasMore="hasMore"
      :loadMore="loadMore"
      :loadingMore="loadingMore"
      :loading="loading"
      :openModalFunction="openModalFunction"
      :closeModalFunction="closeModalFunction"
      :startExportFunction="startExportFunction"
      :selectedExportType="selectedExportType"
      :filters="filters"
    />
  </div>
</template>

<script>
  import TableAdminUsersUsers from '~/components/cockpit/user/TableAdminUsersUsers.vue';
  import { setupHotJar } from '~/util/externalScripts/hotjar';
  import { getDeepFieldValue as deep } from '~/utils/object';
  import { ExportTypes } from '../../../utils/enumV2';

  export default {
    data() {
      return {
        deep: (fieldName) => deep(this, fieldName),
        loadingMore: false,
        selectedExportType: ExportTypes.ADMIN_USERS,
      };
    },
    layout: 'admin-users',
    components: {
      TableAdminUsersUsers,
    },
    async mounted() {
      setupHotJar(this.$store.getters['locale'], 'admin_user');
      await this.$store.dispatch('cockpit/admin/users/changeUserSearch', { search: '' });
      await this.$store.dispatch('cockpit/admin/users/fetchUsers', { page: 1, append: false });
      await this.$store.dispatch('cockpit/admin/users/changeView', { view: 'users' });
    },
    computed: {
      users() {
        return this.$store.getters['cockpit/admin/users/users'];
      },
      currentUser() {
        return this.$store.state.auth.currentUser;
      },
      loading() {
        return this.$store.getters['cockpit/admin/users/loading'];
      },
      currentUserIsGarageScoreUser() {
        return !!this.$store.getters['auth/isGaragescoreUser'];
      },
      userRole() {
        return this.deep('$store.state.auth.currentUser.role');
      },
      jobsByCockpitType() {
        const cockpitType = this.$store.state.cockpit.current.cockpitType;
        return this.$store.getters['profile/jobsByCockpitType'](cockpitType) || [];
      },
      hasMore() {
        return this.$store.getters['cockpit/admin/users/hasMoreUsers'];
      },
      getRowSubview() {
        return this.$store.getters['cockpit/admin/users/getUserRowSubview'];
      },
      filters() {
        const getFilters = this.$store.getters['cockpit/admin/users/filters'];

        // filter null values in filters object
        const res = Object.keys(getFilters).reduce((acc, cv) => {
          if (getFilters[cv]) {
            acc[cv] = getFilters[cv];
          }
          return acc;
        }, {});

        return res;
      },
      usersSearch() {
        return this.$store.getters['cockpit/admin/users/usersSearch'];
      }
    },
    methods: {
      async loadMore() {
        this.loadingMore = true;
        await this.$store.dispatch('cockpit/admin/users/fetchNextUsersPage');
        this.loadingMore = false;
      },
      openModalFunction(payload) {
        return this.$store.dispatch('openModal', payload);
      },
      closeModalFunction(payload) {
        return this.$store.dispatch('closeModal', payload);
      },
      async startExportFunction(payload) {
        await this.$store.dispatch('cockpit/startExport', {
          ...payload,
          adminFilterRole: this.filters.adminFilterRole,
          adminFilterJob: this.filters.adminFilterJob,
          adminFilterLastCockpitOpenAt: this.filters.adminFilterLastCockpitOpenAt,
          adminSearch: this.usersSearch
        });
      },
    },
  };
</script>

<style scoped></style>
