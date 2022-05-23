<template>
  <div class="wizard-step-transfert">
    <div class="wizard-step-transfert__part" v-if="exclusiveUsers.length">
      <h4 class="wizard-step-transfert__part__title">{{ $t_locale('components/global/WizardStepTransfert')('ExclusiveUsers', { name:  garageDisplayName}) }}</h4>
      <div class="wizard-step-transfert__part__users">

        <button role="button" class="wizard-step-transfert__part__users__user"
          :class="classBinding(user.id)"
          v-for="user in exclusiveUsers"
          :key="user.id"
          @click="onOptionClick(user.id)"
          v-tooltip="showTooltip(user.id)"
        >

          <div v-if="user.firstName || user.lastName" class="wizard-step-transfert__part__users__user__name">
            {{ user.firstName ? `${user.firstName[0]}. ` : '' }}{{ user.lastName }}
          </div>
          <div v-else class="wizard-step-transfert__part__users__user__name">
            {{ user.email }}
          </div>
          <div v-if="user.job" class="wizard-step-transfert__part__users__user__job">
            {{ user.job || '' }}
          </div>
        </button>
      </div>
    </div>
    <div class="wizard-step-transfert__part" v-if="multiUsers.length">
      <h4 class="wizard-step-transfert__part__title">{{ $t_locale('components/global/WizardStepTransfert')('NonExclusiveUsers') }}</h4>
      <div class="wizard-step-transfert__part__users">
        <button role="button" class="wizard-step-transfert__part__users__user"
          :class="classBinding(user.id)"
          v-for="user in multiUsers"
          :key="user.id"
          @click="onOptionClick(user.id)"
          v-tooltip="showTooltip(user.id)"
        >
          <div v-if="user.firstName || user.lastName" class="wizard-step-transfert__part__users__user__name">
            {{ user.firstName ? `${user.firstName[0]}. ` : '' }}{{ user.lastName }}
          </div>
          <div v-else class="wizard-step-transfert__part__users__user__name">
            {{ user.email }}
          </div>
          <div v-if="user.job" class="wizard-step-transfert__part__users__user__job">
            {{ user.job || '' }}
          </div>
        </button>
      </div>
    </div>
    <div class="wizard-step-transfert__part" v-if="canCreateUser">
      <h4 class="wizard-step-transfert__part__title--bordered"></h4>
      <div class="wizard-step-transfert__part__users">
        <button role="button" class="wizard-step-transfert__part__users__user wizard-step-transfert__part__users__add" @click="openModal">
          <i class="icon-gs-add-user wizard-step-transfert__part__users__icon" /> {{ $t_locale('components/global/WizardStepTransfert')('addUser') }}
        </button>
      </div>
    </div>

  </div>
</template>

<script>
import { UserRoles } from '~/utils/enumV2';

export default {
  props: {
    users: Array,
    value: String,
    garageId: String,
    garageDisplayName: String,
    openModalDispatch: Function,
    appendTicketUserDispatch: Function,
    ticketManagerId: String,
    currentUserIsGarageScoreUser: Boolean,
    jobsByCockpitType: Array,
    userRole: String,
    availableGarages: Array,
  },

  computed: {
    canCreateUser() {
      return UserRoles.getPropertyFromValue(this.userRole, 'canCreateUser');
    },
    exclusiveUsers() {
      return this.users.filter(u => u.hasOnlyThisGarage);
    },
    multiUsers() {
      return this.users.filter(u => !u.hasOnlyThisGarage);
    },
  },

  methods: {
    classBinding(id) {
      return {
        'wizard-step-transfert__part__users__user--active': this.value === id,
        'wizard-step-transfert__part__users__user--disable': this.isTicketManager(id),
      }
    },

    isTicketManager(id) {
      return id === this.ticketManagerId;
    },

    showTooltip(userId) {
      return this.isTicketManager(userId) ? {
        content: this.$t_locale('components/global/WizardStepTransfert')('userAlreadyAssociated'),
        placement: 'bottom-center'
      } : {}
    },

    onOptionClick(val) {
      if (this.isTicketManager(val)) return;
      this.$emit('input', val);
      this.$emit('validate');
    },


    openModal() {
      this.openModalDispatch({
        component: 'ModalAddUser',
        props: {
          userRole: this.userRole,
          onUserAdded: this.onUserAdded,
          selectedGarageIds: [this.garageId],
          currentUserIsGarageScoreUser: this.currentUserIsGarageScoreUser,
          jobsByCockpitType: this.jobsByCockpitType,
          garages: this.availableGarages
        }
      });
    },

    onUserAdded(resp, selectedGarages, icon, title) {
      if (selectedGarages.find(garage => this.garageId === garage.value)) {
        resp.user.hasOnlyThisGarage = (selectedGarages && selectedGarages.length === 1);
        this.appendTicketUserDispatch({ user: resp.user });
      } else {
        const subtitle = this.$t_locale('components/global/WizardStepTransfert')('subtitle', { email: resp.user.email, garage: this.garageDisplayName });
        this.openModalDispatch({
          component: 'ModalMessage',
          props: {
            subtitle,
            type: 'success',
            icon: icon,
            title: title
          }
        });
      }
    }
  }
}
</script>


<style lang="scss" scoped>
.wizard-step-transfert {

  &__part {

    &__title {
      padding: 0 0 0 0.5rem;
      margin-bottom: 0.5rem;

      &--bordered {
        padding: .5rem 0 0 0;
        border-top: 1px solid $light-grey;
        width: calc(100% - 1rem);
        margin: auto;
        margin-top: 1rem;
      }
    }

    &__users {

      display: flex;
      width: 100%;
      flex-flow: row;
      flex-wrap: wrap;
      justify-content: flex-start;
      align-items: center;

      &__user {
        width: calc(25% - 1rem);
        height: 4.5rem;
        margin: 0.5rem;
        padding: 1rem;
        border: 1px solid $orange;
        cursor: pointer;
        background-color: transparent;
        outline: none;
        font-size: 0.9rem;
        overflow: hidden;
        border-radius: 5px;

        &__name {
          color: $black;
          font-weight: 700;
          font-size: 1rem;
          margin-bottom: .35rem;
        }

        &__job {
          color: $dark-grey;
          font-size: 0.75rem;
        }

        &:hover {
          background-color: lighten($orange, 40%);
        }

        &--active {
          background-color: $orange;
          color: $white;

          .wizard-step-transfert__part__users__user__name, .wizard-step-transfert__part__users__user__job {
            color: $white;
          }

          &:hover {
            background-color: $orange;
          }
        }

        &--disable {
          border-radius: 3px;
          border: solid 1px $grey;
          background-color: rgba(237, 86, 0, 0);
          cursor: not-allowed;
          .wizard-step-transfert__part__users__user__name, .wizard-step-transfert__part__users__user__job {
            color: $grey;
          }

          &:hover {
            background-color: rgba(237, 86, 0, 0);
          }
        }
      }

      &__add {
        background: $orange;
        color: $white;
        display: flex;
        justify-content: center;
        font-size: .92rem;
        font-weight: 700;
        height: 30px;
        width: auto;
        border-radius: 20px;
        padding: .5rem 1rem;

        i {
          margin-right: .5rem;
        }
      }

      &__icon {
        font-size: 1rem;
      }

    }

  }
}
</style>
