import SetupExportsAutomationCampaigns from "~/components/cockpit/automation/SetupExportsAutomationCampaigns.vue";
import { ExportTypes } from "~/utils/enumV2.js"

export default {
  component: SetupExportsAutomationCampaigns,
  props: [
    {
      label: 'isOpen',
      value: true,
      inputType: 'checkbox',
    },
    {
      label: 'selectedExportType',
      value: ExportTypes.AUTOMATION_RGPD,
      inputOptions: [ExportTypes.AUTOMATION_RGPD],
      inputType: 'select',
    },
    {
      label: 'loading',
      value: false,
      inputType: 'checkbox',
    },
    {
      label: 'setActiveStep',
      value: () => { },
      inputType: 'Function'
    },
    {
      label: 'onValidateSelectedAutomationCampaigns',
      value: () => { },
      inputType: 'Function'
    },
    {
      label: 'onCancelSelectedAutomationCampaigns',
      value: () => { },
      inputType: 'Function'
    },
    {
      label: 'setSelectedAutomationCampaigns',
      value: function (value) { 
        // need to update the props when the component is mounted
        this._props.selectedAutomationCampaigns = [...value]
      },
      inputType: 'Function'
    },
    {
      label: 'selectedAutomationCampaigns',
      value: [
        {
          $isDisabled: false,
          label: "Tous",
          value: "All"
        }
      ],
      inputType: 'json'
    },
    {
      label: "availableAutomationCampaigns", 
      value: [
        {
          name: "Relance des clients passés depuis 12 mois",
          id: "M_M",
        }, {
          name: "Proposition d'essai 6 mois après passage atelier",
          id: "VS_M_6",
        },
        {
          name: "Proposition d'essai 18 mois post-achat",
          id: "VS_UVS_18",
        }
      ],
      inputType: 'json'
    },
    {
      label: 'selectedAreValid',
      value: false,
      //inputType: 'checkbox',
    },
  ],
};
