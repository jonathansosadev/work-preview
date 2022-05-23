<template>
  <div class="table-admin-users-garages">
    <div class="table-admin-users-garages__content">
      <Table :rows="garages" :loading="loading">
        <template slot="header">
          <TableAdminUsersGaragesHeader
            :currentUser="currentUser"
            :openModalFunction="openModalFunction"
            :closeModalFunction="closeModalFunction"
            :startExportFunction="startExportFunction"
            :selectedExportType="selectedExportType"
          >
          </TableAdminUsersGaragesHeader>
        </template>
        <template slot="row" slot-scope="{ row }">
          <TableAdminUsersGaragesRow :row="row"/>
          <TableAdminUsersGaragesSubRow
            v-if="row.displaySubView"
            :row="row"
            :assignedUser="assignedUser"
            :currentUser="currentUser"
            :isGarageScore="isGarageScore"
          />
        </template>
      </Table>
    </div>
    <div v-if="hasMore && !emptyArray" class="table-admin-users-garages__footer">
      <Button
        type="orange-border"
        :disabled="loadingMore"
        fullSized
        @click.native="loadMore"
      >
        <template v-if="!loadingMore">
          {{$t_locale('components/cockpit/user/TableAdminUsersGarages')("seeMore")}}
        </template>
        <template v-else>
          <i class="icon-gs-loading" />
          {{ $t_locale('components/cockpit/user/TableAdminUsersGarages')("loading") }}...
        </template>
      </Button>
    </div>
  </div>
</template>


<script>

import TableAdminUsersGaragesRow from './TableAdminUsersGaragesRow';
import TableAdminUsersGaragesSubRow from './TableAdminUsersGaragesSubRow';
import TableAdminUsersGaragesHeader from './TableAdminUsersGaragesHeader';


export default {
  name: 'TableAdminUsersGarages',

  components: {
    TableAdminUsersGaragesRow,
    TableAdminUsersGaragesSubRow,
    TableAdminUsersGaragesHeader,
  },

  props: {
    currentUser: Object,
    garages: Array,
    loading: Boolean,
    view: String,
    hasMore: Boolean,
    emptyArray: Boolean,
    isGarageScore: [Array, Boolean],
    openModalFunction: {
      type: Function,
      default: () => console.error('TableAdminUsersGarages.vue :: openModalFunction not set')
    },
    closeModalFunction: {
      type: Function,
      default: () => console.error('TableAdminUsersGarages.vue :: closeModalFunction not set')
    },
    startExportFunction: {
      type: Function,
      default: () => console.error('TableAdminUsersGarages.vue :: startExportFunction not set')
    },
    selectedExportType: {
      type: String,
      default: ''
    },
  },

  data() {
    return {
      garagesMeta: {
        search: this.$store.state.cockpit.admin.users.garages.search,
      },
      loadingMore: false,
    }
  },

  computed: {},

  mounted() {},

  methods: {
    async loadMore() {
      this.loadingMore = true;
      await this.$store.dispatch('cockpit/admin/users/fetchNextGaragesPage');
      this.loadingMore = false;
    },

    classBindingButton(view) {
      return {
        'table-admin-users-garages__button--active': this.view === view,
      }
    },

    async assignedUser(garageId, userId, oldUserId, alertType, user) {
      await this.$store.dispatch('cockpit/admin/users/updateTicketsConfiguration', {
        garageId, userId, oldUserId, alertType, user
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.table-admin-users-garages {
  position: relative;
  top: 1.5rem;
  border-radius: 3px;
  width: calc(100% - 1.5rem);
  margin-bottom: .15rem;
  margin-left: 1rem;
  margin-right: .5rem;

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
    }
  }

  &__header-combination {
    display: flex;
  }

  &__button-icon {
    font-size: 1.25rem;
  }

  &__button-group {
    .table-admin-users-garages__button:first-child {
      border-radius: 5px 0 0 5px;
    }

    .table-admin-users-garages__button {
      border-radius: 0;
    }

    .table-admin-users-garages__button:last-child {
      border-radius: 0 5px 5px 0;
    }
  }
}
</style>
