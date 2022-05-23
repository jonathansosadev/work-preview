<template>
  <div class="setup-custom-content" ref="setupCustomContent">
    <template v-if="isPreview">
      <div class="setup-custom-content__preview setup-custom-content__preview--preview-mode" >
        <AutomationCampaignEmail v-bind="emailProps"/>
      </div>
    </template>
    <template v-else>
     <SetupStep v-bind="getSetupStepProps('name')" v-if="openedStep !== 'customContent'">
        <template slot="input">
          <input-material :error="nameError" :fixedWidth="'265px'" v-model="nameInput" :minLength="nameMinSize" :maxLength="nameMaxSize" :isValid="inputNameValid">
            <template slot="label">{{ $t_locale('components/cockpit/automation/SetupCustomContent')('name_label') }}</template>
          </input-material>
        </template>
      </SetupStep>
      <SetupStep v-bind="getSetupStepProps('garages')" v-if="openedStep !== 'customContent'">
        <template slot="input">
          <MultiSelectMaterial
            class="setup-custom-content__multiselect"
            :placeholder="`${$t_locale('components/cockpit/automation/SetupCustomContent')('garages_search')}`"
            v-model="garagesSelected"
            :multiple="true"
            :options="garagesOptions"
            :noResult="$t_locale('components/cockpit/automation/SetupCustomContent')('garages_noGarage')"
          >
          </MultiSelectMaterial>
        </template>
      </SetupStep>
      <SetupStep noHeader noButtons v-bind="getSetupStepProps('customContent')" :noBorder="openedStep === 'customContent'">
        <template slot="input">
            <div class="setup-custom-content__body-container">
              <div class="setup-custom-content__preview custom-scrollbar">
                <AutomationCampaignEmail v-bind="emailProps"/>
              </div>
              <div class="setup-custom-content__editor">
                <CampaignEditor
                  class="setup-custom-content__editor-component"
                  :themeColor="customContentInputValue.themeColor"
                  :textColor="customContentInputValue.textColor"
                  :text="customContentInputValue.promotionalMessage"
                  :maxLength="customContentMaxLength"
                  :minLength="customContentMinLength"
                  @change="setCustomContentInput"
                  :isValid="isValid"
                  :onValidate="validateInput"
                  :onCancel="cancelInput"
                  :updateActionToggle="updateActionToggle"
                  :updateCumtomUrl="updateCumtomUrl"
                  :actionToggleUrl="actionToggleUrl"
                  :customUrlValid="customUrlValid"
                  :customUrl="customUrl"
                  :customButtonText="customButtonText"
                  :updateCustomButtonText="updateCustomButtonText"
                  :updateToggleCustomContent="updateToggleCustomContent"
                  :toggleCustomContent="toggleCustomContent"
                />
              </div>
            </div>
        </template>
      </SetupStep>
      <SetupStep v-bind="getSetupStepProps('activePeriod')" v-if="openedStep !== 'customContent'">
        <template slot="input">
          <div class="setup-custom-content__active-period-date-container">
            <input-material class="setup-custom-content__active-period-date-container__start-input" :minDate="activePeriodStartDateMinimum" :maxDate="activePeriodStartDateMaximum" v-model="activePeriodInputValue.startDate" type="date">
              <template slot="label">{{ $t_locale('components/cockpit/automation/SetupCustomContent')('activePeriod_labelStart') }}</template>
            </input-material>
            <input-material v-if="!(activePeriodInputValue.noExpirationDate)" :minDate="activePeriodEndDateMinimum" :maxDate="activePeriodEndDateMaximum" v-model="activePeriodInputValue.endDate" type="date">
              <template slot="label">{{ $t_locale('components/cockpit/automation/SetupCustomContent')('activePeriod_labelEnd') }}</template>
            </input-material>
          </div>
          <CheckBox
            class="setup-custom-content__active-period-date-container__checkbox"
            @change="toggleNoExpirationDate"
            :label="$t_locale('components/cockpit/automation/SetupCustomContent')('activePeriod_labelNoExpirationDate')"
            :checked="activePeriodInputValue.noExpirationDate"
            :labelStyle="checkboxLabelStyle"
          />
        </template>
      </SetupStep>
    </template>

  </div>
