<template>
  <div>
    <!-- CLASSIC NAV -->
    <nav :class="'gs-nav' + ' ' + (useCusteedHeader ? 'custeedContext' : '')">
      <div class="container">
        <div class="row">
          <div class="col-xs-2 logo-container">
            <img :src="(useCusteedHeader? '/logo/logo-custeed-picto.svg' : '/certificate/images/header/logo-small.png')" v-on:click="scrollToTop()"/>
          </div>
          <div v-for="(job, index) in availableJobs" :key="job">
            <div class="vertical-line" v-if="index > 0 && availableJobs[index - 1] !== selectedServiceType && selectedServiceType !== job"></div>
            <div class="col-xs-4 nav-element" v-on:click="selectNav(job)" :class="[selectedServiceType === job ? 'active' : '']">
              <i class="fa" v-bind:class="params[job].icon" aria-hidden="true"></i>
              <span class="no-tablet">{{params[job].title}}</span>
              <span class="tablet-only">{{params[job].short}}</span><br>
              <div class="fixed-on-top-only">
                <span class="star-container">
                    <img :src="getStarBetween(0,2, garage[job].rating)">
                    <img :src="getStarBetween(2,4, garage[job].rating)">
                    <img :src="getStarBetween(4,6, garage[job].rating)">
                    <img :src="getStarBetween(6,8, garage[job].rating)">
                    <img :src="getStarBetween(8,10, garage[job].rating)">
                </span>
                <span class="count-reviews no-mobile"> ({{ garage[job].respondentsCount | spacedNumber }} {{ $t_locale('components/certificate/CtfNav')('review') }})</span>
                <span class="rating-reviews mobile-only"> {{ garage[job].rating | frenchFloating }} </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- FIXED NAV ON SCROLL -->
    <nav :class="'gs-fixed-nav gs-fixed-nav-' + (fixedNavVisible ? 'visible' : 'hidden') + ' ' + (useCusteedHeader ? 'custeedContext' : '')">
      <div class="container">
        <div class="row">
          <div class="col-xs-2 logo-container">
            <img :src="(useCusteedHeader? '/logo/logo-custeed-picto.svg' : '/certificate/images/header/logo-small.png')" v-on:click="scrollToTop()"/>
          </div>
          <div class="vertical-line fixed-on-top-only fixed-on-top-desktop-only"></div>
          <div v-for="job of availableJobs" :key="job">
            <div class="col-xs-4 nav-element" v-on:click="selectNav(job)" :class="[selectedServiceType === job ? 'active' : '']">
              <i class="fa" v-bind:class="params[job].icon" aria-hidden="true"></i>
              <span class="no-tablet">{{params[job].title}}</span>
              <span class="tablet-only">{{params[job].short}}</span><br>
              <div class="fixed-on-top-only">
<!--                <span class="star-container">
                    <img :src="getStarBetween(0,2, garage[job].rating)">
                    <img :src="getStarBetween(2,4, garage[job].rating)">
                    <img :src="getStarBetween(4,6, garage[job].rating)">
                    <img :src="getStarBetween(6,8, garage[job].rating)">
                    <img :src="getStarBetween(8,10, garage[job].rating)">
                </span>-->
                <StarsScore class="star-container" :score="garage[job].rating / 2"></StarsScore>
                <span class="count-reviews no-mobile"> ({{ garage[job].respondentsCount | spacedNumber }} {{ $t_locale('components/certificate/CtfNav')('review') }})</span>
                <span class="rating-reviews mobile-only"> {{ garage[job].rating | frenchFloating }} </span>
              </div>
            </div>
            <div class="vertical-line"></div>
          </div>
          <div class="col-xs-2 get-more-button">
            <button class="read-more-button" v-on:click="setModalHelpVisible(true)">{{ $t_locale('components/certificate/CtfNav')('knowMore') }}</button>
            <button class="read-more-button-tablet" v-on:click="setModalHelpVisible(true)">
              <img class="logo" src="/certificate/images/header/savoir-plus.png" alt="logo">
            </button>
          </div>
        </div>
      </div>
    </nav>
  </div>
</template>

