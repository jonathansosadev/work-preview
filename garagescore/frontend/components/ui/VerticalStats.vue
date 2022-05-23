<template>
  <article class="container">
    <header class="header text-align-center">
      <span class="text-weight-bold">
        {{ title }}
      </span>
      <span
        v-tooltip="{ content: tooltipContent, html: true }"
        class="tooltip-indicator"
      >
        <i class="icon-gs-help" />
      </span>
    </header>
    <div class="mt-m text-align-center text-weight-black value-container" :class="thresholdColorClass">
      <slot name="content">
        <span class="value">
          <template v-if="isPercentage">
            {{ value | oneDecimal | frenchFloating }}%
          </template>
          <template v-else>
            {{ value | renderNumber }}
          </template>
        </span>
        <span class="sub-value">{{ valueDetails }}</span>
      </slot>
    </div>
    <footer v-if="subValues">
      <slot name="renderSubValueList" :items="subValues">
        <template v-for="value in subValues">
          <slot name="renderSubValue" :item="value">
            {{ value }}
          </slot>
        </template>
      </slot>
    </footer>
  </article>
</template>

<script>
export default {
  name: "VerticalStats",
  props: {
    title: {
      type: String,
      required: true,
    },
    tooltipContent: {
      type: String,
      default: '',
    },
    value: {
      type: Number,
      required: true,
    },
    valueDetails: {
      type: String,
    },
    subValues: {
      type: Array,
      default: () => null,
    },
    isPercentage: {
      type: Boolean,
      default: false,
    },
    valueThresholds: {
      type: Object,
      default: () => ({
        positive: -1,
        neutral: 0,
        warning: -1,
        danger: -1,
      }),
    },
  },

  computed: {
    thresholdColorClass() {
      const {
        positive,
        neutral,
        warning,
      } = this.valueThresholds;
      if (this.value >= neutral) {
        if (this.value >= positive) {
          return { 'positive-color' : true };
        }
        return { 'neutral-color' : true };
      } else {
        if (this.value >= warning) {
          return { 'warning-color' : true };
        }
        return { 'danger-color' : true };
      }
    },
  },
};
</script>


<style lang="scss" scoped>
  .container {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .header {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .title {
    font-size: 1rem;
    font-weight: bold;
    line-height: 1.36;
  }
  .tooltip-indicator {
    cursor: pointer;
    font-size: 0.65rem;
    color: $grey;
    margin-left: 0.35rem;
    display: inline-block;
  }
  .sub-value-container {
    height: 1rem;
    font-size: 0.85rem;
    line-height: 1.2;
    color: $grey;
  }
  .sub-value {
    margin-left: 0.36rem;
  }
  .value-container {
    font-weight: 900;
    white-space: nowrap;

    &.positive-color {
      color: $green;
    }
    &.neutral-color {
      color: $blue;
    }
    &.warning-color {
      color: $yellow;
    }
    &.danger-color {
      color: $red;
    }
  }
  .value {
    height: 3rem;
    font-size: 2.429rem;
    line-height: 1.18;
    display: inline;
  }
</style>
