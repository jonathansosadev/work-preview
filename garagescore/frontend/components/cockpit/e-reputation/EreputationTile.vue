<template>
  <section class="e-reputation-tile">
    <div class="e-reputation-tile__top">
      <div class="clearfix">
        <ButtonGroup
          v-if="viewType"
          :activeSlotName="viewType"
          track-id="analytics-v2"
          @change="handleViewChange"
        >
          <template slot="kpi">
            <span v-tooltip="{ content: $t_locale('components/cockpit/e-reputation/EreputationTile')('stats') }">
              <i class="icon-gs-stats" />
            </span>
          </template>
          <template slot="chart">
            <span v-tooltip="{ content: $t_locale('components/cockpit/e-reputation/EreputationTile')('evol') }">
              <i class="icon-gs-evols" />
            </span>
          </template>
        </ButtonGroup>
      </div>
      <img
        v-tooltip="{ content: source }"
        :alt="source"
        :src="`/e-reputation/${source}.svg`"
        class="logo"
      >
      <div class="clearfix" />
    </div>
    <div
      v-if="needSubscribtion"
      class="e-reputation-tile__info e-reputation-tile__subscribe"
    >
      <div class="e-reputation-tile__part">
        <AppText tag="span" type="muted">
          {{ `${ $t_locale('components/cockpit/e-reputation/EreputationTile')('NeedSubscription') } -` }}
        </AppText>
        <Button
          v-if="interactive"
          class="e-reputation-tile__link"
          type="link"
          @click="subscribe"
        >
          <span class="e-reputation-tile__link--underline">
            {{ $t_locale('components/cockpit/e-reputation/EreputationTile')('Subscribe') }}
          </span>
        </Button>
      </div>
    </div>
    <div
      v-else-if="noConnectionAtAll && interactive"
      class="e-reputation-tile__info"
    >
      <StarsScore :score="0" class="e-reputation-tile__info__stars" />
      <Button
        border="square"
        type="orange-border"
        @click="showConnectionAction"
      >
        {{ $t_locale('components/cockpit/e-reputation/EreputationTile')('Connection') }}
      </Button>
    </div>

    <div v-else class="e-reputation-tile__content">
      <div v-if="isChartActive" class="e-reputation-tile__content__chart">
        <Chart
          v-if="!isLoading"
          :chartConfig="chartConfig"
          :target="target"
        />
        <ChartSkeleton v-else />
      </div>
      <div v-else class="e-reputation-tile__info">
        <div v-if="source !== 'Facebook'">
          <div v-if="countReviews > 0" class="review-container">
            <StarsScore
              :score="score"
              class="e-reputation-tile__info__stars"
            />
            <AppText bold tag="span">
              {{ score }}
            </AppText>
            <AppText tag="span">
              /5
            </AppText>
            <AppText tag="span" type="muted">
              {{ `- ${ countReviews } ${ $tc_locale('components/cockpit/e-reputation/EreputationTile')('reviews', countReviews) }` }}
            </AppText>
          </div>
          <div
            v-if="countReviews <= 0"
            class="e-reputation-tile__info__no-review"
          >
            <AppText tag="span" type="muted">
              {{ $t_locale('components/cockpit/e-reputation/EreputationTile')('noReviews') }}
            </AppText>
          </div>
        </div>
        <div v-else class="recommend-wrapper">
          <div class="recommend-score">
            <AppText
              :type="recommendPercentType"
              extraBold
              tag="span"
            >
              {{ recommendPercent }}%
            </AppText>
            <AppText tag="span" type="muted">
              <i
                v-tooltip="{ content: recommendationExplanation }"
                class="icon-gs-help"
              />
            </AppText>
          </div>
          <div class="recommend-details">
            <AppText bold tag="div">
              {{ $t_locale('components/cockpit/e-reputation/EreputationTile')('Recommend') }}&nbsp;
            </AppText>
            <AppText
              tag="div"
              type="muted"
            >
              {{ `- ${ countRecommend } ${ $t_locale('components/cockpit/e-reputation/EreputationTile')('overXReviews', { x: countReviews }) }` }}
            </AppText>
          </div>
        </div>
        <div v-if="countReviews && countDetractorsWithoutResponse && !isGS">
          <a @click="goToDetractorsWithoutResponse">
            <AppText bold tag="span">
              {{ countDetractorsWithoutResponse }}
            </AppText>
            <AppText tag="span">
              {{ `/${ countDetractors } ${ $t_locale('components/cockpit/e-reputation/EreputationTile')('unsatisfiedPending') }` }}
            </AppText>
          </a>
        </div>
        <div v-else-if="countReviews && countDetractors > 0 && !isGS">
          <AppText tag="span" type="success">
            <a @click="goToDetractors">
              {{ $t_locale('components/cockpit/e-reputation/EreputationTile')('unsatisfiedOK') }}
            </a>
          </AppText>
        </div>
        <div
          v-if="interactive && (isGS || (isGroup && countConnectedGarages < countGarages))"
          :class="{ hide: isGS }"
          @click="showConnectionAction"
        >
          <a class="blue-link">
            {{ countConnectedGarages }}/{{ countGarages }} {{ $t_locale('components/cockpit/e-reputation/EreputationTile')('connected') }}
          </a>
        </div>
        <div
          v-else-if="interactive && isGroup"
          @click="showConnectionAction"
        >
          <AppText tag="span" type="success">
            <a>{{ $t_locale('components/cockpit/e-reputation/EreputationTile')('allConnected') }}</a>
          </AppText>
        </div>
        <Button
          v-else-if="interactive"
          border="square"
          size="sm"
          type="phantom"
          @click="disconnect"
        >
          {{ $t_locale('components/cockpit/e-reputation/EreputationTile')('Disconnect') }}
        </Button>
      </div>
    </div>
  </section>
