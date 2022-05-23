<template>
  <div class="survey-input">
    <div class="survey-input__timing">
      <div
        class="survey-input__timing__preview"
        @click="renderContactPreview()"
        v-tooltip="{ content: $t_locale('components/cockpit/admin/surveys/SurveyInput')('previewEmail') }"
      >
        <i class="icon-gs-eye" />
        <span>
          {{ $t_locale('components/cockpit/admin/surveys/SurveyInput')('previewEmail') }}
        </span>
      </div>
      <SelectMaterial class="survey-input__timing__input" small v-model="value" :options="options">
        <template slot="label">{{label}}{{multi ? ' *' : ''}}</template>
      </SelectMaterial>
      <div class="survey-input__timing__modified " v-if="history && history.length > 0">
        {{ $t_locale('components/cockpit/admin/surveys/SurveyInput')('modified', { date: $d(new Date(history[0].date), 'admin') }) }}&nbsp;&nbsp;
        <i class="icon-gs-help no-tablet no-mobile" v-tooltip="{ content: historyTitle }" />
      </div>
    </div>

    <div class="survey-input__signature">
      <div class="survey-input__signature__title">
        hidden
      </div>
      <div class="survey-input__signature__input-line survey-garage__signature__input-line--fix-margin">
        <InputMaterial
          class="survey-input__signature__input-line__input"
          :class="inputClassModifier"
          v-model="lastName"
          type="text"
          :placeholder="$t_locale('components/cockpit/admin/surveys/SurveyInput')('lastName')"
          :disabled="signatureUseDefault"
          :isValid="isValid(lastName) ? 'noErr': 'Invalid'"
          :error="errorMessage('lastName')"
        ></InputMaterial>
        <InputMaterial
          class="survey-input__signature__input-line__input"
          :class="inputClassModifier"
          v-model="firstName"
          type="text"
          :placeholder="$t_locale('components/cockpit/admin/surveys/SurveyInput')('firstName')"
          :disabled="signatureUseDefault"
          :isValid="isValid(firstName) ? 'noErr': 'Invalid'"
          :error="errorMessage('firstName')"
        ></InputMaterial>
      </div>
      <div class="survey-input__signature__input-line survey-garage__signature__input-line--fix-margin">
        <InputMaterial
          class="survey-input__signature__input-line__input"
          :class="inputClassModifier"
          v-model="job"
          type="text"
          :placeholder="$t_locale('components/cockpit/admin/surveys/SurveyInput')('job')"
          :disabled="signatureUseDefault"
          :isValid="isValid(job) ? 'noErr': 'Invalid'"
          :error="errorMessage('job')"
          fixedWidth="100%"
        ></InputMaterial>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';


