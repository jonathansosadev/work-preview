
import CampaignSms from "~/components/sms/automation/AutomationGdprSms.vue";
import { AutomationCampaignTargets } from '~/utils/enumV2';

export default {
  component: CampaignSms,
  props: [
    {
      label: 'target', inputType: 'select', inputOptions:
        AutomationCampaignTargets.values(), value: "M_M"
    },
    { label:'shortUrl', value: "gsco.re/xExvVmAp", inputType: 'text' },
  ]
}