<template>
  <div class="survey-garage">
    <div class="survey-garage__garage">
      <div class="survey-garage__garage__name">
        {{ garageName }}
      </div>
      <div class="survey-garage__garage__subtitle">
        <i class="icon-gs-programming-time"></i>{{ $t_locale('components/cockpit/admin/surveys/SurveyGarage')('surveyTiming') }}
      </div>
      <div class="survey-garage__garage__mirror" v-if="isMirror">
        {{ $t_locale('components/cockpit/admin/surveys/SurveyGarage')('annex') }}&nbsp;<span @click="annexContact()">{{ $t_locale('components/cockpit/admin/surveys/SurveyGarage')('contact') }}</span>
      </div>
    </div>

    <div class="survey-garage__signature">
      <div class="survey-garage__signature__title">
        <i class="icon-gs-pencil"></i>{{ $t_locale('components/cockpit/admin/surveys/SurveyGarage')('emailSignature') }}
      </div>
      <div class="survey-garage__signature__input-line survey-garage__signature__input-line--fix-margin">
        <InputMaterial
          class="survey-garage__signature__input-line__input"
          v-model="lastName"
          type="text"
          :placeholder="$t_locale('components/cockpit/admin/surveys/SurveyGarage')('lastName')"
          :isValid="isValid(lastName) ? 'noErr': 'Invalid'"
          :error="errorMessage('lastName')"
        ></InputMaterial>
        <InputMaterial
          class="survey-garage__signature__input-line__input"
          v-model="firstName"
          type="text"
          :placeholder="$t_locale('components/cockpit/admin/surveys/SurveyGarage')('firstName')"
          :isValid="isValid(firstName) ? 'noErr': 'Invalid'"
          :error="errorMessage('firstName')"
        ></InputMaterial>
      </div>
      <div class="survey-garage__signature__input-line survey-garage__signature__input-line--fix-margin">
        <InputMaterial
          class="survey-garage__signature__input-line__input"
          v-model="job"
          type="text"
          :placeholder="$t_locale('components/cockpit/admin/surveys/SurveyGarage')('job')"
          :isValid="isValid(job) ? 'noErr': 'Invalid'"
          :error="errorMessage('job')"
          fixedWidth="100%"
        ></InputMaterial>
      </div>
      <div class="survey-garage__signature__input-line">
        <div class="survey-garage__signature__input-line__label">{{ $t_locale('components/cockpit/admin/surveys/SurveyGarage')('useDefault') }}</div>
        <Toggle v-model="useDefault"></Toggle>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  props: {
    // Immutable garageName and it's mirror attribute
    garageName: String,
    isMirror: Boolean,
    // Subject to change: signature specs
    signatureLastName: String,
    signatureFirstName: String,
    signatureJob: String,
    signatureUseDefault: Boolean,
    // Event callback
    updateSignature: Function,
    currentUser: Object,
    openModal: {
      type: Function,
      required: true,
    },
    closeModal: {
      type: Function,
      required: true,
    },
  },
  computed: {
    lastName: {
      get() {
        return this.signatureLastName;
      },
      set(value) {
        this.updateSignature({ key: 'lastName', value });
      }
    },
    firstName: {
      get() {
        return this.signatureFirstName;
      },
      set(value) {
        this.updateSignature({ key: 'firstName', value });
      }
    },
    job: {
      get() {
        return this.signatureJob;
      },
      set(value) {
        this.updateSignature({ key: 'job', value });
      }
    },
    useDefault: {
      get() {
        return this.signatureUseDefault;
      },
      set(value) {
        this.updateSignature({ key: 'useDefault', value });
      }
    },
    isValid() {
      return (value) => value && value.length > 0;
    },
    errorMessage() {
      return (key) => this.isValid(this[key]) ? '' : this.$t_locale('components/cockpit/admin/surveys/SurveyGarage')('required', { prop: this.$t_locale('components/cockpit/admin/surveys/SurveyGarage')(`prop_${key}`) });
    },
  },
  methods: {
    annexContact() {
      this.openModal(
        {
          component: 'ModalContactForm',
          props: {
            subject: this.$t_locale('components/cockpit/admin/surveys/SurveyGarage')('subject'),
            titleProp: this.$t_locale('components/cockpit/admin/surveys/SurveyGarage')('titleProp'),
            subtitleProp: this.$t_locale('components/cockpit/admin/surveys/SurveyGarage')('subtitleProp'),
            iconProp: 'icon-gs-alertes',
            user: this.currentUser,
            openModal: this.openModal,
            closeModal: this.closeModal,
          }
        }
      );
    },
  }
}
</script>

<style lang="scss" scoped>
$margin: 1rem;

.survey-garage {
  display: flex;
  flex-flow: column;
  flex-grow: 1;
  justify-content: space-between;
  text-align: left;
  width:calc(100% - (2 * #{$margin}));
  padding: 0 0 1rem 1rem;

  &__garage {
    display: flex;
    flex-flow: column;
    justify-content: flex-start;
    align-items: flex-start;
    margin-bottom: 2rem;

    &__name {
      margin-bottom: 1rem;
      font-size: 1.2rem;
      font-weight: 700;
      color: $black;
    }
    &__subtitle {
      margin-bottom: 0.5rem;
      font-size: 1rem;
      font-weight: 700;
      color: $dark-grey;
      i {
        margin-right: 5px;
      }
    }
    &__mirror {
      font-size: 0.9rem;
      color: $dark-grey;
      > span {
        color: $link-blue;
        text-decoration: none;
        cursor: pointer;
        font-weight: bold;
        &:hover{
          text-decoration: underline;
        }
      }
    }
  }

  &__signature {
    display: flex;
    flex-flow: column;
    justify-content: flex-start;
    align-items: flex-start;

    &__title {
      margin-bottom: 1rem;
      font-size: 1rem;
      font-weight: 700;
      color: $dark-grey;
      i {
        margin-right: 5px;
      }
    }

    &__input-line {
      display: flex;
      flex-flow: row;
      justify-content: space-between;
      width: 100%;

      &--fix-margin {
        margin-top: -1rem;
        margin-bottom: 1rem;
      }

      &__label {
        color: $dark-grey;
        align-self: center;
      }
      &__input {
        font-size: 1rem;
        color: $black;
        margin: 0;
        padding: 0;
      }
      &__input + &__input {
        margin-left: 1rem;
      }
    }

  }

}
</style>
