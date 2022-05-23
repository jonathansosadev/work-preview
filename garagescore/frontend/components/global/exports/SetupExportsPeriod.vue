<template>
  <SetupStep v-bind="periodStepProps">
    <template slot="input">
      <TagSelector
        class="setup-exports-period__tag-selector"
        :tags="periodStepTags"
        :savedTag="temporarySelectedPeriod"
        :onTagSelected="setTemporaryPeriodStepTag"
      />
      <template v-if="isCustomPeriodTemporary">
        <div class="setup-exports-period__custom-period">
          <div class="setup-exports-period__custom-period__part">
            <label for="date-picker-start">{{ $t_locale('components/global/exports/SetupExportsPeriod')('selectStartMonth') }}</label>
            <DatePicker
              class="setup-exports-period__custom-period__part__date-picker"
              ref="datepicker"
              v-model="temporarySelectedStartPeriod"
              v-bind="datePickerStartProps"
            />
          </div>
          <div class="setup-exports-period__custom-period__part">
            <label for="date-picker-end">{{ $t_locale('components/global/exports/SetupExportsPeriod')('selectEndMonth') }}</label>
            <DatePicker
              class="setup-exports-period__custom-period__part__date-picker"
              ref="datepicker"
              v-model="temporarySelectedEndPeriod"
              v-bind="datePickerEndProps"
            />
          </div>
        </div>
      </template>
      <template v-else-if="temporarySelectedPeriod !== null">
        <div class="setup-exports-period__frequency">
          <div class="setup-exports-period__frequency__subtitle">{{ $t_locale('components/global/exports/SetupExportsPeriod')('FrequencySubtitle') }}</div>
          <TagSelector
            class="setup-exports-period__frequency__tag-selector"
            :tags="frequencyStepTags"
            :savedTag="temporarySelectedFrequency"
            :onTagSelected="setTemporaryFrequencyStepTag"
          />
        </div>
      </template>
    </template>
  </SetupStep>
</template>

