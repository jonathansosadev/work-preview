import DropdownGarage from '~/components/global/DropdownGarage.vue';

export default {
  component: DropdownGarage,
  props: [
    {
      label: 'availableGarages',
      value: [
        {
          id: "577a30d774616c1a0056c263",
          publicDisplayName: "Garage Dupont"
        },
        {
          id: "5ca1d4b04a7aa10015fc9eba",
          publicDisplayName: "Taller del Bosque"
        },  
      ],
      inputType: 'json'
    },
    {
      label: 'filteredAvailableGarages',
      value: [
        {
          id: "577a30d774616c1a0056c263",
          publicDisplayName: "Garage Dupont"
        },
        {
          id: "5ca1d4b04a7aa10015fc9eba",
          publicDisplayName: "Taller del Bosque"
        },  
      ],
      inputType: 'json'
    },
    {
      label: "garageId",
      value: "",
      inputType: ""
    },
    {
      label: 'setCurrentGarage',
      value: (garageId) => alert(`garage selected ${garageId}`)
    }
  ],
};