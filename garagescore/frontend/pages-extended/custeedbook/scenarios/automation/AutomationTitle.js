/* automation campaign email */
import Title from "~/components/automation/Title";

function stringProp(label, value) { return { label, value, inputType: 'text' }; }
export default {
  component: Title,
  props: [
        {
          label: 'title',
          value: `Lorem ipsum dolor sit amet !`,
          inputType: 'text'
        },
        {
          label: 'customStyle',
          value: { color: '#000000', "font-weight": 'bold' },
          inputType: 'json'
        }
      ]
};