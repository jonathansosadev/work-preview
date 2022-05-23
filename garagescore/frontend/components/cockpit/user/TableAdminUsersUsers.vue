<template>
  <div class="table-admin-users-users">
    <div class="table-admin-users-users__content">
      <Table :rows="users" :loading="loading">
        <template slot="header">
          <TableAdminUsersUsersHeader
            :currentUser="currentUser"
            :currentUserIsGarageScoreUser="currentUserIsGarageScoreUser"
            :jobsByCockpitType="jobsByCockpitType"
            :userRole="userRole"
            :openModalFunction="openModalFunction"
            :closeModalFunction="closeModalFunction"
            :startExportFunction="startExportFunction"
            :selectedExportType="selectedExportType"
            :filters="filters"
          />
        </template>
        <template slot="header-fixed">
          <TableAdminUsersUsersHeader
            :currentUser="currentUser"
            :currentUserIsGarageScoreUser="currentUserIsGarageScoreUser"
            :jobsByCockpitType="jobsByCockpitType"
            :userRole="userRole"
            :openModalFunction="openModalFunction"
            :closeModalFunction="closeModalFunction"
            :startExportFunction="startExportFunction"
            :selectedExportType="selectedExportType"
            :filters="filters"
          />
        </template>
        <template v-if="user.id !== currentUser.id" slot="row" slot-scope="{ row: user }">
          <TableAdminUsersUsersRow
            :user="user"
            :currentUserIsGarageScoreUser="currentUserIsGarageScoreUser"
            :currentUser="currentUser"
          />
        </template>
      </Table>
    </div>
    <div v-if="hasMore && !emptyArray" class="table-admin-users-users__footer">
      <Button
        type="orange-border"
        :disabled="loadingMore"
        fullSized
        @click="loadMore"
      >
        <template v-if="!loadingMore">
          {{ $t_locale('components/cockpit/user/TableAdminUsersUsers')("seeMore") }}
        </template>
        <template v-else>
          <i class="icon-gs-loading" />
          {{ $t_locale('components/cockpit/user/TableAdminUsersUsers')("loading") }}...
        </template>
      </Button>
    </div>
  </div>
</template>


<script>

import TableAdminUsersUsersRow from './TableAdminUsersUsersRow';
import TableAdminUsersUsersHeader from './TableAdminUsersUsersHeader';


export default {
  name: 'TableAdminUsersUsers',

  components: {
    TableAdminUsersUsersRow,
    TableAdminUsersUsersHeader
  },
  props: {
    currentUserIsGarageScoreUser: Boolean,
    jobsByCockpitType: Array,
    userRole: String,
    currentUser: Object,
    users: {
      type: Array,
      default: [],
    },
    hasMore: {
      type: Boolean,
      default: false
    },
    loadMore: {
      type: Function,
      default: () => console.error('TableAdminUsersUsers.vue: loadMore is not set')
    },
    loadingMore: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    openModalFunction: {
      type: Function,
      default: () => console.error('TableAdminUsersUsers.vue :: openModalFunction not set')
    },
    closeModalFunction: {
      type: Function,
      default: () => console.error('TableAdminUsersUsers.vue :: closeModalFunction not set')
    },
    startExportFunction: {
      type: Function,
      default: () => console.error('TableAdminUsersUsers.vue :: startExportFunction not set')
    },
    selectedExportType: {
      type: String,
      default: ''
    },
    filters: {
      type: Object,
      default: () => {}
    },
  },

  computed: {
    emptyArray() {
      return !this.users || this.users.length === 0;
    }
  }
}
</script>

<style lang="scss" scoped>
  .table-admin-users-users {
    position: relative;
    top: 1.5rem;
    border-radius: 3px;
    width: calc(100% - 1.5rem);
    margin-bottom: .15rem;
    margin-left: 1rem;
    margin-right: .5rem;

    .add-user-btn {
      display: flex;
      justify-content: center;
      align-items: center;
      color: #ffffff;
      background-color: $orange;
      width: 2.5rem;
      padding: 0;
      border-radius: 3px;
      outline: 0;
      border:0;
      height:2.5rem;
      cursor:pointer;
    }

    .add-user-btn i {
      font-size:1.25rem;
    }

    .add-user-btn:hover {
      background-color: $dark-orange;
    }

    &__button {
      border: 1px solid $white;
      color: $white;
      background-color: transparent;
      border-radius: 5px;
      padding: 0.5rem 0.75rem;
      outline: none;
      cursor: pointer;

      &--active {
        background-color: white;
        color: $blue;
      }
    }

    &__footer {
      padding: 1rem 0 2.5rem 0;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    &__header-part {
      margin-right: 1rem;
      &--search {
        flex-grow:1;
        max-width: 20rem;
      }
    }

    &__header-combination {
      display: flex;
    }

    &__button-icon {
      font-size: 1.25rem;
    }

    &__button-group {
      .table-admin-users-users__button:first-child {
        border-radius: 5px 0 0 5px;
      }

      .table-admin-users-users__button {
        border-radius: 0;
      }

      .table-admin-users-users__button:last-child {
        border-radius: 0 5px 5px 0;
      }
    }
  }
</style>
