import ModalDeleteModelResponse from "~/components/cockpit/admin/ModalDeleteModelResponse";

export default {
  component: ModalDeleteModelResponse,
  props: [
    {
      label:'closeModal',
      value: function close() {  return alert('Modal Closed');  }
    },
  ]
}
