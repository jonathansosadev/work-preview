/* CentralButton */
import CentralButton from "~/components/automation/CentralButton";

function stringProp(label, value) { return { label, value, inputType: 'text' }; }
export default {
  component: CentralButton,
  props: [
        {
          label: 'text',
          value: `Button`,
          inputType: 'text'
        },
        {
          label: 'fullWidth',
          value: true,
          inputType: 'checkbox'
        },
        {
          label: 'linkStyle',
          value: { 'background-color': '#F36233', 'color': '#FFFFFF', 'border-color' : '#F36233', 'max-width' : '600px !important', 'width' : '100% !important', 'font-weight': 'bold', 'font-style': 'normal', 'font-family' : 'Arial, sans-serif', 'letter-spacing' : '0', 'border-left' : 'inherit', 'border-right' : 'inherit', 'padding-left' : '15px', 'padding-right' : '15px', 'box-sizing' : 'border-box', 'line-height' : '1.43' },
          inputType: 'json'
        }
      ]
};