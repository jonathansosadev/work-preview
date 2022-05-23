<template>
  <Tile class="tile-ereputation">
    <Title
      class="tile-ereputation__header"
      icon="icon-gs-desktop-star"
    >
      {{$t_locale('components/cockpit/dashboard/TileEReputation')("headerTitle")}}
    </Title>
    <div class="tile-ereputation__padding-bar" />
    <div class="tiles">
      <EreputationTileWelcome
        :childModalProps="childModalProps"
        :erepConnections="garagesStats"
        :interactive="interactive"
        :openModal="openModal"
        :stats="getStatsOfSource('GarageScore')"
        :ereputationProps="ereputationProps"
        mright
        source="Garagescore"
      />
      <EreputationTileWelcome
        :childModalProps="childModalProps"
        :erepConnections="garagesStats"
        :interactive="interactive"
        :openModal="openModal"
        :stats="getStatsOfSource('Google')"
        :ereputationProps="ereputationProps"
        mright
        source="Google"
      />
      <EreputationTileWelcome
        :childModalProps="childModalProps"
        :erepConnections="garagesStats"
        :interactive="interactive"
        :openModal="openModal"
        :stats="getStatsOfSource('Facebook')"
        :mright="isFrench"
        :ereputationProps="ereputationProps"
        source="Facebook"
      />
      <EreputationTileWelcome
        v-if="isFrench"
        :childModalProps="childModalProps"
        :erepConnections="garagesStats"
        :interactive="interactive"
        :openModal="openModal"
        :stats="getStatsOfSource('PagesJaunes')"
        :ereputationProps="ereputationProps"
        source="PagesJaunes"
      />
    </div>
    <nuxt-link
      class="tile-ereputation__link"
      to="e-reputation"
    >
      {{ `${$t_locale('components/cockpit/dashboard/TileEReputation')('goTo')}` }}
      <i class="tile-ereputation__link__chevron icon-gs-right" />
    </nuxt-link>
  </Tile>
</template>

<script>
import EreputationTileWelcome
  from '~/components/cockpit/dashboard/e-reputation/EreputationTileWelcome';

export default {
  name: 'TileEreputation',
  components: {
    EreputationTileWelcome,
  },
  props: {
    childModalProps: Object,
    erepKpis: Array,
    kpiByPeriodSingle: Object,
    garagesStats: Array,
    interactive: {
      type: Boolean,
      default: true,
    },
    locale: String,
    openModal: {
      type: Function,
      required: true,
    },
    ereputationProps: {
      type: Object,
      required: true,
    },
  },
  methods: {
    getStatsOfSource(source) {
      const { erepKpis, kpiByPeriodSingle } = this;
      const { countSurveysResponded } = kpiByPeriodSingle;
      const statsForSource = erepKpis?.find((e) => e.source === source) || null;

      if (source === 'GarageScore' && statsForSource) {
        statsForSource.countReviews = countSurveysResponded;
      }
      return statsForSource;
    },
  },

  computed: {
    isFrench() {
      return this.locale === 'fr';
    },
  },
};
</script>

<style lang="scss" scoped>
.tile-ereputation {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;

  ::v-deep .button {
    height: auto;
  }

  ::v-deep .inline-list {
    margin-bottom: 0.5rem;
  }

  ::v-deep .e-reputation-tile {
    box-shadow: none;
    padding: 0px;
  }

  .tiles {
    width: 100%;

    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-gap: 1rem;

    margin-top: 1rem;
    margin-bottom: 19px;

    @media (max-width: $breakpoint-max-sm) {
      flex-flow: column;
    }
  }

  &__padding-bar {
    // IE hack for height 1px
    padding: 1px 0px 0px 0px;
    height: 0px;

    background-color: $light-grey;
    width: 100%;
  }

  &__link {
    margin-top: 10px;
    text-align: right;
    color: $orange;
    text-decoration: none;
    width: 100%;
    font-size: .9rem;

    &__chevron {
      font-size: .75rem;
      margin-left: 1px;
      position: relative;
      top: 1px;
    }
    &:hover {
      color: darken($orange, 2%);
    }
  }

  &__part {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    white-space: nowrap;

    &--conversion {
      cursor: pointer;
    }

    &__first {
      margin-bottom: 0.5rem;
    }
  }

  &__header {
    justify-content: center;
    margin-bottom: 1rem;
    width: 100%;
    text-align: left;
    font-size: 2rem; // Exception...
  }

  &__underline {
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

  .positive {
    color: $green;
  }

  .warning {
    color: $yellow;
  }

  .danger {
    color: $red;
  }
}

@media (min-width: $breakpoint-min-md) {
  .tile-ereputation {
    &__header {
      justify-content: center;
    }

    .tiles {
      display: flex;
      align-items: center;
    }

    ::v-deep .inline-list {
      margin-bottom: 0;
    }
  }
}
</style>
