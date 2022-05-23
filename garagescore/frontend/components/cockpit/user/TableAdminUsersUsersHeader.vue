<template>
  <div class="table__thead">
    <div class="table-admin-users-users__button-group">
      <div class="table-admin-users-users__left-button-group">
        <button
          role="button"
          class="table-admin-users-users__button"
          :class="classBindingButton('users')"
          @click="changeView('users')"
        >
          <i class="table-admin-users-users__button--icon icon-gs-group" />
          <span class="table-admin-users-users__button--text">{{ $t_locale('components/cockpit/user/TableAdminUsersUsersHeader')("usersView") }}</span>
        </button>
        <button
          role="button"
          class="table-admin-users-users__button"
          :class="classBindingButton('garages')"
          @click="changeView('garages')"
        >
          <i class="table-admin-users-users__button--icon icon-gs-garage" />
          <span class="table-admin-users-users__button--text">{{ $t_locale('components/cockpit/user/TableAdminUsersUsersHeader')("garagesView") }}</span>
        </button>
      </div>
      <ButtonExport
        :openModalFunction="openModalFunction"
        :closeModalFunction="closeModalFunction"
        :currentUser="currentUser"
        :startExportFunction="startExportFunction"
        :selectedExportType="selectedExportType"
      />
    </div>
    <div class="table__header table__header--top">
      <div class="table__searchbar">
        <Searchbar
          :options="filtersOptions"
          :filters="filters"
          v-model="usersMeta.search" 
          :filtersDisabled="filtersDisabled"
          @filtersChange="onFiltersChange"
          @searchClick="onSearch"
        />
      </div>
    </div>
    <div class="table__header">
      <TableHeader>
        <div class="table-admin-users-users__header-combination">
          <div
            class="table-admin-users-users__header-part"
            v-if="canCreateUser"
          >
            <Button
              type="contained-white"
              v-on:click="openAddUserModal()"
            >
              <template>
                <template slot="left">
                  <i class="icon-gs-add-user" />
                </template>
                <AppText tag="span" bold>{{ $t_locale('components/cockpit/user/TableAdminUsersUsersHeader')("AddUser") }}</AppText>
              </template>
            </Button>
          </div>
        </div>
      </TableHeader>
      <TableHeader center>
        <span>{{ $t_locale('components/cockpit/user/TableAdminUsersUsersHeader')("Role") }}</span>
      </TableHeader>
      <TableHeader center>
        <span>{{ $t_locale('components/cockpit/user/TableAdminUsersUsersHeader')("Locals") }}</span>
      </TableHeader>
      <TableHeader center :display="['md', 'lg']">
        <span>{{ $t_locale('components/cockpit/user/TableAdminUsersUsersHeader')("LastLogin") }}</span>
      </TableHeader>
      <TableHeader center></TableHeader>
    </div>
  </div>
</template>

<script>
import Searchbar from "~/components/ui/searchbar/Searchbar";
import ButtonExport from "~/components/global/exports/ButtonExport";
import { UserRoles, UserLastCockpitOpenAt } from '~/utils/enumV2';
import { debounce, isEqual } from "lodash";

