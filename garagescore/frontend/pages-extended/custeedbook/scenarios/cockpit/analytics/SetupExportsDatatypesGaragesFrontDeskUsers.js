import SetupExportsDatatypesGaragesFrontDeskUsers from "~/components/cockpit/analytics/SetupExportsDatatypesGaragesFrontDeskUsers.vue";
import { ExportTypes } from "~/utils/enumV2.js"

export default {
  component: SetupExportsDatatypesGaragesFrontDeskUsers,
  props: [
    {
      label: 'selectedExportType',
      value: ExportTypes.GARAGES,
      inputOptions: [...ExportTypes.values()],
      inputType: 'select',
    },
    {
      label: 'isOpen',
      value: true,
      inputType: 'checkbox',
    },
    {
      label: 'loading',
      value: false,
      inputType: 'checkbox',
    },
    {
      label: 'setSelectedDataTypesAndGaragesAndFrontDeskUsers',
      value: () => {
        alert('OK');
      },
      inputType: 'Function'
    },
    {
      label: 'setActiveStep',
      value: () => { },
      inputType: 'Function'
    },
    {
      label: 'isVehicleInspection',
      value: false,
      inputType: 'checkbox',
    },
    {
      label: 'exportGetAvailableFrontDeskUsers',
      value:() => { },
      inputType: 'Function'
    },
    {
      label: "availableGarages", value: [
        {
          "id": "1",
          "type": "Dealership",
          "publicDisplayName": "Monza",
          "subscriptions": {
            "Maintenance": true,
            "NewVehicleSale": true,
            "UsedVehicleSale": true,
            "VehicleInspection": false,
            "Lead": true,
            "Analytics": true,
            "EReputation": true,
            "Automation": false,
            "CrossLeads": false,
            "active": true,
            "restrictMobile": false
          },
        },
        {
          "id": "2",
          "type": "Dealership",
          "publicDisplayName": "Spa-Francorchamps",
          "subscriptions": {
            "Maintenance": true,
            "NewVehicleSale": true,
            "UsedVehicleSale": true,
            "VehicleInspection": false,
            "Lead": true,
            "Analytics": true,
            "EReputation": true,
            "Automation": false,
            "CrossLeads": false,
            "active": true,
            "restrictMobile": false
          },
        }
      ],
      inputType: 'json'
    },
    {
      label: 'availableFrontDeskUsers',
      value: [{
        label: "Michael Schumacher",
        value: { id: "Michael Schumacher", frontDeskUserName: 'Michael Schumacher', garageId: "1", garagePublicDisplayName: "1" },
        $isDisabled: false,
      }, {
        label: "Fernando Alonso",
        value: { id: 'Fernando Alonso', frontDeskUserName: 'Fernando Alonso', garageId: "1", garagePublicDisplayName: "1" },
        $isDisabled: false,
      },
      {
        label: "Lewis Hamilton",
        value: { id: 'Lewis Hamilton', frontDeskUserName: 'Lewis Hamilton', garageId: "2", garagePublicDisplayName: "2" },
        $isDisabled: false,
      }
      ],
      inputType: 'json'
    },
  ],
};
