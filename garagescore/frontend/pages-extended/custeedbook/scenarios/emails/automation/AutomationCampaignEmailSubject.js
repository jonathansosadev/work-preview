
import AutomationCampaignEmailSubject from "~/components/emails/pages/automation/AutomationCampaignEmailSubject.vue";
import { AutomationCampaignTargets } from '~/utils/enumV2';

export default {
  component: AutomationCampaignEmailSubject,
  props: [
    {
      label: 'target', inputType: 'select', inputOptions:
      AutomationCampaignTargets.values(), value: "M_M"
    },
    { label:'customerName', value: "NOM Customer", inputType: 'text' },
    { label:'garageName', value: "NOM Garage", inputType: 'text' },
    { label:'brandName', value: "NOM Marque", inputType: 'text' },
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