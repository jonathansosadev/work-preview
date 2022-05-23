/** A single, editable, likable, commentable idea, displayed usually in list */
import ModalConfirmName from "~/components/global/exports/ModalConfirmName";
export default {
  component: ModalConfirmName,
  props: [
    {
      label: 'customExportNames',
      value: ['Export1', 'Export2'],
      inputType: 'json'
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
  ]
}
