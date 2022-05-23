import CheckBox from "~/components/ui/CheckBox.vue";

export default {
  component: CheckBox,
  props: [
    {
        label: 'label',
        value: 'Label',
        inputType: 'text'
    },
    {
      label: 'labelStyle',
      value:  'color: inherit;',
      inputType: 'text'
    }
  ]
}