</template>

<script>
import Chart from '~/components/global/Chart';
import ChartSkeleton from '~/components/global/skeleton/ChartSkeleton';

export default {
  name: 'EreputationTile',
  components: {
    Chart,
    ChartSkeleton,
  },
  props: {
    source: { type: String, required: true },
    chartKpiDataAndConf: { type: Object, required: true },
    onChangeView: {
      type: Function,
      required: true,
    },

    hasAccessToEreputation: Boolean,
    interactive: {
      type: Boolean,
      default: true,
    },
    selectedGarage: Object,
    selectedGarageIds: { type: Array, required: false, default: null },
    sourcesInMaintenance: Array,

    erepConnections: Object,

    connectSource: {
      type: Function,
      required: true,
    },
    onChangeReviewFilters: {
      type: Function,
    },
    refreshEreputationReview: {
      type: Function,
    },
    openModal: {
      type: Function,
      required: true,
    },
    childModalProps: Object,
  },

  mounted() {
    if (this.$router.currentRoute.name === 'cockpit-e-reputation-reviews') {
      if (!this.refreshEreputationReview) {
        throw new TypeError("Missing function refreshEreputationReview");
      }
      if (!this.onChangeReviewFilters) {
        throw new TypeError("Missing function onChangeReviewFilters");
      }
    }
  },

  computed: {
    componentName() {
      return this.$options.name || 'EreputationTile';
    },
    chartComponentName() {
      return `${ this.componentName }${ this.source }`;
    },
    chartDataAndConfig() {
      return this.chartKpiDataAndConf[this.chartComponentName];
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
          garageScore.countReviews = this.chartKpiDataAndConf.kpi.data?.garageHistory?.countSurveysResponded || 0;
        }
        return garageScore;
      }
      return this.chartKpiDataAndConf.kpi.data?.erepKpis?.find((e) => e.source === this.source) || null;
    },

    isGS() {
      return this.source === 'GarageScore';
    },
    needSubscribtion() {
      if (this.isGS) {
        return false;
      }
      if (this.selectedGarage?.subscriptions && this.hasAccessToEreputation) {
        return !this.selectedGarage.subscriptions.EReputation;
      }
      return !this.hasAccessToEreputation;
    },

    recommendPercentType() {
      if (this.recommendPercent > 85) {
        return 'success';
      } else if (this.recommendPercent > 75) {
        return 'warning';
      }
      return 'danger';
    },
    countRecommend() {
      return this.stats ? this.stats.countRecommend : 0;
    },

    countReviews() {
      return this.stats ? this.stats.countReviews : 0;
    },

    countDetractors() {
      return this.stats ? this.stats.countDetractors : 0;
    },

    countDetractorsWithoutResponse() {
      return (this.stats && this.stats.countDetractorsWithoutResponse) || 0;
    },

    countConnectedGarages() {
      return this.erepSourceStats && this.erepSourceStats.countConnectedGarages;
    },

    countGarages() {
      return this.erepConnections && this.erepConnections.totalGarages;
    },

    noConnectionAtAll() {
      if (this.source === 'GarageScore') return false;
      if (this.isGroup) {
        return !this.countConnectedGarages || this.countConnectedGarages <= 0;
      } else if (this.erepSourceStats && this.erepSourceStats.connectedGarages && this.erepSourceStats.connectedGarages.length) {
        if (this.erepSourceStats.connectedGarages.find((g) => g === this.selectedGarage?.id)) {
          return false;
        }
      }
      return true;
    },

    isGroup() {
      return this.selectedGarageIds === null || (this.selectedGarageIds && this.selectedGarageIds.length > 1);
    },

    erepSourceStats() {
      if (this.erepConnections && this.erepConnections.sources) {
        return this.erepConnections.sources.find(g => g.name === this.source);
      }
      return undefined;
    },

    recommendationExplanation() {
      return [0, 1, 2, 3, 4].map((n) => this.$t_locale('components/cockpit/e-reputation/EreputationTile')(`recommendationExplanation${ n }`)).join('\n');
    },

    score() {
      return this.stats ? this.$options.filters.oneDecimal(this.stats.rating / 2) : 0;
    },
    recommendPercent() {
      return this.stats ? this.$options.filters.oneDecimal((this.stats.countRecommend / this.stats.countReviews) * 100) : 0;
    },
  },

  methods: {
    showConnectionAction() {
      if (this.isGroup && this.sourcesInMaintenance.includes(this.source)) {
        this.openModal({
          component: 'ModalMaintenance',
          props: {
            ...this.getModalPropsByName('ModalMaintenance'),
            source: this.source,
          },
        });
      } else if (this.isGroup) {
        this.showConnectModal();
      } else {
        this.connectSource({ garageId: this.selectedGarage.id, source: this.source });
      }
    },
    getModalPropsByName(modalName) {
      return this.childModalProps?.[modalName] || {};
    },
    showConnectModal() {
      this.openModal({
        component: 'ModalConnectGarages',
        props: {
          ...this.getModalPropsByName('ModalConnectGarages'),
          source: this.source,
          childModalProps: this.childModalProps,
        },
      });
    },
    disconnect() {
      this.openModal({
        component: 'ModalDisconnectService',
        props: {
          ...this.getModalPropsByName('ModalDisconnectService'),
          source: this.source,
          garage: { garageId: this.selectedGarage.id },
        },
      });
    },

    goToDetractorsWithoutResponse() {
      const filters = {
        surveySatisfactionLevel: 'Detractor',
        publicReviewCommentStatus: 'NoResponse',
        source: this.source,
      };

      if (this.$router.currentRoute.name === 'cockpit-e-reputation-reviews') {
        this.onChangeReviewFilters(filters);
        this.refreshEreputationReview();
      } else {
        this.$router.push({ name: 'cockpit-e-reputation-reviews' });
      }
    },

    goToDetractors() {
      const filters = {
        surveySatisfactionLevel: 'Detractor',
        publicReviewCommentStatus: null,
        source: this.source,
      };

      if (this.$router.currentRoute.name === 'cockpit-e-reputation-reviews') {
        this.onChangeReviewFilters(filters);
        this.refreshEreputationReview();
      } else {
        this.$router.push({ name: 'cockpit-e-reputation-reviews' });
      }
    },

    subscribe() {
      this.openModal({
        component: 'ModalSubscriptionEreputation',
      });
    },

    handleViewChange(viewType) {
      this.onChangeView(this.chartComponentName, viewType);
    },
  },
};
</script>

