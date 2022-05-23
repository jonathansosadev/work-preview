<template>
  <Card class="card-user-role">
    <div class="card-user-role__header">
      <div class="card-user-role__header-part">
        <Title icon="icon-gs-group">{{ $t_locale('components/cockpit/admin/CardUserRole')("Role") }}</Title>
      </div>
    </div>
    <div class="card-user-role__body">
      <div class="card-user-role__body__header">
        <Radio
          class="card-user-role__body__header__radio"
          v-if="!roleIsDisabled(UserRoles.SUPER_ADMIN)"
          v-model="role"
          :radioValue="UserRoles.SUPER_ADMIN"
          name="role"
        >{{ $t_locale('components/cockpit/admin/CardUserRole')(UserRoles.SUPER_ADMIN) }}</Radio>
        <Radio
          class="card-user-role__body__header__radio"
          v-if="!roleIsDisabled(UserRoles.ADMIN)"
          v-model="role"
          :radioValue="UserRoles.ADMIN"
          name="role"
        >{{ $t_locale('components/cockpit/admin/CardUserRole')(UserRoles.ADMIN) }}</Radio>
        <Radio
          class="card-user-role__body__header__radio"
          v-model="role"
          :radioValue="UserRoles.USER"
          name="role"
        >{{ $t_locale('components/cockpit/admin/CardUserRole')(UserRoles.USER) }}</Radio>
      </div>
      <div class="card-user-role__body__content">
        <div class="card-user-role__body__content__text">
          <AppText tag="span" type="muted">{{ $t_locale('components/cockpit/admin/CardUserRole')(`${role}_text`) }}</AppText>
        </div>
      </div>
    </div>
  </Card>
</template>


<script>
import { UserRoles } from '~/utils/enumV2';

export default {
  name: 'CardUserRole',
  props: {
    userRole: {
      type: String,
      default: UserRoles.USER
    },
    currentUserRole: {
      type: String,
      default: UserRoles.USER
    }
  },
  data() {
    return {
      role: this.userRole,
      UserRoles
    }
  },
  watch: {
    'role': {
      handler(val) {
        this.$store.dispatch('cockpit/admin/profile/updateRole', {
          role: val
        });
      }
    }
  },
  computed: {
    roleListWhichCanBeManaged() {
      return UserRoles.getPropertyFromValue(this.currentUserRole, 'canCreateUser') || [];
    }
  },
  methods: {
    roleIsDisabled(role) {
      return !this.roleListWhichCanBeManaged.includes(role);
    }
  }
}
</script>

<style lang="scss">
.card-user-role {
  &__header {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid $grey;
  }

  &__header-part + &__header-part {
    margin-left: 1rem;
  }

  &__header-part {
    display: flex;
    align-items: center;
  }

  &__header-toggle {
    margin-right: 1rem;
  }

  &__header-loading {
    margin-right: 0.25rem;
  }

  &__body {
    margin-top: 1rem;
    display:  flex;
    flex-wrap: wrap;
    flex-direction: column;

    &__header {
        padding: 0.25rem;

        &__radio {
            color: $dark-grey;
          &--disabled {
            color: rgba($black, 0.5);
            cursor: not-allowed!important;
          }
        }
        &__radio:not(:last-child) {
            padding-right: 1rem;
            border-right: 1px solid rgba($grey, .5);
            margin-right: 1rem;
        }
    }
    &__content {
        width: 100%;
        display: flex;
        flex-direction: column;
        margin-top: 1rem;
        box-sizing: border-box;
        flex-wrap: nowrap;
        border-left: .357rem solid $blue;
        padding-left: .357rem;
        border-radius: 3px;

        &__title {
            margin-bottom: 10px;
        }
        &__text {
            line-height: 1.5;
        }
    }
  }



  &__item + &__item {
    margin-left: 1rem;
  }
}
</style>
