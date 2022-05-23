<template>
  <ModalBase class="modal-confirm-name" type="danger">

    <template slot="header-icon">
      <img ref="logo" src="/logo/logo-custeed-picto.svg" class="modal-exports__logo" alt="custeed">
    </template>

    <template slot="header-title">
      <span>{{ $t_locale('components/global/exports/ModalConfirmName')('Title') }}</span>
    </template>

    <template slot="header-subtitle">
      <span>{{ $t_locale('components/global/exports/ModalConfirmName')('Subtitle') }}</span>
    </template>

    <template slot="body">
      <InputMaterial
        class="modal-confirm-name__input"
        v-model.trim="selectedName"
        :error="selectedNameErrorDescription"
        :isValid="selectedNameIsValid"
        :minLength="5"
        :maxLength="100"
      >
        <template slot="label">{{ $t_locale('components/global/exports/ModalConfirmName')('InputLabel') }}</template>
      </InputMaterial>
    </template>

    <template slot="footer" >
      <div class="modal-confirm-name__footer">
        <Button @click="closeModal()" type="phantom" thick>
          <span>{{ $t_locale('components/global/exports/ModalConfirmName')('Cancel') }}</span>
        </Button>
        <Button @click="saveExport()" type="orange" thick :disabled="selectedNameIsValid !== 'Valid'">
          <span>{{ $t_locale('components/global/exports/ModalConfirmName')('Save') }}</span>
        </Button>
      </div>
    </template>

  </ModalBase>
</template>

<script>
import ExportHelper from '~/utils/exports/helper';

export default {
  name: 'ModalConfirmName',
  props: {
    customExportNames: {
      type: Array,
      default: () => [],
    },
    customExport: {
      type: Object,
      default: () => ({}),
    },
    closeModalFunction: {
      type: Function,
      default: () => console.error('ModalConfirmName.vue :: closeModalFunction not set')
    },
    saveCustomExportFunction: {
      type: Function,
      default: () => console.error('ModalConfirmName.vue :: saveCustomExportFunction not set')
    },
    openCustomExportModalFunction: {
      type: Function,
      default: () => console.error('ModalConfirmName.vue :: openCustomExportModalFunction not set')
    },
    openModalFunction: {
      type: Function,
      default: () => console.error('ModalConfirmName.vue :: openModalFunction not set')
    },
    sendExportFunction: {
      type: Function,
      default: () => console.error('ModalConfirmName.vue :: sendExportFunction not set')
    },
    startExportFunction: {
      type: Function,
      default: () => console.error('ModalConfirmName.vue :: startExportFunction not set')
    },
    queryWrapper: {
      type: Function,
      default: () => console.error('ModalConfirmName.vue :: queryWrapper not set')
    }
  },

  data() {
    return {
      selectedName: ''
    };
  },

  computed: {
    selectedNameErrorDescription() {
      if (this.customExportNames.find((e) => e === this.selectedName)) {
        return this.$t_locale('components/global/exports/ModalConfirmName')('NameAlreadyTaken');
      }
    },
    selectedNameIsValid() {
      if (this.customExportNames.find((e) => e === this.selectedName)) {
        return 'Invalid';
      }
      return this.selectedName.length >= 5 ? 'Valid' : 'Invalid';
    },
  },

  methods: {
    closeModal() {
      this.closeModalFunction();
    },
    async saveExport() {
      const { error } = await this.queryWrapper({queryFunction: this.saveCustomExportFunction, errorMessage: `${this.$t_locale('components/global/exports/ModalConfirmName')('Error_SaveCustomExport')}\n${this.$t_locale('components/global/exports/ModalConfirmName')('ContactUs')}`}, { ...this.customExport, name: this.selectedName });
      if (error) {
        return;
      }
      const payload = {
        exportName: this.selectedName,
        selectedExportType: this.customExport.exportType,
        selectedDataTypes: this.customExport.dataTypes,
        selectedGarages: this.customExport.garageIds,
        ...(ExportHelper.exportTypeIsFrontDeskUsers(this.customExport.exportType) && { selectedFrontDeskUsers: this.customExport.frontDeskUsers }),
        selectedPeriod: this.customExport.periodId,
        selectedStartPeriod: this.customExport.startPeriodId,
        selectedEndPeriod: this.customExport.endPeriodId,
        selectedFrequency: this.customExport.frequency,
        selectedFields: this.customExport.fields,
        selectedRecipients: this.customExport.recipients,
      }
      const { error: sendError } = await this.queryWrapper({queryFunction: this.startExportFunction, errorMessage: `${this.$t_locale('components/global/exports/ModalConfirmName')('Error_StartExport')}\n${this.$t_locale('components/global/exports/ModalConfirmName')('ContactUs')}`}, { ...payload });
      if (!sendError) {
        this.closeModalFunction();
        this.$toast.success(this.$t_locale('components/global/exports/ModalConfirmName')("ExportConfirm", {recipients : this.customExport.recipients.join(', ')}));
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.modal-confirm-name {
  overflow: auto;
  width: 400px;
  margin: auto;
  
  &__footer {
    display: flex;
    justify-content: flex-end;
  }
}
::v-deep .input-material {

  &__error {
    position: absolute;
    top: 3.5rem;
  }
}
</style>
