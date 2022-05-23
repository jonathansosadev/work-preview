<template>
  <TableRow class="table-admin">
    <TableRowCell :style="{ flex: 2 }">
      <div class="table-admin__garage">
        <AppText tag="span" bold class="table-admin__garage--name">
          <template v-if="row.externalId">[{{row.externalId}}] - </template>
          {{ row.publicDisplayName }}
        </AppText>
      </div>
      <AppText tag="span" bold class="table-admin__garage--btn" @click.native="onDetailsClick()" >
        {{ $t_locale('components/cockpit/user/TableAdminUsersGaragesRow')("userDetails") }}
        <i class="table-admin__garage--btn--icon" :class="{ 'icon-gs-up': showSubRow, 'icon-gs-down': !showSubRow }" />
      </AppText>
    </TableRowCell>
    <TableRowCell center>
      <AppText type="muted" tag="p">
        {{ row.countAllSubscribedUsers }}
      </AppText>
    </TableRowCell>
    <TableRowCell center>
      <AppText type="muted" tag="p">
        <!--unsatisfied APV-->
        {{ displayAssignedUser('Unsatisfied_Maintenance') }}
      </AppText>
    </TableRowCell>
    <TableRowCell center>
      <AppText type="muted" tag="p">
        <!--unsatisfied VN-->
        {{ displayAssignedUser('Unsatisfied_NewVehicleSale') }}
      </AppText>
    </TableRowCell>
    <TableRowCell center>
      <AppText type="muted" tag="p">
        <!--unsatisfied VO-->
        {{ displayAssignedUser('Unsatisfied_UsedVehicleSale') }}
      </AppText>
    </TableRowCell>
    <TableRowCell center>
      <AppText type="muted" tag="p">
        <!--Lead APV-->
        {{ displayAssignedUser('Lead_Maintenance') }}
      </AppText>
    </TableRowCell>
    <TableRowCell center>
      <AppText type="muted" tag="p">
        <!--Lead VN-->
        {{ displayAssignedUser('Lead_NewVehicleSale') }}
      </AppText>
    </TableRowCell>
    <TableRowCell center>
      <AppText type="muted" tag="p">
        <!--Lead VO-->
        {{ displayAssignedUser('Lead_UsedVehicleSale') }}
      </AppText>
    </TableRowCell>
  </TableRow>
</template>

<script>
import IconLabel from '~/components/global/IconLabel';

export default {
  components: { IconLabel },

  props: {
    row: Object
  },

  computed: {
    showSubRow() {
      return this.row.displaySubView;
    }
  },

  methods: {
    onDetailsClick() {
      this.row.displaySubView = !this.row.displaySubView;
    },
    displayAssignedUser(alertType) {
      if (this.row.ticketsConfiguration && this.row.ticketsConfiguration[alertType]) {
        const userId = this.row.ticketsConfiguration[alertType];
        const findUser = this.row.users.find((u) => userId && u.id.toString() === userId.toString());
        if (findUser && findUser.fullName && !findUser.fullName.includes('undefined')) {
          return findUser.fullName.split(' ') // sam man -> ['sam', 'man']
            .map(name => name && name[0].toUpperCase()) // ['S', 'M']
            .join('.'); // S.M
        }
        if (findUser && findUser.email) {
          return findUser.email[0].toUpperCase();
        }
        return '-';
      }
      return '-';
    }
  },
};
</script>

<style lang="scss" scoped>
.table-admin {
  background-color: $white;
  cursor: pointer;

  &__garage {
    display: flex;
    flex-flow: row;

    &--name {
      color: $black;
      font-weight: 700;
      font-size: 1rem;
    }
    &--btn {
      display: flex;
      color: $dark-grey;
      font-weight: 700;
      font-size: .9rem;
      margin-top: .5rem;
      align-items: center;

      &--icon {
        font-size: .8rem;
        margin-left: .3rem;
      }
    }
  }

  &__garage-icon {
    margin-right: 0.5rem;
  }

  &__garage-label {
    margin-right: 0.5rem;
  }
}
</style>
