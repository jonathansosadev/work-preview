<template>
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <img id="logo" :src="icons.logo"/>
      </td>
    </tr>
    <tr>
      <td align="center">
        <div id="title">{{ $t_locale('components/emails/pages/notifications/WelcomeEmail')('title') }}</div>
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
        {{ $t_locale('components/emails/pages/notifications/WelcomeEmail')('welcome') }}
      </td>
    </tr>
    <!-- SUBSCRIPTION EXPLANATION MESSAGE -->
    <tr>
      <td align="center" id="content">
        {{ $t_locale('components/emails/pages/notifications/WelcomeEmail')('greetings') }},<br/><br/><br/>
        {{ $t_locale('components/emails/pages/notifications/WelcomeEmail')('welcomeToGarageScore') }}<br/><br/>
        <p>
          {{ $t_locale('components/emails/pages/notifications/WelcomeEmail')('subscription') }}
          <template>
            {{ $t_locale('components/emails/pages/notifications/WelcomeEmail')('yourGarageScoreAdmin') }}
          </template>
          {{ $t_locale('components/emails/pages/notifications/WelcomeEmail')('subscriptionFinalPart') }}
        </p>
      </td>
    </tr>
    <tr><CentralButton :text="$t_locale('components/emails/pages/notifications/WelcomeEmail')('connect')" :url="url"/></tr>
    <tr>
      <td align="center" id="why">
        {{ $t_locale('components/emails/pages/notifications/WelcomeEmail')('why') }}
      </td>
    </tr>
    <tr>
      <td align="center" class="row-labels-3">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <td align="center" class="label">
            <img class="label-img" :src="icons.review"/>
            <div class="label-text">{{ $t_locale('components/emails/pages/notifications/WelcomeEmail')('review') }}</div>
          </td>
          <td align="center" class="label">
            <img class="label-img" :src="icons.unsatisfied"/>
            <div class="label-text">{{ $t_locale('components/emails/pages/notifications/WelcomeEmail')('unsatisfied') }}</div>
          </td>
          <td align="center" class="label">
            <img class="label-img" :src="icons.lead"/>
            <div class="label-text">{{ $t_locale('components/emails/pages/notifications/WelcomeEmail')('lead') }}</div>
          </td>
        </table>
      </td>
    </tr>
    <tr>
      <td align="center" class="row-labels-2">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <td align="center" class="label">
            <img class="label-img" :src="icons.analytics"/>
            <div class="label-text">{{ $t_locale('components/emails/pages/notifications/WelcomeEmail')('analytics') }}</div>
          </td>
          <td align="center" class="label">
            <img class="label-img" :src="icons.answer"/>
            <div class="label-text">{{ $t_locale('components/emails/pages/notifications/WelcomeEmail')('answer') }}</div>
          </td>
        </table>
      </td>
    </tr>
    <tr><BaseFooter></BaseFooter></tr>
  </table>
</template>

<script>
import BaseFooter from '../../notifications/BaseFooter';
import CentralButton from '../../general/CentralButton.vue';

export default {
    name: "WelcomeEmail",
    components: { BaseFooter, CentralButton },
    props: {
        url: {
            type: String,
            default: ""
        },
        token:{
            type: String,
            default: ""
        },
        icons: {
            type: Object,
            default() {
                return {};
            }
        },
        config:{
            type: String,
            default: ""
        },
        gsClient:{
            type: String,
            default: ""
        },
    }
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
    width: 86px;
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
    line-height: 1.5;
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
    line-height: 1.5;
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
  #why {
    padding-bottom: 45px;
    font-family: Arial;
    font-size: 20px;
    font-weight: bold;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.15;
    letter-spacing: normal;
    color: black;
  }
  .row-labels-3 {
    padding-left: 20px;
    padding-right: 20px;
    padding-bottom: 34px;
  }
  .row-labels-2 {
    padding-left: 20px;
    padding-right: 20px;
    padding-bottom: 40px;
  }
  .label {
    vertical-align: top;
    width: 146px;
  }
  .label-img {
    display: block;
    padding-bottom: 11px;
    width: 34px;
  }
  .label-text {
    width: 146px;
    font-family: Arial;
    font-size: 14px;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.14;
    letter-spacing: normal;
    text-align: center;
    color: #757575;
    line-height: 1.5;
  }
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
    line-height: 1.5;
  }

  /** --------------------------- **/
</style>