import RgpdForm from "~/components/grey-bo/RgpdForm/index.vue";
export default {
  component: RgpdForm,
  props: [
    {
      label: 'billingAccounts',
      value: [
        {
          name: 'Renault Bordeaux',
          RGPDContact: 'concession-bordeaux@renault.fr',
        },
        {
          name: 'Opel Montargis',
          RGPDContact: null,
        },
      ],
      inputType: 'json'
    },
    {
      label: 'contactNumber',
      value: 2,
      inputType: 'number'
    },
    {
      label: 'customerNumber',
      value: 0,
      inputType: 'number',
    },
    {
      label: 'dataNumber',
      value: 0,
      inputType: 'number',
    },
    {
      label: 'displayReverse',
      value: false,
      inputType: 'checkbox',
    },
    {
      label: 'onSubmitSearch',
      value: () => { },
      inputType: 'Function'
    },
    {
      label: 'onAnonymization',
      value: () => { },
      inputType: 'Function'
    },
  ]
}