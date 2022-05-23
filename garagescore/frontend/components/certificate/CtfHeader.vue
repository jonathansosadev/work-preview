<template>
  <header class="gs-header" :class="gsHeaderBackgroundBinding + (useCusteedHeader? ' CusteedContext' : '')">
    <div class="grey-hover">
      <div class="container">
        <div class="row title-body">
          <div class="col-md-8 col-xs-12">
            <div class="row garage-info-container" id="garage-info-container">
              <div class="garage-name-container">
                <h1 class="garage-name garage-type">{{GarageTypes.displayName( garage.type )}}</h1>
                <h1 class="garage-name"
                    v-html="bracketsToNewLine(garage.name)"></h1>
                <div class="garage-address" itemscope itemprop="address" itemtype="http://schema.org/PostalAddress"
                     v-if="garage.streetAddress || garage.city">
                  <span itemprop="streetAddress">{{ garage.streetAddress }}</span>,
                  <span itemprop="postalCode"> {{ garage.postalCode }} </span>
                  <span itemprop="addressLocality"> {{ garage.city }} </span>
                  <meta itemprop="addressRegion" :content="garage.region">
                  <meta itemprop="addressCountry" :content="garage.countryCode">
                </div>
                <div itemprop="geo" itemscope itemtype="http://schema.org/GeoCoordinates" v-if="garage.latitude">
                  <meta itemprop="latitude" :content="garage.latitude"/>
                  <meta itemprop="longitude" :content="garage.longitude"/>
                </div>
              </div>
              <meta itemprop="image" :content="garage.brandLogos[0]"/>
              <div class="brand-logo-container" v-for="(brandLogo, index) in garage.brandLogos"
                   v-if="currentBrandLogoIndex === index"
                   :style="{backgroundImage: 'url(' + brandLogo + ')'}">
              </div>
            </div>
            <div class="row">
              <div class="col-xs-12 yes-ratio-container" itemscope itemprop="aggregateRating"
                   itemtype="http://schema.org/AggregateRating">
                                <span class="y">
                                    <meta itemprop="ratingValue" :content="garage.rating"/>
                                    <meta itemprop="bestRating" content="10"/>
                                    <meta itemprop="worstRating" content="0"/>
                                    <meta itemprop="ratingCount" :content="$store.getters['certificate/respondentsCount']"/>
                                </span>
              </div>
            </div>
            <div class="row garage-info-container-2">
              <div class="respondends-count-container">
                <div class="respondends-count-container-1">
                  <!--<span class="star-container">  <img :src="getStarBetween(0,2, garage.rating)"> <img :src="getStarBetween(2,4, garage.rating)"> <img :src="getStarBetween(4,6, garage.rating)"> <img :src="getStarBetween(6,8, garage.rating)"> <img :src="getStarBetween(8,10, garage.rating)"></span>-->

                  <StarsScore class="star-container" :score="garage.rating / 2"></StarsScore>
                  <span class="garage-rating"> {{ garage.rating | frenchFloating }}</span><span class="garage-rating-over-10">&nbsp;/10</span>
                </div>
                <div class="respondends-count-container-2">
                  <span class="respondends-count">{{ garage.respondentsCount | spacedNumber }}</span>
                  <span class="respondends-count-comment"> {{ $t_locale('components/certificate/CtfHeader')('reviews') }}</span>
                </div>
              </div>
              <div v-show="garage.openingHours" :class="'col-xs-12 ' + (isOpen ? 'is-open' : 'is-close')">
                {{ $t_locale('components/certificate/CtfHeader')('garageStatus', { status: isOpen ? 'open' : 'closed' }) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
  import GarageTypes from '../../../common/models/garage.type.js';

  export default {
    props: {
      useCusteedHeader: Boolean
    },
    data() {
      return {
        currentBrandLogoIndex: 0,
        titlePaddingTop: '0',
        brandLogoChangeDelay: 3000,
        GarageTypes
      };
    },
    mounted() {
      if (this.garage.name && this.garage.name.length < 30 && !this.garage.name.match(/\(/) && window.innerWidth > 768) {
        this.titlePaddingTop = '16px';
      }

      if (this.garage.brandLogos.length < 2) return;
      const self = this;
      setInterval(() => {
        if (self.currentBrandLogoIndex === (self.garage.brandLogos.length - 1)) {
          self.currentBrandLogoIndex = 0;
          return;
        }
        self.currentBrandLogoIndex++;
      }, this.brandLogoChangeDelay);
    },
    methods: {
      bracketsToNewLine(str) {
        return str && str.toString().replace(/\(([^\)]*)\)/, '<br>$1');
      },
      getStarBetween(min, max, ratio) {
        if (ratio <= min) {
          return '/certificate/images/stars/empty.png';
        }
        if (ratio >= max) {
          return '/certificate/images/stars/full.png';
        }
        return Math.floor(ratio + 0.5) >= ((min + max) / 2)
          ? '/certificate/images/stars/half.png'
          : '/certificate/images/stars/empty.png';
      }
    },
    computed: {
      garage() {
        return this.$store.state.certificate.garage
      },
      gsHeaderBackgroundBinding() {
        return (this.garage && this.garage.type === GarageTypes.MOTORBIKE_DEALERSHIP) ?
          'gs-header-moto' :
          'gs-header-auto';
      },
      isOpen() {
        return this.$store.state.certificate.isOpen;
      }
    },
  }
</script>

<style lang="scss" scoped>

.gs-header {
  color: #000000;
  height: 500px;
  width: 100%;
  background-size: cover;
  background-repeat: no-repeat;
  background-position-x: right;
  background-position-y: center;
  &.gs-header-auto {
    background-image: URL('/certificate/images/header/bg-certif-auto.jpg');
  }
  &.gs-header-moto {
    background-image: URL('/certificate/images/header/bg-certif-moto.jpg');
  }
  .grey-hover {
    width: 100%;
    height: 100%;
    padding-top: 100px;
    background-color: transparent;
  }
  .brand-logo-container {
    margin-top: 15px;
    width: 156px;
    height: 90px;
    display: inline-block;
    background-position: center;
    background-repeat: no-repeat;
    background-size: contain;
  }
  .garage-name-container {
    width: calc(100% - 160px);
    display: inline-block;
    vertical-align: top;
    padding-right: 20px;
  }
  .container .title-body {
  }
  .garage-info-container   {
    border-bottom: 2px dotted #757575;
    padding-bottom: 10px;
  }
  #garage-info-container {
    border-bottom: 2px dotted #757575;
    padding-bottom: 14px;
  }
  .garage-address {
    font-size: 14px;

    display: block;
    color: #757575;
  }
  .garage-name {
    line-height: 42px;
    font-size: 35px;
    font-weight: 700;
    margin-bottom: 10px;
    margin-top: 0;
  }
  .garage-type {
    margin-top: 20px;
    margin-bottom: 5px;
    font-size: 30px;
    color: $dark-grey;
  }

  .respondends-count-container {
    display: block;
    margin-top: 20px;
    font-size: 34px;
  }
  .respondends-count-container-1 {
    height: 28px;
  }
  .respondends-count-container-2 {
    font-size: 23px;
    font-weight: 600;
    margin-top: 20px;
  }
  .star-container {
    display: inline-block;
    vertical-align: top;
    height: 26px;
    font-size: 30px;
    img {
      vertical-align: top;
      height: 100%;
    }
    padding-right: 10px;
  }
  .garage-rating {
    position: relative;
    top: -6px;
  }
  .garage-rating,
  .garage-rating-over-10 {
    display: inline-block;
    vertical-align: top;
    font-weight: 900;
  }
  .garage-rating-over-10 {
    font-size: 75%;
    line-height: 40px;
  }
  .respondends-count-comment {
    font-size: 50%;
    font-weight: normal;
    margin-left: 5px;
  }
  .is-open,
  .is-close {
    font-size: 16px;
    display: none;
    padding: 0;
  }
  .is-open {
    color: #00b700;
  }
  .is-close {
    color: #ddd;
  }

  @media (max-width: 1200px) {
    .garage-name {
      line-height: 36px;
      font-size: 30px;
    }
  }

  @media (max-width: 991px) {
    height: 320px;
    &.gs-header-auto {
      background-image: URL('/certificate/images/header/bg-certif-auto-tablet.jpg');
    }
    &.gs-header-moto {
      background-image: URL('/certificate/images/header/bg-certif-moto-tablet.jpg');
    }
    .grey-hover {
      padding-top: 58px;
    }

    &.CusteedContext {
      .grey-hover {
        padding-top: 70px;
      }
    }

    & {
    height: 385px !important;
    }

    .brand-logo-container {
      width: 110px;
      height: 80px;
    }

    .garage-name-container {
      width: calc(100% - 120px);
      height: 120px;
    }

    .garage-name {
      line-height: 36px;
      font-size: 30px;
      margin-bottom: 0;
      max-height: 72px;
      overflow: hidden;
    }

    .garage-address {
      position: relative;
      top: -8px;
      padding-bottom: 2px;
      color: #757575;
    }

    .respondends-count-container {
      font-size: 27px;
    }
    .respondends-count-container-1 {
      height: 23px;
    }
    .star-container {
      height: 23px;
    }
  }
  @media (max-width: 768px) {
    height: 320px;
    .is-open,
    .is-close {
      display: none;
    }

    .garage-info-container {
      margin: 0;
    }
    .garage-info-container-2 {
      margin: 0;
    }
  }
  @media (max-width: 480px) {
    height: 305px;
    &.gs-header-auto {
      background-image: URL('/certificate/images/header/bg-certif-auto-smartphone.jpg');
    }
    &.gs-header-moto {
      background-image: URL('/certificate/images/header/bg-certif-moto-smartphone.jpg');
    }
    .is-open,
    .is-close {
      display: none;
    }
    .brand-logo-container {
      width: 85px;
      height: 75px;
    }

    .garage-name-container {
      width: calc(100% - 90px);
    }

    .garage-name {
      line-height: 28px;
      font-size: 18px;
      max-height: 56px;
      text-overflow: ellipsis;
      margin-top: 1rem;
      margin-bottom: 0.5rem;
    }

    .garage-address {
      top: 0;
      padding-bottom: 10px;
      font-size: 12px;
      color: #757575;
    }
    .respondends-count-container {
      font-size: 20px;
    }
    .garage-rating {
      position: relative;
      top: 0;
    }
    .garage-rating,
    .garage-rating-over-10 {
      line-height: 16px;
    }
    .respondends-count-container-1 {
      height: 14px;
    }
    .respondends-count-container-2 {
      margin-top: 10px;
    }
    .star-container {
      position: relative;
      top: -4px;
      font-size: 22px;
    }
  }
}

.gs-header.CusteedContext {
  @media (max-width: 991px) {
    .garage-name-container {
      height: 170px;
    }
  }
}
</style>
