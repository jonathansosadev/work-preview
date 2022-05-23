<template>
  <section class="content">
    <div class="container">
      <Notification type="primary" class="notification" v-if="!isReportLoading && displayNotification" @close="displayNotification = false">
        <template slot>
          <span class="bold">{{ $t_locale('pages/report/monthlySummary/_id')('aSavoir') }}</span>
          <span>{{ $t_locale('pages/report/monthlySummary/_id')('dataCouldEvolve') }}</span>
        </template>
      </Notification>
      <div v-if="month != null" class="legend">
        <span class="legend__text">
          <span class="legend__text__period--black">12M</span> :
          <span class="legend__text__perf">{{ $t_locale('pages/report/monthlySummary/_id')("performances") }}&nbsp;</span>
          <span class="legend__text__month--black">{{ $t_locale('pages/report/monthlySummary/_id')("yearPeriod") }}</span>
          <span class="legend__text__shortMonth--black">{{ $t_locale('pages/report/monthlySummary/_id')("yearPeriodShort") }}</span>
        </span>
        <span class="legend__text">
          <span class="legend__text__period--blue">M</span> :
          <span class="legend__text__perf">{{ $t_locale('pages/report/monthlySummary/_id')("performances") }}&nbsp;</span>
          <span class="legend__text__month--blue">{{ $t_locale('pages/report/monthlySummary/_id')(`month${month}`) }}&nbsp;</span>
          <span class="legend__text__shortMonth--blue">{{ $t_locale('pages/report/monthlySummary/_id')(`shortMonth${month}`) }}&nbsp;</span>
          <span class="legend__text__year">{{ year }}</span>
        </span>
        <span class="legend__text">
          <span class="legend__text__period--light-blue">M-1</span> :
          <span class="legend__text__perf">{{ $t_locale('pages/report/monthlySummary/_id')("performances") }}&nbsp;</span>
          <span class="legend__text__month--light-blue">{{ $t_locale('pages/report/monthlySummary/_id')(`month${lastMonth}`) }}&nbsp;</span>
          <span class="legend__text__shortMonth--light-blue">{{ $t_locale('pages/report/monthlySummary/_id')(`shortMonth${lastMonth}`) }}&nbsp;</span>
          <span class="legend__text__year">{{ lastMonthYear }}</span>
        </span>
      </div>

      <div v-if="isReportLoading" class="report__loading">
        <img class="desktop" src="/monthlySummary/fakeReport-desktop.jpg">
        <img class="tablet" src="/monthlySummary/fakeReport-tablet.jpg">
        <img class="mobile" src="/monthlySummary/fakeReport-mobile.jpg">
        <div class="report__loading__spinner">
          <i class="report__loading__spinner__icon icon-gs-loading" /> <br/>
          <span class="report__loading__spinner__text">{{$t_locale('pages/report/monthlySummary/_id')('pleaseWait')}}</span>
        </div>
      </div>

      <div v-if="!isReportLoading" class="report">
        <div class="report__tabs">
          <ReportTab v-for="tab in tabs" :key="tab.id" v-bind="tab" :period="period" :selected="selectedTab === tab.id" @click.native="changeTab(tab.id)"></ReportTab>
        </div>

        <div v-if="isTabForbidden && !isTabUnsubscribed" class="report__forbidden">
          <div class="report__forbidden__text">
            <span class="report__forbidden__text__title"> {{$t_locale('pages/report/monthlySummary/_id')('forbiddenTitle')}} </span> <br/>
            <span class="report__forbidden__text__title"> {{$t_locale('pages/report/monthlySummary/_id')('forbiddenTitle2')}} </span> <br/>
            <span class="report__forbidden__text__paragraph"> {{$t_locale('pages/report/monthlySummary/_id')('forbiddenParagraph')}} </span> <br/>
            <a href="/cockpit/admin/profile" target="_blank"> {{$t_locale('pages/report/monthlySummary/_id')('forbiddenLink')}} <i class="icon-gs-right"></i></a>
          </div>
        </div>
        <div v-else-if="isTabUnsubscribed" class="report__forbidden">
          <div class="report__forbidden__text">
            <span class="report__forbidden__text__title red"> {{$t_locale('pages/report/monthlySummary/_id')('unsubscribedTitle')}} </span> <br/>
            <span class="report__forbidden__text__paragraph"> {{$t_locale('pages/report/monthlySummary/_id')('unsubscribedParagraph')}} </span>
            <a href="mailto:commerce@custeed.com" target="_blank"> {{$t_locale('pages/report/monthlySummary/_id')('unsubscribedLink')}}</a>
          </div>
        </div>
        <div v-else-if="isTabDisabled" class="report__forbidden">
          <div class="report__forbidden__text">
            <span class="report__forbidden__text__title"> {{$t_locale('pages/report/monthlySummary/_id')('disabledTitle')}} </span> <br/>
          </div>
        </div>

        <div v-else class="report__content">
          <div class="report__content__dataType-filter">
            <DropdownDataTypes></DropdownDataTypes>
            <span class="report__content__dataType-filter__garages">
              <span>{{ displayedGarage }}</span>
              <i v-if="unsubscribedGarages.length" :title="unsubscribedGaragesTooltipText" class="icon-gs-help report__content__dataType-filter__garages__alert"></i>
            </span>
          </div>
          <div class="report__content__data">
            <ReportMonthlyLeads v-if="selectedTab === 'leads'" :kpis="kpis" :employeesRanking="employeesRanking" :month="month" :isMultiSites="isMultiSites" :averageAndBestPerfs="averageAndBestPerfs"></ReportMonthlyLeads>
            <ReportMonthlySatisfaction v-if="selectedTab === 'satisfaction'" :kpis="kpis" :employeesRanking="employeesRanking" :month="month" :isMultiSites="isMultiSites" :averageAndBestPerfs="averageAndBestPerfs"></ReportMonthlySatisfaction>
            <ReportMonthlyProblemResolution v-if="selectedTab === 'problemResolution'" :kpis="kpis" :employeesRanking="employeesRanking" :month="month" :isMultiSites="isMultiSites" :averageAndBestPerfs="averageAndBestPerfs"></ReportMonthlyProblemResolution>
            <ReportMonthlyValidEmails v-if="selectedTab === 'validEmails'" :kpis="kpis" :month="month" :employeesRanking="employeesRanking" :isMultiSites="isMultiSites" :averageAndBestPerfs="averageAndBestPerfs"></ReportMonthlyValidEmails>
          </div>
        </div>
      </div>

      <div v-if="!isReportLoading" class="summary">
        <ReportSummary v-bind="summaryData"></ReportSummary>
      </div>
    </div>
  </section>
