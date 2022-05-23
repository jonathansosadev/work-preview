
<template>
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr class="tr-header">
      <td >
        <div class="title">{{ title }}</div>
      </td>
    </tr>
    <tr>
      <td>
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td v-for="kpi in displayableKPIs">
              <div class="kpi">
                <img class="kpi__icon" height="50" width="50" :src="payload.gsClient.latestStaticUrl(kpi.icon)"/>
              </div>
            </td>
          </tr>
          <tr>
            <td v-for="kpi in displayableKPIs">
              <div class="kpi">
                <span class="kpi__title">{{ kpi.title }}</span>
              </div>
            </td>
          </tr>
          <tr>
            <td v-for="kpi in displayableKPIs">
              <div class="kpi">
                <span class="kpi__value">{{ kpi.value }}{{ kpi.suffix || '' }}</span>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</template>

<script>
export default {
  computed: {
    payload() { return this.$store.getters.payload; },
    displayableKPIs() {
      return this.kpis || [];
    }
  },
  props: {
    title: String,
    kpis: Array
    // [
    //   {
    //     icon: the path to the icon,
    //     title: the kpi title
    //     value: the kpi value
    //   }, ...
    // ]
  }
}
</script>

<style lang="scss" scoped>
  #logo {
    display: block;
    width: 286px;
    margin-bottom: 20px;
  }
  .tr-header {
    margin-top: 10px;
  }
  .tr-icon {
    &--fiesta {
      height: 215px;
    }
  }
  .kpi {
    width: 187px;
    text-align:center;
    margin-bottom: 20px;
    &__icon {
      width:50px;
      height:50px;
    }
    &__title {
      color: #757575;
      font-weight: bold;
    }
    &__value {
      color: #757575;
    }
  }
  .title {
    width: 600px;
    text-align:center;
    font-weight: bold;
    color: black;
    margin-bottom: 20px;
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
      color: #c9984f;
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
  #header-icon {
    height: 50px;
    display: block;
    margin-bottom: 20px;
  }
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
      background-color: #c9984f!important;
    }
  }
  .header-icon-wrapper {
    padding-top: 20px;
    &--fiesta {
      padding-top:95px;
    }
  }
  #header-band-img {
    width: 117px;
    height: 25px;
    margin: 2px 0 0 5px;
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
  .padded-tr {
    padding-left: 20px;
    padding-right: 20px;
  }
</style>
