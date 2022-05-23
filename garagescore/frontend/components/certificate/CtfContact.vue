<template>
  <section :class="'contact fixed-' + rightBlock" v-if="garage.latitude || garage.city || garage.phone || externalUrl">
    <section class="contact-titles">
      <h4 class="contact-title">{{ $t_locale('components/certificate/CtfContact')('contact') }}</h4>
      <h6 class="contact-subtitle">{{ $t_locale('components/certificate/CtfContact')('fastService') }}</h6>
    </section>
    <section class="contact-content">
<!--      <section class="contact-titles">
        <h4 class="contact-title">{{ $t_locale('components/certificate/CtfContact')('contact') }}</h4>
        <h6 class="contact-subtitle">{{ $t_locale('components/certificate/CtfContact')('fastService') }}</h6>
      </section>-->
      <section class="contact-actions" v-show="garage.phone || externalUrl">
        <div v-if="garage.phone && garage.phone !== ''" @click="displayPhoneNumber()"
             :class="{'button': !phoneNumberDisplayed, 'clicked-button': phoneNumberDisplayed}">
          <div class="icon-container">
            <img :src="'/certificate/images/contact/' + (phoneNumberDisplayed ? 'tel-clicked' : 'tel') + '.png'"
                 alt="Telephone">
          </div>
          <meta itemprop="telephone" :content="garage.phone" v-if="garage.phone">
          <div class="text-container">
            {{ getPhoneNumber() }}
          </div>
        </div>
        <a v-if="externalUrl" class="button" :href="getGarageExternalUrl()" target="_blank"
           @click="trackRdv()">
          <div class="icon-container">
            <img src="/certificate/images/contact/rdv.png" alt="Rdv">
          </div>
          <div class="text-container">
            {{ $t_locale('components/certificate/CtfContact')(`${garageCertificateWording}Request`) }}
          </div>
        </a>
      </section>
      <section
        :class="{'contact-opening': true, 'has-above': (garage.phone && garage.phone !== '') || (externalUrl && externalUrl !== '')}"
        v-if="garage.openingHours">

        <div class="opening-hours-today">
          <div class="opening-hours-today-left">{{ $t_locale('components/certificate/CtfContact')('workingHours') }}</div>
          <div class="opening-hours-today-right" v-if="openingHours[todayIndex].ranges.length > 0"
               @click="setOpeningHoursDetails(true)"
               style="cursor: pointer;">
            <span v-for="(range, rangeIndex) in openingHours[todayIndex].ranges" :key="rangeIndex">
              {{ fromNumberToStringRange(range.open) + ' - ' + fromNumberToStringRange(range.close) + (rangeIndex < openingHours[todayIndex].ranges.length - 1 ? ' | ' : '')
              }}
            </span>
            <i class="icon-gs-down"></i>
          </div>
          <div class="opening-hours-today-right" @click="setOpeningHoursDetails(true)" style="cursor: pointer;" v-else>
            {{ $t_locale('components/certificate/CtfContact')('closedToday') }}<i class="icon-gs-down"></i>
          </div>
        </div>

        <div :class="isOpen ? 'is-open' : 'is-close'">{{ $t_locale('components/certificate/CtfContact')('garageStatus', { status: isOpen ? $t_locale('components/certificate/CtfContact')('open') : $t_locale('components/certificate/CtfContact')('closed') }) }}</div>

        <div class="opening-hours-details" v-if="openingHoursDetails">
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
                  <span>{{ $t_locale('components/certificate/CtfContact')('closed') }}</span>
                </div>
              </div>
            </div>
          </div>
          <div @click="setOpeningHoursDetails(false)"
               style="cursor: pointer; color: #BCBCBC; text-align: right; margin-top: 5px;">
            <i class="icon-gs-up"></i>
          </div>
        </div>
      </section>
      <section class="map-test-section" @click="displayMap()" v-if="garage.latitude">
        <div class="bottom-tape"><img src="/certificate/images/contact/agrandir.svg" alt="Agrandir" style="position:relative;top:-2px;left:-3px;">{{ $t_locale('components/certificate/CtfContact')('zoomOnMap') }}</div>
      </section>
    </section>
  </section>
