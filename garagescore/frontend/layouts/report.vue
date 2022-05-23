<template>
  <section class="layout-report" :id="{ IE: isIE }">
    <div class="report-header">
      <div class="report-header__top">
        <div>
          <img src="/logo/logo-custeed-long.svg" alt="logo">
        </div>
      </div>
      <div class="report-header__bottom">
        <div v-if="isReportLoaded">
          <span> {{ period }} - {{ displayedGarage }} </span>
          <span style="display:block;" v-if="isIE">
            <i :title="cannotPrintIE" class="icon-gs-help report-header__bottom__alert" style="display:inline;"></i>
            <Button  style="display:inline;" type="orange" class="report-header__bottom__btn-print" :title="cannotPrintIE" :disabled="true">
              <span style="font-size: 13px; font-weight: 600;"><i class="icon-gs-printer"></i>&nbsp;&nbsp;{{ $t_locale('layouts/report')('print') }}</span>
            </Button>
          </span>
          <Button v-else type="white" class="report-header__bottom__btn-print" @click="print()">
            <span style="font-size: 13px; font-weight: 600;"><i class="icon-gs-printer"></i>&nbsp;&nbsp;{{ $t_locale('layouts/report')('print') }}</span>
          </Button>
        </div>
      </div>
    </div>

    <div class="report-content">
      <nuxt/>
    </div>
  </section>
</template>

<script>
import gtagAnalytics from '~/util/externalScripts/gtag-analytics';


export default {
  data() {
    return {
      isIE : false
    }
  },

  beforeMount() {
    gtagAnalytics(process.env.gaMeasurementCockpitID);
  },

  mounted() {
    const ua = window.navigator.userAgent;
    this.isIE = ua.indexOf("MSIE ") > -1 || ua.indexOf("Trident/") > -1 || ua.indexOf("Edge") > -1;
  },

  computed: {
    month() { return this.$store.getters['report/getMonth'] },
    year() { return this.$store.getters['report/getYear'] },
    garages() { return this.$store.getters['report/getGarages'] },
    period() {
      return [this.$t_locale('layouts/report')(`month${this.month}`).toUpperCase(), this.year].join(' ');
    },
    displayedGarage() {
      if (!this.garages || !this.garages.length) return '';
      let group = this.garages.reduce((res, g) => (g.group && g.group === res || res === '') ? g.group : null, '');
      group = group ? `${group} -` : 'de';
      return this.garages.length > 1 ? this.$t_locale('layouts/report')('groupOf', { group, n: this.garages.length}) : this.garages[0].garageName;
    },
    isReportLoaded() {
        return !['EMPTY', 'LOADING'].includes(this.$store.getters['report/getMonthlySummaryStatus']);
    },
    cannotPrintIE() {
      return this.$t_locale('layouts/report')('cannotPrintIE');
    }
  },

  methods: {
    print() {
      window.print();
      return;
    }
  }
}

</script>


<style lang="scss" scoped>
  .layout-report{
    background-color: $bg-grey;
    min-height: 100vh;

    .report-header {
      position: fixed;
      top: 0;
      width: 100%;
      z-index: 10;
      display: block;
      font-size: 1.14rem;

      &__top, &__bottom {
        display: flex;
        align-items: center;
        height: 50px;
        box-shadow: 0 0 10px 0 rgba($black, 0.16);
        div {
          display: flex;
          flex-direction: row;
          align-items: center;
          margin-right: auto;
          margin-left: auto;
        }
      }
      &__top {
        background-color: $custeedBrandColor;
        img {
          height: 36px;
        }
      }
      &__bottom {
        background-color: $white;
        & > div {
          justify-content: space-between;
          width: 97%;
          padding-left: 0.25rem;
          span {
            font-weight: 900;
          }
        }
        &__btn-print__txt {
          font-size: 13px;
          font-weight: 600;
        }
        &__alert {
          color: $red;
          margin-right: 0.5rem;
          font-size: 10px;
        }
      }
    }
    .report-content {
      margin-top: 100px;  // This one is for the header bar not to be overlapping with the report content
      padding-top: 1.5rem;
      padding-bottom: 2rem;
      margin-right: auto;
      margin-left: auto;
      width: 97%
    }
  }

  @media only screen and (min-width: $breakpoint-min-sm) { // 480px
    .layout-report {
      .report-header {
        &__top div, &__bottom div {
          width: 95%;
        }
      }
      .report-content {
        width: 95%;
      }
    }
  }
  @media only screen and (min-width: $breakpoint-min-md) { // 767px
    .layout-report {
      .report-header {
        &__top div, &__bottom div{
          width: 745px;
        }
      }
      .report-content {
        width: 745px;
      }
    }
  }
  @media only screen and (min-width: $breakpoint-min-lg) { // 960px
    .layout-report {
      .report-header {
        &__top div, &__bottom div {
          width: 940px;
        }
      }
      .report-content {
        width: 940px;
      }
    }
  }
  @media only screen and (min-width: $breakpoint-min-xl) { // 1281px
    .layout-report {
      .report-header {
        &__top div, &__bottom div {
          width: 1056px;
        }
      }
      .report-content {
        width: 1056px;
      }
    }
  }

  @media print {
    /* The following properties will be applied to Firefox only */
    @-moz-document url-prefix(){
      .layout-report {}
    }
    .layout-report{
      &#IE {
        scale: 0.75;
      }
      .report-header {
        position: absolute;
        &__top {
          display: none;
        }
        &__bottom {
          &__btn-print {
            display: none;
          }
          div {
            width: 735px;
            justify-content: center;
          }
        }
      }
      .report-content {
        width: 958px;
        margin-top: 50px; // Overriding it because we don't have the upper part of the layout header in print mode
      }
    }
  }

</style>
