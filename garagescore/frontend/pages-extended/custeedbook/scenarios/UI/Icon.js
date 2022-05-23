import Icon from "~/components/ui/Icon";

export default {
  component: Icon,
  props: [
      {
        label: 'name',
        value: 'cog',
        inputType: 'select',
        inputOptions: [
          'add',
          'search',
          'cog',
          'chat-bubble',
          'database',
          'profile',
          'star',
        ]
      },
      {
        label: 'color',
        value: 'default',
        inputType: 'select',
        inputOptions: [
          'default',
          'subdued',
          'hovered',
          'pressed',
          'disabled',
          'success',
          'warning',
          'critical',
          'highlight',
        ]
      },
      {
        label: 'size',
        value: 'xl',
        inputType: 'select',
        inputOptions: [
          'xxs',
          'xs',
          's',
          'm',
          'l',
          'xl',
          'xxl',
        ]
      },
      {
        label: 'animation',
        value: 'none',
        inputType: 'select',
        inputOptions: [
          'none',
          'rotate',
        ]
      },
      {
        label: 'disabled',
        value: false,
        inputType: 'checkbox'
      },
    ]
  }
