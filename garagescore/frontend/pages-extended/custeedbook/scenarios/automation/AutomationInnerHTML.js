/* innerHTML */
import innerHTML from "~/components/automation/innerHTML";

function stringProp(label, value) { return { label, value, inputType: 'text' }; }
export default {
  component: innerHTML,
  props: [
        {
          label: 'content',
          value: `Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
          inputType: 'text'
        },
        {
          label: 'cssStyle',
          value: { 'color': '#219ab5', 'font-weight': 'bold' },
          inputType: 'json'
        }
      ]
};