<script>
  import DataTypes from "~/utils/models/data/type/data-types";
  import GarageTypes from '~/utils/models/garage.type.js';

  export default {
    props: {
      useCusteedHeader: Boolean
    },
    data() {
      return {
        fixedNavVisible: false,
        params: {
          Maintenance: {title: this.$t_locale('components/certificate/CtfNav')('apv'), short: this.$t_locale('components/certificate/CtfNav')('apvShort'), icon: 'icon-gs-repair'},
          NewVehicleSale: {title: this.$t_locale('components/certificate/CtfNav')('vn'), short: this.$t_locale('components/certificate/CtfNav')('vnShort'), icon: 'icon-gs-car'},
          UsedVehicleSale: {title: this.$t_locale('components/certificate/CtfNav')('vo'), short: this.$t_locale('components/certificate/CtfNav')('voShort'), icon: 'icon-gs-car-old'},
          VehicleInspection: {title: this.$t_locale('components/certificate/CtfNav')('vi'), short: this.$t_locale('components/certificate/CtfNav')('viShort'), icon: 'icon-gs-repair', single: true}
        }
      }
    },
    computed: {
      garage() {
        return this.$store.state.certificate.garage;
      },
      selectedServiceType() {
        return this.$store.state.certificate.selectedServiceType;
      },
      scrollRef() {
        return this.$store.state.certificate.scrollRef;
      },
      availableJobs() {
        if (this.params[this.garage.type]) // If the garage type has his own proper type, just give his type
          return this.garage[this.garage.type] ? [this.garage.type] : null;
        return Object.keys(this.params).filter((job) => (this.garage[job] && !this.params[job].single)); // otherwise, show every jobs found without single jobs (removing VehicleInspection for example)
      }
    },
    watch: {
      selectedServiceType() {
        const scrollTop = document.getElementsByTagName('body')[0].scrollTop || document.getElementsByTagName('html')[0].scrollTop;
        if (window.innerWidth < 480 && scrollTop > 266) {
          this.scrollToX(265);
        } else if (window.innerWidth >= 480 && window.innerWidth < 991 && scrollTop > 276) {
          this.scrollToX(275);
        } else if (window.innerWidth >= 991 && scrollTop > 361) {
          this.scrollToX(360);
        }
      }
    },
    mounted() {
      const checkScroll = () => {
        const scrollTop = document.getElementsByTagName('body')[0].scrollTop || document.getElementsByTagName('html')[0].scrollTop;

        if (window.innerWidth < 480 && this.$store.state.certificate.scrollRef !== 295) {
          this.$store.commit('certificate/SET_SCROLL_REF', 295);
        } else if (window.innerWidth >= 480 && window.innerWidth < 991 && this.$store.state.certificate.scrollRef !== 310) {
          this.$store.commit('certificate/SET_SCROLL_REF', 310);
        } else if (window.innerWidth >= 991 && this.$store.state.certificate.scrollRef !== this.$store.state.certificate.basicScrollRef) {
          this.$store.commit('certificate/SET_SCROLL_REF', this.$store.state.certificate.basicScrollRef);
        }
        if (scrollTop > this.scrollRef && this.fixedNavVisible !== true) {
          this.fixedNavVisible = true;
        } else if (scrollTop <= this.scrollRef && this.fixedNavVisible !== false) {
          this.fixedNavVisible = false;
        }
      };
      document.addEventListener("scroll", checkScroll);
      checkScroll();
      if (this.$store.state.certificate.garage && this.$store.state.certificate.garage.type
      && this.$store.state.certificate.garage.type === GarageTypes.MOTORBIKE_DEALERSHIP) {
        this.params[DataTypes.NEW_VEHICLE_SALE].icon = 'icon-gs-moto';
        this.params[DataTypes.USED_VEHICLE_SALE].icon = 'icon-gs-moto-old';
      }
    },
    methods: {
      setModalHelpVisible(visible) {
        this.$store.commit('certificate/SET_MODAL_HELP_VISIBLE', visible);
      },
      selectNav(selected) {
        this.activeNav = selected;
        this.$store.dispatch('certificate/CHANGE_SERVICE_TYPE', selected)
      },
      scrollToX(x) {
        var scrollAnimator = setInterval(function () {
          const scrollTop = document.getElementsByTagName('body')[0].scrollTop || document.getElementsByTagName('html')[0].scrollTop;
          window.scrollTo(0, scrollTop - 20);
          if (scrollTop < x) {
            window.scrollTo(0, x);
            clearInterval(scrollAnimator);
          }
        }, 10);
      },
      scrollToTop(){
        var scrollAnimator = setInterval(function () {
          const scrollTop = document.getElementsByTagName('body')[0].scrollTop || document.getElementsByTagName('html')[0].scrollTop;
          window.scrollTo(0, scrollTop - 30);
          if (scrollTop < 30) {
            clearInterval(scrollAnimator);
          }
        }, 10);
      },
      getStarBetween(min, max, ratio) {
        if (ratio <= min) {
          return '/certificate/images/stars/empty.png';
        }
        if (ratio >= max) {
          return '/certificate/images/stars/full.png';
        }
        return ratio >= ((min + max) / 2)
          ? '/certificate/images/stars/half.png'
          : '/certificate/images/stars/empty.png';
      }
    }
  }
