<template>
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <img id="logo" :src="icons.logo"/>
      </td>
    </tr>
    <tr>
      <td align="center">
        <div id="title">{{ $t_locale('pages-extended/emails/notifications/new-R2/body')('title') }}</div>
      </td>
    </tr>
    <tr>
      <td align="center" id="line">
        <div v-for="i in 5" v-bind:key="i" class="line" :id="'line-' + i"></div>
      </td>
    </tr>
    <tr id="bg-man">
      <td align="center">
        <img id="man" width="86" height="150" :src="icons.welcome"/>
      </td>
    </tr>
    <tr>
      <td align="center" id="welcome-msg">
        {{ $t_locale('pages-extended/emails/notifications/new-R2/body')('goodNews') }}
      </td>
    </tr>
    <tr>
      <td align="center" id="content">
        {{ $t_locale('pages-extended/emails/notifications/new-R2/body')('greetings') }} {{ addressee.getFullName() }},<br/><br/><br/>
        {{ $t_locale('pages-extended/emails/notifications/new-R2/body')('content', { agentName }) }}
      </td>
    </tr>
    <tr><CentralButton :text="$t_locale('pages-extended/emails/notifications/new-R2/body')('connectLink')" :url="connectLink"/></tr>

    <tr><BaseFooter></BaseFooter></tr>

  </table>
</template>

<script>
  import BaseFooter from '../../../../components/emails/notifications/BaseFooter';
  import CentralButton from '../../../../components/emails/general/CentralButton.vue';

  export default {
    layout: 'email',
    components: { BaseFooter, CentralButton },
    computed: {
      payload() { return this.$store.getters.payload; },
      connectLink() {
        return encodeURI(this.payload.baseUrl + this.gsClient.url.getShortUrl('ADMIN'));
      },
      gsClient() {
        return this.payload.gsClient;
      },
      config() {
        return this.payload.config;
      },
      icons() {
        return {
          logo: `${this.$store.state.wwwUrl}/logo/logo-custeed-long-286px-rgb.png`,
          welcome: this.gsClient.latestStaticUrl('/images/www/R1-R2/welcome.png')
        }
      },
      addressee() {
        return this.payload.addressee;
      },
      agent() {
        return this.payload.agent;
      },
      agentName() {
        return this.agent && this.agent.publicDisplayName;
      }
    },
  }
</script>


<style lang="scss" scoped>
  /** ----------Header----------- **/
  #logo {
    display: block;
    width: 286px;
    margin: 13px 0;
  }
  #title {
    display: block;
    width: 295px;
    padding-bottom: 29px;
    font-family: Arial;
    font-size: 10px;
    font-weight: bold;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.6;
    letter-spacing: 2.1px;
    text-align: center;
    color: #757575;
  }

  #line {
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

  #bg-man {
    background-color: #F1F9FB;
  }
  #man {
    margin: 23px 0;
    height: 150px;
    width: 136.5px;
    display: block;
  }
  /** --------------------------- **/

  /** ----------Content---------- **/
  #welcome-msg {
    padding-top: 22px;
    padding-bottom: 41px;
    width: 192px;
    height: 24px;
    font-family: Arial;
    font-size: 20px;
    font-weight: bold;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.15;
    letter-spacing: normal;
    color: black;
  }
  #content {
    padding-bottom: 37px;
    padding-left: 20px;
    padding-right: 20px;
    height: 53px;
    font-family: Arial;
    font-size: 14px;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.14;
    letter-spacing: normal;
    text-align: left;
    color: #757575;
  }
  #button-row {
    padding-bottom: 61px;
  }
  #button {
    border-radius: 3px;
  }
  #button-text {
    text-decoration: none;
    border-radius: 3px;
    padding: 15px 55px;
    border: 1px solid #e9703e;
    display: inline-block;
    font-family: Arial;
    font-size: 14px;
    font-weight: bold;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.14;
    letter-spacing: 0.7px;
    text-align: center;
    color: white;
  }
  /** --------------------------- **/

  /** -----------Footer---------- **/
  #question {
    padding-left: 20px;
    padding-right: 20px;
    padding-bottom: 33px;
    font-family: Arial;
    font-size: 14px;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.14;
    letter-spacing: normal;
    text-align: left;
    color: #757575;
  }
  /** --------------------------- **/
</style>
