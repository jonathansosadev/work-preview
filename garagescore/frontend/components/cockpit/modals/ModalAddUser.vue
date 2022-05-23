<template>
  <ModalBase class="modal-add-user">
    <template slot="header-icon">
      <i :class="icon"></i>
    </template>
    <template slot="header-title">
      <span>{{ title }}</span>
    </template>
    <template slot="header-subtitle">
      <span>{{ $t_locale('components/cockpit/modals/ModalAddUser')('subtitle') }}</span>
    </template>
    <template slot="body">
      <div class="modal-add-user__content">
        <!-- Email -->

        <div class="modal-add-user__content__field">
          <InputMaterial
            :placeholder="$t_locale('components/cockpit/modals/ModalAddUser')('ChooseEmail')"
            @blur="checkEmail()"
            :error="inputNewUserError"
            v-model="newUser.email"
            required
          >
            <template slot="label">{{ $t_locale('components/cockpit/modals/ModalAddUser')('newEmail') }}</template>
          </InputMaterial>
        </div>

        <!-- Role -->
        <template @click.native="closeAllOtherDropdowns(null, $event)">
          <div class="modal-add-user__content__field">
            <DropdownSelector
              :label="$t_locale('components/cockpit/modals/ModalAddUser')('Role')"
              :title="roleTitle"
              :subtitle="$t_locale('components/cockpit/modals/ModalAddUser')('ChooseRole')"
              :items="translatedRoles"
              v-model="newUser.role"
              :callback="dropdownSelectorRole"
              :ref="dropdown.role"
              @click.native.stop="closeAllOtherDropdowns(dropdown.role, $event)"
              required
              type="material"
              size="max-width"
            />
          </div>

          <!-- Function -->

          <div class="modal-add-user__content__field">
            <DropdownSelector
              :label="$t_locale('components/cockpit/modals/ModalAddUser')('Job')"
              :title="jobTitle"
              :subtitle="$t_locale('components/cockpit/modals/ModalAddUser')('ChooseJob')"
              :items="translatedJobs"
              v-model="newUser.job"
              :callback="dropdownSelectorJob"
              :ref="dropdown.job"
              @click.native.stop="closeAllOtherDropdowns(dropdown.job, $event)"
              required
              type="material"
              size="max-width"
            />
          </div>

          <!-- Garages -->

          <div class="modal-add-user__content__field modal-add-user__content__field--garage-list">
            <MultiSelectMaterial
              :placeholder="$t_locale('components/cockpit/modals/ModalAddUser')('ChooseGarage')"
              v-model="selectedGarages"
              :multiple="true"
              :options="garagesOptions"
              :noResult="$t_locale('components/cockpit/modals/ModalAddUser')('NoGarages')"
              :label="$t_locale('components/cockpit/modals/ModalAddUser')('Garages')"
              :select-label="$t_locale('components/cockpit/modals/ModalAddUser')('clickToConfirm')"
              required
            ></MultiSelectMaterial>
          </div>
        </template>
      </div>
    </template>
    <template slot="footer">
      <div class="modal-add-user__footer">
        <Button
          type="orange"
          class="btn validate-closing-btn"
          :disabled="!canValidate"
          @click.native="_addUser()"
          thick
        >
          <span v-if="!inputNewUserIsOk">{{ $t_locale('components/cockpit/modals/ModalAddUser')('pleaseValidEmail') }}</span>
          <span v-else-if="!newUser.role">{{ $t_locale('components/cockpit/modals/ModalAddUser')('pleaseValidRole') }}</span>
          <span v-else-if="!newUser.job">{{ $t_locale('components/cockpit/modals/ModalAddUser')('pleaseValidJob') }}</span>
          <span v-else-if="countSelectedGarages <= 0">{{ $t_locale('components/cockpit/modals/ModalAddUser')('pleaseValidGarage') }}</span>
          <span v-else>{{ $t_locale('components/cockpit/modals/ModalAddUser')('Send') }}</span>
        </Button>
      </div>
    </template>
  </ModalBase>
</template>

<script>
import { validateEmail } from '~/util/email';
import { UserRoles } from '~/utils/enumV2';
import DropdownSelector from '../../global/DropdownSelector';

