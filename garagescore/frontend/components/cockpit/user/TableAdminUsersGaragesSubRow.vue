<template>
  <div>
    <TableRow v-for="user in row.users" :key="user.id" class="users">
      <TableRowCell class="row-cell" id="job" :style="{ flex: 2 }">
        <div class="admin-user">
          <nuxt-link
            :to="to(user)"
            :event="'click'"
            :class="{ me: isMe(user), 'call-to-action': true }">
            <!--display user name or email-->
            <span>{{ user.fullName && user.fullName.search('undefined') === -1 ? user.fullName: user.email }}</span>
            <i
              v-if="isGarageScore"
              class="icon-gs-user-anonymous clickable call-to-action"
              v-tooltip="{ content: $t_locale('components/cockpit/user/TableAdminUsersGaragesSubRow')('ConnectAs') }"
              @click="connectAs(user.id, user.email)"
            />
            <!--display job title-->
            <br v-if="user.job">
            <span v-if="user.job" class="job">
              {{ user.job }}
            </span>
          </nuxt-link>
        </div>
      </TableRowCell>
      <TableRowCell class="row-cell" center>
        <UserRole :userRole="user.role"/>
      </TableRowCell>
      <TableRowCell class="row-cell" center>
        <div class="radio">
          <input
            type="radio"
            :id="radioName(user.id, 'Unsatisfied_Maintenance')"
            :name="row.id + 'Unsatisfied_Maintenance'"
            @click="setAssignedUser(user.id, 'Unsatisfied_Maintenance')"
            :value="user.id"
            v-model="Unsatisfied_Maintenance">
          <label :for="radioName(user.id, 'Unsatisfied_Maintenance')" class="radio-label"></label>
        </div>
      </TableRowCell>
      <TableRowCell class="row-cell" center>
        <div class="radio">
          <input
            type="radio"
            :id="radioName(user.id, 'Unsatisfied_NewVehicleSale')"
            :name="row.id + 'Unsatisfied_NewVehicleSale'"
            @click="setAssignedUser(user.id, 'Unsatisfied_NewVehicleSale')"
            :value="user.id"
            v-model="Unsatisfied_NewVehicleSale">
          <label :for="radioName(user.id, 'Unsatisfied_NewVehicleSale')" class="radio-label"></label>
        </div>
      </TableRowCell>
      <TableRowCell class="row-cell" center>
        <div class="radio">
          <input
            type="radio"
            :id="radioName(user.id, 'Unsatisfied_UsedVehicleSale')"
            :name="row.id + 'Unsatisfied_UsedVehicleSale'"
            @click="setAssignedUser(user.id, 'Unsatisfied_UsedVehicleSale')"
            :value="user.id"
            v-model="Unsatisfied_UsedVehicleSale">
          <label :for="radioName(user.id, 'Unsatisfied_UsedVehicleSale')" class="radio-label"></label>
        </div>
      </TableRowCell>
      <TableRowCell class="row-cell" center>
        <div class="radio">
          <input
            type="radio"
            :id="radioName(user.id, 'Lead_Maintenance')"
            :name="row.id + 'Lead_Maintenance'"
            @click="setAssignedUser(user.id, 'Lead_Maintenance')"
            :value="user.id"
            v-model="Lead_Maintenance">
          <label :for="radioName(user.id, 'Lead_Maintenance')" class="radio-label"></label>
        </div>
      </TableRowCell>
      <TableRowCell class="row-cell" center>
        <div class="radio">
          <input
            type="radio"
            :id="radioName(user.id, 'Lead_NewVehicleSale')"
            :name="row.id + 'Lead_NewVehicleSale'"
            @click="setAssignedUser(user.id, 'Lead_NewVehicleSale')"
            :value="user.id"
            v-model="Lead_NewVehicleSale">
          <label :for="radioName(user.id, 'Lead_NewVehicleSale')" class="radio-label"></label>
        </div>
      </TableRowCell>
      <TableRowCell class="row-cell" center>
        <div class="radio">
          <input
            type="radio"
            :id="radioName(user.id, 'Lead_UsedVehicleSale')"
            :name="row.id + 'Lead_UsedVehicleSale'"
            @click="setAssignedUser(user.id, 'Lead_UsedVehicleSale')"
            :value="user.id"
            v-model="Lead_UsedVehicleSale">
          <label :for="radioName(user.id, 'Lead_UsedVehicleSale')" class="radio-label"></label>
        </div>
      </TableRowCell>
    </TableRow>
  </div>
</template>

<script>
import IconLabel from '~/components/global/IconLabel';
import UserRole from "~/components/global/UserRole";