export default {
  props: {
    label: String,
    garage: Object,
    type: String,
    multi: Boolean,
    // Subject to change: signature specs
    signatureLastName: String,
    signatureFirstName: String,
    signatureJob: String,
    signatureUseDefault: Boolean,
    // Event callback
    updateSignature: Function,
    //  prop drilling
    openModal: {
      type: Function,
      required: true,
    },
    updateMakeSurvey: {
      type: Function,
      required: true,
    },
    removeMakeSurvey: {
      type: Function,
      required: true,
    },

  },
  data() {
    return {
      actualValue: 0,
      baseValue: -1,
      placeHolder: '-',
      initValue: false
    }
  },
  watch: {
    garage() {
      // Init again
      this.actualValue = 0;
      this.baseValue = -1;
      this.placeHolder = '-';
      //
      this.value = this.garage.firstContactDelay[this.type].value || 0;
    },
    signatureUseDefault() {
      if (!this.signatureUseDefault) {
        this.updateSignature({ key: 'firstName', value: this.firstName });
        this.updateSignature({ key: 'lastName', value: this.lastName });
        this.updateSignature({ key: 'job', value: this.job });
      }
    }
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
    isValid() {
      return (value) => this.signatureUseDefault || (value && value.length > 0);
    },
    errorMessage() {
      return (key) => this.isValid(this[key]) ? '' : this.$t_locale('components/cockpit/admin/surveys/SurveyInput')('required', { prop: this.$t_locale('components/cockpit/admin/surveys/SurveyInput')(`prop_${key}`, {}, key) });
    },
    inputClassModifier() {
      return {
        'survey-input__signature__input-line__input--disabled': this.signatureUseDefault
      };
    },
    history() {
      return this.garage.firstContactDelay[this.type].history;
    },
    options() {
      let result = [];
      for (let i = 1; i <= 30; i++) {
        result.push({label: `${this.$t_locale('components/cockpit/admin/surveys/SurveyInput')('J+')}${i}`, value: i - 1})
      }
      return result;
    },
    historyTitle() {
      let result = '';
      for (let i = 0; i < this.history.length; i++) {
        if (i !== 0) {
          result += '--------------\n'
        }
        const from = this.$t_locale('components/cockpit/admin/surveys/SurveyInput')('From', {
          userEmail: this.formatUser(this.history[i].userId, this.history[i].userFirstName, this.history[i].userLastName, this.history[i].userEmail)
        });
        const at = this.$t_locale('components/cockpit/admin/surveys/SurveyInput')('at', {
           date: this.$d(new Date(this.history[i].date), 'admin')
        });
        const historyLog  = this.$t_locale('components/cockpit/admin/surveys/SurveyInput')('historyLog', {
          prevValue: this.history[i].prevValue + 1 || 0,
          value: this.history[i].value + 1 || 0
        });
        result += `${from}\n${at}\n${historyLog}\n`;
      }
      return result;
    },
    value: {
      // getter
      get() {
        return this.actualValue || 0;
      },
      // setter
      set: function (newValue) {
        if (this.baseValue === -1) {
          this.baseValue = newValue;
          this.actualValue = newValue;
        }
        if (this.baseValue !== parseInt(newValue, 10)) {
          this.updateMakeSurvey({
            value: parseInt(newValue, 10),
            brand: this.label,
            garageId: this.garage.id,
            type: this.type,
          });
        } else {
          this.removeMakeSurvey({
            brand: this.label,
            garageId: this.garage.id,
            type: this.type,
          });
        }
      }
    }
  },
  methods: {
    formatUser(id, firstName, lastName, email) {
      if (!id) {
        return this.$t_locale('components/cockpit/admin/surveys/SurveyInput')('deletedUser');
      }
      else if (firstName && lastName) {
        return `${firstName} ${lastName}`.trim()
      } else if (email) {
        return email
      } else {
        return this.$t_locale('components/cockpit/admin/surveys/SurveyInput')('deletedUser');
      }
    },
    async renderContactPreview() {
      let res = await axios.post(`/cockpit/contact/preview-generate`, {
        contactType: 'Campaign',
        contactId: this.garage.contactIds[this.type],
        garageId: this.garage.id,
        garageType: this.garage.garageType,
        email: 'previsualisation@exemple.com'
      });
      if (res.data) {
        this.openModal({
          component: 'ModalMakeSurveysPrevisualisation',
          props: {
            htmlBody: res.data.htmlBody,
            subject: res.data.subject,
          },
        });
      } else {
        console.error(`Error generating preview : ${JSON.stringify(res, null, 4)}`)
      }
    },
  },
  mounted() {
    this.value = this.garage.firstContactDelay[this.type].value || 0;
  }
}
</script>

<style lang="scss" scoped>

.survey-input {
  display: flex;
  flex-flow: column;
  flex-grow: 1;
  justify-content: space-between;
  text-align: left;

  &__timing {
    display: flex;
    flex-flow: column;
    justify-content: flex-start;
    align-items: flex-start;
    margin-bottom: 2rem;

    &__preview {
      display: flex;
      align-items: center;
      margin-bottom: 1rem;
      -ms-word-break: break-word;
      word-break: break-word;
      color: $orange;
      text-decoration: none;
      cursor: pointer;
      font-size: 0.85rem; // 12px

      i {
        margin-right: 5px;
        font-size: 10px;
        padding: .5rem;
        background: rgba($grey, .15);
        border-radius: 3px;
      }
    }

    &__input {
      margin-bottom: 0.5rem;
      margin-top: 0;
      ::v-deep .select-material__label {
        font-size: 0.857rem;
        padding-top: 0;
        top: 0;
      }
    }

    &__modified {
      margin-bottom: 0.5rem;
      font-size: 0.85rem; // 12px
      color: $green;
      > i {
        cursor: pointer;
        color: $grey;
        font-size: 0.71rem; // 10px
      }
    }
  }

  &__signature {
    display: flex;
    flex-flow: column;
    justify-content: flex-start;
    align-items: flex-start;
    padding-bottom: 2.65rem; // That corresponds to the toggle on SurveyGarage

    &__title {
      // Little hack so it takes the space without being shown
      visibility: hidden;
      margin-bottom: 1rem;
      font-size: 1rem;
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
        margin: 0;
        padding: 0;

        &--disabled {
          ::v-deep .input-material__indicator {
            border-bottom: 2px dashed $grey;
          }
        }
      }
      &__input + &__input {
        margin-left: 1rem;
      }
    }

  }
}

@media screen and (max-width: calc(#{$breakpoint-max-md})) {
  .survey-input {
    width: calc(100% - 1rem);
    &__modified {
      height:auto;
      margin-bottom:0.5rem;
    }
  }
}
</style>