</template>

<script>
  import CtfContactMap from './CtfContactMap.vue'

  export default {
    data() {
      return {
        todayIndex: 0,
        openingHours: [{
          name: this.$t_locale('components/certificate/CtfContact')('mon'),
          ranges: []
        }, {
          name: this.$t_locale('components/certificate/CtfContact')('tue'),
          ranges: []
        }, {
          name: this.$t_locale('components/certificate/CtfContact')('wed'),
          ranges: []
        }, {
          name: this.$t_locale('components/certificate/CtfContact')('thu'),
          ranges: []
        }, {
          name: this.$t_locale('components/certificate/CtfContact')('fri'),
          ranges: []
        }, {
          name: this.$t_locale('components/certificate/CtfContact')('sat'),
          ranges: []
        }, {
          name: this.$t_locale('components/certificate/CtfContact')('sun'),
          ranges: []
        }],
        openingHoursFromToday: [],
        openingHoursDetails: false,
        phoneNumberDisplayed: false,
        externalUrl: null
      };
    },
    mounted: function () {
      this.generateOpeningHours();
      for (const elem of this.garage.links) {
        if (elem.name === 'appointment') {
          this.externalUrl = elem.url;
          break;
        }
      }
      if (!this.externalUrl) {
        this.externalUrl = this.garage.googleWebsiteUrl; // Field computed from common/lib/garagescore/api/modules/garage/GarageGlobalData.js
      }
      const leftBlock = document.getElementsByClassName('left-block')[0];
      const rightBlock = document.getElementsByClassName('right-block')[0];

      rightBlock.style.height = leftBlock.offsetHeight + 'px';
      document.addEventListener("scroll", () => {
        const scrollTop = document.getElementsByTagName('body')[0].scrollTop || document.getElementsByTagName('html')[0].scrollTop;
        let bottomOfLeftBlock = 0;
        let theoricBottomOfContact = 0;
        if (document.getElementsByClassName('left-block')[0]) {
          bottomOfLeftBlock = document.getElementsByClassName('left-block')[0].offsetTop + document.getElementsByClassName('left-block')[0].offsetHeight - scrollTop - 50;
        }
        if (document.getElementsByClassName('contact')[0]) {
          theoricBottomOfContact = document.getElementsByClassName('contact')[0].offsetHeight + (window.innerWidth <= 991 ? 42 : 72);
        }

        if (scrollTop > this.scrollRef && theoricBottomOfContact <= bottomOfLeftBlock && this.$store.state.certificate.rightBlock !== 'middle') {
          this.$store.commit('certificate/SET_RIGHT_BLOCK', 'middle');
        } else if (theoricBottomOfContact > bottomOfLeftBlock && this.$store.state.certificate.rightBlock !== 'bottom') {
          this.$store.commit('certificate/SET_RIGHT_BLOCK', 'bottom');
        } else if (scrollTop <= this.scrollRef && this.$store.state.certificate.rightBlock !== 'top') {
          this.$store.commit('certificate/SET_RIGHT_BLOCK', 'top');
        }
      });
    },
    updated: function () {
      const leftBlock = document.getElementsByClassName('left-block')[0];
      const rightBlock = document.getElementsByClassName('right-block')[0];

      rightBlock.style.height = leftBlock.offsetHeight + 'px';
    },
    methods: {
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
      setOpeningHoursDetails(val) {
        this.openingHoursDetails = val;
      },
      displayPhoneNumber() {
        this.safeGtag('event', 'clicked', {
          event_category: 'phoneNumberButton',
          event_label: this.$route.params.slug || 'unknown slug'
        });
        this.phoneNumberDisplayed = true;
      },
      trackRdv() {
        this.safeGtag('event', 'clicked', {
          event_category: 'rdvButton',
          event_label: this.$route.params.slug || 'unknown slug'
        });
      },
      trackMapBtn() {
        this.safeGtag('event', 'clicked', {
          event_category: 'mapButton',
          event_label: this.$route.params.slug || 'unknown slug'
        });
      },
      getPhoneNumber() {
        if (!this.phoneNumberDisplayed) {
          return this.$t_locale('components/certificate/CtfContact')('displayNumber');
        }
        return this.garage.phone;
      },
      getGarageExternalUrl() {
        return this.externalUrl;
      },
      notMobileMode() {
        return window.innerWidth > 768;
      },
      displayMap() {
        this.$store.commit('certificate/SET_MAP_VISIBLE', true);
        this.trackMapBtn();
      },
      safeGtag() {
        if(window && window.gtag) window.gtag(...arguments);
      }
    },
    computed: {
      garage() {
        return this.$store.state.certificate.garage;
      },
      isOpen() {
        return this.$store.state.certificate.isOpen;
      },
      rightBlock() {
        return this.$store.state.certificate.rightBlock;
      },
      mapVisible() {
        return this.$store.state.certificate.mapVisible;
      },
      hasLocalisation() {
        return this.$store.state.certificate.garage.longitude && this.$store.state.certificate.garage.latitude;
      },
      scrollRef() {
        return this.$store.state.certificate.scrollRef;
      },
      garageCertificateWording() {
        return this.garage.certificateWording || 'appointment';
      }
    },
    components: {CtfContactMap}
  }
