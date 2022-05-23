/** A single, editable, likable, commentable idea, displayed usually in list */
import Button from "~/components/ui/Button";
export default {
  component: Button,
  props: [
    {
      label: 'size',
      value: `default`,
      inputType: 'select',
      inputOptions: [
        "xs",
        "sm",
        "default",
        "md",
        "lg",
        "xl"
      ]
    },
    {
      label: 'type',
      value: "options-dark",
      inputType: 'select',
      inputOptions: [
        "primary",
        "danger",
        "warning",
        "success",
        "orange",
        "default",
        "options-dark",
        "contained-icon-white",
      ]
    },
    {
      label: 'loading',
      value: false,
      inputType: 'checkbox',
    },
    {
      label: 'link',
      value: false,
      inputType: 'checkbox',
    },
    {
      label: 'border',
      value: 'round',
      inputType: 'select',
      inputOptions: [
        "round",
        "square"
      ]
    },
    {
      label: 'disabled',
      value: false,
      inputType: 'checkbox',
    },
    {
      label: 'fullSized',
      value: false,
      inputType: 'checkbox',
    },
    {
      label: 'fullSizedNoPadding',
      value: false,
      inputType: 'checkbox',
    },
    {
      label: 'active',
      value: false,
      inputType: 'checkbox',
    },
    {
      label: 'content',
      value: 'Par collaborateur',
      inputType: 'text',
    },
    {
      label: 'icon',
      value: 'icon-gs-group',
      inputType: 'text'
    },
    {
      label: 'tooltip',
      value: 'I am a tooltip!',
      inputType: 'text'
    }
  ],
}
