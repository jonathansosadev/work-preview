import MonthlySummary from '~/components/grey-bo/MonthlySummary';

export default {
  component: MonthlySummary,
  props: [
    {
      label: 'fetchUserLast12MonthlySummaries',
      value: () => alert('Recherche Effectué'),
    },
    {
      label: 'loading',
      inputType: 'checkbox',
      value: false,
    },
    {
      label: 'results',
      value: [],
      inputOptions: [
        [],
        [
          { id: '616517bfaaad400003bfd176', createdAt: '1634015167800' },
          { id: '61402d9daa86000003f29b17', createdAt: '1631595933255' },
        ],
      ],
      inputType: 'select',
    },
    {
      label: 'error',
      value: null,
      inputOptions: [
        null,
        'NoResult',
        'UserNotFound',
        'UserForbidden',
      ],
      inputType: 'select',
    },
    {
      label: 'userId',
      value: '',
      inputOptions: [
        '',
        '6196586545036d0004c7458b',
      ],
      inputType: 'select',
    },
  ],
};