</template>

<script>
import CampaignEditor from "~/components/cockpit/automation/CampaignEditor";
import AutomationCampaignEmail from "~/components/emails/pages/automation/AutomationCampaignEmail.vue";
import { Blue } from '~/assets/style/global.scss';

export default {
  components: { CampaignEditor, AutomationCampaignEmail },
  name: 'AutomationSetupCustomContent',
  data() {
    return  {
      garagesSelected: []
    };
  },

  props: {
    target: String,
    availableGarages: Array,
    onChange: Function,
    onSave: Function,
    setValidate: Function,
    isPreview: Boolean,
    isModification: Boolean,
    inputSaveFile: Object,
    preselectedGarages: Array,
    alreadyTakenNames: Array,
    changeStep: null,
    fieldNames: Array,
    saveFile: Object,
    nameMinSize: Number,
    nameMaxSize: Number,
    nameValidatedValue: String,
    nameInputValue: String,
    garagesValidatedValue: Array,
    garagesInputValue: Array,
    customContentValidatedValue: Object,
    customContentInputValue: Object,
    customContentMaxLength: Number,
    customContentMinLength: Number,
    activePeriodValidatedValue: Object,
    activePeriodInputValue: Object,
    customUrlValidatedValue: String,
    customUrl: String,
    customUrlValid: Boolean,
    actionToggleUrl: Boolean,
    openedStep: String,
    garagesOptions: Array,
    updateNameInputValue: Function,
    validateInput: Function,
    isFilled: Function,
    updateGaragesInputValue: Function,
    updateActionToggle: Function,
    updateCumtomUrl: Function,
    cancelInput: Function,
    prefilledValues: Function,
    customButtonText: String,
    updateCustomButtonText: Function,
    actionToggleButtonText: Boolean,
    updateToggleCustomContent: Function,
    toggleCustomContent: Boolean,
  },
  mounted() {
    this.prefilledValues();
  },
  watch: {
    garagesSelected() {
      this.updateGaragesInputValue(this.garagesSelected);
    }
  },
  computed: {
    nameInput: {
      get () {
        return this.nameInputValue;
      },
      set (val) {
        this.updateNameInputValue(val);
      }
    },
    nameError() {
      return this.isNameNotAlreadyTaken ? '' : this.$t_locale('components/cockpit/automation/SetupCustomContent')('nameAlreadyTaken')
    },
    isEditCustomContent() {
      return this.openedStep === 'customContent';
    },
    isNameNotAlreadyTaken() {
      return !(this.alreadyTakenNames && this.alreadyTakenNames.includes(this.nameInputValue) && this.nameInputValue !== this.nameValidatedValue);
    },
    isValid() {
      if (this.openedStep === 'name') {
        return this.isNameNotAlreadyTaken && !!(this.nameInputValue && this.nameInputValue.length >= this.nameMinSize && this.nameInputValue.length <= this.nameMaxSize)
      }
      if (this.openedStep === 'garages') {
        return this.isModification || (this.garagesInputValue && this.garagesInputValue.length > 0);
      }
      if (this.openedStep === 'customContent') {
        return !!(this.customContentInputValue.themeColor && this.customContentInputValue.promotionalMessage
          && this.customContentInputValue.promotionalMessage.replace(/<[^>]*>?/gm, '').length <= this.customContentMaxLength
          && this.customContentInputValue.promotionalMessage.replace(/<[^>]*>?/gm, '').length >= this.customContentMinLength) ||
          !this.toggleCustomContent;
      }
      if (this.openedStep === 'activePeriod') {
        return !!(this.activePeriodInputValue.startDate && (this.activePeriodInputValue.endDate || this.activePeriodInputValue.noExpirationDate));
      }
      return false;
    },
    inputNameValid() {
      return this.isValid ? 'Valid' : 'Invalid'
    },
    previewGaragePublicDisplayName() {
      const garageToTakeTheLogoFrom = this.garagesValidatedValue && this.garagesValidatedValue.length ? this.garagesValidatedValue[0] : this.availableGarages[0];
      return garageToTakeTheLogoFrom && garageToTakeTheLogoFrom.label && garageToTakeTheLogoFrom.label.replace(/ *\([^)]*\) */g, "") || "GarageName";
    },
    previewGarageBrandName() {
      const garageToTakeTheLogoFrom = this.garagesValidatedValue && this.garagesValidatedValue.length ? this.garagesValidatedValue[0] : this.availableGarages[0];
      return garageToTakeTheLogoFrom && garageToTakeTheLogoFrom.garageBrand || "Maker";
    },
    previewLogoUrl() {
      const garageToTakeTheLogoFrom = this.garagesValidatedValue && this.garagesValidatedValue.length ? this.garagesValidatedValue[0] : this.availableGarages[0];
      return garageToTakeTheLogoFrom && garageToTakeTheLogoFrom.garageLogo;
    },
    emailProps() {
      return {
        logoUrl: this.previewLogoUrl,
        themeColor: this.customContentInputValue.themeColor,
        promotionalMessage: this.customContentInputValue.promotionalMessage,
        garageName: this.previewGaragePublicDisplayName,
        customerName: 'Jean Dubois',
        brandName: this.previewGarageBrandName,
        target: this.target,
        customUrl: this.customUrl,
        actionToggleUrl: this.actionToggleUrl,
        isEditCustomContent: this.isEditCustomContent,
        customButtonText: this.customButtonText,
        actionToggleButtonText: this.actionToggleButtonText,
        toggleCustomContent: this.toggleCustomContent,
        isPreview: true,
      };
    },
    activePeriodEndDateMinimum() {
      if (this.activePeriodInputValue.startDate) {
        return new Date(this.activePeriodInputValue.startDate);
      }
      const tommorow = new Date();
      tommorow.setDate(tommorow.getDate() + 1)
      return tommorow;
    },
    activePeriodEndDateMaximum() {
      return null;
    },
    activePeriodStartDateMinimum() {
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const startDate = this.activePeriodValidatedValue && this.activePeriodValidatedValue.startDate ? new Date(this.activePeriodValidatedValue.startDate) : null
      if (startDate && startDate.getTime() < tomorrow.getTime()) {
        return startDate;
      }
      return tomorrow;
    },
    activePeriodStartDateMaximum() {
      if (this.activePeriodInputValue.endDate) {
        return new Date(this.activePeriodInputValue.endDate);
      }
      return null;
    },
    checkboxLabelStyle() {
      if (this.activePeriodInputValue.noExpirationDate) {
        return `color: ${Blue};`;
      }
    }
  },
  methods: {
    allIsFilled() {
      return !(this.openedStep || this.fieldNames && this.fieldNames.some((e) => !(this.isFilled(e))));
    },
    toggleNoExpirationDate() {
      this.activePeriodInputValue.startDate = this.activePeriodInputValue.startDate || this.activePeriodStartDateMinimum
      this.activePeriodInputValue.noExpirationDate = !(this.activePeriodInputValue.noExpirationDate)
    },
    getSetupStepProps(fieldName) {
      return {
        stepName: fieldName,
        label: this.$t_locale('components/cockpit/automation/SetupCustomContent')(`${fieldName}_label`, {}, fieldName),
        subLabel: this.formattedSubLabel(fieldName),
        isOpen: this.openedStep === fieldName,
        filled: this.isFilled(fieldName),
        isValid: this.isValid,
        onSetActive: this.setActiveStep,
        onValidate: this.validateInput,
        onCancel: this.cancelInput,
        ref: fieldName,
        isModification: !!(this.inputSaveFile)
      }
    },
    formattedSubLabel(fieldName) {
      if (fieldName === 'activePeriod') {
        if (this.activePeriodValidatedValue && this.activePeriodValidatedValue.startDate && this.activePeriodValidatedValue.noExpirationDate) {
          return this.$t_locale('components/cockpit/automation/SetupCustomContent')('activePeriod_subLabel_noExpirationDate', { date: this.$dd(this.activePeriodValidatedValue.startDate, 'short') })
        } else if (this.activePeriodValidatedValue && this.activePeriodValidatedValue.startDate && this.activePeriodValidatedValue.endDate) {
          return `${this.$dd(this.activePeriodValidatedValue.startDate, 'short')} - ${this.$dd(this.activePeriodValidatedValue.endDate, 'short')}`
        }
        return this.$t_locale('components/cockpit/automation/SetupCustomContent')('activePeriod_subLabel');
      }
      if (fieldName === 'customContent') {
        //return this[`${fieldName}ValidatedValue`].promotionalMessage ? this[`${fieldName}ValidatedValue`].promotionalMessage.replace('<br>', ' ').replace(/<[^>]*>?/gm, '') : this.$t_locale('components/cockpit/automation/SetupCustomContent')(`${fieldName}_subLabel`) // comment until Romain change mind...
        let customContentFilled = this[`${fieldName}ValidatedValue`].promotionalMessage ? this.$t_locale('components/cockpit/automation/SetupCustomContent')(`${fieldName}_filled`, {}, fieldName) : this.$t_locale('components/cockpit/automation/SetupCustomContent')(`${fieldName}_subLabel`, {}, fieldName);
        if (this.actionToggleUrl) {
          customContentFilled = customContentFilled + ` | ${this.$t_locale('components/cockpit/automation/SetupCustomContent')("redirection")}`;
        }
        return customContentFilled;
      }
      if (fieldName === 'garages') {

        if (this[`${fieldName}ValidatedValue`] && this[`${fieldName}ValidatedValue`].length > 1) {
          return this.$t_locale('components/cockpit/automation/SetupCustomContent')(`${fieldName}_many_subLabel`, { amount: this[`${fieldName}ValidatedValue`].length }, fieldName);
        } else if (this[`${fieldName}ValidatedValue`] && this[`${fieldName}ValidatedValue`].length === 1) {
          return this[`${fieldName}ValidatedValue`][0].label;
        }
        return this.$t_locale('components/cockpit/automation/SetupCustomContent')(`${fieldName}_subLabel`, {}, fieldName);
      }
      return this[`${fieldName}ValidatedValue`] || this.$t_locale('components/cockpit/automation/SetupCustomContent')(`${fieldName}_subLabel`, {}, fieldName);
    },
    setActiveStep(stepName) {
      this.$emit('openedStep', stepName);
      this.$nextTick(() => {
        this.setValidate(this.allIsFilled())
      })
    },
    setCustomContentInput(modifiedDatas) {
      this.customContentInputValue.textColor = modifiedDatas.textColor;
      this.customContentInputValue.promotionalMessage = modifiedDatas.text;
      this.customContentInputValue.themeColor = modifiedDatas.themeColor;
    },
  },
};
</script>

<style lang="scss" scoped>
.setup-custom-content {
  &__multiselect {
    max-width: 560px;
  }
  &__editor-component {
    width: 25vw;
  }
  &__centered-button-container {
    display:flex;
    justify-content: center;
    flex-direction: row;
  }
  &__active-period-date-container {
    display:flex;
    flex-direction: row;

    &__start-input {
      margin-right: 1.5rem;
    }
    &__checkbox {
      margin-top: .7rem;
      font-weight: 700;
      font-size: 1rem!important;
    }
  }
  &__body-container {
    display: flex;
    flex-direction: row;
    width: 100%;
    max-height: 58vh;
  }
  &__preview {
    width: calc(600px + 2rem);
    margin-right: 1rem;
    box-shadow: 0 0 3px 0 rgba($black, .16);
    flex-shrink: 0;
    padding: 1rem 1rem 1.5rem;
    box-sizing: border-box;
    overflow-y: auto;
    overflow-x: hidden;
    height: 60vh;

    &--preview-mode {
        width: 600px;
        height: inherit;
        padding: 0;
        margin: 0;
        margin-left: 10px;
    }
  }
}
</style>
