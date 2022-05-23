/* CentralButton */
import TableAutomationCampaignRow from "~/components/cockpit/automation/TableAutomationCampaignRow";

export default {
  component: TableAutomationCampaignRow,
  props: [
    {
      label: 'row',
      value: { 
        KPI_automationCountConvertedEmail: 4634,
        KPI_automationCountConvertedSms: 2266,
        KPI_automationCountLeadEmail: 2611,
        KPI_automationCountLeadSms: 434,
        KPI_automationCountOpenedEmail: 19396,
        KPI_automationCountOpenedSms: 17316,
        KPI_automationCountSentEmail: 45603,
        KPI_automationCountSentSms: 17316,
        KPI_automationTotalConverted: 6900,
        KPI_automationTotalLead: null,
        KPI_automationTotalOpened: 36712,
        KPI_automationTotalSent: 62919,
        campaignId: "60868f95b7f36200046f5989",
        customContent: undefined,
        garageId: "60706e38b02f370003b26b5b",
        idleEmail: 118,
        idleSms: 116,
        runningEmail: 600,
        runningSms: 591,
        totalCampaignsEmail: 718,
        totalCampaignsSms: 707,
        _id: "M_M",
       },
      inputType: 'json'
    },
    {
      label: 'campaignType',
      value: '',
      inputType: 'string'
    },
    {
      label: 'index',
      value: 1,
      inputType: 'number'
    },
    {
      label: 'displayDetails',
      value: () => {
        alert('show email and phone KPI');
      },
      inputType: 'Function'
    },
  ]
};