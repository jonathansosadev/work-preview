<template>
  <ModalBase class="modal-exports" type="danger">

    <template slot="header-icon">
      <img ref="logo" src="/logo/logo-custeed-picto.svg" class="modal-exports__logo" alt="custeed">
    </template>

    <template slot="header-title">
      <span>{{ title }}</span>
    </template>

    <template slot="header-subtitle">
      <span>{{ subtitle }}</span>
    </template>

      <template slot="bodyheader" v-if="!queryLoading">
        <div v-if="viewIsList" class="modal-exports__add-exports" track-id="customContentAdd">
          <Button type="contained-orange" @click="toggleView(VIEWS.SETUP)" track-id="modalExportsAdd">
            <template>
              <template slot="left">
                <i track-id="modalExportAdd" class="icon-gs-add" />
              </template>
              <AppText tag="span" track-id="modalExportAdd">{{ $t_locale('components/global/exports/ModalExports')('CreateNewExport') }}</AppText>
            </template>
          </Button>
        </div>
        <div v-else-if="displayReturnButton" class="modal-exports__back">
          <div @click="toggleView(VIEWS.LIST)" class="modal-exports__back__cta">
            <i class="icon-gs-left-circle"/>
            <AppText class="modal-exports__back__text" tag="div" bold>{{ $t_locale('components/global/exports/ModalExports')('Back') }}</AppText>
          </div>
          <div class="modal-exports__back__filler">
          </div>
        </div>
      </template>

    <template slot="body">
        <template v-if="queryLoading">
          <Skeleton v-for="i in 10" :key="i" class="modal-exports__skeleton" />
        </template>
        <div v-else-if="viewIsList" class="modal-exports__exports-list">
          <CustomExportsList
            :customExports="customExports"
            :onSend="onSend"
            :onEdit="onEdit"
            :onDelete="onDelete"
            />
        </div>
        <div v-else-if="!viewIsList" class="modal-exports__setup-exports">
          <SetupExports
            class="modal-exports__setup-exports-component"
            :shortcutExport="shortcutExport"
            :customExportToUpdate="customExportToUpdate"
            :setFormIsValid="setFormIsValid"
            :availableGarages="availableGarages"
            :availableFrontDeskUsers="availableFrontDeskUsers"
            :currentUser="currentUser"
            :exportGetAvailableFrontDeskUsers="exportGetAvailableFrontDeskUsers"
            :existingExportsNames="existingExportsNames"
            :availableAutomationCampaigns="availableAutomationCampaigns"
            :target="target"
            :garageIds="garageIds"
            :selectedTags="selectedTags"
            :optionSelected="optionSelected"
          />
        </div>
    </template>

    <template slot="footer" v-if="!queryLoading">
      <div class="modal-exports__footer" v-show="displayFooter">
        <CheckBox
          v-if="!customExportToUpdate"
          class="modal-exports__footer__left-part"
          :label="$t_locale('components/global/exports/ModalExports')('SaveCustomExport')"
          @change='toggleSavePreferences'
          :labelStyle="checkboxLabelStyle"
          :checked="isRecurringExport"
          :disabled="isRecurringExport"
          :tooltipContent="tooltipContent"
        />
        <div class="modal-exports__footer__right-part">
          <Button @click="closeModal()" type="phantom">
            <span>{{ $t_locale('components/global/exports/ModalExports')('Cancel') }}</span>
          </Button>
          <Button v-if="shouldShowSaveButton" @click="saveExport()" type="orange" :disabled="sendButtonDisabled" thick>
            <span>{{ $t_locale('components/global/exports/ModalExports')('Update') }}</span>
          </Button>
          <Button v-else-if="!customExportToUpdate" @click="sendExport()" type="orange" :disabled="sendButtonDisabled" thick>
            <span>{{ $t_locale('components/global/exports/ModalExports')('Send') }}</span>
          </Button>
          <Button v-else @click="updateExport()" type="orange" :disabled="updateButtonDisabled" thick>
            <span>{{ $t_locale('components/global/exports/ModalExports')('Update') }}</span>
          </Button>
        </div>
      </div>
    </template>

  </ModalBase>
</template>