<script>
  import TagSelector from '~/components/global/TagSelector';
  import { periodIdToString } from '~/util/periods';
  import { ExportFrequencies, ExportPeriods } from '../../../utils/enumV2';

  export default {
    name: 'SetupExportsPeriod',
    components: {
      TagSelector
    },

    props: {
      selectedPeriod: {
        type: String, default: null,
      },
      selectedStartPeriod: {
        type: String, default: null,
      },
      selectedEndPeriod: {
        type: String, default: null,
      },
      availablePeriods: {
        type: Array, default: [],
      },
      isOpen: {
        type: Boolean, default: false,
      },
      loading: {
        type: Boolean, default: false,
      },
      setActiveStep: {
        type: Function, required: true,
      },
      setSelectedPeriodAndFrequency: {
        type: Function, required: true,
      },
      setSelectedCustomPeriod: {
        type: Function, required: true,
      },
      availableFrequencies: {
        type: Array,
        default: () => []
      },
      selectedFrequency: {
        type: String,
        default: ''
      }
    },

    data() {
      return {
        temporarySelectedPeriod: null,
        temporarySelectedStartPeriod: null,
        temporarySelectedEndPeriod: null,
        temporarySelectedFrequency: ExportFrequencies.NONE,
      }
    },

    computed: {
      // Subcomponent props
      periodStepProps() {
        return {
          ref: 'periodStep',
          stepName: 'periodStep',
          label: this.$t_locale('components/global/exports/SetupExportsPeriod')(`periodStepLabel`),
          subLabel: this.setSubLabel(),
          isOpen: this.isOpen,
          loading: this.loading,
          isModification: false,
          filled: this.selectedPeriodIsValid && this.selectedFrequencyIsValid,
          isValid: this.temporarySelectedPeriodIsValid && this.temporarySelectedFrequencyIsValid,
          onSetActive: this.setActiveStep,
          onValidate: this.emitSelectedPeriod,
          onCancel: this.cancelPeriod,
        };
      },
      periodStepTags() {
        if (!this.availablePeriods || !this.availablePeriods.length ) {
          return [];
        }
        const rollingPeriodsSubTags = this.availablePeriods.map((period) => ({
          id: period,
          label: this.fromPeriodIdToString(period),
          disabled: false,
        }));
        return [
          { id: 'RollingPeriods', label: this.$t_locale('components/global/exports/SetupExportsPeriod')('RollingPeriodsLabel'), icon: 'icon-gs-calendar', subTags: rollingPeriodsSubTags },
          { id: 'CustomPeriod', label: this.$t_locale('components/global/exports/SetupExportsPeriod')('CustomPeriodLabel'), icon: 'icon-gs-calenda-setting' },
        ];
      },
      frequencyStepTags() {
        if (!this.availableFrequencies || !this.availableFrequencies.length) {
          return [];
        }
        const frequenciesSubTags = this.availableFrequencies.map((frequency) => ({
          id: frequency,
          label: this.$t_locale('components/global/exports/SetupExportsPeriod')(`Frequency_${frequency}`),
          disabled: this.frequencySubTagisDisabled(frequency),
          tooltip: this.frequencySubTagisDisabled(frequency) ? this.$t_locale('components/global/exports/SetupExportsPeriod')('Unavailable') : '',
        }));

        return [
          { id: 'Frequencies', onlySubTags: true, subTags: frequenciesSubTags },
        ]
      },
      datePickerCommonProps() {
        return {
          type: 'month',
          valueType: 'YYYY-[month]MM',
          titleFormat: 'MM/YYYY',
        };
      },
      datePickerStartProps() {
        return {
          disabledDate: this.disabledStartDate,
          inputAttr: { id: 'date-picker-start' },
          ...this.datePickerCommonProps
        }
      },
      datePickerEndProps() {
        return {
          disabledDate: this.disabledEndDate,
          inputAttr: { id: 'date-picker-end' },
          ...this.datePickerCommonProps
        }
      },
      isCustomPeriodTemporary() {
        return this.temporarySelectedPeriod === 'CustomPeriod';
      },
      isCustomPeriod() {
        return this.selectedPeriod === 'CustomPeriod';
      },
      // Validators
      selectedPeriodIsValid() {
        this.temporarySelectedPeriod = `${this.selectedPeriod}`;
        if (this.isCustomPeriod) {
          const startPeriodValid = this.selectedStartPeriod && /^\d\d\d\d-month\d\d$/.test(this.selectedStartPeriod);
          const endPeriodValid = this.selectedEndPeriod && /^\d\d\d\d-month\d\d$/.test(this.selectedEndPeriod);
          return startPeriodValid && endPeriodValid;
        }
        return this.availablePeriods.includes(this.selectedPeriod);
      },
      selectedFrequencyIsValid() {
        return this.availableFrequencies.includes(this.selectedFrequency);
      },
      temporarySelectedPeriodIsValid() {
        if (this.isCustomPeriodTemporary) {
          const monthlyRegex = /^\d\d\d\d-month\d\d$/;
          const startValid = this.temporarySelectedStartPeriod && monthlyRegex.test(this.temporarySelectedStartPeriod);
          const endValid = this.temporarySelectedEndPeriod && monthlyRegex.test(this.temporarySelectedEndPeriod);
          return startValid && endValid;
        }
        return this.availablePeriods.includes(this.temporarySelectedPeriod);
      },
      temporarySelectedFrequencyIsValid() {
        if (this.temporarySelectedPeriod === ExportPeriods.LAST_MONTH) {
          return this.availableFrequencies.includes(this.temporarySelectedFrequency) && [ExportFrequencies.NONE, ExportFrequencies.EVERY_MONTH_ON_10].includes(this.temporarySelectedFrequency);
        }
        return this.availableFrequencies.includes(this.temporarySelectedFrequency);
      },
      periodStepValidSubLabel() {
        if (this.isCustomPeriod) {
          const startPeriod = this.fromPeriodIdToString(this.selectedStartPeriod);
          const endPeriod = this.fromPeriodIdToString(this.selectedEndPeriod);
          return `${startPeriod} - ${endPeriod}`;
        }
        return this.fromPeriodIdToString(this.selectedPeriod);
      },
      frequencyStepValidSubLabel() {
        return this.$t_locale('components/global/exports/SetupExportsPeriod')(`Frequency_${this.selectedFrequency}`);
      },
    },

    methods: {
      isBeforeAbsoluteStart(date) {
        const absoluteStart = this.$moment('2016-month01', 'YYYY-[month]MM');
        return this.$moment(date, 'YYYY-[month]MM').isBefore(absoluteStart.startOf('day'));
      },
      isAfterLastMonth(date) {
        const lastMonth = this.$moment().subtract(1, 'month').endOf('month');
        return this.$moment(date, 'YYYY-[month]MM').isAfter(lastMonth);
      },

      disabledStartDate(date) {
        if (this.temporarySelectedEndPeriod) {
          const selectedEndDate = this.$moment(this.temporarySelectedEndPeriod, 'YYYY-[month]MM');
          const isAfterSelectedEnd = this.$moment(date, 'YYYY-[month]MM').isAfter(selectedEndDate.startOf('day'));
          return isAfterSelectedEnd || this.isBeforeAbsoluteStart(date) || this.isAfterLastMonth(date);
        }
        return this.isBeforeAbsoluteStart(date) || this.isAfterLastMonth(date);
      },
      disabledEndDate(date) {
        if (this.temporarySelectedStartPeriod) {
          const selectedStartDate = this.$moment(this.temporarySelectedStartPeriod, 'YYYY-[month]MM');
          const isBeforeSelectedStart = selectedStartDate.isAfter(this.$moment(date, 'YYYY-[month]MM').startOf('day'));
          return isBeforeSelectedStart || this.isBeforeAbsoluteStart(date) || this.isAfterLastMonth(date);
        }
        return this.isBeforeAbsoluteStart(date) || this.isAfterLastMonth(date);
      },
      setTemporaryPeriodStepTag(value) {
        this.temporarySelectedPeriod = value;
      },
      setTemporaryFrequencyStepTag(value) {
        this.temporarySelectedFrequency = this.availableFrequencies.find((v) => v === value) || ExportFrequencies.NONE;
      },
      emitSelectedPeriod() {
        if (this.isCustomPeriodTemporary) {
          this.setSelectedPeriodAndFrequency('CustomPeriod', ExportFrequencies.NONE);
          this.setSelectedCustomPeriod(this.temporarySelectedStartPeriod, this.temporarySelectedEndPeriod);
        } else {
          this.setSelectedCustomPeriod(null, null);
          this.setSelectedPeriodAndFrequency(this.temporarySelectedPeriod, this.temporarySelectedFrequency);
        }
      },
      fromPeriodIdToString(periodId) {
        return periodIdToString(periodId, (k) => this.$t_locale('components/global/exports/SetupExportsPeriod')(k), 'Period_');
      },
      cancelPeriod() {
        this.temporarySelectedPeriod = `${this.selectedPeriod}`;
        this.temporarySelectedStartPeriod = `${this.selectedStartPeriod}`;
        this.temporarySelectedEndPeriod = `${this.selectedEndPeriod}`;
        this.temporarySelectedFrequency = `${this.selectedFrequency}`;
        this.setActiveStep(null);
      },
      setSubLabel() {
        if (!this.selectedPeriodIsValid) {
          return this.$t_locale('components/global/exports/SetupExportsPeriod')('periodStepSubLabel');
        }
        if (!this.selectedFrequency || this.selectedFrequency === ExportFrequencies.NONE) {
          return `${this.$t_locale('components/global/exports/SetupExportsPeriod')(`Period`)} : ${this.periodStepValidSubLabel}`;
        }
        return `${this.$t_locale('components/global/exports/SetupExportsPeriod')(`Period`)} : ${this.periodStepValidSubLabel}, ${this.$t_locale('components/global/exports/SetupExportsPeriod')(`Frequency`)} : ${this.frequencyStepValidSubLabel}`;
      },
      mustResetTemporaryFrequency(newPeriod) {
        return this.isCustomPeriod || (newPeriod === ExportPeriods.LAST_MONTH && this.temporarySelectedFrequency !== ExportFrequencies.EVERY_MONTH_ON_10);
      },
      frequencySubTagisDisabled(frequency) {
        return this.temporarySelectedPeriod === ExportPeriods.LAST_MONTH && ![ExportFrequencies.NONE, ExportFrequencies.EVERY_MONTH_ON_10].includes(frequency);
      }
    },
    watch : {
        selectedPeriod: {
          immediate: true,
          handler(newVal) {
            if(!this.isCustomPeriod) {
              this.temporarySelectedPeriod = newVal;
            }
          }
        },
        selectedFrequency: {
          immediate: true,
          handler(newVal) {
            if(!this.isCustomPeriod) {
              this.temporarySelectedFrequency = newVal;
            }
          }
        },
        temporarySelectedPeriod: {
          immediate: true,
          handler(newPeriod) {
            this.mustResetTemporaryFrequency(newPeriod) && this.setTemporaryFrequencyStepTag(ExportFrequencies.NONE);
          }
        },
        selectedStartPeriod: {
          immediate: true,
          handler(newVal) {
            if(this.isCustomPeriod) {
              this.temporarySelectedStartPeriod = newVal;
            }
          }
        },
        selectedEndPeriod: {
          immediate: true,
          handler(newVal) {
            if(this.isCustomPeriod) {
              this.temporarySelectedEndPeriod = newVal;
            }
        },
      }
    }
  }
</script>

<style lang="scss" scoped>
  .setup-exports-period {
    &__active-period-date-container {
      display:flex;
      flex-direction: row;

      &__start-input {
        margin-right: 1.5rem;
      }
      &__checkbox {
        margin-top: 1rem;
        padding-left: 1.5rem;
        font-weight: 700;
        font-size: 1rem!important;
      }
    }

    &__custom-period {
      display: flex;
      flex-flow: row;
      margin-top: 1rem;

      &__part {
        display: flex;
        flex-flow: column;
        label {
          color: $dark-grey;
        }
        & + & {
          margin-left: 1.5rem;
        }
      }
    }

    &__frequency {
      &__subtitle {
        margin-top: 1rem;
        font-size: 1rem;
        font-weight: 700;
        color: $dark-grey;
        word-break: break-word;
        overflow: hidden;
        display: block;
        white-space: nowrap;
        text-overflow: ellipsis;
        max-width: 475px;
      }
    }
  }

</style>


