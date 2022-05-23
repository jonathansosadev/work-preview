<template>
  <table class="counter-munged" width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr class="tr-header">
      <td class="header-band" :class="`header-band--${color}`">
        <table class="counter-munged" width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td><div class="header-band-txt">{{ prefix }}</div></td>
            <td align="left"><img id="header-band-img" height="23" width="88" :src="custeedLogo"/></td>
          </tr>
        </table>
      </td>
    </tr>
    <tr :class="fiesta ? 'tr-icon--fiesta' : 'tr-icon'" :style="headerIconStyle">
      <td>
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td width="20px"></td>
            <td><div class="title" :class="`title--${color}`">{{ title }}</div></td>
            <td width="20px"></td>
          </tr>
        </table>
      </td>
    </tr>
    <tr v-if="subTitle">
      <td class="padded-tr" align="center">
        <img v-if="brandLogoUrl" class="brand-logo" :src="brandLogoUrl">
        <div class="subtitle">{{ subTitle }}</div>
      </td>
    </tr>
    <tr>
      <td align="center" id="line">
        <div v-for="i in 5" v-bind:key="i" class="line" :id="'line-' + i"></div>
      </td>
    </tr>
  </table>
</template>

<script>
export default {
  computed: {
    payload() { return this.$store.getters.payload; },
    prefix() {
      if (this.noBannerPrefix) {
        return ''
      }
      return this.bannerPrefix || this.$t_locale('components/emails/notifications/BaseHeader')('headerText');
    },
    headerIconStyle() {
      return this.fiesta ? {
        'background-image': 'url(' + this.payload.gsClient.latestStaticUrl('/images/www/alert/fiesta.png') + ')',
        'background-size': 'contain',
        'background-repeat': 'no-repeat'
      } : {};
    },
    custeedLogo() {
      return `/logo/logo-custeed-small-white.png`;
    },

  },
  props: {
    bannerPrefix: String,
    noBannerPrefix: Boolean,
    title: String,
    subTitle: String,
    color: String,
    brandLogoUrl: String,
    fiesta: Boolean
  }
}
</script>

<style lang="scss" scoped>
  .counter-munged {
    min-width: 100%; // That counters the effect of GMail adding munged class that breaks the layout
  }
  .tr-header {
    margin-top: 10px;
  }
  .tr-header {
    margin-top: 10px;
  }
  .tr-icon {
    &--fiesta {
      height: 180px;
    }
  }
  .title {
    border-top:30px solid transparent;
    display: block;
    font-size: 20px;
    font-family: Arial Narrow,Arial,sans-serif;
    font-weight: bold;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.3;
    letter-spacing: 2px;
    text-align: center;
    &--blue {
      color: #219ab5;
    }
    &--green {
      color: #02b151;
    }
    &--red {
      color: #d14836;
    }
    &--yellow {
      color: #e9b330;
    }
    &--gold {
      color: #C8974F;
    }
  }
  .subtitle {
    display: block;
    margin-top: 15px;
    font-family: Arial Narrow,Arial,sans-serif;
    font-size: 16px;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.38;
    letter-spacing: 1.6px;
    text-align: center;
    color: #000;
  }
  #line {
    padding-top: 22px;
    padding-bottom: 29px;
  }
  .line {
    display: inline-block;
    width: 25px;
    height: 3px;
    padding-left: 0;
  }
  #line-1{background-color: #229ab5;}
  #line-2{background-color: #d55342;}
  #line-3{background-color: #e9b432;}
  #line-4{background-color: #03b152;}
  #line-5{background-color: #ca9951;}
  .header-band{
    font-weight: bolder;
    display:block;
    text-align:center;
    height:35px;
    &--blue {
      background-color: #219ab5!important;
    }
    &--green {
      background-color: #02b151!important;
    }
    &--red {
      background-color: #d14836!important;
    }
    &--yellow {
      background-color: #e9b330!important;
    }
    &--gold {
      background-color: #C8974F!important;
    }
  }
  #header-band-img {
    width: 88px;
    height: 23px;
    margin: 4px 0 0 5px;
  }
  .header-band-txt {
    height: 35px;
    line-height: 35px;
    font-size: 12px;
    font-weight: normal;
    font-family: Trebuchet MS, Arial Narrow,Arial,sans-serif;
    color: white;
    text-align: right;
    letter-spacing: 1.2px;
  }
  .brand-logo {
    margin-right: 14px;
  }
  .padded-tr {
    padding-left: 20px;
    padding-right: 20px;
  }
</style>
