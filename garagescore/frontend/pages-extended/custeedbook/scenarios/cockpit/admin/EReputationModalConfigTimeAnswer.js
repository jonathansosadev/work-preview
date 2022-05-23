import ModalConfigTimeAnswer from '~/components/cockpit/admin/ModalConfigTimeAnswer.vue';

export default {
  component: ModalConfigTimeAnswer,
  props: [
    {
      label: 'garagesConfigDelay',
      value: [
        {
          id: '577a30d774616c1a0056c263',
          name: 'Renault Athis Mouns',
          disabled: false,
          automaticReviewResponseDelay: 3600000,
        },
        {
          id: '5ca1d4b04a7aa10015fc9eba',
          name: 'Taller del Bosque',
          disabled: false,
          automaticReviewResponseDelay: 3600000,
        },
      ],
      inputType: 'json',
    },
    {
      label: 'reponseTime',
      value: [
        { label: 'Immediate', value: 60000 },
        { label: 'After1h', value: 3600000 },
        { label: 'After2h', value: 7200000 },
        { label: 'After3h', value: 10800000 },
        { label: 'After4h', value: 14400000 },
        { label: 'After1j', value: 86400000 },
        { label: 'After2j', value: 172800000 },
        { label: 'After3j', value: 259200000 },
      ],
      inputType: 'json',
    },
  ],
};
