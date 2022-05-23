<template>
  <ModalBase class="modal-custom-content" type="danger" :overrideCloseCross="overrideClose">
    <template slot="header-icon">
      <img ref="logo" src="/logo/logo-custeed-picto.svg" class="modal-custom-content__logo" alt="custeed">
    </template>
    <template slot="header-title">
      <span>{{ title }}</span>
    </template>
    <template slot="header-subtitle">
      <span>{{ subtitle }}</span>
    </template>
    <template slot="bodyheader">
      <template v-if="showBodyHeader">
        <div class="modal-custom-content__back">
          <div @click="toggleView('list')" class="modal-custom-content__back__cta">
            <i class="icon-gs-left-circle"/>
            <AppText class="modal-custom-content__back__text" tag="div" bold>{{ $t_locale('components/cockpit/automation/ModalCustomContent')('back') }}</AppText>
          </div>
          <div class="modal-custom-content__back__filler">
          </div>
        </div>
      </template>
      <div v-if="display === 'list'" class="modal-custom-content__add-custom-content" track-id="customContentAdd">
        <Button type="contained-orange" @click="toggleView('setup')" :disabled="isLoading()" track-id="customContentAdd">
          <template>
            <template slot="left">
              <i track-id="customContentAdd" class="icon-gs-add" />
            </template>
            <AppText tag="span" track-id="customContentAdd">{{ $t_locale('components/cockpit/automation/ModalCustomContent')('addNewCustomContent') }}</AppText>
          </template>
        </Button>
      </div>
    </template>
    <template slot="body">
      <template v-if="display === 'list'">
        <template v-if="isLoading()">
          <TableRowAutomationSkeleton v-for="n in 10"  :key="n" :columnCount="5" fixedHeight="83px" />
        </template>
        <template v-else>
          <CustomContentList
            :customContents="availableCustomContents"
            :onModify="onCustomContentModify"
            :onDelete="onCustomContentDelete"
            :onPreview="onCustomContentPreview"
          />
        </template>
      </template>
      <template v-if="display === 'setup'">
        <SetupCustomContent 
          v-on:openedStep="setCustomContentOpenedStep"
          class="modal-custom-content__setup"
          v-bind="setupCustomContentProps"
        />
      </template>
      <template v-if="display === 'modification'">
        <SetupCustomContent 
          isModification
          v-on:openedStep="setCustomContentOpenedStep" 
          class="modal-custom-content__setup" 
          v-bind="setupCustomContentProps"
        />
      </template>
      <template v-if="display === 'preview'">
        <SetupCustomContent 
          isPreview
          v-bind="setupCustomContentProps"
        />
      </template>
      <template v-if="display === 'deletion'">
        <div class="modal-custom-content__delete">
          <i class="icon-gs-alert-information-circle"/>
          <AppText class="modal-custom-content__delete__title" tag="span" align="center" bold>{{ $t_locale('components/cockpit/automation/ModalCustomContent')('deletionTitle') }}</AppText>
          <AppText class="modal-custom-content__delete__text" tag="span" align="center" bold>{{ $t_locale('components/cockpit/automation/ModalCustomContent')('deletionContent', { amountGarages: toDeleteCustomContent.amountGarages }) }}<br/>{{ $t_locale('components/cockpit/automation/ModalCustomContent')('deletionContent2') }}</AppText>
        </div>
      </template>
    </template>
    <template slot="footer" >
      <!--for interface edit custom content-->
      <div class="modal-custom-content__footer" v-if="isEditCustomContent">
        <template>
          <Button @click="cancelInput('customContent')" type="phantom">
            <span>{{ $t_locale('components/cockpit/automation/ModalCustomContent')('cancel') }}</span>
          </Button>
          &nbsp;&nbsp;
          <Button @click="validateInput('customContent')" :disabled="confirmButtonDisabled" type="orange">
            <span>{{ $t_locale('components/cockpit/automation/ModalCustomContent')('valid') }}</span>
          </Button>
        </template>
      </div>
      <!--for interface setup, modification, deletion and save in DB-->
      <div class="modal-custom-content__footer" v-else>
        <template v-if="display === 'setup' || display === 'modification' || display === 'deletion'">
          <Button @click="toggleView('list')" type="phantom">
            <span>{{ $t_locale('components/cockpit/automation/ModalCustomContent')('cancel') }}</span>
          </Button>
          &nbsp;&nbsp;
          <Button @click="confirmFunction" type="orange" :disabled="confirmButtonDisabled">
            <span>{{ confirmButtonLabel }}</span>
          </Button>
        </template>
      </div>
    </template>
  </ModalBase>
