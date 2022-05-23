<template>
  <section class="e-reputation-presentation-tile">
    <div class="e-rep-header-left">
      <div class="e-rep-header-left__title">
        <div class="clearfix">
          <ButtonGroup v-if="viewType" track-id="analytics-v2" :activeSlotName="viewType" @change="handleViewChange">
            <template slot="kpi">
              <span v-tooltip="{ content: $t_locale('components/cockpit/e-reputation/EreputationPresentationTile')('stats') }">
                <i class="icon-gs-stats" />
              </span>
            </template>
            <template slot="chart">
              <span v-tooltip="{ content: $t_locale('components/cockpit/e-reputation/EreputationPresentationTile')('evol') }">
                <i class="icon-gs-evols" />
              </span>
            </template>
          </ButtonGroup>
        </div>
        <img
          src="/e-reputation/GarageScore.svg"
          alt="GarageScore"
          v-tooltip="{ content: $t_locale('components/cockpit/e-reputation/EreputationPresentationTile')('gs') }"
        >
        <div class="clearfix" />
      </div>
      <!-- chart view -->
      <div class="e-rep-left__content" v-if="isChartActive">
        <Chart v-if="!isLoading" :chartConfig="chartConfig" :target="target" />
        <ChartSkeleton v-else />
      </div>
      <div class="e-rep-left__content" v-else>
        <StarsScore :score="gsScore" class="stars-score-wrapper" />
        <div>
          <AppText tag="span" class="extra-bold">
            {{ fullGsScore }}
          </AppText>
          <AppText tag="span">
            / 10
          </AppText>
          <AppText tag="span" type="muted">
            - {{ countReviews }} {{ $tc_locale('components/cockpit/e-reputation/EreputationPresentationTile')("reviews", countReviews) }}
          </AppText>
        </div>
      </div>
    </div>
    <div class="e-rep-header-right">
      <div class="logo-title-wrapper">
        <AppText
          tag="span"
          size="md"
          bold
        >
          {{ $t_locale('components/cockpit/e-reputation/EreputationPresentationTile')("GSProvider") }} :
        </AppText>
      </div>
      <div class="logo-wrapper">
        <div class="logo" v-for="logo in logos" :key="logo.name">
          <img :src="logo.imgPath" :alt="logo.name" v-tooltip="{ content: logo.name }" />
          <br />
          <AppText tag="span" type="muted" size="mds" bold>
            {{ logo.name }}
          </AppText>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import Chart from '~/components/global/Chart';
import ChartSkeleton from '~/components/global/skeleton/ChartSkeleton';
// import { ChartConfigFormats } from '~/utils/enumV2';

export default {
  name: 'EreputationTileGarageScore',
  data() {
    return {
      logos: [
        { name: 'Google', imgPath: '/e-reputation/Google.svg' },
        { name: 'PagesJaunes', imgPath: '/e-reputation/PagesJaunes.svg' },
        { name: 'La Centrale', imgPath: '/e-reputation/LaCentrale.svg' },
        { name: 'Ouest France', imgPath: '/e-reputation/OuestFrance.svg' },
        { name: 'Promoneuve', imgPath: '/e-reputation/Promoneuve.svg' },
        { name: 'Zoomcar', imgPath: '/e-reputation/Zoomcar.svg' },
      ],
    };
  },

  props: {
    source: { type: String, required: true },
    chartKpiDataAndConf: { type: Object, required: true },
    onChangeView: {
      type: Function,
      required: true,
    },
  },

  components: { Chart, ChartSkeleton },

  computed: {
    componentName() {
      return this.$options.name || 'EreputationTileGarageScore';
    },
    chartDataAndConfig() {
      return this.chartKpiDataAndConf[this.componentName];
    },
    isLoading() {
      return this.chartDataAndConfig.isLoading;
    },
    viewType() {
      return this.chartDataAndConfig.viewType;
    },
    chartConfig() {
      return this.chartDataAndConfig.componentChartConfig;
    },
    isChartActive() {
      return this.viewType === 'chart';
    },
    target() {
      return this.chartDataAndConfig.target;
    },

    stats() {
      if (this.source && this.source === 'GarageScore') {
        const garageScore = this.chartKpiDataAndConf.kpi.data?.erepKpis?.find((e) => e.source === this.source) || null;
        if (garageScore) {
          garageScore.countReviews = this.chartKpiDataAndConf.kpi.data?.kpiByPeriodSingle?.countSurveysResponded || 0;
        }
        return garageScore;
      }
      return this.chartKpiDataAndConf.kpi.data?.erepKpis?.find((e) => e.source === this.source) || null;
    },
    countReviews() {
      return this.stats ? this.stats.countReviews : 0;
    },
    gsScore() {
      return this.stats ? this.$options.filters.oneDecimal(this.stats.rating / 2) : 0;
    },
    fullGsScore() {
      return this.$options.filters.oneDecimal(this.gsScore * 2);
    },
  },

  methods: {
    handleViewChange(viewType) {
      this.onChangeView(this.componentName, viewType);
    },
  },
};
</script>

<style lang="scss" scoped>
.extra-bold {
  font-weight: 900;
}

.clearfix {
  flex: 1;
}

.e-reputation-presentation-tile {
  box-shadow: 0 0 3px 0 rgba(0, 0, 0, 0.16);
  margin: 0 0.5rem 0 1rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: left;
  background-color: #fff;
  border-radius: 5px;

  @media (max-width: $breakpoint-min-md) {
    flex-flow: column;
  }

  img {
    width: 2rem;
  }

  .e-rep-header-left {
    padding: 0 1.5rem 0 0;
    border-right: 1px solid rgba($grey, 0.5);
    text-align: center;
    display: flex;
    flex-flow: column;
    align-items: center;
    width: 33%;
    height: 180px;
    box-sizing: border-box;

    &__title {
      display: flex;
      width: 100%;
      border-bottom: 1px solid $light-grey;
      margin-bottom: 10px;
      padding-bottom: 10px;
    }

    @media (max-width: $breakpoint-min-md) {
      padding: 0 0 20px 0;
      border-right: none;
      border-bottom: 1px solid $light-grey;
      margin-bottom: 20px;
      width: 100%;
    }

    .stars-score-wrapper {
      margin: 1.2rem 0;
    }
  }

  .e-rep-left__content {
    width: 100%;
    height: 100%;
  }

  .e-rep-header-right {
    text-align: center;
    width: 68%;
    //height: 100%;
    display: flex;
    flex-flow: column;
    align-items: center;
    //justify-content: space-between;

    .logo-wrapper {
      padding: 1.5rem 0 0 0;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;

      ::v-deep .text {
        display: none;
      }

      @media (min-width: $breakpoint-min-md) {
        ::v-deep .text {
          display: inline;
        }
      }

      .logo {
        text-align: center;
        padding: 1rem;

        @media (max-width: $breakpoint-min-lg) {
          font-size: 10px;
        }

        img {
          margin-bottom: 5px;
        }
      }
    }
  }
}
</style>
