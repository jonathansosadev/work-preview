/** A single, editable, likable, commentable idea, displayed usually in list */
import CustomExportsList from "~/components/global/exports/CustomExportsList";
export default {
  component: CustomExportsList,
  props: [
    {
      label: 'customExports',
      value: [
          {
            id: 1,
            name: 'Satisfaction',
            exportType: 'FRONT_DESK_USERS',
            dataTypes: ['Maintenance', 'NewVehicleSale'],
            garageIds: ['toto', 'tata'],
            periodId: 'lastQuarter',
            fields: [
              'BD_CON__MODIFIED_CITY',
              'BD_CON__ADDRESS',
              'BD_CON__MODIFIED_ADDRESS',
              'BD_CON__MODIFIED_POSTAL_CODE',
              'BD_CON__MODIFIED_EMAIL',
              'BD_CON__MODIFIED_PHONE',
              'BD_CON__LAST_KNOWN_EMAIL_STATUS',
              'BD_CON__LAST_KNOWN_PHONE_STATUS',
              'BD_CON__CAMPAIGN_STATUS',
              'BD_CON__TICKET_STATUS',
            ],
          },
          {
            id: 2,
            name: 'Coordonnées modifiées',
            exportType: 'CONTACTS_MODIFIED',
            dataTypes: ['All'],
            garageIds: ['lele'],
            periodId: 'ALL_HISTORY',
            fields: [
              'BD_COM__GARAGE',
              'BD_COM__FRONT_DESK_USER',
              'BD_COM__INTERNAL_REFERENCE',
              'BD_CON__GENDER',
              'BD_CON__FIRST_NAME',
              'BD_CON__LAST_NAME',
            ],
          }
      ],
      inputType: 'json',
  },
  ]
}