</template>


<script>
import SetupCustomContent from '~/components/cockpit/automation/SetupCustomContent';
import CustomContentList from "~/components/cockpit/automation/CustomContentList";
import TableRowAutomationSkeleton from '~/components/global/skeleton/TableRowAutomationSkeleton';


export default {
  components: { CustomContentList, SetupCustomContent, TableRowAutomationSkeleton },
  props: {
    availableGarages: Array,
    availableCustomContents: Array,
    target: String,
    onSave: Function,
    onDelete: Function,
    preselectedGarages: Array,
    previewCustomContentId: String,
    isLoading: Function
  },
  data() {
    return {
      isAllValid: false,
      saveInput: null,
      mountedInterval: null,
      display: 'list',
      modificationSaveFile: {},
      selectedCustomContent: {},
      toDeleteCustomContent: null,
      customContentOpenedStep: null,
      changeStep: null,
      fieldNames: [
        'name',
        'garages',
        'customContent',
        'activePeriod'
      ],
      saveFile: {},
      nameMinSize: 4,
      nameMaxSize: 50,
      nameValidatedValue: null,
      nameInputValue: '',
      garagesValidatedValue: [],
      garagesInputValue: [],
      customContentValidatedValue: {
        themeColor: null,
        promotionalMessage: null
      },
      customContentInputValue: {
        themeColor: null,
        promotionalMessage: null
      },
      customContentMaxLength: 150,
      customContentMinLength: 10,
      activePeriodValidatedValue: {
        startDate: null,
        endDate: null,
        noExpirationDate: false
      },
      activePeriodInputValue: {
        startDate: null,
        endDate: null,
        noExpirationDate: false
      },
      customUrlValidatedValue: null,
      customUrl: '',
      customUrlValid: true,
      actionToggleUrl: false,
      customButtonTextValidatedValue: null,
      customButtonText: '',
      actionToggleButtonText: false,
      toggleCustomContent: false,
      isClickedEditCustomContent: false,
    }
  },
  mounted() {
    if (this.preselectedGarages && this.preselectedGarages.length) {
      this.toggleView('setup');
    }
    if (this.previewCustomContentId) {
      this.onCustomContentPreview(this.previewCustomContentId);
    }
  },
  methods: {
    isFilled(fieldName) {
      if (fieldName === 'activePeriod') {
        return !!(this.activePeriodValidatedValue.startDate);
      }
      if (fieldName === 'customContent') {
        if(this.display === 'modification') {
          return !!(this.customContentValidatedValue.promotionalMessage) || !this.toggleCustomContent;
        }
        return this.isClickedEditCustomContent;
      }
      if (fieldName === 'garages') {
        return this.isModification || (this.garagesValidatedValue && this.garagesValidatedValue.length > 0);
      }
      return !!(this[`${fieldName}ValidatedValue`] ? this[`${fieldName}ValidatedValue`].length : false)
    },
    allIsFilled() {
      return !(this.fieldNames.some((e) => !(this.isFilled(e))));
    },
    validateInput(stepName){
      if (stepName === 'activePeriod') {
        this[`${stepName}ValidatedValue`].startDate = this[`${stepName}InputValue`].startDate && new Date(this[`${stepName}InputValue`].startDate);
        this[`${stepName}ValidatedValue`].endDate = this[`${stepName}InputValue`].endDate && new Date(this[`${stepName}InputValue`].endDate);
        this[`${stepName}ValidatedValue`].noExpirationDate = this[`${stepName}InputValue`].noExpirationDate;
      } else if (stepName === 'customContent') {
        this[`${stepName}ValidatedValue`].themeColor = this[`${stepName}InputValue`].themeColor;
        this[`${stepName}ValidatedValue`].promotionalMessage = this[`${stepName}InputValue`].promotionalMessage;
      } else {
        this[`${stepName}ValidatedValue`] = this[`${stepName}InputValue`];
      }
      this.saveLocally(stepName);
      this.saveInformations(JSON.stringify(this.saveFile), this.allIsFilled());
      this.setCustomContentOpenedStep(null);
    },
    cancelInput(stepName) {
      if (stepName === 'activePeriod') {
        this[`${stepName}InputValue`].startDate = this[`${stepName}ValidatedValue`].startDate && new Date(this[`${stepName}ValidatedValue`].startDate);
        this[`${stepName}InputValue`].endDate = this[`${stepName}ValidatedValue`].endDate && new Date(this[`${stepName}ValidatedValue`].endDate);
        this[`${stepName}InputValue`].noExpirationDate = this[`${stepName}ValidatedValue`].noExpirationDate;
      } else if (stepName === 'customContent') {
        this[`${stepName}InputValue`].themeColor = this[`${stepName}ValidatedValue`].themeColor;
        this[`${stepName}InputValue`].promotionalMessage = this[`${stepName}ValidatedValue`].promotionalMessage;
      } else {
        this[`${stepName}InputValue`] = this[`${stepName}ValidatedValue`];
      }
      this.setCustomContentOpenedStep(null);
      this.setValid(this.allIsFilled())
    },
    saveLocally(stepName) {
      this.saveFile[stepName] = this[`${stepName}ValidatedValue`];
      // We only save in the local storage if we took the info from the localstorage (see mounted)
      if (!(this.selectedCustomContent)) {
        localStorage.setItem(`SetupCustomContent_${this.target}`, JSON.stringify(this.saveFile));
      }
    },
    setCustomContentOpenedStep(value) {
      if (value === "customContent") {
        this.updateClickedEditCustomContent(value === "customContent");
      }
      this.customContentOpenedStep = value;
      this.changeStep = value;
    },
    saveCustomContent() {
      if (this.display === 'setup') {
        // We remove the draft from the localstorage if it was a creation
        localStorage.removeItem(`SetupCustomContent_${this.target}`);
      }
      this.onSave(this.saveInput, this.preselectedGarages && this.preselectedGarages.length);
      this.toggleView('list');
      if (this.preselectedGarages && this.preselectedGarages.length) {
        this.$store.dispatch('closeModal');
      }
    },
    deleteCustomContent() {
      this.onDelete(this.toDeleteCustomContent.customContentId);
      this.toggleView('list');
    },
    onCustomContentPreview(customContentId) {
      this.selectedCustomContent = this.getCustomContentForSetup(this.availableCustomContents.find((customContent) => customContent.id === customContentId));
      this.toggleView('preview')
    },
    onCustomContentModify(customContentId) {
      this.selectedCustomContent = this.getCustomContentForSetup(this.availableCustomContents.find((customContent) => customContent.id === customContentId));
      this.toggleView('modification')
    },
    onCustomContentDelete(customContentId) {
      this.toDeleteCustomContent =  {
        customContentId,
        amountGarages: this.availableGarages.filter((g) => g.customContentId === customContentId.toString()).length
      }
      this.toggleView('deletion');
    },
    getCustomContentForSetup(customContent) {
      return {
        customContentId: customContent.id,
        name: customContent.displayName,
        garages: this.availableGarages.filter((g) => g.customContentId === customContent.id).map((g) => g.value),
        customContent: {
          themeColor: customContent.themeColor,
          promotionalMessage: customContent.promotionalMessage
        },
        activePeriod: {
          startDate: new Date(customContent.startAt),
          endDate: customContent.noExpirationDate ? null : new Date(customContent.endAt),
          noExpirationDate: customContent.noExpirationDate
        },
        customUrl: customContent.customUrl,
        customButtonText: customContent.customButtonText,
      }
    },
    toggleView(interfaceName) {
      if (interfaceName === "setup") {
        this.updateClickedEditCustomContent(false);
      }
      this.display = interfaceName;
      this.closeSetupStep();
    },
    setValid(isAllValid) {
      this.isAllValid = isAllValid
    },
    saveInformations(saveInput, isAllValid) {
      this.saveInput = JSON.parse(saveInput);
      this.setValid(isAllValid);
    },
    closeModal() {
      this.$store.dispatch('closeModal');
    },
    closeSetupStep() {
      this.changeStep = null;
    },
    updateNameInputValue(val) {
      this.nameInputValue = val;
    },
    updateGaragesInputValue(val) {
      this.garagesInputValue = val;
    },
    updateActionToggle() {
      this.actionToggleUrl = !this.actionToggleUrl;
      this.customUrl = '';
      this.customUrlValidatedValue = '';
      this.saveLocally('customUrl');
    },
    updateCumtomUrl(url) {
      this.customUrl = url;
      // check if URL is valid with big large regex
      this.customUrlValid = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/gi.test(url)
      if (this.customUrlValid) {
        this.customUrlValidatedValue = url;
        this.saveLocally('customUrl');
      }
    },
    updateCustomButtonText(value) {
      this.actionToggleButtonText = !!value;
      this.customButtonText = value;
      this.customButtonTextValidatedValue = value;
      this.saveLocally('customButtonText');
    },
    updateToggleCustomContent(value) {
      this.toggleCustomContent = !!value;
      if (!value) {
        this.customContentValidatedValue.promotionalMessage = null;
        this.customContentInputValue.promotionalMessage = null;
      }
    },
    updateClickedEditCustomContent(val) {
      this.isClickedEditCustomContent = val;
    },
    resetValue() {
      this.nameValidatedValue = null;
      this.nameInputValue = '';
      this.garagesValidatedValue = [];
      this.garagesInputValue = [];
      this.customContentValidatedValue = {
        themeColor: null,
        promotionalMessage: null
      }
      this.customContentInputValue = {
        themeColor: null,
        promotionalMessage: null
      }
      this.activePeriodValidatedValue = {
        startDate: null,
        endDate: null,
        noExpirationDate: false
      }
      this.activePeriodInputValue = {
        startDate: null,
        endDate: null,
        noExpirationDate: false
      }
      this.customUrlValidatedValue = null;
      this.customUrl = '';
      this.customUrlValid = true;
      this.actionToggleUrl = false;
      this.customButtonTextValidatedValue = null;
      this.customButtonText = '';
      this.actionToggleButtonText = false;
      this.toggleCustomContent = false;
    },
    prefilledName() {
      this.nameValidatedValue = this.saveFile['name'];
      this.nameInputValue = this.saveFile['name'];
    },
    prefilledGarages() {
      // when garages have been preselected, we fill the garage thing with them
      this.garagesValidatedValue = this.saveFile['garages'] && this.saveFile['garages'].map((gValue) => this.garagesOptions.find((gO) => gO.value === gValue));
      this.garagesInputValue = this.saveFile['garages'] && this.saveFile['garages'].map((gValue) => this.garagesOptions.find((gO) => gO.value === gValue));
      this.saveLocally('garages');
      this.validateInput('garages');
    },
    prefilledActivePeriod() {
      const startDate = this.saveFile['activePeriod'].startDate && new Date(this.saveFile['activePeriod'].startDate);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      this.activePeriodValidatedValue.startDate = startDate;
      this.activePeriodValidatedValue.endDate = this.saveFile['activePeriod'].endDate && new Date(this.saveFile['activePeriod'].endDate);
      this.activePeriodValidatedValue.noExpirationDate = this.saveFile['activePeriod'].noExpirationDate;
      this.activePeriodInputValue.startDate = startDate;
      this.activePeriodInputValue.endDate = this.saveFile['activePeriod'].endDate && new Date(this.saveFile['activePeriod'].endDate);
      this.activePeriodInputValue.noExpirationDate = this.saveFile['activePeriod'].noExpirationDate;
    },
    prefilledCustomUrl() {
      this.customUrl = this.saveFile['customUrl'];
      this.customUrlValid = !!this.saveFile['customUrl'];
      this.actionToggleUrl = this.display !== "preview" && !!this.saveFile['customUrl'];
    },
    prefilledCustomButtonText() {
      this.customButtonText = this.saveFile['customButtonText'];
      this.customButtonTextValidatedValue = this.saveFile['customButtonText'];
      this.actionToggleButtonText = this.display !== "preview" && !!this.saveFile['customButtonText'];
    },
    prefilledCustomContent() {
      this.toggleCustomContent = this.display !== "preview" && this.saveFile['customContent'] && !!this.saveFile['customContent'].promotionalMessage;
      this.customContentValidatedValue = this.saveFile['customContent'];
      this.customContentInputValue = this.saveFile['customContent'];
    },
    prefilledValues() {
      // reset value for other interface display (setup, list, ...)
      // and prefilled each input
      this.resetValue();
      const entryFile = this.selectedCustomContent ? JSON.stringify(this.selectedCustomContent) : localStorage.getItem(`SetupCustomContent_${this.target}`);
      this.saveFile = JSON.parse(entryFile);
      if (!entryFile || this.display === 'setup') {
        return;
      }
      if (this.saveFile['name']) {
        this.prefilledName();
      }
      if (this.saveFile['garages'] && this.selectedCustomContent) {
        this.prefilledGarages();
      }
      if (this.saveFile['activePeriod']) {
        this.prefilledActivePeriod();
      }
      if (this.saveFile['customUrl']) {
        this.prefilledCustomUrl();
      }
      if (this.saveFile['customButtonText']) {
        this.prefilledCustomButtonText();
      }
      if (this.saveFile['customContent']) {
        this.prefilledCustomContent();
      }
      this.setValidate && this.setValidate(this.allIsFilled());
    }
  },

  computed: {
    setupCustomContentProps() {
      return {
        preselectedGarages: this.preselectedGarages,
        changeStep: this.changeStep,
        alreadyTakenNames: this.customContentNames,
        availableGarages: this.availableGarages,
        target: this.target,
        setValidate: this.setValid,
        onChange: this.saveInformations,
        fieldNames: this.fieldNames,
        saveFile: this.saveFile,
        nameMinSize: this.nameMinSize,
        nameMaxSize: this.nameMaxSize,
        nameValidatedValue: this.nameValidatedValue,
        nameInputValue: this.nameInputValue,
        garagesValidatedValue: this.garagesValidatedValue,
        garagesInputValue: this.garagesInputValue,
        customContentValidatedValue: this.customContentValidatedValue,
        customContentInputValue: this.customContentInputValue,
        customContentMaxLength: this.customContentMaxLength,
        customContentMinLength: this.customContentMinLength,
        activePeriodValidatedValue: this.activePeriodValidatedValue,
        activePeriodInputValue: this.activePeriodInputValue,
        customUrlValidatedValue: this.customUrlValidatedValue,
        customUrl: this.customUrl,
        customUrlValid: this.customUrlValid,
        actionToggleUrl: this.actionToggleUrl,
        openedStep: this.openedStep,
        garagesOptions: this.garagesOptions,
        updateGaragesInputValue: this.updateGaragesInputValue,
        updateNameInputValue: this.updateNameInputValue,
        validateInput: this.validateInput,
        isFilled: this.isFilled,
        updateActionToggle: this.updateActionToggle,
        prefilledValues: this.prefilledValues,
        cancelInput: this.cancelInput,
        updateCumtomUrl: this.updateCumtomUrl,
        customButtonText: this.customButtonText,
        updateCustomButtonText: this.updateCustomButtonText,
        actionToggleButtonText: this.actionToggleButtonText,
        updateToggleCustomContent: this.updateToggleCustomContent,
        toggleCustomContent: this.toggleCustomContent,
      };
    },
    garagesOptions() {
      if (this.availableGarages) {
        return this.availableGarages.map((e) => {
          const isDisabled = e.disabled || (e.customContentId && e.customContentId !== (this.saveFile && this.saveFile.customContentId))
          let disabledLabel = null;
          if (isDisabled) {
            disabledLabel = e.disabled ? this.$t_locale('components/cockpit/automation/ModalCustomContent')('garageStatusNotEligible') : this.$t_locale('components/cockpit/automation/ModalCustomContent')('customContentAlreadyExists')
          }
          return {
            label: isDisabled ? `${e.label} - (${disabledLabel})` : e.label,
            value: e.value,
            $isDisabled: isDisabled,
            garageLogo: e.garageLogo
          }
        })
      }
      return [];
    },
    openedStep() {
      return this.changeStep || null;
    },
    overrideClose() {
      return this.customContentOpenedStep === 'customContent' ? this.setCustomContentOpenedStep : this.closeModal
    },
    title() {
      return this.customContentOpenedStep === 'customContent' ? this.$t_locale('components/cockpit/automation/ModalCustomContent')('customContentTitle') : this.$t_locale('components/cockpit/automation/ModalCustomContent')('title');
    },
    subtitle() {
      return this.customContentOpenedStep === 'customContent' ? this.$t_locale('components/cockpit/automation/ModalCustomContent')('customContentSubtitle') : this.$t_locale('components/cockpit/automation/ModalCustomContent')('subtitle');
    },
    isEditCustomContent() {
      return this.customContentOpenedStep === 'customContent';
    },
    showBodyHeader() {
      return this.display !== 'list' && this.customContentOpenedStep !== 'customContent' && !(this.preselectedGarages) && !this.previewCustomContentId
    },
    confirmButtonLabel() {
      return this.display === 'deletion' ? this.$t_locale('components/cockpit/automation/ModalCustomContent')('confirm') : this.$t_locale('components/cockpit/automation/ModalCustomContent')('save');
    },
    confirmFunction() {
      return this.display === 'deletion' ? this.deleteCustomContent : this.saveCustomContent;
    },
    confirmButtonDisabled() {
      if (this.isEditCustomContent) {
        let promotionalMessage = this.customContentInputValue.promotionalMessage || '';
        if (promotionalMessage) promotionalMessage = promotionalMessage.replace(/<[^>]*>?/gm, '');
        return (
          (this.actionToggleUrl && !this.customUrlValid) ||
          (this.actionToggleButtonText && this.customButtonText.length < 10) ||
          (this.toggleCustomContent && promotionalMessage && promotionalMessage.length < 10)
        );
      }
      return this.display !== 'deletion' && !(this.isAllValid);
    },
    customContentNames() {
      return (this.availableCustomContents && this.availableCustomContents.map((customContent) => customContent.displayName)) || [];
    }
  }
}
</script>

