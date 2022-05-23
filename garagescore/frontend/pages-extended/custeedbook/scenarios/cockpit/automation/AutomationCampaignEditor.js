/* CampaignEditor */
import CampaignEditor from "~/components/cockpit/automation/CampaignEditor";

function stringProp(label, value) { return { label, value, inputType: 'text' }; }
export default {
  component: CampaignEditor,
  props: [
        {
          label: 'value',
          value: ``,
          inputType: 'text'
        },
        {
          label: 'showFooter',
          value: true,
          inputType: 'checkbox'
        }
      ]
};