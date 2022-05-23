<template>
  <ModalBase class="modal-exports" type="danger">
    <template slot="header-icon">
      <img ref="logo" src="/logo/logo-custeed-picto.svg" class="modal-exports__logo" alt="custeed" />
    </template>

    <template slot="header-title">
      <span>{{ $t_locale('components/global/exports/ModalConfirmEmail')('Title') }}</span>
    </template>

    <template slot="header-subtitle">
      <span>{{ $t_locale('components/global/exports/ModalConfirmEmail')('Subtitle') }}</span>
    </template>

    <template slot="body">
      <div class="modal-exports__setup-exports">
        <SetupStep v-bind="recipientsStepProps">
          <template slot="input">
            <InputMaterial
              class="setup-exports__recipients"
              :error="recipientsStepErrorDescription"
              v-model="temporarySelectedRecipients"
              :isValid="temporarySelectedRecipientsIsValid"
            >
              <template slot="label">{{ $t_locale('components/global/exports/ModalConfirmEmail')('RecipientsStepLabel') }}</template>
            </InputMaterial>
            <AppText class="setup-exports__recipients__sublabel" tag="div" type="muted" bold size="sm">
              {{ $t_locale('components/global/exports/ModalConfirmEmail')('RecipientsStepSubLabel') }}
            </AppText>
          </template>
        </SetupStep>
      </div>
    </template>

    <template slot="footer">
      <div class="modal-exports__footer">
        <Button @click="closeModal()" type="phantom">
          <span>{{ $t_locale('components/global/exports/ModalConfirmEmail')('Cancel') }}</span>
        </Button>
        <Button @click="sendExport()" type="orange" :disabled="sendButtonDisabled">
          <span>{{ $t_locale('components/global/exports/ModalConfirmEmail')('Send') }}</span>
        </Button>
      </div>
    </template>
  </ModalBase>
</template>

<script>
import SetupExports from '~/components/global/exports/SetupExports';
import CustomExportsList from '~/components/global/exports/CustomExportsList';
import { validateEmail } from '../../../util/email';
import fieldsHandler from '../../../../common/lib/garagescore/cockpit-exports/fields/fields-handler';
import { ExportTypes, ExportFrequencies } from '../../../utils/enumV2';

export default {
  name: 'ModalConfirmEmail',
  components: {
    SetupExports,
    CustomExportsList,
  },

  props: {
    currentUser: {
      type: Object,
      default: () => {},
    },
    selectedExportType: {
      type: String,
      default: '',
    },
    openModalFunction: {
      type: Function,
      default: () => console.error('ModalConfirmEmail.vue :: openModalFunction not set'),
    },
    closeModalFunction: {
      type: Function,
      default: () => console.error('ModalConfirmEmail.vue ::closeModalFunction not set'),
    },
    startExportFunction: {
      type: Function,
      default: () => console.error('ModalConfirmEmail.vue :: startExportFunction not set'),
    },
  },

  data() {
    return {
      displayReturnButton: true,
      formIsValid: false,
      selectedFields: this.selectedFieldsByExportType,
      temporarySelectedRecipients: '',
      selectedRecipients: '',
      activeStep: null,
    };
  },

  mounted() {
    this.temporarySelectedRecipients = this.currentUser ? this.currentUser.email : '';
    this.selectedRecipients = this.currentUser ? this.currentUser.email : '';
  },

  computed: {
    sendButtonDisabled() {
      return !this.selectedRecipientsIsValid;
    },
    selectedFieldsIsValid() {
      return this.selectedFields.length > 0;
    },
    recipientsStepErrorDescription() {
      return this.temporarySelectedRecipientsIsValid ? '' : this.$t_locale('components/global/exports/ModalConfirmEmail')('RecipientsStepErrorDescription');
    },
    temporarySelectedRecipientsIsValid() {
      return this.temporarySelectedRecipients
        .replace(/\s/g, '')
        .split(';')
        .every((e) => validateEmail(e) === 'OK')
        ? 'Valid'
        : 'Invalid';
    },
    selectedRecipientsIsValid() {
      return this.selectedRecipients
        .replace(/\s/g, '')
        .split(';')
        .every((e) => validateEmail(e) === 'OK');
    },
    recipientsStepValidSubLabel() {
      return this.selectedRecipients.split(';').join(', ');
    },
    recipientsStepProps() {
      return {
        stepName: 'recipientsStep',
        label: this.$t_locale('components/global/exports/ModalConfirmEmail')(`recipientsStepLabel`),
        subLabel: this.selectedRecipientsIsValid ? this.recipientsStepValidSubLabel : this.$t_locale('components/global/exports/ModalConfirmEmail')('recipientsStepSubLabel'),
        isOpen: this.activeStep === 'recipientsStep',
        filled: this.selectedRecipientsIsValid,
        isValid: this.temporarySelectedRecipientsIsValid === 'Valid',
        onSetActive: this.setActiveStep,
        onValidate: this.setSelectedRecipients,
        onCancel: this.cancelRecipients,
        ref: 'recipientsStep',
        isModification: false,
        loading: false,
      };
    },
    selectedFieldsByExportType() {
      const exportCategory = ExportTypes.getProperty(this.selectedExportType, 'category');
      return fieldsHandler[exportCategory].COMMON;
    },
  },

  methods: {
    async sendExport() {
      if (this.startExportFunction) {
        const customExport = {
          selectedExportType: this.selectedExportType,
          selectedFields: this.selectedFieldsByExportType,
          selectedRecipients: this.selectedRecipients.split(';'),
          selectedFrequency: ExportFrequencies.NONE
        };

        await this.startExportFunction({ ...customExport });
        this.openModalFunction({
          component: 'ModalSplashScreen',
          props: {
            isLoading: true,
            recipients: this.selectedRecipients.split(';'),
            closeModalFunction: this.closeModalFunction,
          },
        });
      }
    },
    closeModal() {
      this.closeModalFunction();
    },
    setSelectedRecipients() {
      this.selectedRecipients = `${this.temporarySelectedRecipients}`;
      this.setActiveStep(null);
    },
    cancelRecipients() {
      this.temporarySelectedRecipients = `${this.selectedRecipients}`;
      this.setActiveStep(null);
    },
    setActiveStep(step) {
      this.activeStep = step;
    },
  },
};
</script>

<style lang="scss" scoped>
.modal-exports {
  overflow: auto;
  height: 100%;
  width: 680px;

  &__add-exports {
    padding: 0.45rem 0 0.35rem 0.5rem;
  }

  &__back {
    color: $black;
    background-color: $bg-grey;
    border-bottom: 1px solid rgba($grey, 0.5);
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
      margin-top: -1px !important;
      margin-left: 0.3rem !important;
    }
    &__filler {
      flex-grow: 1;
    }
  }
  &__footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
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
      margin: 1.5rem 0 1rem 0 !important;
    }
    &__text {
      font-size: 1rem;
      color: $dark-grey;
      line-height: 1.5;
    }
  }
}
</style>
