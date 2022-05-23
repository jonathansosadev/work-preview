<template>
  <div class="gs-mobile-actions" v-if="hasAtLeastOneItem">
    <div class="gs-mobile-actions-inner">
      <ul>
        <li :class="'li' + (numberOfItems)" v-show="hasExternalLink" @click="goToRdv()">
          <div><img src="/certificate/images/contact/rdv.png" alt="Rendez-vous"></div>
          <div>{{ $t_locale('components/certificate/CtfMobileActions')('meeting') }}</div>
        </li>

        <li :class="'li' + (numberOfItems)" v-show="hasPhone" @click="callGarage()">
          <div><img src="/certificate/images/contact/tel.png" alt="Telephone"></div>
          <div>{{ $t_locale('components/certificate/CtfMobileActions')('call') }}</div>
        </li>

        <li :class="'li' + (numberOfItems)" v-show="hasLocalisation" @click="goToMap()">
          <div><img src="/certificate/images/contact/localisation.png" alt="Localisation"></div>
          <div>{{ $t_locale('components/certificate/CtfMobileActions')('localization') }}</div>
        </li>

        <li :class="'li' + (numberOfItems)" v-show="hasOpeningHours" @click="goToOpening()">
          <div><img src="/certificate/images/contact/horaires.png" alt="Horaires"></div>
          <div>{{ $t_locale('components/certificate/CtfMobileActions')('workingHours')}}</div>
        </li>
      </ul>
    </div>

    <div class="gs-action-content" v-if="actionTitle">
      <div class="action-title">
        <h2>{{ actionTitle }}</h2>
        <button @click="actionTitle = null"><img src="/certificate/images/contact/close.png" alt="Close">
        </button>
      </div>
      <div class="action-content-inner">

        <div class="action action-rdv" v-show="actionNumber === 1">
          <p class="rdv-text">{{ $t_locale('components/certificate/CtfMobileActions')('redirection') }}</p>
          <p class="rdv-icon"><i class="icon-gs-loading"></i></p>
        </div>

        <div class="action action-map" v-show="actionNumber === 2">
          <ctf-contact-map-mobile></ctf-contact-map-mobile>
        </div>

        <div class="action action-opening" v-show="actionNumber === 3">
          <h3 :class="isOpen ? 'is-open' : 'is-close'">{{ $t_locale('components/certificate/CtfMobileActions')('garageStatus', { status: isOpen ? 'open' : 'closed' }) }}</h3>
          <div class="opening-hours-details">
            <div v-for="(day, index) in openingHoursFromToday" :key="index"
                 :class="'opening-hours-details-day ' + (index === 0 ? 'details-today' : '')">
              <div :class="'opening-hours-details-day-' + (isOpen ? 'open' : 'close')">
                <div class="opening-hours-details-day-left">{{ day.name + ' : ' }}</div>
                <div v-if="day.ranges.length > 0" class="opening-hours-details-day-right">
                  <div class="openinig-hours-details-day-right-inner">
                  <span v-for="(range, rangeIndex) in day.ranges" :key="rangeIndex">
                    {{ fromNumberToStringRange(range.open) + ' - ' + fromNumberToStringRange(range.close) + (rangeIndex < day.ranges.length - 1 ? ' | ' : '')
                    }}
                  </span>
                  </div>
                </div>
                <div class="opening-hours-details-day-right" v-else>
                  <div class="openinig-hours-details-day-right-inner">
                    <span>{{ $t_locale('components/certificate/CtfMobileActions')('closedUppercase') }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import CtfContactMapMobile from './CtfContactMapMobile.vue';

  export default {
    components: {CtfContactMapMobile},
    data() {
      return {
        externalLink: null,
        actionTitle: null,
        actionNumber: -1,
        openingHours: [{
          name: this.$t_locale('components/certificate/CtfMobileActions')('mon'), ranges: []
        }, {
          name: this.$t_locale('components/certificate/CtfMobileActions')('tue'), ranges: []
        }, {
          name: this.$t_locale('components/certificate/CtfMobileActions')('wed'), ranges: []
        }, {
          name: this.$t_locale('components/certificate/CtfMobileActions')('thu'), ranges: []
        }, {
          name: this.$t_locale('components/certificate/CtfMobileActions')('fri'), ranges: []
        }, {
          name: this.$t_locale('components/certificate/CtfMobileActions')('sat'), ranges: []
        }, {
          name: this.$t_locale('components/certificate/CtfMobileActions')('sun'), ranges: []
        }],
        openingHoursFromToday: [],
        mapVisible: false
      };
    },
    mounted: function () {
      this.generateOpeningHours();
      for (const elem of this.garage.links) {
        if (elem.name === 'appointment') {
          this.externalLink = elem.url;
          break;
        }
      }
      if (!this.externalLink) {
        this.externalLink = this.garage.googleWebsiteUrl; // Field computed from common/lib/garagescore/api/modules/garage/GarageGlobalData.js
      }
      window.addEventListener('resize', () => {
        this.mapVisible = window.innerWidth <= 768;
      });
      this.mapVisible = window.innerWidth <= 768;
    },
    computed: {
      garage() {
        return this.$store.state.certificate.garage;
      },
      isOpen() {
        return this.$store.state.certificate.isOpen;
      },
      hasPhone() {
        return this.$store.state.certificate.garage.phone && this.$store.state.certificate.garage.phone !== '';
      },
      hasOpeningHours() {
        return this.$store.state.certificate.garage.openingHours !== null;
      },
      hasLocalisation() {
        return this.$store.state.certificate.garage.longitude && this.$store.state.certificate.garage.latitude;
      },
      hasExternalLink() {
        return this.externalLink !== null;
      },
      hasAtLeastOneItem() {
        return this.hasPhone || this.hasLocalisation || this.hasExternalLink || this.hasOpeningHours;
      },
      numberOfItems() {
        let i = 0;

        if (this.hasPhone) {
          ++i;
        }
        if (this.hasOpeningHours) {
          ++i;
        }
        if (this.hasLocalisation) {
          ++i;
        }
        if (this.hasExternalLink) {
          ++i;
        }
        return i;
      }
    },
    methods: {
      goToRdv() {
        this.actionNumber = 1;
        this.actionTitle = this.$t_locale('components/certificate/CtfMobileActions')('meetingProposition');
        window.setTimeout(() => {
          this.actionTitle = null;
          this.actionNumber = -1;
          this.safeGtag('event', 'clicked', {
            event_category: 'rdvButton',
            event_label: this.$route.params.slug || 'unknown slug'
          });
        }, 1100);
        window.setTimeout(() => {
          window.open(this.externalLink);
        }, 1000);
      },
      callGarage() {
        this.safeGtag('event', 'clicked', {
          event_category: 'phoneNumberButton',
          event_label: this.$route.params.slug || 'unknown slug'
        });
        window.setTimeout(() => {
          window.location = 'tel:' + this.garage.phone;
        }, 800);
      },
      goToMap() {
        this.actionNumber = 2;
        this.actionTitle = this.$t_locale('components/certificate/CtfMobileActions')('localization');
      },
      goToOpening() {
        this.actionNumber = 3;
        this.actionTitle = this.$t_locale('components/certificate/CtfMobileActions')('workingHours');
      },
      generateOpeningHours() {
        const now = this.$moment().tz(this.garage.timezone || 'Europe/Paris');

        this.todayIndex = now.day() === 0 ? 6 : now.day() - 1;
        this.generateRanges(this.garage.openingHours);
        this.sortRangesAsc();
        this.generateOpeningHoursFromToday();
        this.setIsOpen(this.openingHours[this.todayIndex], now);
      },
      generateRanges(garageOpeningHours) {
        if (!garageOpeningHours) {
          return;
        }
        for (const elem of garageOpeningHours) {
          if (this.rangeIsValid(elem)) {
            this.generateRange(elem);
          }
        }
      },
      rangeIsValid(r) {
        return r.open && r.close && r.open.day && r.close.day && r.open.time && r.close.time &&
          r.open.day === r.close.day && parseInt(r.open.time, 10) < parseInt(r.close.time, 10);
      },
      generateRange(elem) {
        const pos = elem.open.day === 0 ? 6 : elem.open.day - 1;
        const day = this.openingHours[pos];

        day.ranges.push({open: parseInt(elem.open.time, 10), close: parseInt(elem.close.time, 10)});
      },
      sortRangesAsc() {
        for (const day of this.openingHours) {
          day.ranges.sort((a, b) => a.open - b.open);
        }
      },
      fromNumberToStringRange(n) {
        const padded = ('0000' + n).slice(-4);

        return padded.substr(0, 2) + ':' + padded.substr(2);
      },
      generateOpeningHoursFromToday() {
        this.openingHoursFromToday = this.openingHours.slice(this.todayIndex).concat(this.openingHours.slice(0, this.todayIndex));
      },
      setIsOpen(openingHoursToday, now) {
        const nowNb = parseInt(('00' + String(now.hour())).slice(-2) + ('00' + String(now.minute())).slice(-2), 10);

        for (const range of openingHoursToday.ranges) {
          if (nowNb >= range.open && nowNb <= range.close) {
            this.$store.commit('certificate/SET_IS_OPEN', true);
          }
        }
      },
      safeGtag() {
        if(window && window.gtag) window.gtag(...arguments);
      }
    }
  }
</script>

<style lang="scss" scoped>
  .gs-mobile-actions {
    display: none;
    .gs-mobile-actions-inner {
      color: #FFF;
      background: #ec5507;

      font-size: 11px;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 5px 5px 2px 5px;
      z-index: 100;
      height: 40px;
      ul {
        margin: 0;
        padding: 0;
        width: 100%;
        li {
          display: inline-block;
          vertical-align: bottom;
          text-align: center;
          cursor: pointer;
          img {
            height: 18px;
          }
        }
        .li4 {
          width: 25%;
        }
        .li3 {
          width: 33.33%;
        }
        .li2 {
          width: 50%;
        }
        .li1 {
          width: 100%;
        }
      }
    }
    .gs-action-content {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 99;
      .action-title {
        color: #FFF;

        background: rgba(0, 0, 0, 0.9);
        padding: 20px 10px;
        height: 65px;
        h2 {
          display: inline-block;
          font-size: 16px;
          padding: 0;
          margin: 0;
          vertical-align: middle;
          text-align: left;
          width: 85%;
        }
        button {
          display: inline-block;
          vertical-align: middle;
          border: none;
          background: transparent;
          outline: none;
          text-align: right;
          width: 15%;
        }
      }
      .action-content-inner {
        background: #FFF;
        height: calc(100vh - 40px - 65px);
        padding: 20px 5px;
        position: relative;
        .action {

        }
        .action-rdv {
          text-align: center;
          color: #757575;
          .rdv-text {

            font-size: 16px;
            margin-top: 30px;
          }
          .rdv-icon {
            margin-top: 30px;
          }
        }
        .action-opening {
          .is-open {
            color: #00B700;
          }
          .is-close {
            color: #333;
          }
          .opening-hours-details {
            background: #FFF;
            padding: 10px 0;
            .opening-hours-details-day-left {

              font-size: 15px;
              color: #757575;
              display: inline-block;
              width: 29%;
            }
            .opening-hours-details-day-right {

              display: inline-block;
              font-size: 14px;
              color: #BCBCBC;
              width: 71%;
              text-align: right;
              .openinig-hours-details-day-right-inner {
                text-align: left;
                width: 185px;
                display: inline-block;
              }
            }
            .details-today {
              .opening-hours-details-day-open {
                color: #00B700;
                .opening-hours-details-day-left {
                  color: inherit;
                }
                .opening-hours-details-day-right {
                  color: inherit;
                }
              }
              .opening-hours-details-day-close {
                color: #333;
                .opening-hours-details-day-left {
                  color: inherit;
                }
                .opening-hours-details-day-right {
                  color: inherit;
                }
              }
            }
          }
        }
        .action-map {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }
      }
    }
    @media (max-width: 768px) {
      display: block;
    }
  }
</style>
