import ButtonExport from "~/components/global/exports/ButtonExport";

export default {
  component: ButtonExport,
  props: [
    {
      label: 'label',
      value: 'Exporter',
      inputType: 'text'
    },
    {
      label: 'isAutomation',
      value: false,
      inputType: 'checkbox',
    },
  ]
}
