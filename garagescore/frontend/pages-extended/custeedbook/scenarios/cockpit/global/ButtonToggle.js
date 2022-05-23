/** A single, editable, likable, commentable idea, displayed usually in list */
import ButtonToggle from "~/components/global/ButtonToggle.vue";
export default {
  component: ButtonToggle,
  props: [
    {
      label: 'firstOption',
      value: {
        label: 'établissements (24)',
        value: 'garages'
      },
      inputType: 'json'
    },
    {
      label: 'secondOption',
      value: {
        label: 'Plaques (2)',
        value: 'plaques'
      },
      inputType: 'json'
    },
    {
      label: 'optionSelected',
      value: 'garages',
      inputType: 'text'
    },
    {
      label: 'selectedOption',
      value: (option) => alert(option),
      inputType: 'function'
    }
  ]
}