export default {
  components: { IconLabel, UserRole },
  data() {
    return {
      Unsatisfied_Maintenance: '',
      Unsatisfied_NewVehicleSale: '',
      Unsatisfied_UsedVehicleSale: '',
      Lead_Maintenance: '',
      Lead_NewVehicleSale: '',
      Lead_UsedVehicleSale: '',
    };
  },

  props: {
    row: Object,
    assignedUser: Function,
    currentUser: Object,
    isGarageScore: [Array, Boolean]
  },

  mounted() {
    this.displayCheckedRadio();
  },

  methods: {
    radioName(userId, alertType) {
      return this.row.id + userId + alertType;
    },
    async setAssignedUser(userId, alertType) {
      const oldUser = this.findUserTicket(alertType);
      const oldUserId = oldUser ? oldUser.id : '';
      await this.assignedUser(this.row.id, userId, oldUserId, alertType);
    },
    findUserTicket(alertType) {
      if (this.row.ticketsConfiguration && this.row.ticketsConfiguration[alertType]) {
        const userId = this.row.ticketsConfiguration[alertType];
        return this.row.users.find(u => userId && u.id.toString() === userId.toString());
      }
      return null;
    },
    displayCheckedRadio() {
      const Unsatisfied_Maintenance = this.findUserTicket('Unsatisfied_Maintenance');
      if (Unsatisfied_Maintenance) this.Unsatisfied_Maintenance = Unsatisfied_Maintenance.id;
      const Unsatisfied_NewVehicleSale = this.findUserTicket('Unsatisfied_NewVehicleSale');
      if (Unsatisfied_NewVehicleSale) this.Unsatisfied_NewVehicleSale = Unsatisfied_NewVehicleSale.id;
      const Unsatisfied_UsedVehicleSale = this.findUserTicket('Unsatisfied_UsedVehicleSale');
      if (Unsatisfied_UsedVehicleSale) this.Unsatisfied_UsedVehicleSale = Unsatisfied_UsedVehicleSale.id;
      const Lead_Maintenance = this.findUserTicket('Lead_Maintenance');
      if (Lead_Maintenance) this.Lead_Maintenance = Lead_Maintenance.id;
      const Lead_NewVehicleSale = this.findUserTicket('Lead_NewVehicleSale');
      if (Lead_NewVehicleSale) this.Lead_NewVehicleSale = Lead_NewVehicleSale.id;
      const Lead_UsedVehicleSale = this.findUserTicket('Lead_UsedVehicleSale');
      if (Lead_UsedVehicleSale) this.Lead_UsedVehicleSale = Lead_UsedVehicleSale.id;
    },
    connectAs(id, userEmail) {
      this.$store.dispatch('cockpit/admin/users/connectAs', { id, userEmail });
    },
    isMe(user) {
      return this.currentUser.id && this.currentUser.id.toString() === user.id.toString();
    },
    to(user) {
      if (this.isMe(user)) {
        return { name: 'cockpit-admin-profile' };
      }
      return { name: 'cockpit-admin-user-id', query: { id: user.id } }
    }
  },
  computed: {}
};
</script>

<style lang="scss" scoped>
a {
  text-decoration: none !important;
}
.me {
  color: $orange !important;
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

.radio {
  input[type="radio"] {
    position: absolute;
    opacity: 0;
    + .radio-label {
      &:before {
        content: '';
        border-radius: 50%;
        border: 2px solid $dark-grey;
        display: inline-block;
        width: 0.7145rem;
        height: 0.7145rem;
        position: relative;
        vertical-align: top;
        cursor: pointer;
        text-align: center;
        transition: all 250ms ease;
      }
    }
    &:checked {
      + .radio-label {
        &:before {
          background-color: $blue;
          border: 2px solid $blue;
          box-shadow: inset 0 0 0 0.1rem $bg-grey;
        }
      }
    }
  }
}

.disabled {
  cursor: default;
  text-decoration: none;
  color: $dark-grey;
}

.admin-user {
  padding-left: 1.3rem;
  text-align: left;
  line-height: 1.5;
}

.job {
  color: $grey;
}

.row-cell {
  background-color: $bg-grey;
}
div {
  margin-left: 0;
  box-sizing: border-box;
  text-align: center;
}

.call-to-action.disabled:hover {
  cursor: not-allowed;
  color: $blue;
}
.low-opacity {
  opacity: 0.5;
}
.users {
  display: flex;
  flex-direction: row;
  width: 100%;
  background-color: $white;
}
.user-type {
  padding: 1rem 0 0 0;
}
.c-icon-label {
  &--pointer {
    cursor: pointer;
    user-select: none;
  }
}
</style>
