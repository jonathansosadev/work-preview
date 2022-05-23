<template>
  <Tile class="tile-sales-period">
    <Title
      :hoverTitle="titleHoverTitle"
      :icon="vehiculePlusIcon"
      class="tile-sales-period__header"
    >
      {{ $t_locale('components/cockpit/dashboard/TileSalesPeriod')("headerTitle") }}
    </Title>
    <div class="tile-sales-period__padding-bar" />
    <template v-if="hasRights">
      <div class="tile-sales-period__body">
        <div class="tile-sales-period__body__handler">
          <VerticalStats
            v-if="garagesConversions"
            :title="$t_locale('components/cockpit/dashboard/TileSalesPeriod')('sales')"
            :tooltipContent="statsHoverTitle"
            :value="garagesConversions.countConversionsLeads"
            :valueDetails="`(${garagesConversions.countConvertedLeadsPct}%)`"
            :subValues="[
              { value: garagesConversions.countConversionsVN, suffix: $t_locale('components/cockpit/dashboard/TileSalesPeriod')('vn') },
              { value: garagesConversions.countConversionsVO, suffix: $t_locale('components/cockpit/dashboard/TileSalesPeriod')('vo') },
            ]"
            :valueThresholds="{
              positive,
              neutral,
              warning,
              danger: 0,
            }"
          >
            <template #renderSubValueList="{ items }">
              <ul class="sub-value-list">
                <li
                  v-for="item in items"
                  :key="item.suffix"
                  class="sub-value-list__item text-size-caption-1"
                >
                  <AppText
                    nowrap
                    tag="span"
                    type="muted"
                  >
                    {{ item.value | renderNumber }}
                    {{ item.suffix }}
                  </AppText>
                </li>
              </ul>
            </template>
          </VerticalStats>
          <div class="vertical-separator" />
          <VerticalStats
            v-if="garagesConversions"
            :title="$t_locale('components/cockpit/dashboard/TileSalesPeriod')('tradein')"
            :tooltipContent="statsHoverTitle"
            :value="garagesConversions.countConversionsTradeins"
            :valueDetails="`(${garagesConversions.countConversionsTradeInsPct}%)`"
            :subValues="[
              { value: garagesConversions.countConversionsTradeins, suffix: $t_locale('components/cockpit/dashboard/TileSalesPeriod')('vo') },
            ]"
            :valueThresholds="{
              positive,
              neutral,
              warning,
              danger: 0,
            }"
          >
            <template #renderSubValueList="{ items }">
              <ul class="sub-value-list text-size-caption-1">
                <li
                  v-for="item in items"
                  :key="item.suffix"
                  class="sub-value-list__item"
                >
                  <AppText
                    nowrap
                    tag="span"
                    type="muted"
                  >
                    {{ item.value | renderNumber }}
                    {{ item.suffix }}
                  </AppText>
                </li>
              </ul>
            </template>
          </VerticalStats>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="tile-sales-period__part">
        <AppText tag="span" type="muted">
          {{ $t_locale('components/cockpit/dashboard/TileSalesPeriod')("unavailable") }}
        </AppText>
        <Button
          class="tile-sales-period__button-link"
          type="link"
          @click="subscribe"
        >
          <span class="tile-sales-period__underline">
            {{ $t_locale('components/cockpit/dashboard/TileSalesPeriod')('subscribe') }}
          </span>
        </Button>
      </div>
    </template>
  </Tile>
</template>

<script>
import VerticalStats from '~/components/ui/VerticalStats';

export default {
  components: {
    VerticalStats,
  },
  props: {
    authorizations: {
      type: Object,
      required: true,
    },
    garagesConversions: {
      type: Object,
      required: true,
    },
    openModal: {
      type: Function,
      required: true,
    },
  },
  methods: {
    subscribe() {
      this.openModal({ component: 'ModalSubscriptionVNVO' });
    },
  },
  computed: {
    positive() {
      return this.garagesConversions.countLeads * 21 / 100
    },
    neutral() {
      return this.garagesConversions.countLeads * 20 / 100
    },
    warning() {
      return this.garagesConversions.countLeads * 10 / 100
    },
    hasRights() {
      const {
        hasLeadAtLeast,
        hasVnAtLeast,
        hasVoAtLeast,
      } = this.authorizations;

      if (!hasLeadAtLeast) {
        return false;
      }
      if (hasVnAtLeast) {
        return true;
      }
      if (hasVoAtLeast) {
        return true;
      }
      return false;
    },
    statsHoverTitle() {
      return [
        this.$t_locale('components/cockpit/dashboard/TileSalesPeriod')('hoverGood'),
        this.$t_locale('components/cockpit/dashboard/TileSalesPeriod')('hoverMedium'),
        this.$t_locale('components/cockpit/dashboard/TileSalesPeriod')('hoverBad')
      ].join('\n');
    },
    titleHoverTitle() {
      return this.$t_locale('components/cockpit/dashboard/TileSalesPeriod')('hoverTitle');
    },
    vehiculePlusIcon() {
      return this.$store.getters['cockpit/vehiclePlusIcon'];
    },
  },
};
</script>

<style lang="scss" scoped>
.sub-value-list {
  padding: 0;
  margin: 0;
  list-style: none;
  display: flex;
  justify-content: center;
  gap: 1rem;

  &__item {
    position: relative;

    &:not(:last-child)::after {
      content: "";
      z-index: 10;
      height: 1rem;
      width: 1px;
      display: block;
      background-color: grey;
      position: absolute;
      top: 0;
      right: calc(-0.5rem - 1px);
    }
  }
}

.vertical-separator {
  width: 0;
  height: 55%;
  border: solid 1px rgba(188, 188, 188, 0.5);
  align-self: flex-end;
}

.tile-sales-period {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;

  ::v-deep .button {
    height: auto;
  }

  ::v-deep .title {
    &__icon {
      font-size: 1.3rem;
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
      height: 100%;
      display: flex;
    }
  }

  &__padding-bar {
    height: 1px;
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

  &__part {
    width: 100%;
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
    font-size: 2rem;
  }

  &__underline {
    position: relative;

    &:after {
      position: absolute;
      content: "";
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
  .tile-sales-period {
    &__header {
      justify-content: center;
    }

    ::v-deep .inline-list {
      margin-bottom: 0;
    }
  }
}
</style>
