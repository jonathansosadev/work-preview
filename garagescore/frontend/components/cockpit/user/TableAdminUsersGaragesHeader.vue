<template>
  <div class="table__thead">
    <div class="table-admin-users-garages__button-group">
      <div class="table-admin-users-garages__left-button-group">
        <button
          role="button"
          class="table-admin-users-garages__button"
          :class="classBindingButton('users')"
          @click="changeView('users')"
        >
          <i class="table-admin-users-garages__button--icon icon-gs-group" />
          <span class="table-admin-users-garages__button--text">{{ $t_locale('components/cockpit/user/TableAdminUsersGaragesHeader')("usersView") }}</span>
        </button>
        <button
          role="button"
          class="table-admin-users-garages__button"
          :class="classBindingButton('garages')"
          @click="changeView('garages')"
        >
          <i class="table-admin-users-garages__button--icon icon-gs-garage" />
          <span class="table-admin-users-garages__button--text">{{ $t_locale('components/cockpit/user/TableAdminUsersGaragesHeader')("garagesView") }}</span>
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
        <Searchbar v-model="garagesMeta.search" @searchClick="onSearch"/>
      </div>
    </div>
    <div class="table__header table-leads-header">
      <TableHeader :style="{ flex: 2 }">
      </TableHeader>
      <template>
        <TableHeader center>{{ $t_locale('components/cockpit/user/TableAdminUsersGaragesHeader')("Users") }}</TableHeader>
        <TableHeader center>{{ $t_locale('components/cockpit/user/TableAdminUsersGaragesHeader')("assign") }} <br> <b>{{ $t_locale('components/cockpit/user/TableAdminUsersGaragesHeader')("unsatisfiedAPV") }}</b> </TableHeader>
        <TableHeader center>{{ $t_locale('components/cockpit/user/TableAdminUsersGaragesHeader')("assign") }} <br> <b>{{ $t_locale('components/cockpit/user/TableAdminUsersGaragesHeader')("unsatisfiedVN") }}</b></TableHeader>
        <TableHeader center>{{ $t_locale('components/cockpit/user/TableAdminUsersGaragesHeader')("assign") }} <br> <b>{{ $t_locale('components/cockpit/user/TableAdminUsersGaragesHeader')("unsatisfiedVO") }}</b></TableHeader>
        <TableHeader center>{{ $t_locale('components/cockpit/user/TableAdminUsersGaragesHeader')("assign") }} <br> <b>{{ $t_locale('components/cockpit/user/TableAdminUsersGaragesHeader')("leadAPV") }}</b></TableHeader>
        <TableHeader center>{{ $t_locale('components/cockpit/user/TableAdminUsersGaragesHeader')("assign") }} <br> <b>{{ $t_locale('components/cockpit/user/TableAdminUsersGaragesHeader')("leadVN") }}</b></TableHeader>
        <TableHeader center>{{ $t_locale('components/cockpit/user/TableAdminUsersGaragesHeader')("assign") }} <br> <b>{{ $t_locale('components/cockpit/user/TableAdminUsersGaragesHeader')("leadVO") }}</b></TableHeader>
      </template>
    </div>
  </div>
</template>

<script>
import Searchbar from "~/components/ui/searchbar/Searchbar";
import ButtonExport from "~/components/global/exports/ButtonExport";

export default {
  components: {
    Searchbar,
    ButtonExport
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
    openModalFunction: {
      type: Function,
      default: () => console.error('TableAdminUsersGaragesHeader.vue :: openModalFunction not set')
    },
    closeModalFunction: {
      type: Function,
      default: () => console.error('TableAdminUsersGaragesHeader.vue :: closeModalFunction not set')
    },
    startExportFunction: {
      type: Function,
      default: () => console.error('TableAdminUsersGaragesHeader.vue :: startExportFunction not set')
    },
  },

  data() {
    return {
      garagesMeta: {
        search: this.$store.state.cockpit.admin.users.garages.search
      },

      loadingMore: false
    };
  },

  computed: {
    view() {
      return this.$store.getters["cockpit/admin/users/view"];
    }
  },

  methods: {
    classBindingButton(view) {
      return {
        "table-admin-users-garages__button--active": this.view === view
      };
    },

    async changeView(view) {
      await this.$store.dispatch("cockpit/admin/users/changeView", { view });
    },

    async onSearch() {
      this.$store.dispatch("cockpit/admin/users/changeGarageSearch", {
        search: this.garagesMeta.search
      });
      await this.$store.dispatch("cockpit/admin/users/fetchAdminGarages", {
        page: 1,
        append: false
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
.table-admin-users-garages {

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
    margin-right: 1rem;
    &--search {
      flex-grow: 1;
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