<style lang="scss" scoped>
.clearfix {
  flex: 1;
}

.review-container {
  margin-top: 5px;
}

.e-reputation-tile {
  background-color: #fff;
  box-shadow: 0 0 3px 0 rgba(0, 0, 0, 0.16);
  text-align: center;
  flex-grow: 1;
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  height: 220px;
  min-height: 220px;
  box-sizing: border-box;
  border-radius: 5px;

  &__top {
    display: flex;
    width: 100%;
    border-bottom: 1px solid $light-grey;
    padding-bottom: 10px;
    margin-bottom: 10px;
  }

  &__content {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;

    &__chart {
      width: 100%;
      height: 100%;
    }
  }

  &__link {
    display: inline;
    padding: 0;

    &--underline {
      position: relative;

      &:after {
        position: absolute;
        content: '';
        background-color: $blue;
        width: 100%;
        height: 1px;
        bottom: 0;
        right: 0;
        left: 0;
      }
    }
  }

  &__part {
    margin-top: 19px;
  }

  &__subscribe {
    justify-content: flex-start;
  }

  &__info {
    height: 100px;
    display: flex;
    flex-flow: column;
    align-items: stretch;
    justify-content: space-around;

    &__no-review {
      margin-top: 1rem;
    }

    &__stars {
      margin-bottom: .5rem;
    }

    a {
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .hide {
    visibility: hidden;
  }

  .logo {
    width: 2rem;
  }

  .blue-link {
    color: #219ab5;
  }

  .recommend-wrapper {
    display: flex;
    flex-flow: column;
    align-items: center;
    justify-content: center;

    .recommend-score {
      font-size: 1rem;
      padding-bottom: 7px;
      display: flex;
      align-items: center;

      .icon-gs-help {
        font-size: 0.7rem;
        color: $grey;
        margin-left: 5px;
      }
    }

    .recommend-details {
      display: flex;
      align-items: center;
    }
  }
}
</style>
