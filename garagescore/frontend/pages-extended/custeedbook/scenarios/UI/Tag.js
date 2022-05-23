import Tag from "~/components/ui/Tag";

export default {
  component: Tag,
  props: [
    {
      label: 'content',
      inputType: 'text',
      value: 'Hello World!'
    },
      {
        label: 'background',
        inputType: 'select',
        value : 'critical-default',
        inputOptions: [
          'primary-default',
          'success-default',
          'warning-default',
          'critical-default',
          'grey-default',
          'grey-subdued',
          'grey-disabled',
        ],
      },
      {
        label: 'icon',
        value: 'target',
        inputType: 'select',
        inputOptions: [
          'target',
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
        label: 'padding',
        value: 'xs',
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
    ]
  }
