<template>
  <Tile class="tile-solved-unsatisfied-period">
    <Title
      icon="icon-gs-sad-checked"
      class="tile-solved-unsatisfied-period__header"
    >
      {{ $t_locale('components/cockpit/dashboard/TileSolvedUnsatisfiedPeriod')('headerTitle') }}
    </Title>
    <div class="tile-solved-unsatisfied-period__padding-bar"></div>
    <div class="tile-solved-unsatisfied-period__body">
      <div class="tile-solved-unsatisfied-period__body__handler">
        <Stats
          :dangerValue="0"
          :hoverTitle="solvedPctHoverTitle"
          :neutralValue="50"
          :positiveValue="50"
          :value="countSolvedPct"
          :warningValue="25"
          isPercent
        >
          <template slot="label">{{ $t_locale('components/cockpit/dashboard/TileSolvedUnsatisfiedPeriod')('solved') }}</template>
          <template slot="subtitle" v-if="!cockpitTypeIsVI">
            <InlineList class="tile-purchase-project__details">
              <AppText
                tag="li"
                type="muted"
              >
                {{ garagesSolvedUnsatisfied.countSolvedAPVUnsatisfied | renderNumber }}
                {{ $t_locale('components/cockpit/dashboard/TileSolvedUnsatisfiedPeriod')('maintenance') }}
              </AppText>
              <AppText
                tag="li"
                type="muted"
              >
                {{ garagesSolvedUnsatisfied.countSolvedVNUnsatisfied | renderNumber }}
                {{ $t_locale('components/cockpit/dashboard/TileSolvedUnsatisfiedPeriod')('vn') }}
              </AppText>
              <AppText
                tag="li"
                type="muted"
              >
                {{ garagesSolvedUnsatisfied.countSolvedVOUnsatisfied | renderNumber }}
                {{ $t_locale('components/cockpit/dashboard/TileSolvedUnsatisfiedPeriod')('vo') }}
              </AppText>
            </InlineList>
          </template>
        </Stats>
      </div>
    </div>
  </Tile>
</template>

<script>
import GarageTypes from "~/utils/models/garage.type.js";

export default {
  props: {
    cockpitType: {
      type: String,
      required: true,
    },
    garagesSolvedUnsatisfied: {
      type: Object,
      required: true,
    },
    hasAccessToUnsatisfied: Boolean,
  },
  computed: {
    cockpitTypeIsVI() {
      return this.cockpitType === GarageTypes.VEHICLE_INSPECTION
    },
    countSolvedPct() {
      let solvedSum =
        this.garagesSolvedUnsatisfied.countSolvedAPVUnsatisfied +
        this.garagesSolvedUnsatisfied.countSolvedVNUnsatisfied +
        this.garagesSolvedUnsatisfied.countSolvedVOUnsatisfied ;
      return Math.round(
        (solvedSum / this.garagesSolvedUnsatisfied.countUnsatisfied) * 100
      );
    },
    solvedPctHoverTitle() {
      return [
        this.$t_locale('components/cockpit/dashboard/TileSolvedUnsatisfiedPeriod')('hoverGood'),
        this.$t_locale('components/cockpit/dashboard/TileSolvedUnsatisfiedPeriod')('hoverMedium'),
        this.$t_locale('components/cockpit/dashboard/TileSolvedUnsatisfiedPeriod')('hoverBad')
      ].join('\n');
    },
  }
};
</script>

<style lang="scss" scoped>
.tile-solved-unsatisfied-period {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;

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
  }

  ::v-deep .title {
    &__icon {
      font-size: 1.5rem;
    }
  }

  ::v-deep .inline-list {
    margin-bottom: 0.5rem;
  }

  &__body {
    display: flex;
    flex-direction: row;
    flex-grow: 1;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin-top: 16.5px;

    &__handler {
      width: 100%;
    }
  }

  &__header {
    justify-content: center;
    margin-bottom: 1rem;
    width: 100%;
    text-align: left;
    font-size: 2rem; // Exception...
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
  .tile-solved-unsatisfied-period {
    &__header {
      justify-content: center;
    }

    ::v-deep .inline-list {
      margin-bottom: 0;
    }
  }
}
</style>
