import DropdownDMS from '~/components/global/DropdownDMS.vue'
export default {
  component: DropdownDMS,
  props: [
    {
      label: 'currentDMS',
      value: 
        {
          frontDeskUserName: "ALL_USERS",
          garageId: null
        },
      inputType: 'json'
    },
    {
      label: 'availableDms',
      value: [
        {
            frontDeskUserName: "prueba1"
        },
        {
            frontDeskUserName: "prueba2"
        },
      ],
      inputType: 'json'
    },
    {
      label: 'setCurrentDMS',
      value: (item) => { alert(`item selected ${item.frontDeskUserName}`) }
    }
  ]
}