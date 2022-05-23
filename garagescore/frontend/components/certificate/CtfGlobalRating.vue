<template>
  <section class="global-rating">
    <div class="trophy-container">
      <div class="trophy" :style="{
              backgroundImage: `url(${getTrophyBackgroundUrl(garage[selectedServiceType] ? garage[selectedServiceType].rating : 0)})`,
              marginTop: trophyMarginTop
            }">
        <span>{{((garage[selectedServiceType] && garage[selectedServiceType].rating) || 0) | frenchFloating }}</span>
      </div>
      <h2 class="trophy-comment">
        <span class="black-comment">{{ $t_locale('components/certificate/CtfGlobalRating')('amountOfClients', {amount: ((garage[selectedServiceType] && garage[selectedServiceType].respondentsCount) || 0)}) }}</span>
        {{ getSentence }}
      </h2>
    </div>
  </section>
</template>

<script>
  import DataTypes from "~/utils/models/data/type/data-types";
  import GarageTypes from "~/utils/models/garage.type.js";

  export default {
    data() {
      return {
        trophyMarginTop: '6px',
        DataTypes
      };
    },
    computed: {
      garage() {
        return this.$store.state.certificate.garage;
      },
      selectedServiceType() {
        return this.$store.state.certificate.selectedServiceType;
      },
      getSentence() {
        const options = {name: this.garage.name, serviceType: this.displayServiceType(this.selectedServiceType) }
        if(this.garage.type.includes(GarageTypes.VEHICLE_INSPECTION)) {
          return this.$t_locale('components/certificate/CtfGlobalRating')('sentenceVI', options)
        } else if(this.garage.type.includes(GarageTypes.AGENT)) {
          return this.$t_locale('components/certificate/CtfGlobalRating')('sentenceAgent', options)
        } else if(this.garage.type.includes(GarageTypes.CAR_REPAIRER)) {
          return this.$t_locale('components/certificate/CtfGlobalRating')('sentenceCarRepairer', options)
        } else {
          return this.$t_locale('components/certificate/CtfGlobalRating')('sentenceDealership', options)
        }
      }
    },
    mounted() {
      const style = window.getComputedStyle(document.getElementsByClassName('trophy-container')[0], null);
      const styleTrophy = window.getComputedStyle(document.getElementsByClassName('trophy')[0], null);
      this.trophyMarginTop = (style.height.replace('px', '') - styleTrophy.height.replace('px', '')) / 2 + 'px'
    },
    methods: {
      getTrophyBackgroundUrl(rating) {
        const rouderedRating = Math.round(rating * 2) / 2;
        return `/certificate/images/trophy/${rouderedRating.toString().replace(/\./, ',')}.png`;
      },
      displayServiceType(value) {
        switch (value) {
          case 'Maintenance': return this.$t_locale('components/certificate/CtfGlobalRating')('Maintenance');
          case 'NewVehicleSale': return this.$t_locale('components/certificate/CtfGlobalRating')('NewVehicleSale');
          case 'UsedVehicleSale': return this.$t_locale('components/certificate/CtfGlobalRating')('UsedVehicleSale');
          case 'VehicleInspection': return this.$t_locale('components/certificate/CtfGlobalRating')('VI');
          default :
            return '';
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  .global-rating {
    width: 100%;
    display: inline-block;
    border-bottom: 2px dotted #BCBCBC;
    .bread-crumb {
      font-size: 12px;
      color: #BCBCBC;
      line-height: 32px;
      margin-bottom: 3px;
      .separator {
        font-size: 30px;
        
        position: relative;
        top: 6px;
        padding: 0 5px;
      }
    }
    .trophy-container {
      display: flex;
      flex-flow: row wrap;
    }
    .trophy {
      color: black;
      font-size: 22px;
      width: 82px;
      height: 55px;
      background-size: cover;
      display: inline-block;
      vertical-align: top;
      
      span {
        position: relative;
        top: 30px;
        left: 26px;
      }
    }
    .trophy-comment {
      
      display: inline-block;
      vertical-align: top;
      font-size: 16px;
      color: #757575;
      line-height: 28px;
      width: calc(100% - 82px);
      padding: 9px 18px;
      text-align: justify;
      .black-comment {
        color: black;
        font-weight: bold;
        
      }
    }
    @media (max-width: 991px) {
      .bread-crumb {
        font-size: 10px;
        line-height: 18px;
        .separator {
          font-size: 22px;
          top: 4px;
        }
      }

      .trophy {
        font-size: 14px;
        width: 50px;
        height: 33px;
        span {
          position: relative;
          top: 15px;
          left: 15px;
        }
      }

      .trophy-comment {
        font-size: 12px;
        width: calc(100% - 50px);
        padding: 6px 12px;
        line-height: 18px;
      }
    }
    @media (max-width: 480px) {
      .bread-crumb {
        display: none;
      }

      .trophy {
        margin-top: 11px;
      }
    }
  }
</style>