<style lang="scss" scoped>
  .modal-custom-content {
    overflow: auto;
    height: 100%;
    min-width: 680px;

    &__add-custom-content {
      padding: 0.45rem 0 0.35rem 0.5rem;

    }
    &__back {
      color: $black;
      background-color: $bg-grey;
      border-bottom: 1px solid rgba($grey, .5);
      width: 100%;
      padding: 1rem 0.5rem;
      box-sizing: border-box;
      display: flex;
      flex-direction: row;
      margin-bottom: 1rem;
      
      &__cta {
        cursor: pointer;
        flex-grow: 0;
        display: flex;
      }
      &__text {
        margin-top: -1px!important;
        margin-left: .3rem!important;
      }
      &__filler {
        flex-grow: 1;
      }
    }
    &__logo {
      width: 3rem;
      height: 3rem;
    }
    &__footer {
      display: flex;
      justify-content: flex-end;
    }
    &__setup {
      width: 100%;
    }
    &__delete {
      display: flex;
      flex-direction: column;
      margin-top: 3rem;

      & i {
        font-size: 70px;
        color: $red;
        text-align: center;
      }

      &__title {
        font-size: 1.5rem;
        color: $black;
        margin: 1.5rem 0 1rem 0!important;
      }
      &__text {
        font-size: 1rem;
        color: $dark-grey;
        line-height: 1.5;
      }
    }
  }
::v-deep .modal-base {

  &__body {
    padding: 0!important;
  }
}
</style>
