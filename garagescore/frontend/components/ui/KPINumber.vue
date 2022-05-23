<template>
  <span class="kpi-number" :class="classBinding">
    <template v-if="!prc">{{ value }}</template>
    <template v-else>{{ value | percentage }}</template>
  </span>
</template>

<script>
export default {
  name: 'KPINumber',
  props: {
    value: { type: Number | String },
    dangerValue: { type: Number },
    warningValue: { type: Number },
    neutralValue: { type: Number },
    positiveValue: { type: Number },
    reverse: { type: Boolean },
    prc: { type: Boolean },
    link: { type: Boolean }
  },
  computed: {
    classBinding() {
      let baseClass = {};
      let intValue = this.value;
      // remove space and convert string to int
      if (/ /.test(intValue)) {
        intValue = parseInt(intValue.replace(/ /g, ''), 10);
      }
      if (!this.reverse) {
        baseClass = {
          "kpi-number--positive": intValue >= this.positiveValue,
          "kpi-number--neutral": intValue >= this.neutralValue && intValue < this.positiveValue,
          "kpi-number--warning": intValue >= this.warningValue && intValue < this.neutralValue,
          "kpi-number--danger": intValue >= this.dangerValue && intValue < this.warningValue
        };
      } else {
        baseClass = {
          "kpi-number--positive": intValue <= this.positiveValue,
          "kpi-number--neutral": intValue <= this.neutralValue && intValue > this.positiveValue,
          "kpi-number--warning": intValue <= this.warningValue && intValue > this.neutralValue,
          "kpi-number--danger": intValue <= this.dangerValue && intValue > this.warningValue
        };
      }

      return {
        ...baseClass,
        "kpi-number--link": this.link
      };
    }
  }
};
</script>

<style lang="scss" scoped>
.kpi-number {
  font-size: 1rem;
  font-weight: bold;

  &--positive {
    color: $green;
  }

  &--neutral {
    color: $blue;
  }

  &--warning {
    color: $yellow;
  }

  &--danger {
    color: $red;
  }

  &--link {
    &:hover {
      .kpi-number--danger {
        color: darken($red, 20);
      }

      .kpi-number--warning {
        color: darken($yellow, 20);
      }

      .kpi-number--neutral {
        color: darken($blue, 20);
      }

      .kpi-number--positive {
        color: darken($green, 20);
      }
    }
  }
}
</style>