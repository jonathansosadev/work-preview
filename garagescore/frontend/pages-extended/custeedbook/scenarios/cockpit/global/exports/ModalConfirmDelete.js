/** A single, editable, likable, commentable idea, displayed usually in list */
import ModalConfirmDelete from "~/components/global/exports/ModalConfirmDelete";
export default {
  component: ModalConfirmDelete,
  props: [
    {
      label: 'customExport',
      value: {
          id: 1,
          name: 'Satisfaction',
          exportType: 'FRONT_DESK_USERS',
          dataTypes: ['Maintenance', 'NewVehicleSale'],
          garageIds: ['toto', 'tata'],
          periodId: 'lastQuarter',
          fields: [
            'BD_CON__MODIFIED_CITY',
            'BD_CON__ADDRESS',
          ],
        },
      inputType: 'json',
    },
    {
      label: 'closeModalFunction',
      value: () => alert('Modal Fermé'),
      inputType: 'function'
    },
    {
      label: 'deleteCustomExportFunction',
      value: () => alert('Export Supprimé'),
      inputType: 'function'
    },
  ]
}
