<template>
  <div class="report-chart-header">
    <span class="report-chart-header__title"> {{ title }} </span>
    <span class="report-chart-header__12M" v-if="months"> 12M </span>
    <span class="report-chart-header__M1" v-if="months"> M-1 </span>
    <span class="report-chart-header__M" v-if="months"> M </span>
  </div>
</template>

<script>
export default {
  name: 'ReportChartHeader',
  props: {
    title: String,
    months: { type: Boolean, default: false }
  }
}
</script>

<style lang="scss" scoped>
  .report-chart-header {
    border-bottom: 1px solid rgba($grey, 0.5);
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding-left: 1rem;
    padding-bottom: 0.5rem;

    &__title {
      flex-basis: 0;
      flex-grow: 5.6;
      color: $black;
      font-size: 1.14rem;
      font-weight: 700;
      // for the title not to take more than 1 line & add the ... when it overflows 
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      padding-right: 0.5rem;
    }

    &__12M, &__M1, &__M {
      flex-basis: 0;
      flex-grow: 1;
      text-align: center;
      font-weight: 900;
    }

    &__12M {
      color: $black;
    }
    &__M1 {
      color: rgba($blue, 0.5)
    }
    &__M {
      color: $blue;
    }
  }
  
  // @media only screen and (min-width: 520px) { // It's ugly but it prevents percentages from being displayed on 2 lines 
  //   .report-chart-header {
  //     &__title {
  //       flex-grow: 6;
  //     }
  //   }
  // }
  // @media only screen and (min-width: $breakpoint-min-md) { // 768px
  //   .report-chart-header {
  //     &__title {
  //       flex-grow: 5;
  //     }
  //   }
  // }
  // @media only screen and (min-width: $breakpoint-min-lg) { // 960px
  //   .report-chart-header {
  //     &__title {
  //       flex-grow: 6;
  //     }
  //   }
  // }
</style>
