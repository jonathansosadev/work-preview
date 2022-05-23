<template>
  <canvas id="chartCanvas" min-width="50px" ref="chart" aria-label="chart" role="img"></canvas>
</template>

<script>
import Chart from 'chart.js';
import { Golden, Grey, GreyishBrown, DarkGrey, CusteedBrandColor, Blue } from '~/assets/style/global.scss';

export default {
  name: 'Chart',
  props: {
    chartConfig: {
      required: true,
      type: Object,
      validator: function ({ labels }) {
        return Array.isArray(labels) && labels.every((label) => typeof label === 'string');
      },
    },
    target: {
      required: true,
      type: Object,
    },
    top200: {
      type: Object,
    },
    global: {
      type: Object,
    },
  },
  data() {
    return {
      chart: null,
    };
  },
  mounted() {
    const ctx = this.$refs.chart.getContext('2d');
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.labels,
        datasets: [
          {
            pointStyle: 'rectRot',
            type: 'bar',
            label: this.$t_locale('components/global/Chart')('performance'),
            backgroundColor: this.$props.target.backgroundColor,
            data: this.$props.target.dataSet,
            order: 4,
          },
          {
            label: this.$t_locale('components/global/Chart')('filteredPeriod'),
            backgroundColor: Blue,
            order: 3,
          },
          ...(this.$props.top200
            ? [
                {
                  type: 'line',
                  label: 'Top 200',
                  fill: false,
                  lineTension: 0.3,
                  borderColor: Golden,
                  pointBorderColor: Golden,
                  pointBackgroundColor: Golden,
                  pointBorderWidth: 1,
                  pointHoverRadius: 1,
                  pointHitRadius: 0,
                  pointHoverBackgroundColor: Golden,
                  pointHoverBorderColor: Golden,
                  pointHoverBorderWidth: 2,
                  pointRadius: 1,
                  borderWidth: 2,
                  data: this.$props.top200.dataSet,
                  order: 2,
                },
              ]
            : []),
          ...(this.$props.global
            ? [
                {
                  type: 'line',
                  label: 'Moy. Custeed',
                  fill: false,
                  lineTension: 0.4,
                  borderColor: Grey,
                  pointBorderColor: Grey,
                  pointBackgroundColor: Grey,
                  pointBorderWidth: 1,
                  pointHoverRadius: 2,
                  pointHoverBackgroundColor: Grey,
                  pointHoverBorderColor: Grey,
                  pointHoverBorderWidth: 2,
                  pointRadius: 1,
                  pointHitRadius: 0,
                  borderWidth: 2,
                  data: this.$props.global.dataSet,
                  order: 1,
                },
              ]
            : []),
        ],
      },
      options: {
        maintainAspectRatio: false,
        legend: {
          display: true,
          position: 'bottom',
          reverse: true,
          fullSize: false,
          labels: {
            fontFamily: 'Lato, sans-serif',
            padding: 10,
            fontColor: DarkGrey,
            boxWidth: 8,
            usePointStyle: true,
            pointStyle: 'circle',
          },
        },
        tooltips: {
          enabled: true,
          position: 'average',
          footerAlign: 'center',
          bodyAlign: 'left',
          padding: 10,
          bodySpacing: 5,
          intersect: false,
          displayColors: true,
          multiKeyBackground: 'transparent',
          backgroundColor: GreyishBrown,
          mode: 'index',
          itemSort: (a, b) => {
            return a.datasetIndex - b.datasetIndex;
          },
          callbacks: {
            title: () => null,
            label: (tooltipItem, data) => {
              const label = data.datasets[tooltipItem.datasetIndex].label || '';
              const value = tooltipItem.value || 0;
              const suffix = this.$props.chartConfig.suffix || '';
              return ` ${label} : ${value}${suffix}`;
            },
            labelColor: ({ datasetIndex }) => {
              let backgroundColor = null;
               if (datasetIndex === 0) {
                backgroundColor = this.$props.chartConfig.labelsColors.find(color => color !== Blue) ? CusteedBrandColor : Blue;
              } else if (datasetIndex === 1) {
                backgroundColor = Blue;
              } else if (datasetIndex === 2) {
                backgroundColor = Golden;
              } else if (datasetIndex === 3) {
                backgroundColor = Grey;
              }
              return {
                borderColor: 'transparent',
                backgroundColor,
              };
            },
          },
        },
        scales: {
          yAxes: [
            {
              display: true,
              type: 'linear',
              padding: 0,
              ticks: {
                ...(this.$props.chartConfig.stepSize !== undefined && { stepSize: +this.$props.chartConfig.stepSize }),
                ...(this.$props.chartConfig.min !== undefined && { min: +this.$props.chartConfig.min }),
                ...(this.$props.chartConfig.max !== undefined && { max: +this.$props.chartConfig.max }),
                ...(this.$props.chartConfig.suggestedMin !== undefined && {
                  suggestedMin: +this.$props.chartConfig.suggestedMin,
                }),
                ...(this.$props.chartConfig.suggestedMax !== undefined && {
                  suggestedMax: +this.$props.chartConfig.suggestedMax,
                }),
                fontSize: 10,
              },
            },
          ],
          xAxes: [
            {
              ticks: {
                stepSize: 1,
                padding: 0,
                fontSize: 10,
              },
            },
          ],
        },
      },
    });
  },
  computed: {
    labels() {
      return this.$props.chartConfig.labels.map((label) => (label.length > 5 ? `${label.slice(0, 4)}.` : label));
    },
  },
  watch: {
    chartConfig: {
      deep: true,
      handler: function (config) {
        this.chart.data.labels = this.labels;
        ['min', 'max', 'suggestedMin', 'suggestedMax', 'stepSize'].forEach((configElement) => {
          if (config[configElement] !== undefined) {
            this.chart.options.scales.yAxes[0]['ticks'][configElement] = +config[configElement];
          }
        });
        this.chart.update();
      },
    },
    target: {
      deep: true,
      handler: function (config) {
        this.chart.data.datasets.forEach((dataset) => {
          if (dataset.type === 'bar') {
            dataset.data = config.dataSet;
            dataset.backgroundColor = config.backgroundColor;
          }
        });

        this.chart.update();
      },
    },
    top200: {
      deep: true,
      handler: function (config) {
        this.chart.data.datasets.forEach((dataset) => {
          if (dataset.label === 'Top 200') {
            dataset.data = config.dataSet;
          }
        });
        this.chart.update();
      },
    },
    global: {
      deep: true,
      handler: function (config) {
        this.chart.data.datasets.forEach((dataset) => {
          if (dataset.label === 'Moy. Custeed') {
            dataset.data = config.dataSet;
          }
        });
        this.chart.update();
      },
    },
  },
};
</script>

<style>
#chartCanvas {
  max-height: 144px;
  height: 144px;
  width: 100%;
}
</style>