</template>

<script>
  import DropdownDataTypes from '~/components/report/common/DropdownDataTypes.vue';
  import ReportTab from '~/components/report/common/ReportTab.vue';
  import ReportSummary from '~/components/report/common/ReportSummary.vue';

  import ReportMonthlyLeads from '~/components/report/monthlySummary/ReportMonthlyLeads.vue';
  import ReportMonthlySatisfaction from '~/components/report/monthlySummary/ReportMonthlySatisfaction.vue';
  import ReportMonthlyProblemResolution from '~/components/report/monthlySummary/ReportMonthlyProblemResolution.vue';
  import ReportMonthlyValidEmails from '~/components/report/monthlySummary/ReportMonthlyValidEmails.vue';

  export default {
    layout: 'report',
    components: {
      DropdownDataTypes, ReportTab, ReportSummary,
      ReportMonthlyLeads, ReportMonthlySatisfaction, ReportMonthlyProblemResolution, ReportMonthlyValidEmails
    },
    mounted() {
      this.$store.dispatch('report/fetchMonthlySummary', { reportId: this.$route.params.id });
    },
    data() {
      return {
        tabs: this.$store.getters['report/getMonthlySummaryTabs'],
        displayNotification: true
      };
    },
    created() {
    },
    computed: {
      month() { return this.$store.getters['report/getMonth'] },
      year() { return this.$store.getters['report/getYear'] },
      garages() { return this.$store.getters['report/getGarages'] || [] },
      summaryByGarage() { return this.$store.getters['report/getSummaryByGarage'] },
      summaryMyAverage() { return this.$store.getters['report/getSummaryMyAverage'] },
      summaryBestGarages() { return this.$store.getters['report/getSummaryBestGarages'] },
      selectedTab() { return this.$store.getters['report/getCurrentTabName']; },
      unsubscribedGarages() { return this.$store.getters['report/getTabUnsubscribedGarages'](this.selectedTab) || []; },
      isTabForbidden() { return this.$store.getters['report/isTabForbidden'](this.selectedTab); },
      isTabUnsubscribed() { return this.garages.length && (this.garages.length === this.unsubscribedGarages.length) },
      isTabDisabled() { return false; },
      unsubscribedGaragesTooltipText() {
        const garages = this.unsubscribedGarages;
        const nGaragesText = garages.length === 1 ? garages[0].garageName : this.$t_locale('pages/report/monthlySummary/_id')('nGarages', { n: garages.length });
        return `${nGaragesText},\n${this.$tc_locale('pages/report/monthlySummary/_id')('haveNot', garages.length)} ${this.$t_locale('pages/report/monthlySummary/_id')('subscribedTo1')}\n${this.$t_locale('pages/report/monthlySummary/_id')('subscribedTo2')}\n\n${this.$t_locale('pages/report/monthlySummary/_id')('subscriptionContact1')}\n${this.$t_locale('pages/report/monthlySummary/_id')('subscriptionContact2')}`;
      },
      isReportLoading() {
        return ['EMPTY', 'LOADING'].includes(this.$store.getters['report/getMonthlySummaryStatus']);
      },

      isMultiSites() { return this.garages.length > 1; },
      displayedGarage() {
        if (!this.garages || !this.garages.length) return '';
        return this.isMultiSites ? this.$t_locale('pages/report/monthlySummary/_id')('multiSites', { n: this.garages.length }) : this.garages[0].garageName;
      },
      period() {
        return {
          long: [this.$t_locale('pages/report/monthlySummary/_id')(`month${this.month}`), this.year].join(' '),
          short: [this.$t_locale('pages/report/monthlySummary/_id')(`shortMonth${this.month}`), this.year].join(' ')
        };
      },

      kpis() { return this.$store.getters['report/getMonthlySummaryData']; },
      employeesRanking() { return this.$store.getters['report/getEmployeesRanking']; },
      averageAndBestPerfs() { return this.$store.getters['report/getAverageAndBestPerfs']; },
      lastMonth() {
        return (this.month + 11) % 12; // Addind 12 - 1 so the %12 gives us a positive number when this.month === 0
      },
      lastMonthYear() {
        return this.month ? this.year : (this.year - 1);
      },

      availableDataTypes() {
        return this.$store.getters['report/getAvailableDataTypes'];
      },

      summaryColumns() {
        return [
          { id: 'garageName', title: 'sites' },
          ...this.tabs.map(t => ({ id: t.id, title: t.title, type: t.type, icon: t.icon }))
        ];
      },
      summaryData() {
        return {
          columns: this.summaryColumns,
          myAverage: this.summaryMyAverage,
          bestGarages: this.summaryBestGarages,
          garagesData: this.summaryByGarage
        }
      }
    },
    methods: {
      changeTab(newTab) {
        if (this.tabs.find(t => t.id === newTab))
          this.$store.dispatch('report/changeCurrentTab', { tab: newTab });
      },
    }
  }
