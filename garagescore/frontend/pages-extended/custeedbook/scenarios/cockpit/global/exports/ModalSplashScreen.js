/** A single, editable, likable, commentable idea, displayed usually in list */
import ModalSplashScreen from "~/components/global/exports/ModalSplashScreen";
export default {
  component: ModalSplashScreen,
  props: [
    {
      label: 'recipients',
      value: ['foo@bar.fr', 'lele@toto.com'],
      inputType: 'json'
    },
    {
      label: 'canSave',
      value: true,
      inputType: 'checkbox'
    },
    {
      label: 'isLoading',
      value: true,
      inputType: 'checkbox'
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
  ]
}
