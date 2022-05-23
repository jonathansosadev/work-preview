<template>
  <div class="stats" :class="classBinding">
    <div class="stats__left">
      <div class="stats__value" v-if="!noMainValue">
        <span v-if="isPercent">{{ value | oneDecimal | frenchFloating }}%</span>
        <span v-else>{{ value | renderNumber }}</span>
        <span class="stats__value-unit" v-if="value !== '-'">
          <slot name="value-unit"></slot>
        </span>
      </div>
    </div>
    <div class="stats__right">
      <div class="stats__label">
        <span class="stats__label-value">
          <slot name="label"></slot>
        </span>
        <span class="stats__label-subtitle">
          <slot name="label-subtitle"></slot>
        </span>
        <span
          class="stats__hover-title"
          v-if="hoverTitle"
          v-tooltip="{ content: hoverTitle, html: true }"
        >
          <i class="icon-gs-help" />
        </span>
      </div>
      <div class="stats__subtitle text-size-caption-1">
        <slot name="subtitle"></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
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

    small: { type: Boolean }
  },

  computed: {
    classBinding() {
      let value = this.value;
      if (this.value === "-" || !this.value) {
        value = 0;
      }
      if (!this.reverse) {
        return {
          "stats--blue": this.blueOnly,
          "stats--gold": this.goldOnly,
          "stats--positive": value >= this.positiveValue,
          "stats--neutral":
            value >= this.neutralValue && value < this.positiveValue,
          "stats--warning":
            value >= this.warningValue && value < this.neutralValue,
          "stats--danger":
            value >= this.dangerValue && value < this.warningValue,
          "stats--small": this.small
        };
      } else {
        return {
          "stats--blue": this.blueOnly,
          "stats--gold": this.goldOnly,
          "stats--positive": value <= this.positiveValue,
          "stats--neutral":
            value <= this.neutralValue && value > this.positiveValue,
          "stats--warning":
            value <= this.warningValue && value > this.neutralValue,
          "stats--danger":
            value <= this.dangerValue && value > this.warningValue,
          "stats--small": this.small
        };
      }
    }
  }
};
</script>


<style lang="scss" scoped>
.stats {
  display: flex;
  flex-flow: column;
  align-items: center;

  &__value {
    color: $black;
    font-size: 2rem;
    font-weight: 900;
    display: flex;
    justify-content: flex-end;
    white-space: nowrap;
  }

  &__value-unit {
    color: $black;
    font-size: 2rem;
    font-weight: 900;
  }

  &__right {
    display: flex;
    flex-flow: column;
    align-items: center;
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
    margin-top: .3rem;
  }

  &__hover-title {
    cursor: pointer;
    font-size: 0.85rem;
    position: relative;
    color: $grey;
    display: none;
  }

  &--positive {
    .stats__value-unit,
    .stats__value {
      color: $green;
    }
  }

  &--neutral {
    .stats__value-unit,
    .stats__value {
      color: $blue;
    }
  }

  &--warning {
    .stats__value-unit,
    .stats__value {
      color: $yellow;
    }
  }

  &--danger {
    .stats__value-unit,
    .stats__value {
      color: $red;
    }
  }

  &--blue {
    .stats__value-unit,
    .stats__value {
      color: $blue;
    }
  }

  &--gold {
    .stats__value-unit,
    .stats__label,
    .stats__label-value,
    .stats__value {
      color: $gold;
    }
  }

  &--small {
    .stats {
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
  .stats {
    flex-flow: row;
    width: 100%;

    &__value {
      text-align: left;
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

    &__left {
      width: 33%;
      line-height: 2rem;
    }

    &__right {
      width: 66%;
      padding-left: 1rem;
      align-items: flex-start;
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

@media (max-width: $breakpoint-max-sm) {
  .stats {
    &__right {
      margin-top: 0.3rem;
    }

    &__subtitle {
      margin-top: 0.15rem;
    }
  }
}
</style>
