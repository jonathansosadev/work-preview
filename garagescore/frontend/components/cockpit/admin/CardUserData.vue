<template>
  <div class="card-user-data">
    <div class="card-user-data__header">
      <Title icon="icon-gs-user">{{$t_locale('components/cockpit/admin/CardUserData')("PersonalData")}}</Title>
    </div>
    <div class="card-user-data__body">
      <div class="card-user-data__part">
        <Radio class="card-user-data__radio" v-model="form.civility" radioValue="M" name="civility">{{$t_locale('components/cockpit/admin/CardUserData')("Mr")}}</Radio>
        <Radio class="card-user-data__radio" v-model="form.civility" radioValue="Mme" name="civility">{{$t_locale('components/cockpit/admin/CardUserData')("Ms")}}</Radio>
        <div class="card-user-data__radio-required-label" v-if="isMyProfile">
          <AppText tag="span" type="danger" size="sm">(*) {{$t_locale('components/cockpit/admin/CardUserData')("Required")}}</AppText>
        </div>
      </div>
      <div class="card-user-data__part">
        <div class="card-user-data__field">
          <InputMaterial v-model="form.lastname" :is-valid="validate.lastname" :required="isMyProfile">
            <template slot="label">{{$t_locale('components/cockpit/admin/CardUserData')("LastName")}}</template>
          </InputMaterial>
        </div>
        <div class="card-user-data__field">
          <InputMaterial v-model="form.firstname" :is-valid="validate.firstname" :required="isMyProfile">
            <template slot="label">{{$t_locale('components/cockpit/admin/CardUserData')("FirstName")}}</template>
          </InputMaterial>
        </div>
      </div>
      <div class="card-user-data__part">
        <div class="card-user-data__field">
          <InputMaterial v-model="form.email" :is-valid="validate.email" :required="isMyProfile">
            <template slot="label">{{$t_locale('components/cockpit/admin/CardUserData')("Email")}}</template>
          </InputMaterial>
        </div>
        <div class="card-user-data__field">
          <SelectMaterial v-model="form.job" :is-valid="validate.job" :options="jobsOptions" :required="isMyProfile">
            <template slot="label">{{$t_locale('components/cockpit/admin/CardUserData')("Job")}}</template>
          </SelectMaterial>
        </div>
      </div>
      <div class="card-user-data__part">
        <div class="card-user-data__field">
          <PhoneInputMaterial v-model="form.phone" :validate="validatePhone" :required="isMyProfile" mode="landLine">
            <template slot="label">{{$t_locale('components/cockpit/admin/CardUserData')("Phone")}}</template>
          </PhoneInputMaterial>
        </div>
        <div class="card-user-data__field">
          <PhoneInputMaterial v-model="form.mobile" :validate="validateMobile" :required="isMyProfile" mode="mobile">
            <template slot="label">{{$t_locale('components/cockpit/admin/CardUserData')("MobilePhone")}}</template>
          </PhoneInputMaterial>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import fieldsValidation from '~/util/fieldsValidation';
import { valid } from 'semver';

export default {
  props: {
    civility: String,
    firstname: String,
    lastname: String,
    job: String,
    mobile: String,
    phone: String,
    email: String,
    isValid: Boolean,
    currentUserIsGarageScoreUser: Boolean,
    userJobs: Array
  },

  data() {
    return {
      form: {
        civility: this.civility,
        firstname: this.firstname,
        lastname: this.lastname,
        job: this.job,
        mobile: this.mobile,
        phone: this.phone,
        email: this.email,
      },
      isMobileValid: false,
      isPhoneValid: false
    }
  },

  watch: {
    'form': {
      deep: true,
      handler(value, oldvalue) {
        Object.keys(value).forEach(e => {
          if(value[e] !== this[e]) {
            this.$emit(`update:${e}`, value[e])
          }
        });
      }
    },

    'validate': {
      immediate: true,
      handler (value) {
        this.$emit('update:isValid', Object.keys(value).every(e => value[e] === 'Valid'));
      }
    }
  },

  methods: {
    validateMobile(validationResult) {
      this.isMobileValid = validationResult;
    },
    validatePhone(validationResult) {
      this.isPhoneValid = validationResult;
    },
    isUserEmailGarageScore(email) {
      return email && !!email.match(/@garagescore\.com|@custeed\.com/)
    }
  },

  computed: {
    // required field is based on auth.js isProfileComplete method
    isMyProfile() {
      return (this.$store.state.route.name === 'cockpit-admin-profile');
    },

    // One of this should be validate if is my profile
    isPhoneValidate() {
      if(this.isMyProfile) {
        return this.isMobileValid || this.isPhoneValid;
      } else {
        if (this.form.mobile) return this.isMobileValid && (!this.form.phone || this.isPhoneValid);
        if (this.form.phone) return this.isPhoneValid && (!this.form.mobile || this.isMobileValid);
        return true;
      }
    },

    isCivilityValidate(){
      if (this.isMyProfile) {
        return this.civility !== null ? 'Valid' : 'Invalid';
      }
      return 'Valid';
    },

    validate() {
      return {
        civility: this.isCivilityValidate,
        job: this.job !== null ? 'Valid' : 'Invalid',
        firstname: fieldsValidation(this.firstname, 'text', { required: this.isMyProfile }).status,
        lastname: fieldsValidation(this.lastname, 'text', { required: this.isMyProfile }).status,
        email: fieldsValidation(this.email, 'email', { required: this.isMyProfile }).status,
        mobile: this.isPhoneValidate ? 'Valid' : 'Invalid',
        phone: this.isPhoneValidate ? 'Valid' : 'Invalid',
      }
    },

    jobsOptions() {
      if(this.currentUserIsGarageScoreUser && this.isUserEmailGarageScore(this.form.email)) {
        this.form.job = 'Custeed';
        return [{ label: 'Custeed', value: 'Custeed' }];
      }
      return this.userJobs.map((name) => ({ label: this.$t_locale('components/cockpit/admin/CardUserData')(name.replace(/'/g,''), {}, name.replace(/'/g,'')),  value: name })) || [];
    }
  }
}
</script>

<style lang="scss">
.card-user-data {
  &__header {
    width: calc(100% - 2.5rem);
    padding-bottom: 0.7rem;
    padding-left: 1rem;
    border-bottom: 1px solid rgba($grey, .7);
  }

  &__body {
    margin-top: 1rem;
    display: flex;
    flex-flow: column;
    border-right: 1px solid rgba($grey, .5);
    padding-right: 2.5rem;
    padding-left: 1rem;
  }

  &__radio {
    & + & {
      margin-left: 1rem;
    }
  }


  &__radio-required-label {
    margin-left: auto;
  }

  &__field {
    flex: 1;

    &:first-child {
      margin-right: 0.5rem;
    }

    &:last-child {
      margin-left: 0.5rem;
    }
  }


  &__part {
    display: flex;
    flex-flow: row;

    & + & {
      margin-top: 1.5rem;
    }
  }
}
@media (max-width: $breakpoint-min-md) {
  .card-user-data {
    &__header {
      width: 100%;
      padding-left: 0;
    }
    &__body {
      border-right: none;
      padding-right: 0;
      padding-left: 0;
    }
  }
}
</style>