</script>

<style lang="scss" scoped>
  .container {
    background: $bg-grey;
    color: $dark-grey;
  }
  .notification {
    margin-bottom: 1rem;
  }
  .legend {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    background-color: $white;
    box-shadow: 0 0 3px 0 rgba($black, 0.16);
    padding: 1rem;
    margin-bottom: 1rem;

    &__text {
      display: inline-block;
      &__perf {
        display: none;
      }
      &__month {
        &--black, &--blue, &--light-blue {
          display: none;
        }
      }
      &__period, &__month, &__shortMonth {
        &--black {
          font-weight: 900;
          color: $black;
        }
        &--blue {
          font-weight: 900;
          color: $blue;
        }
        &--light-blue {
          font-weight: 900;
          color: rgba($blue, 0.5)
        }
      }
    }
  }

  .report {
    background-color: $white;
    box-shadow: 0 0 3px 0 rgba($black, 0.16);

    &__tabs {
      display: flex;
      flex-grow: 1;
      overflow: auto;
    }

    &__forbidden, &__loading {
      padding-top: 2rem;
      position: relative;
      img {
        width: 100%;
        &.tablet, &.desktop { display: none; }
      }
      i {
        font-size: 11px;
      }
      a {
        color: $link-blue;
      }
      &__spinner {
        position: absolute;
        top: calc(2rem + 15%);
        left: 0;
        width: 100%;
        text-align: center;
        &__icon {
          font-size: 5rem;
          color: $blue;
        }
        &__text {
          display: inline-block;
          color: $dark-grey;
          font-size: 1rem;
          font-weight: 700;
          margin-top: 0.5rem;
        }
      }
      &__text {
        padding: 0 1rem 3rem;
        &__title {
          display: inline-block;
          margin-bottom: 1rem;
          color: $black;
          font-size: 1.14rem;
          font-weight: 700;
          &.red {
            color: $red;
          }
        }
        &__paragraph {
          display: inline-block;
          color: $dark-grey;
          margin-bottom: 0.5rem;
        }
      }
    }

    &__content {
      padding: 1rem 1rem 1.5rem;
      &__dataType-filter {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-content: center;
        box-shadow: inset 0 0 0 1000px rgba($grey, 0.5);
        color: $black;
        padding: 0.71rem 1.3rem;
        &__garages {
          max-width: 55%;
          display: inline-block;
          font-size: 1.14rem;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          &__alert {
            display: none;
            color: $red;
            margin-left: 0.5rem;
            font-size: 10px;
          }
          & > span {
            vertical-align: sub;
          }
        }
      }

      &__data {
        margin-top: 1.5rem;
        display: flex;
        flex-direction: column;
      }
    }
  }

  .summary {
    margin-top: 4rem;
  }

  @media only screen and (min-width: $breakpoint-min-sm) { // 480px
  }
  @media only screen and (min-width: $breakpoint-min-md) { // 768px
    .legend {
      &__text {
        &__perf {
          display: initial;
        }
      }
    }
    .report {
      // &__loading, &__forbidden {
      //   img {
      //     &.tablet { display: initial;}
      //     &.mobile { display: none; }
      //   }
      // }
      &__content {
        &__dataType-filter {
          &__garages {
            max-width: unset;
          }
        }
      }
    }
  }
  @media only screen and (min-width: $breakpoint-min-lg) { // 960px
    .legend {
      &__text {
        &__month {
          &--black, &--blue, &--light-blue {
            display: inline;
          }
        }
        &__shortMonth {
          &--black, &--blue, &--light-blue {
            display: none;
          }
        }
      }
    }
    .report {
      // &__loading, &__forbidden {
      //   img {
      //     &.desktop { display: initial; }
      //     &.tablet { display: none; }
      //   }
      // }
      &__content__dataType-filter__garages__alert {
        display: initial;
      }
    }
  }
  @media only screen and (min-width: $breakpoint-min-xl) { // 1280px
  }

  @media print {
    .notification {
      display: none !important;
    }
    .summary {
      margin-top: 2rem;
      page-break-inside: avoid;
      page-break-after: avoid;
    }
    .legend {
      &__text {
        &__month {
          &--black, &--blue, &--light-blue {
            display: inline;
          }
        }
        &__shortMonth {
          &--black, &--blue, &--light-blue {
            display: none;
          }
        }
        &__perf {
          display: initial;
        }
      }
    }
  }

</style>
