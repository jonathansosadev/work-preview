<template>
  <div :class="active" class="report-tab">
    <div>
      <span class="report-tab__title">{{ $t_locale('components/report/common/ReportTab')(title) }}</span>
      <div class="report-tab__perfs">
        <div class="report-tab__perfs__year">
          <span class="report-tab__perfs__year__number">{{ perf12M | displayPerf(type) }}</span>
          <span class="report-tab__perfs__year__text">{{ $t_locale('components/report/common/ReportTab')('12months') }}</span>
          <span class="report-tab__perfs__year__textShort">{{ $t_locale('components/report/common/ReportTab')('12monthsShort') }}</span>
        </div>
        <div class="report-tab__perfs__month">
          <span class="report-tab__perfs__month__number">
            {{ perfM | displayPerf(type) }} <i :class="arrowClasses"></i>
          </span>
          <span class="report-tab__perfs__month__text">{{ $t_locale('components/report/common/ReportTab')('onPeriod') }} {{ period.long }}</span>
          <span class="report-tab__perfs__month__textShort">{{ $t_locale('components/report/common/ReportTab')('onPeriod') }} {{ period.short }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReportTab',
  data() {
    return {
    }
  },
  props: {
    selected: Boolean,
    title: String,
    period: Object,
    perf12M: Number,
    perfM: Number,
    perfM1: Number,
    type: { type: String, default: 'number' },
    inverted: { type: Boolean, default: false }
  },

  computed: {
    active() { return { 'active': this.selected }; },
    arrowClasses () {
      if (!Number.isFinite(this.perfM) || !Number.isFinite(this.perfM1)) return '';
      const perfM = this.type === 'score' ? Math.round(10 * this.perfM) / 10 : Math.round(this.perfM);
      const perfM1 = this.type === 'score' ? Math.round(10 * this.perfM1) / 10 : Math.round(this.perfM1);
      return {
        'icon-gs-progress-up': perfM > perfM1,
        'icon-gs-progress-down': perfM < perfM1,
        'icon-gs-equal': perfM === perfM1,
        'better': this.inverted ? perfM < perfM1 : perfM > perfM1,
        'worse': this.inverted ? perfM > perfM1 : perfM < perfM1
      };
    }
  },

  methods: {
  },

  filters: {
    displayPerf(perf, type) {
      if (!Number.isFinite(perf)) return '-';
      switch (type) {
        case 'percentage': return `${Math.round(perf)} %`;
        case 'score': return perf.toFixed(1);
        case 'number': return Math.round(perf);
        default: return Math.round(perf);
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .report-tab {
    display: flex;
    flex-grow: 1;
    flex-basis: 0;
    flex-direction: column;
    border-top: 4px solid $bg-grey;
    box-shadow: inset 0 0 0 1000px $bg-grey;
    padding: 0.71rem 0 1rem;
    cursor: pointer;

    & > div {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 0.5rem 1rem 0;
      height: 100%;
    }
    &:not(.active) + &:not(.active) {
      & > div {
        border-left: 1px solid $grey;
      }
    }

    &.active {
      box-shadow: inset 0 0 0 1000px $white;
      border-color: $blue;
      .report-tab__title {
        color:  $black;
        font-weight: 700;
      }
      .report-tab__perfs {
        &__year {
          padding-bottom: 0;
        }
        &__year, &__month {
          display: inherit;
          &__number {
            font-weight: 900;
          }
          &__text, &__textShort {
            display: none;
            visibility: visible;
          }
        }
      }
    }

    &__title {
      height: 2.57rem;
      overflow: hidden;
      display: block;
      font-size: 1.14rem;
      font-weight: 300;
      color: $black;
      margin-bottom: 1rem;
    }

    &__perfs {
      display: flex;
      flex-direction: column;
      white-space: nowrap;

      &__year, &__month {
        display: flex;
        flex-direction: column;
        &__number {
          margin-bottom: 0.5rem;
          margin-right: 0.5rem;
          font-size: 1.5rem;
          color: $black;
          & i {
            font-size: 0.79rem;
            color: $grey;
            &.better { color: $bright-green; }
            &.worse { color: $red; }
          }
        }
        &__text, &__textShort {
          display: none;
          visibility: hidden;
          font-size: 0.86rem;
          color: $dark-grey;
        }
      }
      &__month {
        display: none;
        &__number {
          color: $blue;
        }
      }
      &__year {
        padding-bottom: 2.3rem;
      }

    }
  }

  @media only screen and (min-width: $breakpoint-min-sm) {  //  480px
    .report-tab {
      &.active {
        .report-tab__perfs {
          &__year, &__month {
            &__textShort {
              display: inherit;
            }
          }
        }
      }
      .report-tab__perfs {
        flex-direction: row;
        &__year {
          padding-right: 1rem;
          padding-bottom: 0;
          &__textShort {
            display: inherit;
          }
        }
        &__month {
          border-left: 1px solid $grey;
          padding-left: 1rem;
        }
      }
    }
  }
  @media only screen and (min-width: $breakpoint-min-md) {  //  768px
    
  }
  @media only screen and (min-width: $breakpoint-min-lg) {  //  960px
    .report-tab {
      &.active {
        .report-tab__perfs {
          &__year, &__month {
            &__text {
              display: inherit;
            }
            &__textShort {
              display: none;
            }
          }
        }
      }
      .report-tab__perfs {
        &__year, &__month {
          &__number {
            font-size: 2rem;
          }
          &__textShort {
            display: none;
          }
          &__text {
            display: inherit;
          }
        }
      }
    }
  }
  @media only screen and (min-width: $breakpoint-min-xl) {  //  1281px

  }

  @media print {
    .report-tab {
      &.active {
        .report-tab__perfs {
          &__year, &__month {
            &__text {
              display: inherit;
            }
            &__textShort {
              display: none;
            }
          }
        }
      }
      .report-tab__perfs {
        flex-direction: row;
        &__year {
          padding-right: 1rem;
          padding-bottom: 0;
        }
        &__month {
          border-left: 1px solid $grey;
          padding-left: 1rem;
        }
        &__year, &__month {
          &__number {
            font-size: 2rem;
          }
          &__textShort {
            display: none;
          }
          &__text {
            display: inherit;
          }
        }
      }
    }
  }

</style>