</script>

<style lang="scss" scoped>
  $right-block-space: 20px;
  .contact {
    width: 100%;
    background-color: #fff;
    display: inline-block;

    padding-top: 20px;
    position: relative;
    .contact-titles {
      padding: 5px 0 10px 0;
      text-align: center;
      color: #333;
      .contact-title {

        font-size: 22px;
        margin-bottom: 5px;
        margin-top: 0;
        @media (max-width: 991px) {
          font-size: 18px;
        }
      }
      .contact-subtitle {

        font-size: 14px;
        color: #757575;
        margin: 0 0 15px 0;
        @media (max-width: 991px) {
          font-size: 12px;
        }
      }
    }
    .contact-content {
      padding: $right-block-space;
      color: #FFFFFF;
      border: 2px dotted #bcbcbc;
      .contact-actions {
        padding: 0;
        a.button {
          margin: $right-block-space 0;
        }
        .button {
          background: #e44b05;
          display: block;
          height: 45px;
          width: 100%;
          outline: none;
          padding: 5px 10px;
          margin: 0;
          border: none;
          box-shadow: 1px 1px 8px #888;
          position: relative;
          border-radius: 3px;
          overflow: hidden;
          color: #fff;
          cursor: pointer;
          &::before {
            content: '';
            display: block;
            background: #ec5506;
            position: absolute;
            top: -50px;
            left: -20px;
            right: -5px;
            bottom: 7px;
            border-radius: 50%;
          }
          .icon-container {
            height: 45px;
            position: absolute;
            width: 45px;
            top: 0;
            left: 0;
            padding: 9px 10px;
            box-shadow: 2px 0 4px 0 rgba(0, 0, 0, 0.1);
            background: #e44b05;
            border-top-left-radius: 3px;
            border-bottom-left-radius: 3px;
            text-align: center;
            img {
              width: 25px;
            }
          }
          .text-container {
            position: absolute;
            top: 0;
            left: 40px;
            bottom: 0;
            right: 0;
            text-align: left;

            font-size: 18px;
            padding: 11px 0 0 50px;
            @media (max-width: 1200px) {
              padding: 11px 0 0 30px;
            }
            @media (max-width: 991px) {
              padding: 12px 0 0 20px;
              font-size: 14px;
            }
          }
          &:hover {
            background: #d74306;
            &::before {
              background: #e44b05;
            }
            .icon-container {
              background: #d74306;
            }
          }
        }
        .clicked-button {
          background: transparent;
          display: block;
          height: 45px;
          width: 100%;
          outline: none;
          padding: 5px 10px;
          border: 1px solid #ec5506;
          position: relative;
          border-radius: 3px;
          overflow: hidden;
          color: #fff;
          cursor: text;
          .icon-container {
            height: 45px;
            position: absolute;
            width: 45px;
            top: 0;
            left: 0;
            padding: 9px 10px;
            background: transparent;
          }
          .text-container {
            position: absolute;
            top: 0;
            left: 40px;
            bottom: 0;
            right: 0;
            text-align: left;

            font-size: 18px;
            padding: 11px 0 0 50px;
            color: #ec5506;
            @media (max-width: 1200px) {
              padding: 11px 0 0 30px;
            }
            @media (max-width: 991px) {
              padding: 12px 0 0 20px;
              font-size: 14px;
            }
          }
        }
      }
      .contact-opening {
        color: #111;
        padding: $right-block-space 0;
        position: relative;
        .opening-hours-today {
          .opening-hours-today-left {

            font-size: 16px;
            color: #757575;
            display: inline-block;
            width: 28%;
            @media (max-width: 991px) {
              font-size: 12px;
            }
          }
          .opening-hours-today-right {

            display: inline-block;
            font-size: 14px;
            color: #BCBCBC;
            width: 72%;
            text-align: right;
            @media (max-width: 1200px) {
              font-size: 13px;
            }
            @media (max-width: 991px) {
              font-size: 9px;
            }
          }
        }
        .is-open {
          text-align: center;

          font-size: 16px;
          color: #00B700;
          margin-top: 10px;
          @media (max-width: 991px) {
            font-size: 12px;
          }
        }
        .is-close {
          text-align: center;

          font-size: 16px;
          color: #333;
          margin-top: 10px;
          @media (max-width: 991px) {
            font-size: 12px;
          }
        }
        .opening-hours-details {
          position: absolute;
          background: #FFF;
          z-index: 2;
          top: 0;
          left: 0;
          right: 0;
          padding: 10px 0;
          .opening-hours-details-day-left {

            font-size: 15px;
            color: #757575;
            display: inline-block;
            width: 29%;
            @media (max-width: 991px) {
              font-size: 11px;
            }
          }
          .opening-hours-details-day-right {

            display: inline-block;
            font-size: 14px;
            color: #BCBCBC;
            width: 71%;
            text-align: right;
            @media (max-width: 991px) {
              font-size: 10px;
            }
            .openinig-hours-details-day-right-inner {
              text-align: left;
              width: 185px;
              display: inline-block;
              @media (max-width: 991px) {
                font-size: 10px;
                width: 132px;
              }
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
      .contact-opening.has-above {
        border-top: 2px dotted #bcbcbc;
      }
      .map-test-section {
        width: 100%;
        height: 225px;
        border-top: 2px dotted #bcbcbc;
        background: url('/certificate/images/contact/map-fixe.png') no-repeat 0 $right-block-space;
        cursor: pointer;
        position: relative;
        opacity: 1;
        transition: opacity 0.2s;
        &:hover {
          opacity: 0.9;
          transition: opacity 0.6s;
        }
        .bottom-tape {
          color: #757575;

          font-size: 16px;
          text-align: center;
          background: rgba(242,242,242,0.8);
          line-height: 26px;
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          padding: 10px;
        }
      }
    }
  }

  .contact.fixed-top {
    top: 0;
    transition: top 0.4s;
  }

  .contact.fixed-middle {
    position: fixed;
    top: 65px;
    width: 375px;
    transition: top 1s;
    @media (max-width: 1200px) {
      width: 308.33px;
    }
    @media (max-width: 991px) {
      width: 235px;
    }
  }

  .contact.fixed-bottom {
    position: absolute;
    bottom: 55px;
    width: 375px;
    @media (max-width: 1200px) {
      width: 308.33px;
      bottom: 55px;
    }
    @media (max-width: 991px) {
      width: 235px;
      bottom: 55px;
    }
  }
</style>