export default {
  name: 'ModalAddUser',
  components: { DropdownSelector },
  props: {
    selectedGarageIds: {
      type: Array,
      default() {
        return [];
      },
    },
    onUserAdded: { type: Function },
    currentUserIsGarageScoreUser: { type: Boolean },
    jobsByCockpitType: Array,
    garages: Array,
    userRole: String,
  },

  watch: {
    'newUser.email': function (currentEmail, oldEmail) {
      this.checkEmail(true, oldEmail);
    },
    selectedGarages(garages) {
      const all = garages.find((garage) => garage.value === 'All');
      if (all && this.selectedGarages.length > 1) {
        this.selectedGarages = [all];
      }
    },
  },

  data() {
    return {
      newUser: {
        email: '',
        role: '',
        job: '',
      },

      inputNewUserPristine: true,
      inputNewUserError: '',
      inputNewUserIsOk: false,
      userGarageListLoaded: false,

      selectedGarage: '',
      selectedGarages: [],
      selectedGarageError: '',

      hoveredGarage: null,

      icon: "icon-gs-add-user",
      title: this.$t_locale('components/cockpit/modals/ModalAddUser')("AddOneUser"),

      roleTitle: this.$t_locale('components/cockpit/modals/ModalAddUser')('ChooseRole'),
      jobTitle: this.$t_locale('components/cockpit/modals/ModalAddUser')('ChooseJob'),

      dropdown: {
        role: 'dropdownRole',
        job: 'dropdownJob',
      },
    };
  },
  computed: {
    canValidate() {
      return (this.countSelectedGarages > 0) && this.inputNewUserIsOk && this.newUser.role && this.newUser.job;
    },
    countSelectedGarages() {
      return this.selectedGarages.length;
    },
    userJobs() {
      if (this.currentUserIsGarageScoreUser && this.isNewUserEmailGarageScore(this.newUser.email)) {
        return [{ name: 'Custeed' }];
      }
      return this.jobsByCockpitType || [];
    },
    translatedJobs() {
      return this.userJobs.map(({ name = '' }) => ({
        job: name,
        label: this.$t_locale('components/cockpit/modals/ModalAddUser')(name.replace(/'/g,'')),
      }));
    },
    translatedRoles() {
      const rolesWhichCanBeCreated = UserRoles.getPropertyFromValue(this.userRole, 'canCreateUser');
      if (!rolesWhichCanBeCreated) return [];
      return UserRoles.values().filter(userRole => rolesWhichCanBeCreated.includes(userRole)).map(userRole => ({
        role: userRole,
        label: this.$t_locale('components/cockpit/modals/ModalAddUser')(userRole),
      }));
    },
    formattedGarageList() {
      return this.garages.map((garage) => ({
        label: garage.publicDisplayName,
        value: garage.id,
        $isDisabled: (this.selectedGarages && this.selectedGarages[0] && this.selectedGarages[0].value === 'All'),
      }));
    },
    garagesOptions() {
      if (!this.garages) return [];
      return [
        {
          label: this.$t_locale('components/cockpit/modals/ModalAddUser')('Garage_All'),
          value: 'All',
          $isDisabled: false,
        }, ...this.formattedGarageList];
    },
  },

  methods: {
    checkEmail(checkIfGoodOnly, oldEmail) {
      if (validateEmail(this.newUser.email) === 'OK') {
        this.inputNewUserError = '';
        this.inputNewUserIsOk = true;
        this.inputNewUserPristine = false;
      } else if (
        !checkIfGoodOnly &&
        !this.inputNewUserPristine &&
        validateEmail(this.newUser.email) === 'empty'
      ) {
        this.inputNewUserError = `${this.$t_locale('components/cockpit/modals/ModalAddUser')('missingEmail')}.`;
        this.inputNewUserIsOk = false;
      } else if (
        !checkIfGoodOnly &&
        validateEmail(this.newUser.email) === 'invalid'
      ) {
        this.inputNewUserError = `${this.$t_locale('components/cockpit/modals/ModalAddUser')('invalidEmail')}.`;
        this.inputNewUserIsOk = false;
        this.inputNewUserPristine = false;
      }

      if (validateEmail(this.newUser.email) === 'OK'
        && this.currentUserIsGarageScoreUser
        && this.isNewUserEmailGarageScore(this.newUser.email)) {
        this.newUser.job = { 'name': 'Custeed', 'label': 'Custeed' };
      }

      if (this.currentUserIsGarageScoreUser
        && !this.isNewUserEmailGarageScore(this.newUser.email)
        && this.isNewUserEmailGarageScore(oldEmail)) {
        this.newUser.job = '';
      }

    },

    async _addUser() {
      if (
        this.inputNewUserIsOk &&
        this.countSelectedGarages > 0 &&
        this.newUser.job &&
        this.newUser.role
      ) {
        const res = await this.$store.dispatch(
          'cockpit/admin/profile/validateEmail',
          this.newUser.email,
        );
        this.inputNewUserIsOk = false;
        if (res && res.error) {
          this.inputNewUserError = `${this.$t_locale('components/cockpit/modals/ModalAddUser')('invalidEmail')}.`;
          this.inputNewUserPristine = false;
          console.log(res.error);
          return;
        } else this.inputNewUserIsOk = true;
        if (this.selectedGarages[0].value === 'All' && !this.isNewUserEmailGarageScore(this.newUser.email) &&
          this.currentUserIsGarageScoreUser) {
          alert(`${this.$t_locale('components/cockpit/modals/ModalAddUser')('CusteedUsersShouldNotGiveEveryGaragesToNormalUsers')}.`);
          return;
        }
        const resp = await this.$store.dispatch('profile/addUser', {
          newUser: this.newUser,
          garages: (this.selectedGarages[0].value === 'All' ? [] : this.selectedGarages.map(garage => garage.value)),
        });
        this.$store.dispatch('closeModal');
        if (resp.data.message === 'userAdded') {
          if (this.onUserAdded)
            this.onUserAdded(
              resp.data,
              this.selectedGarages,
              this.icon,
              this.title,
            );
        } else if (resp.data.message === 'userAlreadyExists') {
          const subtitle = this.$t_locale('components/cockpit/modals/ModalAddUser')('failAdd', { email: resp.data.emailSentTo });
          this.$store.dispatch('openModal', {
            component: 'ModalMessage',
            props: {
              subtitle,
              type: 'danger',
              icon: this.icon,
              title: this.title,
            },
          });
        }
      }
    },

    isNewUserEmailGarageScore(email) {
      return email && !!email.match(/@garagescore\.com|@custeed\.com/);
    },
    closeAllOtherDropdowns(clickedRef) {
      const dropdownRefs = Object.values(this.dropdown);
      for (const currentRef in this.$refs) {
        if (this.$refs[currentRef] && dropdownRefs.includes(currentRef) && (clickedRef !== currentRef)) {
          this.$refs[currentRef].$refs.dropdown.closeDropdown();
        }
      }
      // Automatically scroll to bottom
      const container = this.$el.querySelector('.modal-base__body');
      container.scrollTop = container.scrollHeight;
    },
    dropdownSelectorRole({ label, role = "" }) {
      this.newUser.role = role;

      if (role) {
        this.roleTitle = label;
      } else {
        this.roleTitle = this.$t_locale('components/cockpit/modals/ModalAddUser')('ChooseRole');
      }
    },
    dropdownSelectorJob({ label, job = "" }) {
      this.newUser.job = job;

      if (job) {
        this.jobTitle = label;
      } else {
        this.jobTitle = this.$t_locale('components/cockpit/modals/ModalAddUser')('ChooseJob');
      }
    },
  },
  mounted() {
    if (this.selectedGarageIds && this.selectedGarageIds.length > 0) {
      this.selectedGarages.push(...this.garagesOptions.filter(option => this.selectedGarageIds.includes(option.value)));
    }
  },
};
</script>

<style lang="scss" scoped>
.modal-add-user {
  overflow: auto;
  height: 100%;

  &__content {
    position: relative;

    &__field {
      margin-bottom: 2rem;

      ::v-deep .input-material__input::placeholder {
        color: $dark-grey !important;
        font-size: 0.9rem;
      }

      ::v-deep .multiselect__input {
        position: relative !important;
      }

      ::v-deep .multiselect__input::placeholder {
        color: $dark-grey !important;
        font-size: 0.9rem;
      }

      &__label {
        margin-bottom: 0.5rem;
        font-weight: bold;
      }

      &--garage-list {
        margin-top: 3rem;

        ::v-deep .multiselect__tags {
          overflow: hidden;
          max-height: calc(
            70vh - (2.4rem + 9rem + 3.6rem + 35px + 50px + 35px)
          );
        }
      }
    }
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
