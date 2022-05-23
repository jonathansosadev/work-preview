import OptionsAutomationCampaignTypes from "~/components/global/OptionsAutomationCampaignTypes";
import CampaignTypes from "~/utils/models/automation-campaign.type";

export default {
  component: OptionsAutomationCampaignTypes,
  props: [
    {
      label: 'availableCampaignTypes',
      value: [
        {
          id: CampaignTypes.AUTOMATION_MAINTENANCE,
          key: CampaignTypes.AUTOMATION_MAINTENANCE,
          label: CampaignTypes.AUTOMATION_MAINTENANCE,
        },
        {
          id: CampaignTypes.AUTOMATION_VEHICLE_SALE,
          key: CampaignTypes.AUTOMATION_VEHICLE_SALE,
          label: CampaignTypes.AUTOMATION_VEHICLE_SALE,
        },
      ],
      inpuType: 'json',
    },
  ]
}