<script>
  import SetupExports from '~/components/global/exports/SetupExports';
  import CustomExportsList from '~/components/global/exports/CustomExportsList'
  import { ExportFrequencies, ExportTypes } from '~/utils/enumV2';
  import CheckBox from '~/components/ui/CheckBox.vue';
  import { DarkGrey, Blue } from '~/assets/style/global.scss';
  import ExportHelper from '~/utils/exports/helper';
  import { garagesValidator } from '~/utils/components/validators';

  export default {
    name: 'ModalExports',
    components: {
      SetupExports,
      CustomExportsList,
      CheckBox
    },
    props: {
      fetchCustomExports : {
        type: Function,
        default: () => {}
      },
      availableGarages: {
        type: Array,
        default: () => [],
      },
      availableFrontDeskUsers: {
        type: Array,
        default: () => [],
      },
      exportGetAvailableFrontDeskUsers: {
        type: Function,
        default: () => console.error('ModalExports.vue :: exportGetAvailableFrontDeskUsers not set')
      },
      currentUser: {
        type: Object,
        default: () => ({}),
      },
      shortcutExportPayload: {
        type: Object,
        default: () => null,
      },
      customExportNames: {
        type: Array,
        default: () => [],
      },
      customExport: {
        type: Object,
        default: () => ({}),
      },
      customExports: {
        type: Array,
        default: () => [],
      },
      availableAutomationCampaigns: {
        type: Array,
        default: () => [],
      },
      target: {
        type: String,
        default: '',
      },
      openModalFunction: {
        type: Function,
        default: () => console.error('ModalExports.vue :: openModalFunction not set')
      },
      openCustomExportModalFunction: {
        type: Function,
        default:() => console.error('ModalExports:vue :: openCustomExportModalFunction not set')
      },
      closeModalFunction: {
        type: Function,
        default: () => console.error('ModalExports.vue ::closeModalFunction not set')
      },
      startExportFunction: {
        type: Function,
        default: () => console.error('ModalExports.vue :: startExportFunction not set')
      },
      saveCustomExportFunction: {
        type: Function,
        default: () => console.error('ModalExport.vue :: saveCustomExportFunction not set')
      },
      updateCustomExportFunction: {
        type: Function,
        default: () => console.error('ModalExports.vue :: updateCustomExportFunction not set')
      },
      deleteCustomExportFunction: {
        type: Function,
        default: () => console.error('ModalExports.vue :: updateCustomExportFunction not set')
      },
      garageIds: {
        required: true,
        validator: garagesValidator
      },
      optionSelected: {
        type: String,
        default: 'garages'
      },

      selectedTags:{
        type: Array,
        default: () => []
      },
    },

    data() {
      return {
        VIEWS: {
          LIST: 'list',
          SETUP: 'setup',
        },
        view: 'list',
        displayReturnButton: true,
        formIsValid: false,
        selectedExportName: '',
        selectedExportType: '',
        selectedDataTypes: [],
        selectedGarages: [],
        selectedFrontDeskUsers: [],
        selectedPeriod: '',
        selectedFrequency: ExportFrequencies.NONE,
        selectedStartPeriod: null,
        selectedEndPeriod: null,
        selectedFields: [],
        selectedRecipients: [],
        selectedAutomationCampaigns: [],
        customExportToUpdate: null,
        customExportHasChanges: false,
        shortcutExport: null,
        customExportToSave: false,
        queryLoading: false,
      }
    },


    async mounted(){
      if (this.shortcutExportPayload) {
        // prefil the requester
        this.displayReturnButton = false;
        this.shortcutExport = this.shortcutExportPayload;
        this.view = this.VIEWS.SETUP;
        return;
      }

      // we need to fetch the user's customExports
      await this.queryWrapper({queryFunction: this.fetchCustomExports, errorMessage: `${this.$t_locale('components/global/exports/ModalExports')('Error_FetchCustomExports')}\n${this.$t_locale('components/global/exports/ModalExports')('ContactUs')}`});
    },

    methods: {
      toggleSavePreferences() {
        this.customExportToSave = !this.customExportToSave;
      },
      saveExport() {
        const customExport = {
          exportType: this.selectedExportType,
          dataTypes: this.selectedDataTypes,
          garageIds: this.selectedGarages,
          ...(ExportHelper.exportTypeIsFrontDeskUsers(this.selectedExportType) && {frontDeskUsers: this.selectedFrontDeskUsers}),
          periodId: this.selectedPeriod,
          fields: this.selectedFields,
          recipients: this.selectedRecipients,
          userId: this.currentUser.id.toString(),
          startPeriodId: this.selectedStartPeriod,
          endPeriodId: this.selectedEndPeriod,
          frequency: this.selectedFrequency
        }
        this.openModalFunction({
          component: 'ModalConfirmName',
          adaptive: true,
          props: {
            customExportNames: this.customExports.map((e) => e.name),
            customExport,
            closeModalFunction: this.closeModalFunction,
            saveCustomExportFunction: this.saveCustomExportFunction,
            openCustomExportModalFunction: this.openCustomExportModalFunction,
            openModalFunction: this.openModalFunction,
            startExportFunction: this.startExportFunction,
            queryWrapper: this.queryWrapper,
          }
        });
      },
      toggleView(view) {
        this.view = view;
        if (view === this.VIEWS.LIST) {
          this.shortcutExport = null;
          this.customExportToUpdate = null;
        }
      },
      async sendExport() {
        if (this.startExportFunction) {
          const customExport = {
            selectedExportType: this.selectedExportType,
            selectedDataTypes: this.selectedDataTypes,
            selectedGarages: this.selectedGarages,
            ...(ExportHelper.exportTypeIsFrontDeskUsers(this.selectedExportType) && {selectedFrontDeskUsers: this.selectedFrontDeskUsers}),
            selectedPeriod: this.selectedPeriod,
            selectedStartPeriod: this.selectedStartPeriod,
            selectedEndPeriod: this.selectedEndPeriod,
            selectedFrequency: this.selectedFrequency,
            selectedFields: this.selectedFields,
            selectedRecipients: this.selectedRecipients,
            selectedAutomationCampaigns: this.selectedAutomationCampaigns,
          };

          const { error } = await this.queryWrapper({queryFunction: this.startExportFunction, errorMessage:  `${this.$t_locale('components/global/exports/ModalExports')('Error_StartExport')}\n${this.$t_locale('components/global/exports/ModalExports')('ContactUs')}`}, { ...customExport })
          if (!error) {
            this.closeModalFunction();
            this.$toast.success(this.$t_locale('components/global/exports/ModalExports')("ExportConfirm", {recipients : customExport.selectedRecipients.join(', ')}));
          }
        }
      },
      async updateExport() {
        if (!this.updateCustomExportFunction) {
          return;
        }
        const customExport = {
          id: this.customExportToUpdate.id,
          userId: this.currentUser.id.toString(),
          name: this.selectedExportName,
          exportType:this.selectedExportType,
          dataTypes: this.selectedDataTypes,
          garageIds:this.selectedGarages,
          ...(ExportHelper.exportTypeIsFrontDeskUsers(this.selectedExportType) && { frontDeskUsers: this.selectedFrontDeskUsers }),
          periodId: this.selectedPeriod,
          startPeriodId: this.selectedStartPeriod,
          endPeriodId: this.selectedEndPeriod,
          frequency: this.selectedFrequency,
          fields: this.selectedFields,
          recipients: this.selectedRecipients,
        }
        await this.queryWrapper({queryFunction: this.updateCustomExportFunction, errorMessage:  `${this.$t_locale('components/global/exports/ModalExports')('Error_UpdateCustomExport')}\n${this.$t_locale('components/global/exports/ModalExports')('ContactUs')}`}, { ...customExport });
        this.customExportToUpdate = null;
        this.toggleView(this.VIEWS.LIST);
      },
      closeModal() {
        this.closeModalFunction();
      },
      setFormIsValid(
        value,
        {
          customExportHasChanges,
          selectedExportName, selectedExportType, selectedDataTypes, selectedGarages,
          selectedFrontDeskUsers, selectedPeriod, selectedFrequency, selectedStartPeriod, selectedEndPeriod,
          selectedFields, selectedRecipients, selectedAutomationCampaigns
        }
      ) {
        this.formIsValid = !!value;
        this.customExportHasChanges = !!customExportHasChanges;
        this.selectedExportName = selectedExportName;
        this.selectedExportType = selectedExportType;
        this.selectedDataTypes = selectedDataTypes;
        this.selectedGarages = selectedGarages;
        if(ExportHelper.exportTypeIsFrontDeskUsers(selectedExportType)) {
          this.selectedFrontDeskUsers = selectedFrontDeskUsers;
        }
        if (selectedPeriod && selectedPeriod !== 'CustomPeriod') {
          this.selectedPeriod = selectedPeriod;
          this.selectedFrequency = selectedFrequency
          this.selectedStartPeriod = null;
          this.selectedEndPeriod = null;
        } else {
          this.selectedPeriod = null;
          this.selectedFrequency = ExportFrequencies.NONE
          this.selectedStartPeriod = selectedStartPeriod;
          this.selectedEndPeriod = selectedEndPeriod;
        }
        this.selectedAutomationCampaigns = selectedAutomationCampaigns.map(campaign => campaign.value);
        this.selectedFields = selectedFields.map((e) => e.id);
        this.selectedRecipients = selectedRecipients.replace(/\s/g, '').split(';');
      },
      async onSend(customExport) {
        if (this.startExportFunction) {
          const selectedPeriod = customExport.periodId || null;
          const payload = {
            exportConfigurationId: customExport.id,
            exportName: customExport.name,
            selectedExportType: customExport.exportType,
            selectedDataTypes: customExport.dataTypes,
            selectedGarages: customExport.garageIds,
            ...(ExportHelper.exportTypeIsFrontDeskUsers(customExport.exportType) && { selectedFrontDeskUsers: customExport.frontDeskUsers }),
            selectedPeriod,
            selectedStartPeriod: customExport.startPeriodId,
            selectedEndPeriod: customExport.endPeriodId,
            selectedFrequency: customExport.frequency,
            selectedFields: customExport.fields,
            selectedRecipients: customExport.recipients,
          };
          const { error } = await this.queryWrapper({queryFunction: this.startExportFunction, errorMessage: `${this.$t_locale('components/global/exports/ModalExports')('Error_StartExport')}\n${this.$t_locale('components/global/exports/ModalExports')('ContactUs')}`}, { ...payload });
          if (!error) {
            this.closeModalFunction();
            this.$toast.success(this.$t_locale('components/global/exports/ModalExports')("ExportConfirm", {recipients : payload.selectedRecipients.join(', ')}));
          }
        }
      },
      onEdit(customExport) {
        this.customExportToUpdate = customExport;
        this.toggleView(this.VIEWS.SETUP);
      },
      onDelete(customExport) {
        this.openModalFunction({
          component: 'ModalConfirmDelete',
          adaptive: true,
          props: {
            customExport,
            closeModalFunction: this.closeModalFunction,
            deleteCustomExportFunction: this.deleteCustomExportFunction,
            openCustomExportModalFunction: this.openCustomExportModalFunction,
            queryWrapper: this.queryWrapper,
          }
        });
      },
      async queryWrapper({queryFunction, errorMessage = ''} = {}, ...args) {
        const res = { error: false };
        try {
          this.queryLoading = true;
          await queryFunction(...args);
        } catch (error) {
          console.error(error);
          res.error = true;
          this.$toast.error(errorMessage || this.$t_locale('components/global/exports/ModalExports')('Error_Fallback'));
          this.closeModalFunction();
        } finally {
          this.queryLoading = false;
        }
        return res;
      }
    },

    computed: {
      title() {
        return this.selectedExportType === ExportTypes.AUTOMATION_RGPD ? this.$t_locale('components/global/exports/ModalExports')('automation_RGPD_title'): this.$t_locale('components/global/exports/ModalExports')('Title');
      },
      subtitle() {
        return this.selectedExportType === ExportTypes.AUTOMATION_RGPD ? this.$t_locale('components/global/exports/ModalExports')('automation_RGPD_subtitle'): this.$t_locale('components/global/exports/ModalExports')('Subtitle');
      },
      viewIsList() {
        return this.view === this.VIEWS.LIST;
      },
      displayFooter() {
        return this.view === this.VIEWS.SETUP;
      },
      sendButtonDisabled() {
        return !this.formIsValid;
      },
      updateButtonDisabled() {
        return !this.formIsValid || !this.customExportHasChanges;
      },
      existingExportsNames() {
        if(!this.customExports) {
          return [];
        };
        return this.customExports
          .filter(({ name }) => this.customExportToUpdate ? name !== this.customExportToUpdate.name : true)
          .map(({ name }) => name);
      },
      checkboxLabelStyle() {
        if (this.isRecurringExport) {
          return `color: ${Blue}; opacity: .5; font-weight: bold; cursor: default;`
        }
        return `color: ${DarkGrey}; font-weight: bold;`;
      },
      isRecurringExport() {
        return this.selectedFrequency && this.selectedFrequency !== ExportFrequencies.NONE;
      },
      tooltipContent() {
        return this.isRecurringExport ? this.$t_locale('components/global/exports/ModalExports')('SavedRecurringExportTooltip') : '';
      },
      shouldShowSaveButton() {
        return this.customExportToSave || (!this.customExportToUpdate && this.isRecurringExport);
      },
    }
  }
</script>

<style lang="scss" scoped>
  .modal-exports {
    overflow: auto;
    height: 100%;
    max-width: 680px;

    &__add-exports {
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
    &__footer {
      display: flex;
      align-items: center;

      &__left-part {
        width: auto;
        display: inline-block;
        margin-right: auto;
      }
      &__right-part {
        display: flex;
        margin-left: auto;
      }
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
    &__skeleton {
      height : 35px !important;
      margin-top: 10px;
    }
  }

</style>
