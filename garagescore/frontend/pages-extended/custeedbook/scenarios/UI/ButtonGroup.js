import ButtonGroup from "~/components/ui/ButtonGroup";
export default {
  component: ButtonGroup,
  props: [
      {
        label: 'activeSlotName',
        inputType: 'select',
        inputOptions: [
          "stats",
          "evol"
        ],
        value : 'stats'
      },
      {
        label: 'type',
        value: 'default',
        inputType: 'select',
        inputOptions: [
          "default"
        ]
      },
      {
        label: 'size',
        value: 'md',
        inputType: 'select',
        inputOptions: [
          'sm',
          'md',
          'lg',
        ]
      },
    ]
  }
