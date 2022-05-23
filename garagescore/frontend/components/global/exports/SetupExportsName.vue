<template>
  <SetupStep v-bind="stepProps">
    <template slot="input">
      <input-material
        fixedWidth="265px"
        v-model.trim="temporarySelectedExportName"
        :minLength="nameMinSize"
        :maxLength="nameMaxSize"
        :isValid="temporarySelectedExportNameIsValid ? 'Valid' : 'Invalid'"
        :error="nameError"
      >
        <template slot="label">{{ $t_locale('components/global/exports/SetupExportsName')('nameLabel') }}</template>
      </input-material>
    </template>
  </SetupStep>
</template>

<script>
export default {
  name: 'SetupExportsName',
  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    existingExportsNames: {
      type: Array,
      default: [],
    },
    selectedExportName: {
      type: String,
      default: '',
    },
    selectedExportNameIsValid: {
      type: Boolean,
      default: false,
    },
    setSelectedExportName: {
      type: Function,
      required: true,
    },
    setActiveStep: {
      type: Function,
      required: true,
    },
  },
  data() {
    return {
      temporarySelectedExportName: '',
      nameMinSize: 5,
      nameMaxSize: 100,
    };
  },
  computed: {
    stepProps() {
      return {
        stepName: 'exportName',
        ref: 'exportName',
        label: this.$t_locale('components/global/exports/SetupExportsName')(`exportNameStepLabel`),
        subLabel: this.selectedExportName,
        isOpen: this.isOpen,
        loading: this.loading,
        filled: this.selectedExportNameIsValid,
        isValid: this.temporarySelectedExportNameIsValid,
        onSetActive: this.setActiveStep,
        onValidate: this.setSelected,
        onCancel: this.cancelExportName,
        isModification: false,
      };
    },
    isNameNotAlreadyTaken() {
      return !this.existingExportsNames.includes(this.temporarySelectedExportName);
    },
    isNameCorrectSize() {
      if (!this.temporarySelectedExportName || typeof this.temporarySelectedExportName !== 'string') {
        return false;
      }
      if (this.temporarySelectedExportName.length < this.nameMinSize) {
        return false;
      }
      if (this.temporarySelectedExportName.length > this.nameMaxSize) {
        return false;
      }
      return true;
    },
    temporarySelectedExportNameIsValid() {
      return this.isNameNotAlreadyTaken && this.isNameCorrectSize;
    },
    nameError() {
      if (!this.isNameCorrectSize) {
        return this.$t_locale('components/global/exports/SetupExportsName')('nameNotCorrectSize', { nameMinSize: this.nameMinSize, nameMaxSize: this.nameMaxSize });
      }
      if (!this.isNameNotAlreadyTaken) {
        return this.$t_locale('components/global/exports/SetupExportsName')('nameAlreadyTaken');
      }
      return '';
    },
  },
  methods: {
    setSelected() {
      this.setSelectedExportName(this.temporarySelectedExportName);
    },
    cancelExportName() {
      this.temporarySelectedExportName = `${this.selectedExportName}`;
      this.setActiveStep(null);
    },
  },
  watch: {
    selectedExportName: {
      immediate: true,
      handler(newValue) {
        if (newValue) {
          this.temporarySelectedExportName = newValue;
        }
      },
    },
  },
};
</script>

<style lang="scss" scoped></style>
