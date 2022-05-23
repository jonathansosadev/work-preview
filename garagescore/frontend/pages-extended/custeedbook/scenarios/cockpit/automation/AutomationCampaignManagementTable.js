/* AutomationCampaignManagementTable */
import AutomationCampaignManagementTable from '~/components/cockpit/automation/AutomationCampaignManagementTable';

function stringProp(label, value) { return { label, value, inputType: 'text' }; }
export default {
  component: AutomationCampaignManagementTable,
  props: [
        {
          label: 'campaignList',
          value: [{ garageId: '2515', garageName: "Citroën Flers", status: "RUNNING", contactType: "EMAIL", hidden: false }, { garageId: '2515', garageName: "Citroën Flers", status: "RUNNING", contactType: "MOBILE", hidden: false }, { garageId: '2516', garageName: "Citroën Lannion", status: "RUNNING", contactType: "EMAIL", hidden: false }, { garageId: '2516', garageName: "Citroën Lannion", status: "RUNNING", contactType: "MOBILE", hidden: false }, { garageId: '2517', garageName: "Citroën Pontoise", status: "RUNNING", contactType: "EMAIL", hidden: false }, { garageId: '2517', garageName: "Citroën Pontoise", status: "RUNNING", contactType: "MOBILE", hidden: false }, { garageId: '2518', garageName: "Mercedes Caen", status: "RUNNING", contactType: "EMAIL", hidden: false }, { garageId: '2518', garageName: "Mercedes Caen", status: "RUNNING", contactType: "MOBILE", hidden: false }, { garageId: '2519', garageName: "Renault Athis-Mons", status: "RUNNING", contactType: "EMAIL", hidden: false }, { garageId: '2519', garageName: "Renault Athis-Mons", status: "RUNNING", contactType: "MOBILE", hidden: false }, { garageId: '2519', garageName: "Renault Viry Chatillon", status: "RUNNING", contactType: "EMAIL", hidden: false }, { garageId: '2519', garageName: "Renault Viry Chatillon", status: "RUNNING", contactType: "MOBILE", hidden: false }],
          inputType: 'json',
        },
        {
          label: 'dropdownSelectorStatusCallback',
          value: (a, b) => {
            console.log('dropdownSelectorStatusCallback', a, b);
          },
        },
        {
          label: 'dropdownSelectorContactCallback',
          value: (a, b) => {
            console.log('dropdownSelectorContactCallback', a, b);
          },
        },
        {
          label: 'garagesSubscriptionStatus',
          value: [ {id: '5a1ec0645f2f921300362cd4', isSubscribedToAutomation: true}, {id: '5a82b1f931062400137e997a', isSubscribedToAutomation: false}],
          inputType: 'json',
        },
      ]
};