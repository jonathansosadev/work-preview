import ChartSkeleton from '~/components/global/skeleton/ChartSkeleton';

export default {
  component: ChartSkeleton,
  props: [
    {
      label: 'barsHeight',
      value: ['30%', '20%', '10%', '40%', '50%', '70%', '40%', '32%', '78%', '23%', '42%', '36%'],
      inputType: 'json',
    },
  ],
};