export default {
  components: {
    Searchbar,
    ButtonExport
  },

  data() {
    return {
      usersMeta: {
        search: this.$store.state.cockpit.admin.users.pageParameters.users.search
      },
      debouncedFetch: debounce(() => {
        this.$store.dispatch("cockpit/admin/users/fetchUsers", {
          page: 1,
          append: false
        });
      }, 500),
      filtersOptions: [
        {
          key: "adminFilterRole",
          label: this.$t_locale('components/cockpit/user/TableAdminUsersUsersHeader')("Role"),
          icon: "icon-gs-user-queen-crown",
          values: [
            { label: this.$t_locale('components/cockpit/user/TableAdminUsersUsersHeader')("superAdmin"), value: UserRoles.SUPER_ADMIN },
            { label: this.$t_locale('components/cockpit/user/TableAdminUsersUsersHeader')("admin"), value: UserRoles.ADMIN },
            { label: this.$t_locale('components/cockpit/user/TableAdminUsersUsersHeader')("user"), value: UserRoles.USER }
          ]
        },

        {
          key: "adminFilterJob",
          label: this.$t_locale('components/cockpit/user/TableAdminUsersUsersHeader')("Job"),
          icon: "icon-gs-user-question",
          values: this.jobsByCockpitType.map(job => {
            return { label: job.name, value: job.name }
          })
        },

        {
          key: "adminFilterLastCockpitOpenAt",
          label: this.$t_locale('components/cockpit/user/TableAdminUsersUsersHeader')("LastLogin"),
          icon: "icon-gs-user-work-laptop",
          values: [
            { label: this.$t_locale('components/cockpit/user/TableAdminUsersUsersHeader')("Recent"), value: UserLastCockpitOpenAt.RECENT },
            { label: this.$t_locale('components/cockpit/user/TableAdminUsersUsersHeader')("Intermediate"), value: UserLastCockpitOpenAt.INTERMEDIATE },
            { label: this.$t_locale('components/cockpit/user/TableAdminUsersUsersHeader')("LongTime"), value: UserLastCockpitOpenAt.LONG_TIME },
            { label: this.$t_locale('components/cockpit/user/TableAdminUsersUsersHeader')("Never"), value: UserLastCockpitOpenAt.NEVER },
          ]
        }
      ]
    };
  },

  props: {
    currentUser: {
      type: Object,
      default: () => {},
    },
    selectedExportType: {
      type: String,
      default: ''
    },
    currentUserIsGarageScoreUser: Boolean,
    jobsByCockpitType: Array,
    userRole: String,
    filtersDisabled: { type: Boolean, default: false },
    openModalFunction: {
      type: Function,
      default: () => console.error('TableAdminUsersUsersHeader.vue :: openModalFunction not set')
    },
    closeModalFunction: {
      type: Function,
      default: () => console.error('TableAdminUsersUsersHeader.vue :: closeModalFunction not set')
    },
    startExportFunction: {
      type: Function,
      default: () => console.error('TableAdminUsersUsersHeader.vue :: startExportFunction not set')
    },
    filters: {
      type: Object,
      default: () => {}
    },
  },

  computed: {
    canCreateUser() {
      return UserRoles.getPropertyFromValue(this.userRole, 'canCreateUser');
    },
    view() {
      return this.$store.getters["cockpit/admin/users/view"];
    },
  },

  methods: {
    onSearch() {
      this.$store.dispatch("cockpit/admin/users/changeUserSearch", {
        search: this.usersMeta.search
      });
      this.$store.dispatch("cockpit/admin/users/fetchUsers", {
        page: 1,
        append: false
      });
    },

    onFiltersChange(newFilters) {
      const sameFilters = isEqual(this.filters, newFilters);

      if (!sameFilters) {
        this.$store.dispatch("cockpit/admin/users/changeFilters", {
          filters: newFilters
        });
      this.debouncedFetch()
      }
    },

    classBindingButton(view) {
      return {
        "table-admin-users-users__button--active": this.view === view
      };
    },

    async changeView(view) {
      await this.$store.dispatch("cockpit/admin/users/changeView", { view });
    },

    openAddUserModal() {
      this.$store.dispatch("openModal", {
        component: "ModalAddUser",
        props: {
          userRole: this.userRole,
          onUserAdded: this.userAdd,
          currentUserIsGarageScoreUser: this.currentUserIsGarageScoreUser,
          jobsByCockpitType: this.jobsByCockpitType,
          garages: this.$store.state.cockpit.availableGarages
        }
      });
    },

    userAdd(data) {
      this.$store.dispatch("closeModal");
      this.$router.push({
        name: "cockpit-admin-user-id",
        params: { id: data.user.id }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.table {

  &__header {
    border-bottom: solid 1px rgba($grey, .5);
  }
}
.table-admin-users-users {

  &__button-group{
    display: flex;
    justify-content: space-between;
    border-bottom: 10px solid $bg-grey;
    padding: .5rem .5rem 0;
  }

  &__button {
    border: none;
    color: $dark-grey;
    background-color: transparent;
    padding: 0.5rem;
    outline: none;
    cursor: pointer;
    font-size: 1.1rem;

    &--active {
      color: $blue;
      border-bottom: 3px solid $blue;
      border-bottom-left-radius: 3px 3px;
      border-bottom-right-radius: 3px 3px;
    }
  }

  &__footer {
    margin: 1rem 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  &__header-part {
    margin-left: 1rem;
    &--search {
      flex-grow: 1;
      max-width: 20rem;
    }
  }

  &__header-combination {
    display: flex;
  }

  &__button {

    &--icon {
      font-size: 1.1rem;
      margin-right: .3rem;
    }
    &--text {
      font-size: 1rem;
      font-weight: 700;
    }
  }
}
</style>
