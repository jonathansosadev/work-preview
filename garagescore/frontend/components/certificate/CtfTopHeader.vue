<template>
  <section class="gs-top-header" :class="customHeader" :style="{backgroundColor, zIndex: showModal ? 20 : 15 }">
    <router-link target="_blank" :to="`${$t_locale('components/certificate/CtfTopHeader')('landingLanguage')}`" >
      <div class="blue-tape">
        <div class="blue-tape-content">
          <div class="blue-bubble"></div>
          <div class="top-header-body">
            <!--<img :src="lib.client.staticUrl('/images/www/certificate/header/logo.png')">-->
            <img class="logo" :src="(useCusteedHeader? '/logo/logo-custeed-long.svg' : '/certificate/images/header/logo.svg')" alt="Logo">
            <span class="comment">
              {{ $t_locale('components/certificate/CtfTopHeader')('title', { title: title }) }}
            </span>
            <!--<span class="comment-mobile">la réelle satisfaction des clients {{ $store.getters['certificate/garageType'](2) }}</span>-->
            <button class="read-more-button">{{ $t_locale('components/certificate/CtfTopHeader')('knowMore') }}</button>
            <button class="read-more-button-mobile" v-on:click.prevent="setModalHelpVisible(true, $event)">
              <img class="logo" src="/certificate/images/header/savoir-plus.svg" alt="Savoir Plus">
            </button>
          </div>
        </div>
      </div>
    </router-link>
  </section>
</template>


