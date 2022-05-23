<template>
  <section class="e-reputation-tile">
    <img
      class="logo"
      :src="`/e-reputation/${source}.svg`"
      :alt="source"
      v-tooltip="{ content: source }"
    >
    <div
      v-if="isSubscriptionNeeded"
      class="e-reputation-tile__info e-reputation-tile__subscribe"
    >
      <div class="e-reputation-tile__part">
        <AppText tag="span" type="muted">
          {{ $t_locale('components/cockpit/dashboard/e-reputation/EreputationTileWelcome')('NeedSubscription') }} -
        </AppText>
        <Button
          v-if="interactive"
          @click="subscribe()"
          type="link"
          class="e-reputation-tile__link"
        >
          <span class="e-reputation-tile__link--underline">{{ $t_locale('components/cockpit/dashboard/e-reputation/EreputationTileWelcome')('Subscribe') }}</span>
        </Button>
      </div>
    </div>
    <div v-else-if="noConnectionAtAll && interactive" class="e-reputation-tile__info">
      <StarsScore :score="0" />
      <Button
        border="square"
        type="orange-border"
        @click="showConnectionAction()"
      >
        {{ $t_locale('components/cockpit/dashboard/e-reputation/EreputationTileWelcome')('Connection') }}
      </Button>
    </div>

    <div v-else class="e-reputation-tile__info">
      <div v-if="source !== 'Facebook'">
        <StarsScore :score="score" />
        <div style="margin-top: 5px;" v-if="countReviews > 0">
          <AppText tag="span" bold>
            {{ score }}
          </AppText>
          <AppText tag="span">
            /5
          </AppText>
          <AppText tag="span" type="muted">
            - {{ countReviews }} {{ $tc_locale('components/cockpit/dashboard/e-reputation/EreputationTileWelcome')('reviews', countReviews) }}
          </AppText>
        </div>
      </div>
      <div v-else class="recommend-wrapper">
        <div class="recommend-score">
          <AppText
            tag="span"
            extraBold
            :type="recommendPercentType"
          >
            {{ recommendPercent }}%
          </AppText>
          <AppText tag="span" type="muted">
            <i class="icon-gs-help" v-tooltip="{ content: recommendationExplanation }" />
          </AppText>
        </div>
        <div class="recommend-details">
          <AppText tag="div" bold>
            {{ $t_locale('components/cockpit/dashboard/e-reputation/EreputationTileWelcome')('Recommend') }}&nbsp;
          </AppText>
          <AppText tag="div" type="muted">
            - {{ countRecommend }} {{ $t_locale('components/cockpit/dashboard/e-reputation/EreputationTileWelcome')('overXReviews', { x: countReviews }) }}
          </AppText>
        </div>
      </div>
      <div v-if="countDetractorsWithoutResponse && !isGS">
        <a @click="goToDetractorsWithoutResponse()">
          <AppText tag="span" bold>{{ countDetractorsWithoutResponse }}</AppText>
          <AppText tag="span">/{{ countDetractors }} {{ $t_locale('components/cockpit/dashboard/e-reputation/EreputationTileWelcome')('unsatisfiedPending') }}</AppText>
        </a>
      </div>
      <div v-else-if="countReviews && !isGS">
        <AppText tag="span" type="success">
          <a @click="goToDetractors()">{{ $t_locale('components/cockpit/dashboard/e-reputation/EreputationTileWelcome')('unsatisfiedOK') }}</a>
        </AppText>
      </div>
      <div
        v-if="interactive && (isGS || (isGroup && countConnectedGarages < countGarages))"
        @click="showConnectionAction()"
        :class="{ hide: isGS }"
      >
        <a class="blue-link">{{ countConnectedGarages }}/{{ countGarages }} {{ $t_locale('components/cockpit/dashboard/e-reputation/EreputationTileWelcome')('connected') }}</a>
      </div>
      <div v-else-if="interactive && isGroup" @click="showConnectionAction()">
        <AppText tag="span" type="success">
          <a>{{ $t_locale('components/cockpit/dashboard/e-reputation/EreputationTileWelcome')('allConnected') }}</a>
        </AppText>
      </div>
      <Button
        v-else-if="interactive"
        border="square"
        type="phantom"
        size="sm"
        @click="disconnect()"
      >
        {{ $t_locale('components/cockpit/dashboard/e-reputation/EreputationTileWelcome')('Disconnect') }}
      </Button>
    </div>
  </section>
</template>

