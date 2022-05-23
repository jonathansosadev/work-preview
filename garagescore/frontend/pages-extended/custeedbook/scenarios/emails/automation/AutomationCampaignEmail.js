/* automation campaign email */
import AutomationCampaign from "~/components/emails/pages/automation/AutomationCampaignEmail.vue";

import { AutomationCampaignTargets } from '~/utils/enumV2';
  
function stringProp(label, value) { return { label, value, inputType: 'text' }; }

export default {
  component: AutomationCampaign,
  props: [
    {
      label: 'target', inputType: 'select', inputOptions:
        AutomationCampaignTargets.values(), value: "M_M"
    },
    { label:'promotionalMessage', value: "Mon message promo {garageName}  {customerName}  {brandName}", inputType: 'longtext' },
    stringProp('garageName', "Mon garage"),
    stringProp('customerName', "Mon client"),
    stringProp('brandName', "Ma marque"),
    stringProp('themeColor', "#F36233"),
    stringProp('logoUrl', "Logo-h60px-Seat.png"),
    {
      label: 'choices',
      value: [
        {
          label: "Choix 1",
          url: "url"
        }
      ], inputType: 'json'
    },
    {
      label: 'isMotorbikeDealership',
      inputType: 'select',
      inputOptions: [
        true,
        false
      ]
    },
  ]
}