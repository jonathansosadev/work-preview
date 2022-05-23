<template>
  <div class="kpi" :class="classBinding" v-if="!loading">
    <div class="kpi__title">
      <span class="kpi__title__label">
        <div class="clearfix">
          <ButtonGroup track-id="analytics-v2" v-if="view" :activeSlotName="activeSlotName" @change="handleViewChange">
            <template slot="kpi">
              <span class="kpi__title__help" v-tooltip="{ content: $t_locale('components/ui/OldKPI')('stats') }">
                  <i class="icon-gs-stats"></i>
              </span>
            </template>
            <template slot="chart">
              <span class="kpi__title__help" v-tooltip="{ content: $t_locale('components/ui/OldKPI')('evol') }">
                <i class="icon-gs-evols"></i>
              </span>
            </template>
          </ButtonGroup>
        </div>
        <slot name="label"></slot>
        <div class="clearfix">
          <span
            class="kpi__title__hover-title"
            v-if="hoverTitle && $mq === 'lg' && !noInfo"
            v-tooltip="{ content: hoverTitle, html: true }"
          >
            <i class="icon-gs-help" />
          </span>
        </div>
      </span>
    </div>
    <div class="divider"></div>
      <div class="kpi__main">
        <div class="kpi__value" v-if="!noMainValue">
          <span v-if="isPercent">
            {{ value | oneDecimal | frenchFloating }}
            <template v-if="!isNaN(value)">%</template>
          </span>
          <span v-else>{{ value | renderNumber }}</span>
          <span class="kpi__value-unit" v-if="value !== '--'">
            <slot name="value-unit"></slot>
          </span>
        </div>
        <div class="kpi__subtitle">
          <slot name="subtitle"></slot>
        </div>
      </div>
      <div class="kpi__common-stats" v-if="!noBottom">
        <div class="kpi__common-stats__left">
          <div class="kpi__common-stats__upper-value">{{ topValue }}</div>
          <div class="kpi__common-stats__lower-label">{{ $t_locale('components/ui/OldKPI')('top') }}</div>
        </div>
        <div class="kpi__common-stats__right">
          <div class="kpi__common-stats__upper-value">{{ globalValue }}</div>
          <div class="kpi__common-stats__lower-label">{{ $t_locale('components/ui/OldKPI')('global') }}</div>
        </div>
      </div>
  </div>
  <KPISkeleton
    :noBottom="noBottom"
    :noInfo="noInfo"
    :haveSubtitle="$slots.subtitle !== undefined"
    v-else
  />
</template>

<script>
  import garageTypes from '~/utils/models/garage.type';
  import KPISkeleton from "~/components/global/skeleton/KPISkeleton";

export default {
  name: "KPI",
  components: { KPISkeleton },

  props: {
    value: { type: Number | String },
    hoverTitle: { type: String },
    dangerValue: { type: Number },
    warningValue: { type: Number },
    neutralValue: { type: Number },
    positiveValue: { type: Number },
    isPercent: { type: Boolean },
    reverse: { type: Boolean },
    noMainValue: { type: Boolean },
    // @TODO wrong modifier
    goldOnly: { type: Boolean },
    blueOnly: { type: Boolean },
    darkGreyOnly: { type: Boolean },

    small: { type: Boolean },

    generalStatsLabel: { type: String },
    decimal: { type: Number },

    noBottom: { type: Boolean }, // Use no hide the bottom part (Top 200... Global...)
    noInfo: { type: Boolean }, // Hide little 'i' bubble

    loading: { type: Boolean },

    //[Analytics v2]
    changeView: { type : Function },
    view : { type : String },
    componentName : { type : String }
  },

  methods: {
    handleViewChange(slotName){
      this.$props.changeView(this.$props.componentName, slotName);
    },
    getDisplayValue(value) {
      if (value || value === 0) {
        const decimal = this.decimal || 0;
        const divider = Math.pow(10, decimal);
        return Math.round(value * divider) / divider;
      }
      return null;
    }
  },
  computed: {
    classBinding() {
      if (!this.reverse) {
        return {
          "kpi--blue": this.blueOnly,
          "kpi--gold": this.goldOnly,
          "kpi--dark-grey": this.darkGreyOnly,
          "kpi--positive": this.value >= this.positiveValue,
          "kpi--neutral":
            this.value >= this.neutralValue && this.value < this.positiveValue,
          "kpi--warning":
            this.value >= this.warningValue && this.value < this.neutralValue,
          "kpi--danger":
            this.value >= this.dangerValue && this.value < this.warningValue,
          "kpi--small": this.small
        };
      } else {
        return {
          "kpi--blue": this.darkGreyOnly,
          "kpi--gold": this.goldOnly,
          "kpi--dark-grey": this.darkGrey,
          "kpi--positive": this.value <= this.positiveValue,
          "kpi--neutral":
            this.value <= this.neutralValue && this.value > this.positiveValue,
          "kpi--warning":
            this.value <= this.warningValue && this.value > this.neutralValue,
          "kpi--danger":
            this.value <= this.dangerValue && this.value > this.warningValue,
          "kpi--small": this.small
        };
      }
    },
    selectedPeriod() {
      return this.$store.state.cockpit.current.periodId;
    },
    cockpitType() {
      return this.$store.state.cockpit.current.cockpitType;
    },
    dataType() {
      if (this.$route.name.includes('automation')) {
        return this.$store.state.cockpit.current.automationCampaignType || 'ALL';
      }
      if (this.$route.name.includes('leads')) {
        return this.$store.state.cockpit.current.leadSaleType || 'ALL'
      }
      return this.$store.state.cockpit.current.dataTypeId || 'ALL';
    },

    generalStats() {
      const generalStats = this.$store.getters["cockpit/generalStats"] &&
        this.$store.getters["cockpit/generalStats"][this.selectedPeriod] &&
        this.$store.getters["cockpit/generalStats"][this.selectedPeriod][this.cockpitType];
      if (this.cockpitType === garageTypes.VEHICLE_INSPECTION) {
        return generalStats && generalStats[this.generalStatsLabel]
      }
      return generalStats && generalStats[this.dataType] && generalStats[this.dataType][this.generalStatsLabel];
    },
    topValue() {
      const numericValue = this.getDisplayValue(this.generalStats && this.generalStats.top && this.generalStats.top.rate);
      if (!numericValue && numericValue !== 0) return '--';

      return this.isPercent ? `${numericValue}%` : numericValue;
    },
    globalValue() {
      const numericValue = this.getDisplayValue(this.generalStats && this.generalStats.allGarages && this.generalStats.allGarages.rate);
      if (!numericValue && numericValue !== 0) return '--';

      return this.isPercent ? `${numericValue}%` : numericValue;
    },
    activeSlotName() {
      return this.$props.view;
    },
  }
};
</script>