<script>
export default {
  name: 'EreputationTileWelcome',
  props: {
    source: String,
    stats: { type: Object, default: () => ({}), },
    erepConnections: { type: Array, default: () => [], },
    interactive: {
      type: Boolean,
      default: true,
    },
    openModal: {
      type: Function,
      required: true,
    },
    ereputationProps: {
      type: Object,
      required: true,
    },
    childModalProps: Object,
  },

  computed: {
    isGS() {
      return this.source === 'Garagescore';
    },

    isSubscriptionNeeded() {
      const hasAccessToEreputation = this.$store.getters['auth/hasAccessToEreputation'];
      const selectedGarage = this.$store.getters['cockpit/selectedGarage'];
      if (this.isGS) {
        return false;
      }
      if (selectedGarage && selectedGarage.subscriptions && hasAccessToEreputation) {
        return !selectedGarage.subscriptions.EReputation;
      }
      return !hasAccessToEreputation;
    },

    score() {
      return this.stats ? this.$options.filters.oneDecimal(this.stats.rating / 2) : 0;
    },

    recommendPercent() {
      return this.stats
        ? this.$options.filters.oneDecimal((this.stats.countRecommend / this.stats.countReviews) * 100)
        : 0;
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
      return this?.stats?.countRecommend || 0;
    },

    countReviews() {
      return this?.stats?.countReviews || 0;
    },

    countDetractors() {
      return this?.stats?.countDetractors || 0;
    },

    countDetractorsWithoutResponse() {
      return this?.stats?.countDetractorsWithoutResponse || 0;
    },

    countConnectedGarages() {
      return this?.erepSourceStats?.countConnectedGarages;
    },

    countGarages() {
      return this?.erepConnections?.totalGarages;
    },

    noConnectionAtAll() {
      if (this.source === 'Garagescore') {
        return false;
      }
      if (this.isGroup) {
        return !this.countConnectedGarages || this.countConnectedGarages <= 0;
      } else if (
        this.erepSourceStats &&
        this.erepSourceStats.connectedGarages &&
        this.erepSourceStats.connectedGarages.length
      ) {
        if (this.erepSourceStats.connectedGarages.find((g) => g === this.$store.getters['cockpit/selectedGarageId'])) {
          return false;
        }
      }
      return true;
    },

    isGroup() {
      return !this.$store.getters['cockpit/selectedGarageId'];
    },

    erepSourceStats() {
      if (this.erepConnections && this.erepConnections.sources) {
        return this.erepConnections.sources.find((g) => g.name === this.source);
      }
      return null;
    },

    recommendationExplanation() {
      return [0, 1, 2, 3, 4].map((n) => this.$t_locale('components/cockpit/dashboard/e-reputation/EreputationTileWelcome')(`recommendationExplanation${n}`)).join('\n');
    },
  },

  methods: {
    getModalPropsByName(modalName) {
      return this.childModalProps?.[modalName] || {};
    },
    showConnectModal() {
      this.openModal({
        component: 'ModalConnectGarages',
        props: {
          ...this.getModalPropsByName('ModalConnectGarages'),
          source: this.source,
        },
      });
    },
    showConnectionAction() {
      if (
        this.isGroup
        && this.ereputationProps.sourcesInMaintenance.includes(this.source)
      ) {
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
        this.connect(this.ereputationProps.singleKpi);
      }
    },
    connect(garage) {
      this.ereputationProps.connectSource({
        garageId: garage.garageId,
        source: this.source,
      });
    },
    disconnect() {
      const garage = this.ereputationProps.singleKpi;
      this.openModal({
          component: 'ModalDisconnectService',
          props: {
            ...this.getModalPropsByName('ModalDisconnectService'),
            source: this.source,
            garage,
          },
        },
      );
    },
    goToDetractorsWithoutResponse() {
      const filters = {
        surveySatisfactionLevel: 'Detractor',
        publicReviewCommentStatus: 'NoResponse',
        source: this.source,
      };

      this.ereputationProps.changeReviewFilters(filters);
      if (this.$router.currentRoute.name === 'cockpit-e-reputation-reviews') {
        this.refreshEreputationReview();
      } else {
        this.redirectToReviewPage();
      }
    },
    goToDetractors() {
      const filters = {
        surveySatisfactionLevel: 'Detractor',
        publicReviewCommentStatus: null,
        source: this.source,
      };

      this.ereputationProps.changeReviewFilters(filters);
      if (this.$router.currentRoute.name === 'cockpit-e-reputation-reviews') {
        this.refreshEreputationReview();
      } else {
        this.redirectToReviewPage();
      }
    },
    refreshEreputationReview() {
      this.ereputationProps.fetchReviews({
        page: 1,
        append: false,
      });
    },
    redirectToReviewPage() {
      this.ereputationProps.refreshEreputationRouteParameters();
      this.$router.push({ name: 'cockpit-e-reputation-reviews' });
    },
    subscribe() {
      this.openModal({
        component: 'ModalSubscriptionEreputation',
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.e-reputation-tile {
  background-color: $white;
  box-shadow: 0 0 3px 0 rgba($black, 0.16);
  text-align: center;
  flex-grow: 1;
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;

  @media (max-width: $breakpoint-min-xl) {
    width: 100%;
    box-sizing: border-box;
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
        bottom: 0px;
        right: 0px;
        left: 0px;
      }
    }
  }

  &__part {
    margin-top: 1rem;
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
    color: $blue;
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
        font-size: 0.85rem;
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