<script>
  export default {
    props: {
      useCusteedHeader: Boolean
    },

    data() {
      return {
        backgroundColor: '#6b6b6b',
        showModal: false
      }
    },
    mounted() {
      const checkScroll = () => {
        const scrollTop = document.getElementsByTagName('body')[0].scrollTop || document.getElementsByTagName('html')[0].scrollTop;
        let scrollRef = 270;
        if (window.innerWidth < 991) {
          scrollRef = 200;
        }
        if (window.innerWidth < 480) {
          scrollRef = 190;
        } else {
          this.backgroundColor = scrollTop > 0 && scrollTop <= scrollRef ? '#6b6b6b' : 'transparent';
        }
      };
      document.addEventListener("scroll", checkScroll);
      checkScroll();
    },
    methods: {
      setModalHelpVisible(visible) {
        this.$store.commit('certificate/SET_MODAL_HELP_VISIBLE', visible);
      }
    },
    computed: {
      title() {
        if (this.garage.type === 'VehicleInspection') {
          return this.$t_locale('components/certificate/CtfTopHeader')('vehicleInspectionTitle');
        }
        if (!this.garage.subscriptions.NewVehicleSale && !this.garage.subscriptions.UsedVehicleSale) {// little change for concessions, we check the subscriptions
          return this.$t_locale('components/certificate/CtfTopHeader')('garagesTitle');
        }
        return this.$t_locale('components/certificate/CtfTopHeader')('defaultTitle')
      },
      garage() {
        return this.$store.state.certificate.garage;
      },
      customHeader() {
        return {
          'custeed-header': this.useCusteedHeader
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  $White: #fff;
  $Blue-gs: #43b9ad;
  .gs-top-header {
    position: absolute;
    height: 80px;
    width: 100%;
    padding-top: 24px;
    margin-bottom: 20px;
    -moz-transition: padding 0.1s ease;
    -webkit-transition: padding 0.1s ease;
    -o-transition: padding 0.1s ease;
    transition: padding 0.1s ease;
    .blue-tape {
      height: 62px;
      width: 100%;
      background-color: $Blue-gs;
    }
    img.logo {
      max-width: 290px;
      width: 290px;
    }
    .comment {
      padding-left: 7px;
      font-size: 16px;
    }
    .comment-mobile {
      display: none;
    }
    .blue-tape-content {
      height: 100%;
      width: 100%;
      max-width: 1170px;
      margin: auto;
    }
    .blue-bubble {
      width: 88px;
      height: 88px;
      display: inline-block;
      border-radius: 50%;
      background-color: $Blue-gs;
      top: -13px;
      position: relative;
    }
    .top-header-body {
      display: inline-block;
      color: $White;
      width: 100%;
      vertical-align: top;
      line-height: 62px;
      position: relative;
      top: -95px;
      padding-left: 13px;
    }
    img {
      display: inline-block;
      vertical-align: top;
    }
    button.read-more-button {
      border: 1px solid $White;
      border-radius: 3px;
      line-height: 16px;
      font-size: 16px;
      padding: 10px 20px;
      background-color: transparent;
      float: right;
      margin: 12px 25px;
    }
    button.read-more-button-mobile {
      display: none;
    }
    button.read-more-button:hover {
      background-color: $White;
      color: $Blue-gs;
    }
    @media (max-width: 1200px) {
      .blue-tape-content {
        max-width: 970px;
      }
    }
    @media (max-width: 991px) {
      height: 50px;
      padding: 15px 0;
      .top-header-body {
        top: -61px;
        padding-left: 4px;
        line-height: 39px;
      }

      .comment {
        font-size: 12px;
      }
      .blue-tape-content {
        max-width: 750px;
      }
      .blue-bubble {
        width: 54px;
        height: 54px;
        border-radius: 27px;
        top: -9px;
        left: -4.5px;
        position: relative;
      }

      .blue-tape {
        height: 36px;
        padding-left: 15px;
      }

      img {
        width: 170px;
      }

      img.logo {
        max-width: 290px;
        width: 180px;
      }

      button.read-more-button {
        font-size: 12px;
        padding: 3px 7px;
        margin: 7px 28px;
      }
    }

    @media (max-width: 768px) {
      .blue-tape-content {
        max-width: 750px;
      }
      button.read-more-button {
        display: none;
      }

      button.read-more-button-mobile {
        display: inline-block;
        background-color: transparent;
        border: none;
        vertical-align: middle;
        height: 35px;
        float: right;
        padding: 9px;
        margin-right: 10px;
        img {
          width: 20px;
          height: 20px;
        }
      }

      .comment {
        font-size: 10px;
      }
    }

    @media (max-width: 610px) {
      .blue-tape-content {
        max-width: 750px;
      }
      .comment {
        font-size: 8.7px;
        
      }
    }

    @media (max-width: 480px) {
      .blue-tape-content {
        max-width: 750px;
      }
      position: absolute;

      .comment {
        display: block;
        line-height: 10px;
        padding-left: 43px;
        position: relative;
        top: -5px;
      }

      .blue-tape {
        height: 46px;
      }

      button.read-more-button-mobile {
        position: relative;
        top: -43px;
      }
    }
  }

  .gs-top-header.fixed-on-scroll {
    .blue-tape {
      display: none;
    }

    @media (max-width: 480px) {
      position: absolute;
      padding: 0;
      .blue-tape {
        padding-top: 5px;
        height: 51px;
        display: inline-block;
      }
    }
  }

  .custeed-header {
    padding-top: 0;

    .blue-tape {
      height: 90px;
      background: $custeedBrandColor;

      .top-header-body {
        margin-top: 18px;
        padding-left: 0;

        img {
          height: 57px;
          text-align: left;
          width: fit-content;
        }
      }
    }

    .blue-bubble {
      pointer-events: none;
      visibility: hidden;
    }

    .top-header-body {
      .comment {
        display: none;
      }
    }
  }
@media (max-width: $breakpoint-min-sm) {
  .custeed-header {
    .blue-tape {
      height: 60px;

      .top-header-body {

        img {
          height: 40px;
          text-align: left;
          width: fit-content;
          position: relative;
          top: -5px;
        }
      }
    }
    .read-more-button-mobile {
      top: -1px!important;
      img {
        height: 2rem!important;
      }
    }
  }
  
}
</style>
