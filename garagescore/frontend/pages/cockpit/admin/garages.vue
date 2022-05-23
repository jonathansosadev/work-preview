<template>
  <div class="page-cockpit-leads">
    <PlaceholderLoading v-if="loading" fullScreen/>
    <TableAdminUsersGarages 
      :currentUser="currentUser"
      :garages="garages"
      :loading="loading"
      :view="view"
      :hasMore="hasMore"
      :emptyArray="emptyArray"
      :isGarageScore="isGarageScore"
      :openModalFunction="openModalFunction"
      :closeModalFunction="closeModalFunction"
      :startExportFunction="startExportFunction"
      :selectedExportType="selectedExportType"
    ></TableAdminUsersGarages>
  </div>
</template>

<script>
  import TableAdminUsersGarages from '~/components/cockpit/user/TableAdminUsersGarages.vue';
  import { ExportTypes } from '../../../utils/enumV2'
  
  export default {
    layout: 'admin-users',
    components: {
      TableAdminUsersGarages
    },
    data() {
      return {
        selectedExportType: ExportTypes.ADMIN_GARAGES
      }
    },
    async mounted() {
      await this.$store.dispatch("cockpit/admin/users/changeGarageSearch", { search: '' });
      await this.$store.dispatch("cockpit/admin/users/fetchAdminGarages", { page: 1, append: false });
      await this.$store.dispatch('cockpit/admin/users/changeView', { view: 'garages' });
      await this.$store.dispatch('cockpit/admin/users/fetchAdminGarages', { page: 1, append: false });
    },
    computed: {
      currentUser() {
        return this.$store.state.auth.currentUser;
      },
      loading() {
        return this.$store.getters['cockpit/admin/users/loading'];
      },
      garages() {
        return this.$store.getters['cockpit/admin/users/garages'];
      },
      view() {
        return this.$store.getters['cockpit/admin/users/view'];
      },
      hasMore() {
        return this.$store.getters['cockpit/admin/users/hasMoreGarages'];
      },
      emptyArray() {
        return !this.garages || this.garages.length === 0;
      },
      isGarageScore() {
        return this.$store.state.auth.isGarageScoreUser;
      },
      garagesSearch() {
        return this.$store.getters['cockpit/admin/users/garagesSearch'];
      }
    },
    methods: {
      openModalFunction(payload) {
        return this.$store.dispatch('openModal', payload);
      },
      closeModalFunction(payload) {
        return this.$store.dispatch('closeModal', payload);
      },
      async startExportFunction(payload) {
        await this.$store.dispatch('cockpit/startExport', {...payload, adminSearch: this.garagesSearch});
      }
    }
  }
</script>

<style scoped>

</style>
