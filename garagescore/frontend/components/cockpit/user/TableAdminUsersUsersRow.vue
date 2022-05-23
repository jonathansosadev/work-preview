<template>
  <TableRow class="table-admin-user">
    <TableRowCell>
      <div class="table-admin-user__informations">
        <nuxt-link
          v-if="canManageThisUser"
          :to="{ name: 'cockpit-admin-user-id', query: { id: user.id } }"
          class="table__link"
        >
          <AppText class="table-admin-user__name-email" tag="span">{{ displayName }}</AppText>
        </nuxt-link>
        <AppText v-else :title="$t_locale('components/cockpit/user/TableAdminUsersUsersRow')('noAccessUser')" class="table-admin-user__name-email--disabled" tag="span">{{ displayName }}</AppText>
        <AppText class="table-admin-user__job" tag="span">{{ $t_locale('components/cockpit/user/TableAdminUsersUsersRow')(user.job, {}, user.job ) }}</AppText>
      </div>
    </TableRowCell>
    <TableRowCell center>
      <UserRole :userRole="user.role"/>
    </TableRowCell>
    <TableRowCell center>
      <span>{{ user.garagesCount }}</span>
    </TableRowCell>
    <TableRowCell
      center
      :display="['md', 'lg']"
    >{{ displayDate($moment(user.lastCockpitOpenAt).format('D/MM/YYYY HH:mm')) }}</TableRowCell>
    <TableRowCell center>
      <ul class="table-admin-user__action-list">
        <Button
          class="table-admin-user__action-list--item"
          :class="sendClass"
          type="icon-btn"
          @click="sendPasswordRequest(user.email, user.id)"
          v-tooltip="{content: sendTitle}"
        >
          <i class="icon-gs-reset-password" />
        </Button>
        <Button
          class="table-admin-user__action-list--item"
          :class="deleteClass"
          type="icon-btn"
          v-if="canManageThisUser"
          @click="deleteUser(user.email, user.id)"
          v-tooltip="{content: deleteTitle}"
        >
          <i class="icon-gs-trash" />
        </Button>
        <Button
          class="table-admin-user__action-list--item"
          type="icon-btn"
          v-if="isGarageScore"
          @click="connectAs(user.id, user.email)"
          v-tooltip="{content: $t_locale('components/cockpit/user/TableAdminUsersUsersRow')('logAs')}"
        >
          <i class="icon-gs-user-anonymous" />
        </Button>
      </ul>
    </TableRowCell>
  </TableRow>
</template>


<script>
import IconLabel from "~/components/global/IconLabel";
import UserRole from "~/components/global/UserRole";
import { UserRoles } from "~/utils/enumV2";
import { managerDisplayName } from "~/util/user";

export default {
  components: { IconLabel, UserRole },
  props: {
    user: Object,
    currentUserIsGarageScoreUser: Boolean,
    currentUser: Object
  },
  methods: {
    setRowSubview(view) {
      this.$store.dispatch("cockpit/admin/users/changeUserRowSubview", {
        id: this.user.id,
        view
      });
    },
    connectAs(id, userEmail) {
      this.$store.dispatch("cockpit/admin/users/connectAs", { id, userEmail });
    },
    deleteUser(userEmail, userId) {
      if (this.user.isDefaultTicketManagerSomewhere) return;
      this.$store.dispatch("openModal", {
        component: "ModalDeleteChildUser",
        props: { userEmail, userId }
      });
    },
    sendPasswordRequest(userEmail, userId) {
      if (!this.user.resetPasswordVeryRecent) {
        this.$store.dispatch("openModal", {
          component: "ModalResetPassword",
          props: { userEmail, userId }
        });
      }
    },
    displayDate(value) {
      return value.includes("Invalid") ? "" : value;
    }
  },

  computed: {
    displayName() {
      return managerDisplayName(this.user);
    },
    deleteTitle() {
      if (this.user.isDefaultTicketManagerSomewhere) {
        return this.$t_locale('components/cockpit/user/TableAdminUsersUsersRow')("delete3");
      }
      return this.$t_locale('components/cockpit/user/TableAdminUsersUsersRow')("delete2");
    },
    deleteClass() {
      return this.user.isDefaultTicketManagerSomewhere ? "low-opacity" : "";
    },
    sendTitle() {
      return this.user.resetPasswordVeryRecent ? this.$t_locale('components/cockpit/user/TableAdminUsersUsersRow')("send1") : this.$t_locale('components/cockpit/user/TableAdminUsersUsersRow')("send2");
    },
    sendClass() {
      return this.user.resetPasswordVeryRecent ? "green bold" : "clickable call-to-action bold";
    },
    canManageThisUser() {
      const list = UserRoles.getPropertyFromValue(this.currentUser.role, 'canCreateUser');
      return list && list.includes(this.user.role);
    },
    isGarageScore() {
      return this.currentUserIsGarageScoreUser;
    }
  }
};
</script>

<style lang="scss" scoped>
.table-admin-user {
  display: flex;
  align-items: center;
  color: $dark-grey;

  &__informations {
    display: flex;
    flex-direction: column;
  }
  &__name-email {
    color: $black;
    font-weight: 700;

    &:hover {
      color: $blue;
    }
    &--disabled {
      cursor: default;
    }
  }
  &__job {
    color: $grey;
    margin-top: .5rem;
  }
  &__button-phantom {
    border: none;
    background-color: transparent;
    outline: 0;
    text-decoration: underline;
    cursor: pointer;
    padding: 1rem;

    &:hover {
      color: $blue;
    }
  }

  &__action-list {
    list-style: none;
    display: inline-flex;
    flex-flow: row;

    &--item {
      width: 2rem;
      height: 2rem;
      margin-right: .7rem;

      & i {
        font-size: .85rem;
      }
    }
  }
}

.table__link {
  color: $black-grey;
  cursor: pointer;
}

.clickable {
  cursor: pointer;
}
.call-to-action {
  color: $dark-grey;
}
.call-to-action:hover {
  color: $orange;
}

.call-to-action.disabled:hover {
  cursor: not-allowed;
  color: $orange;
}

.managed {
  font-size: 0.9rem;
}
.manager {
  color: $blue !important;
}

.low-opacity {
  opacity: 0.5;
}
.c-icon-label {
  &--pointer {
    cursor: pointer;
    user-select: none;
  }
}

.green {
  color: $green;
}

.profile-icon {
  font-weight: bold;
  position: relative;
  top: 0.3rem;
  font-size: 1.5rem;
}
</style>
