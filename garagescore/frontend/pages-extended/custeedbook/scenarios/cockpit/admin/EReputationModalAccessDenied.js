import ModalAccessDenied from "~/components/cockpit/modals/e-reputation/ModalAccessDenied";

export default {
  component: ModalAccessDenied,
  props: [
    {
      label:'closeModal',
      value: function close() {  return alert('Modal Closed');  }
    },
    {
      label: 'reason',
      value: 'insufficientClearance',
      inputType: 'select',
      inputOptions: [
        'insufficientClearance',
        'noSubscribedGarages'
      ]
    }
  ]
}