<style lang="scss" scoped>
.divider {
  height: 1px;
  background-color: rgba($grey, .5);
  width: 100%;
  margin: 1rem 0;
}

.clearfix {
  flex : 1;
}

.kpi {
  display: flex;
  flex-flow: column;
  align-items: center;
  box-shadow: 0 0 3px 0 rgba($black, 0.16);
  background-color: $white;
  padding: 1rem 1.5rem;
  box-sizing: border-box;
  border-radius: 5px;
  height: 100%;

  &__title {
    width: 100%;
    font-weight: bold;
    text-align: center;
    color: black;
    &__label {
      display: flex;
      align-items: center;
    }
    &__hover-title {
      color: $grey;
      font-size: .85rem;
      position: relative;
      float: left;
      left: 5px;
      top: 2px;
      cursor: pointer;
    }
  }

  &__value {
    color: $black;
    text-align: center;
    font-size: 2rem;
    font-weight: 900;
    display: flex;
    justify-content: center;
    white-space: nowrap;
    margin-bottom: 7px;
  }

  &__value-unit {
    color: $black;
    font-size: 2rem;
    font-weight: 900;
  }

  &__common-stats {
    display: flex;
    flex-flow: row;
    align-items: center;
    width: 100%;
    text-align: center;
    color: $dark-grey;
    &__upper-value {
      font-size: 21px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    &__lower-label {
      font-size: 12px;
    }
    &__left {
      width: calc(50% - 1px);
      border-right: 1px solid $light-grey;
    }
    &__right {
      width: 50%;
    }
  }

  &__label-value {
    color: $black;
    font-size: $KPI-title-size;
    font-weight: 700;
    text-align: center;
    display: inline;
  }

  &__label-subtitle {
    font-weight: normal;
    font-size: $KPI-subtitle-size;
    margin-left: 0.2rem;
    color: $dark-grey;
    display: none;
  }

  &__subtitle {
    color: $dark-grey;
    font-size: $KPI-subtitle-size;
    margin-bottom: 21px;
    min-height: 1rem;
  }

  &__hover-title {
    cursor: pointer;
    font-size: 0.7rem;
    position: relative;
    top: -0.3rem;
    left: 0.3rem;
    color: $grey;
    display: none;
  }

  &--positive {
    .kpi__value-unit,
    .kpi__value {
      color: $green;
    }
  }

  &--neutral {
    .kpi__value-unit,
    .kpi__value {
      color: $blue;
    }
  }

  &--warning {
    .kpi__value-unit,
    .kpi__value {
      color: $yellow;
    }
  }

  &--danger {
    .kpi__value-unit,
    .kpi__value {
      color: $red;
    }
  }

  &--blue {
    .kpi__value-unit,
    .kpi__value {
      color: $blue;
    }
  }

  &--dark-grey {
    .kpi__value-unit,
    .kpi__value {
      color: $dark-grey;
    }
  }

  &--gold {
    .kpi__value-unit,
    .kpi__label,
    .kpi__label-value,
    .kpi__value {
      color: $gold;
    }
  }

  &--small {
    .kpi {
      &__value {
        font-size: 1.6rem;
        display: flex;
        justify-content: flex-end;
      }

      &__value-unit {
        font-size: 1.6rem;
      }
    }
  }
}

@media (min-width: $breakpoint-min-md) {
  .kpi {
    flex-flow: column;

    &__value {
      font-size: 2.5rem;
      font-weight: 900;
    }

    &__value-unit {
      font-size: 2.5rem;
    }

    &__label-value {
      text-align: left;
      font-size: 1rem;
    }

    &__subtitle {
      display: block;
    }

    &__label-subtitle {
      display: inline;
    }

    &__hover-title {
      display: inline;
    }
  }
}
</style>