</script>

<style lang="scss" scoped>
  nav {
    .nav-element i.fa {
      color: $dark-grey;
    }

    .nav-element.active i.fa {
        color: $gsBrandColor;
    }
  }

  nav.custeedContext {
    .nav-element {
      &.active {
        background-color: white;
        padding-top: 0;
        color: black;
        border-top: 3px solid $custeedBrandColor;
      }

      & i.fa {
        color: $dark-grey;
      }

      &.active i.fa {
        color: $custeedBrandColor;
      }
    }
    @media (max-width: 991px) {
      & {
        top: 345px;
      }
    }
  }

  .gs-nav, .gs-fixed-nav {
    width: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    height: 45px;
    color: white;
    position: absolute;
    top: 455px;
    z-index: 16;
    text-align: center;
    -moz-transition: height 0.5s ease;
    -webkit-transition: height 0.5s ease;
    -o-transition: height 0.5s ease;
    transition: height 0.5s ease;
    .nav-element {
      padding: 0;
      padding-top: 3px;
      height: 45px;
      font-size: 18px;
      
      width: calc(33.33333333% - 1px);
      cursor: pointer;
      i {
        padding-right: 10px;
        font-size: 1.5em;
        position: relative;
        top: 7px;
      }
    }
    .get-more-button {
      display: none;
    }
    .logo-container {
      display: none;
    }
    .vertical-line {
      display: inline-block;
      width: 0;
      height: 26px;
      border-right: 1px solid #bcbcbc;
      margin-top: 10px;
      float: left;
    }
    .nav-element.active {
      background-color: white;
      border-top: 3px solid #43b9ad;
      padding-top: 0;
      
      color: black;
    }
    .only-too-small {
      display: none;
    }
    .mobile-only {
      display: none;
    }
    .tablet-only {
      display: none;
    }
    .fixed-on-top-only {
      display: none;
    }
    button.read-more-button {
      border: 1px solid white;
      border-radius: 3px;
      line-height: 14px;
      font-size: 14px;
      padding: 8px 13px;
      background-color: transparent;
      margin-top: 16px;
    }
    button.read-more-button-tablet {
      display: none;
    }
    button.read-more-button:hover {
      background-color: white;
      color: #43b9ad;
    }
    .rating-reviews {
      padding-left: 5px;
      font-weight: bold;
    }

    @media (min-width: 768px) {
      @media (hover:hover) {
        .nav-element:hover {
          cursor: pointer;
          border-top: 3px solid #43b9ad;
          padding-top: 0;
        }
      }
    }
    @media (max-width: 991px) {
      top: 275px;
      .tablet-only {
        display: inline-block;
      }

      .no-tablet {
        display: none;
      }
    }
    @media (max-width: 768px) {
      top: 275px;
      .nav-element {
        font-size: 14px;
        padding-top: 8px;
      }
      .nav-element.active {
        padding-top: 5px;
      }
    }
    @media (max-width: 480px) {
      top: 345px;
      height: 40px;

      .no-mobile {
        display: none;
      }

      .mobile-only {
        display: inline-block;
      }
      .nav-element {
        font-size: 12px;
        height: 40px;
        img {
          padding-right: 5px;
        }
      }
    }
    @media (max-width: 374px) {
      .nav-element {
        padding-top: 14px;
        img {
          display: none;
        }
        .only-too-small {
          display: inline-block;
        }
        i {
          display: none;
        }
      }
      .nav-element.active {
        padding-top: 11px;
      }
    }
  }

  .gs-fixed-nav {
    position: fixed;
    height: 65px;
    box-shadow: 0 1px 8px #bcbcbc;
    background-color: rgba(0, 0, 0, 0.8);
    .fixed-on-top-only {
      display: inline-block;
      .count-reviews {
        font-size: 14px;
      }
    }
    .vertical-line {
      height: 44px;
    }
    .nav-element {
      height: 65px;
      width: calc(33.33333333% - 86px);
      cursor: pointer;
    }
    .get-more-button {
      display: inline-block;
      width: 150px;
      float: right;
      text-align: right;
    }
    .logo-container {
      display: inline-block;
      width: 95px;
      padding-top: 4px;
      overflow: hidden;
      img:hover {
        cursor: pointer;
      }
      img {
        width: 57px;
      }
    }
    .nav-element.active {
      background-color: white;
      border-top: none;
      padding-top: 3px;
      color: black;
      
    }
    .star-container {
      font-size: 14px;
      display: inline-block;
    }
    @media (max-width: 991px) {
      .star-container {
        img {
          width: 12px;
        }
      }

      .count-reviews {
        font-size: 12px;
      }

      .nav-element {
        width: calc(33.33333333% - 56px);
      }

      .get-more-button {
        width: 60px;
        padding-top: 20px;
        button.read-more-button {
          display: none;
        }
        button.read-more-button-tablet {
          display: inline-block;
          background-color: transparent;
          border: none;
          vertical-align: middle;
          float: right;
          img {
            width: 25px;
            height: 25px;
          }
        }
      }
    }
    @media (max-width: 768px) {
      .nav-element {
        width: calc(33.33333333% - 21px);
        i {
          display: none;
        }
        .star-container {
          img {
            display: inline-block;
          }
        }
      }

      .nav-element.active {
        padding-top: 8px;
      }

      .get-more-button {
        display: none;
      }

      .logo-container {
        display: inline-block;
        width: 60px;
        padding: 13px 8px;
        text-align: left;
        img {
          width: 40px;
        }
      }

      .fixed-on-top-desktop-only {
        display: none;
      }
    }
    @media (max-width: 480px) {
      height: 40px;
      .nav-element {
        height: 40px;
        padding-top: 4px;
        width: calc(33.33333333% - 1px);
        i {
          display: none;
        }
        .star-container {
          top: 1px;
          img {
            display: inline-block;
            width: 10px;
          }
        }
      }

      .nav-element.active {
        padding-top: 4px;
      }

      .logo-container {
        display: none;
      }

      .vertical-line {
        height: 28px;
        margin-top: 7px;
      }

      .fixed-on-top-only {
        .count-reviews {
          font-size: 10px;
        }
      }
    }

    @media (max-width: 374px) {
      .nav-element {
        img {
          display: none;
        }
        .star-container {
          img {
            display: inline-block;
          }
        }
      }
    }
    .mobile-blue-tape {
      height: 45px;
      background: #43b9ad;
      display: none;
      text-align: left;
      padding: 5px 0 0 5px;
      overflow: hidden;
      @media (max-width: 480px) {
        display: block;
      }
      .logo {
        width: 140px;
        display: inline-block;
        vertical-align: top;
      }
      .comment {
        display: block;
        line-height: 10px;
        padding-left: 36px;
        position: relative;
        top: -3px;
        font-size: 9px;
        
      }
      .read-more-button-mobile {
        position: relative;
        top: -43px;
        display: inline-block;
        background-color: transparent;
        border: none;
        vertical-align: middle;
        height: 35px;
        float: right;
        padding: 9px;
        margin-right: 10px;
        .read-more {
          width: 20px;
          height: 20px;
          display: inline-block;
          vertical-align: top;
        }
      }
    }
  }

  .gs-fixed-nav.gs-fixed-nav-visible {
    top: 0;
    transition: top 1s;
  }
  .gs-fixed-nav.gs-fixed-nav-hidden {
    top: -72px;
    transition: top 0.4s;
    @media (max-width: 480px) {
      top: -90px;
    }
  }
</style>
