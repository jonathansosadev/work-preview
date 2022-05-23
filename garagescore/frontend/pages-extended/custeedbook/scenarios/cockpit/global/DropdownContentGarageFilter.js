import DropdownContentGarageFilter from "~/components/global/DropdownContentGarageFilter.vue";
export default {
  component: DropdownContentGarageFilter,
  props: [
    {
      label: 'isMobile',
      value: true,
      inputType: 'checkbox'
    },
    {
      label: 'optionSelected',
      value: 'garages',
      inputType: 'text'
    },
    {
    label: 'firstOption',
    value: {
        label: 'Etablessiments (3)',
        value: 'garages'
      },
    inputType: 'json'
    },
    {
      label: 'secondOption',
      value: {
        label: 'Plaques (3)',
        value: 'tags'
      },
      inputType: 'json'
    },
    {
      label: 'listedGarages',
      value: [{ key: '1', value: 'Dupont' },
        { key: '2', value: 'Smith' },
        {key: '3', value: 'Smith 2'}
      ],
      inputType: 'json'
    },
    {
      label: 'listedTags',
      value: [{ key: '1', value: 'Plaque1' },
        { key: '2', value: 'Plaque2' },
        {key: '3', value: 'plaque3'}
      ],
      inputType: 'json'
    },
    {
      label: 'isDisabledCheckbox',
      value: true,
      inputType: 'checkbox'
    },
    {
      label: 'labelClass',
      value: 'gray',
      inputType: 'text'
    }
  ]
}