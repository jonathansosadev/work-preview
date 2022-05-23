import ModalDeleteTag from '~/components/global/ModalDeleteTag.vue'
export default {
  component: ModalDeleteTag,
  props: [
    {
      label: "tagId",
      value: "1",
      inputType: "text"
    },
    {
      label: "closeModal",
      value: ()=>alert('Closing Modal'),
    },
    {
      label: "deleteTag",
      value: (id)=>alert(`Deleting tag with id ${id}`),
    }
  ]
}