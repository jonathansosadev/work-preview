import Chart from "~/components/global/Chart";
export default {
  component: Chart,
  props: [
        {
          label: "chartConfig",
          value: {
            stepSize: 25,
            min: 0,
            max: 100,
            suggestedMin: 0,
            suggestedMax: 100,
            labels : [
            'Jan.', 'Fév.',
            'Mars', 'Avr.',
            'Mai', 'Juin',
            'Juil.', 'Août',
            'Sep.', 'Oct.',
            'Nov.', 'Déc.'
            ]
          },
          inputType: 'json'
        },
        {
          label: 'target',
          value: { label: "NPS", dataSet : [42, 48, 46, 50, 72, 65, 60, 68, 66, 50, 53, 57], backgroundColor : [...new Array(7).fill('#142244'), ...new Array(3).fill('#059dba'),...new Array(2).fill('#142244')]},
          inputType: 'json'
        },
        {
          label: 'top200',
          value: { dataSet : [75, 73, 78, 75, 74, 75, 76, 75, 76, 82, 80, 78] },
          inputType: 'json'
        },
        {
          label: 'global',
          value: { dataSet : [60, 56, 60, 70, 65, 63, 65, 69, 67, 69, 70, 68] },
          inputType: 'json'
        }
      ],
}
