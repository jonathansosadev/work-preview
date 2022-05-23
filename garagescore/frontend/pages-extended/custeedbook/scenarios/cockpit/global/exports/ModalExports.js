/** A single, editable, likable, commentable idea, displayed usually in list */
import ModalExports from "~/components/global/exports/ModalExports";

export default {
  component: ModalExports,
  props: [
    {
      label: 'customExports',
      value: [
        {
          id: 1,
          name: 'Satisfaction',
          exportType: 'FRONT_DESK_USERS',
          dataTypes: ['Maintenance', 'NewVehicleSale'],
          garageIds: ['559a9b04d4434d1900014ac9', '559a9b04d4434d1900014a11'],
          periodId: 'lastQuarter',
          fields: [
            'BF_SAT__REVIEWS_COUNT',
            'BF_SAT__NPS',
            'BF_SAT__SCORE',
            'BF_SAT__SCORE_MAINTENANCE',
            'BF_SAT__SCORE_NEW_VEHICLE_SALE',
            'BF_SAT__SCORE_USED_VEHICLE_SALE',
            'BF_SAT__ANSWERING_COUNT',
          ],
        },
        {
          id: 2,
          name: 'Coordonnées modifiées',
          exportType: 'CONTACTS_MODIFIED',
          dataTypes: ['All'],
          garageIds: ['559a9b04d4434d1900014ac9'],
          periodId: 'ALL_HISTORY',
          fields: [
            'BD_COM__GARAGE',
            'BD_COM__FRONT_DESK_USER',
            'BD_COM__INTERNAL_REFERENCE',
            'BD_CON__GENDER',
            'BD_CON__FIRST_NAME',
            'BD_CON__LAST_NAME',
          ],
        },
        {
          id: 3,
          name: 'Critères Insatisfaction APV',
          exportType: 'UNSATISFIED',
          dataTypes: ['Maintenance'],
          garageIds: ['559a9b04d4434d1900014ac9'],
          periodId: 'lastQuarter',
          fields: [
            'BD_COM__GARAGE',
            'BD_COM__FRONT_DESK_USER',
            'BD_COM__INTERNAL_REFERENCE',
            'BD_CON__GENDER',
            'BD_CON__FIRST_NAME',
            'BD_CON__LAST_NAME',
            'BD_UNS__MAINTENANCE_CRITERIA_1',
            'BD_UNS__MAINTENANCE_SUB_CRITERIA_1',
            'BD_UNS__MAINTENANCE_SUB_CRITERIA_2',
          ],
        }
      ],
      inputType: 'json',
    },
    {
      label: 'startExportFunction',
      value: () => alert('Export Lancé'),
      inputType: 'function'
    },
    {
      label: 'openModalFunction',
      value: () => alert('Modal Ouvert'),
      inputType: 'function'
    },
    {
      label: 'closeModalFunction',
      value: () => alert('Modal Fermé'),
      inputType: 'function'
    },
    {
      label: 'saveCustomExportFunction',
      value: () => alert('Export Sauvegardé'),
      inputType: 'function'
    },
    {
      label: 'updateCustomExportFunction',
      value: () => alert('Export Modifié'),
      inputType: 'function'
    },
    {
      label: 'deleteCustomExportFunction',
      value: () => alert('Export Supprimé'),
      inputType: 'function'
    },
    {
      label: 'currentUser',
      inputType: 'json',
      value: {
        hasAccessToEstablishment: true,
        hasAccessToTeam: true,
        hasAccessToAutomation: true,
        hasAccessToContacts: false,
        hasAccessToCrossLeads: true,
        hasAccessToEreputation: true,
        hasAccessToLeads: true,
        hasAccessToSatisfaction: true,
        hasAccessToSources: true,
        hasAccessToUnsatisfied: true,
        id: '5ec4dafc4f7e3f0016b7f6dc',
        email: 'foo@bar.fr'
      }
    },
    {
      label: 'availableGarages',
      inputType: 'json',
      value: [
        {
          id: '559a9b04d4434d1900014ac9',
          type: 'Dealership',
          isAAgentSharingHisLeads: false,
          isAgentSharingAllTickets: false,
          publicDisplayName: "Tom Auto Service (AD Combs-la-Ville)",
          slug: "tom-auto-service-ad-combs-la-ville",
          status: "RunningAuto",
          subscriptions: {
            Analytics: true,
            Automation: true,
            CrossLeads: true,
            EReputation: true,
            Lead: true,
            Maintenance: true,
            NewVehicleSale: true,
            UsedVehicleSale: true,
            VehicleInspection: true,
            active: true,
          }
        }, {
          id: '559a9b04d4434d1900014a10',
          type: 'Agent',
          isAAgentSharingHisLeads: true,
          isAgentSharingAllTickets: false,
          publicDisplayName: "Mon Agent",
          slug: "mon-agent",
          status: "RunningAuto",
          subscriptions: {
            Analytics: true,
            Automation: true,
            CrossLeads: true,
            EReputation: true,
            Lead: true,
            Maintenance: true,
            NewVehicleSale: true,
            UsedVehicleSale: true,
            VehicleInspection: true,
            active: true,
          }
        }, {
          id: '559a9b04d4434d1900014a11',
          type: 'Dealership',
          isAAgentSharingHisLeads: false,
          isAgentSharingAllTickets: false,
          publicDisplayName: "Mon Garage",
          slug: "mon-garage",
          status: "RunningAuto",
          subscriptions: {
            Analytics: true,
            Automation: true,
            CrossLeads: true,
            EReputation: true,
            Lead: true,
            Maintenance: true,
            NewVehicleSale: true,
            UsedVehicleSale: true,
            VehicleInspection: true,
            active: true,
          }
        }
      ]
    },
    {
      label: 'availablePeriods',
      inputType: 'json',
      value: [
        {
          id: 'ALL_HISTORY'
        }, {
          id: 'CURRENT_YEAR'
        }, {
          id: 'lastQuarter'
        }, {
          id: '2020'
        }, {
          id: '2021-month05'
        }
      ]
    },
  ]
}
