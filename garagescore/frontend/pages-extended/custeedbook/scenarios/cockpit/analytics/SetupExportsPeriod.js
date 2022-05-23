import SetupExportsPeriod from "~/components/global/exports/SetupExportsPeriod.vue";
import { ExportPeriods, ExportFrequencies } from "../../../../../utils/enumV2";

export default {
  component: SetupExportsPeriod,
  props: [
    {
      label: 'selectedPeriod',
      value: ExportPeriods.LAST_MONTH,
      inputOptions: ExportPeriods.values(),
      inputType: 'select',
    },
    {
      label: 'selectedFrequency',
      value: ExportFrequencies.NONE,
      inputOptions: ExportFrequencies.values(),
      inputType: 'select',
    },
    {
      label: 'selectedStartPeriod',
      value: '',
      inputType: 'date',
    },
    {
      label: 'selectedEndPeriod',
      value: '',
      inputType: 'date',
    },
    {
      label: 'availablePeriods',
      value: ExportPeriods.values(),
      inputType: 'json',
    },
    {
      label: 'isOpen',
      value: true,
      inputType: 'checkbox',
    },
    {
      label: 'loading',
      value: false,
      inputType: 'checkbox',
    },
    {
      label: 'setActiveStep',
      value: () => alert(`Active step`),
      inputType: 'Function',
    },
    {
      label: 'setSelectedPeriodAndFrequency',
      value: (period, frequency) => alert(`Period selected : ${period}, Frequency selected : ${frequency}`),
      inputType: 'Function',
    },
    {
      label: 'setSelectedCustomPeriod',
      value: (period1, period2) => period1 && alert(`CustomPeriod selected : ${period1} - ${period2}`),
      inputType: 'Function',
    },
    {
      label: 'availableFrequencies',
      value: ExportFrequencies.values(),
      inputType: 'json',
    },
  ],
}
