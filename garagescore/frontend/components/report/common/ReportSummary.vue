<template>
  <div class="report-summary">
    <div class="report-summary__title">
      {{ $t_locale('components/report/common/ReportSummary')('summaryTitle') }}
    </div>
    <div class="table-wrapper">
      <table class="report-summary__table">
        <thead class="report-summary__table__head">
          <th v-for="(column, i) in columns" :key="column.id">
            <span :class="headerClass(i)">{{ $t_locale('components/report/common/ReportSummary')(column.title) }}</span>
            <span :class="headerIconClass(i)" v-if="column.icon"><i :class="column.icon"></i></span>
          </th>
        </thead>
        <tbody class="report-summary__table__body">
          <tr class="report-summary__table__body__row best-garages">
            <td v-for="(column, i) in columns" :key="column.id">
              <span :class="cellClass(i)"> {{ displayPerf(bestGarages[column.id], column.type) }} </span>
            </td>
          </tr>
          <tr class="report-summary__table__body__row my-average" v-if="sortedGarages.length > 1">
            <td v-for="(column, i) in columns" :key="column.id">
              <span :class="cellClass(i)"> {{ displayPerf(myAverage[column.id], column.type) }} </span>
            </td>
          </tr>
          <tr v-for="(row, rank) in sortedGarages" :key="row.garage" :class="garageRowClass(rank)">
            <td v-for="(column, i) in columns" :key="column.id">
              <span :class="cellClass(i)" v-if="sortedGarages.length === 1 && i === 0"> {{ row[column.id] }} </span>
              <span :class="cellClass(i)" v-else-if="i === 0"> {{ rank + 1 }}. {{ row[column.id] }} </span>
              <span :class="cellClass(i)" v-else> {{ displayPerf(row[column.id], column.type) }} </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>

export default {
  name: 'ReportSummary',
  components: { },
  data() {
    return {
    }
  },
  props: {
    columns: Array,
    bestGarages: Object,
    myAverage: Object,
    garagesData: Array
  },
  
  computed: {
    currentTabName() {
      return this.$store.getters['report/getCurrentTabName'];
    },
    currentTabIndex() {
      return ['leads', 'satisfaction', 'problemResolution', 'validEmails'].indexOf(this.currentTabName);
    },
    sortedGarages() {
      if (this.garagesData.length < 2 || this.currentTabIndex === -1) return this.garagesData;
      return this.garagesData.sort((a,b) => {
        const aVal = Number.isFinite(a[this.currentTabName]) ? a[this.currentTabName] : -1;
        const bVal = Number.isFinite(b[this.currentTabName]) ? b[this.currentTabName] : -1;
        return bVal - aVal;
      });
    }
  },
  methods: {
    headerClass(index) {
      return {
        'report-summary__table__head__column': true,
        'first': index === 0,
        'bold': index === this.currentTabIndex + 1
      }
    },
    headerIconClass(index) {
      return {
        'report-summary__table__head__icon': true,
        'first': index === 0,
        'bold': index === this.currentTabIndex + 1
      }
    },
    garageRowClass(index) {
      return {
        'report-summary__table__body__row': true,
        'first-garage': index === 0
      };
    },
    cellClass(index) {
      return {
        'report-summary__table__body__row__cell': true,
        'first': index === 0,
        'bold': index === this.currentTabIndex + 1
      }
    },
    displayPerf(perf, type) {
      if (typeof perf === 'string') return this.$t_locale('components/report/common/ReportSummary')(perf);
      switch (type) {
        case 'percentage': return `${Math.round(perf)} %`;
        case 'score': return Math.round(perf * 10) / 10;
        case 'number': return Math.round(perf * 10) / 10;
        default: return perf;
      }
    }
  }
}
</script>

<style lang="scss">
  .report-summary {
    &__title {
      width: 100%;
      text-align: center;
      margin-bottom: 4rem;
      color: $black;
      font-size: 2rem;
      font-weight: 700;
    }
    .table-wrapper {
      overflow-x: scroll;
      box-shadow: 0 0 6px 0 rgba($black, .16);
      &::-webkit-scrollbar {
        display: none;
      }
    }
    &__table {
      padding: 1.5rem 1.5rem .5rem 1rem;
      background-color: $white;
      overflow-x: hidden;
      width: 100%;
      th {
        white-space: nowrap;
      }
      &__head {
        &__column {
          display: none;
          border-bottom: 1px solid rgba($grey, .5);
          box-sizing: border-box;
          width: 100%;
          padding: 0.5rem 1rem;
          font-weight: 300;
          font-size: 1.14rem;
          color: $black;
          &.bold {
            color: $black;
            font-weight: 900;
          }
          &.first {
            display: inline-block;
            text-align: left;
            font-weight: 900;
          }
        }
        &__icon {
          border-bottom: 1px solid rgba($grey, .5);
          box-sizing: border-box;
          width: 100%;
          padding: 0.5rem 1rem;
          font-weight: 300;
          font-size: 1.14rem;
          color: $black;
          &.bold {
            color: $black;
            font-weight: 900;
          }
          &.first {
            display: inline-block;
            text-align: left;
            font-weight: 900;
          }
        }
      }

      &__body {
        &__row {

          &.best-garages {
            & .first {
              color: $bright-green;
              font-weight: 700;
            }
            & .report-summary__table__body__row__cell {
              padding-top: 1rem;
            }
          }
          &.my-average {
            & .first {
              color: $blue;
              font-weight: 700;
            }
            & .report-summary__table__body__row__cell {
              padding-bottom: 1rem;
            }
          }
          &.first-garage {
            & .report-summary__table__body__row__cell {
              padding-top: 1rem;
            }
          }
          &__cell {
            padding-bottom: 1rem;
            display: inline-block;
            width: 100%;
            color: $black;
            text-align: center;
            font-weight: 400;
            &.first {
              text-align: left;
              padding-left: 1rem;
            }
            &.bold {
              font-weight: 700;
            }
          }
        }
      }
    }
  }
  
  @media only screen and (min-width: $breakpoint-min-md) { // 768px
    .report-summary {
      &__table__head {
        &__column {
          display: inherit
        }
        &__icon {
          display: none;
        }
      }
    }
  }

  @media print {
    .report-summary {
      &__table__head {
        &__column {
          display: inherit
        }
        &__icon {
          display: none;
        }
      }
    }
  }
</style>
