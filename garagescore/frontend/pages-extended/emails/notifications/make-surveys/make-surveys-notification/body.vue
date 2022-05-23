<template>
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <BaseHeader
        :title="$t_locale('pages-extended/emails/notifications/make-surveys/make-surveys-notification/body')('title')"
        color="blue"
        logo-url="/images/www/alert/notepad.png"
      ></BaseHeader>
    </tr>
    <tr>
      <td align="center" id="content">
        {{ $t_locale('pages-extended/emails/notifications/make-surveys/make-surveys-notification/body')('greetings') }}<br/><br/>
        <span class="bolded">
          {{ data.changerUserName }},
          <JobHandler v-if="!isGarageScore" :job="data.changerUserJob"></JobHandler>
          <span v-else>{{ $t_locale('pages-extended/emails/notifications/make-surveys/make-surveys-notification/body')('fromGarageScore') }}</span>,
        </span>
        {{ $t_locale('pages-extended/emails/notifications/make-surveys/make-surveys-notification/body')('intro') }}<br><br>
        <span class="bolded color-black">{{ $t_locale('pages-extended/emails/notifications/make-surveys/make-surveys-notification/body')('detailsTitle') }}</span><br><br>
        <span>
          {{ $t_locale('pages-extended/emails/notifications/make-surveys/make-surveys-notification/body')('garagesAmount') }}
          <span class="color-blue">{{ data.modifications && data.modifications.length || 0 }}</span>
        </span>
      </td>
    </tr>
    <tr>
      <td align="center" class="padded-tr button-row">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr align="center">
            <td>
              <table border="0" cellspacing="1" cellpadding="0" width="100%">
                <tr>
                  <td align="center" class="padded bolded bgcolor-darkgrey color-black">
                    <span>{{ $t_locale('pages-extended/emails/notifications/make-surveys/make-surveys-notification/body')('garagesJobs') }}</span>
                  </td>
                  <td align="center" class="padded bolded bgcolor-darkgrey color-black">
                    <span>{{ $t_locale('pages-extended/emails/notifications/make-surveys/make-surveys-notification/body')('GSsurvey') }}</span>
                  </td>
                </tr>
                <tr v-for="modif in data.modifications" :key="modif.garageName">
                  <td align="center" class="padded color-darkgrey bgcolor-grey">
                    <span>{{ modif.garageName }}</span>
                  </td>
                  <td align="center" class="padded color-darkgrey bgcolor-grey" style="min-width:150px">
                    <span v-for="change in modif.changes" :key="change">{{ formatChange(change) }}<br></span>
                    <span v-if="!hasChange(modif.changes)">{{ $t_locale('pages-extended/emails/notifications/make-surveys/make-surveys-notification/body')('noModifs') }}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td align="center" class="button-row">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr align="center">
            <td>
              <table border="0" cellspacing="0" cellpadding="0" width="100%">
                <tr>
                  <td>
                  </td>
                  <td class="button" align="center">
                    <a bgcolor="#EC5601" class="button-text" :href="payload.config.get('publicUrl.app_url') + payload.gsClient.url.getShortUrl('ADMIN') + '/surveys'" target="_blank">{{ $t_locale('pages-extended/emails/notifications/make-surveys/make-surveys-notification/body')('goToScenario') }}</a>
                  </td>
                  <td>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <BaseFooter></BaseFooter>
    </tr>
  </table>
</template>


<script>

import BaseHeader from '../../../../../components/emails/notifications/BaseHeader';
import BaseFooter from '../../../../../components/emails/notifications/BaseFooter';
import JobHandler from '../../../../../components/emails/notifications/JobHandler';


export default {
  layout: 'email',
  components: { BaseHeader, BaseFooter, JobHandler },
  methods: {
    formatChange(change) {
      let delta = 1;
      let result = `${this.$t_locale('pages-extended/emails/notifications/make-surveys/make-surveys-notification/body')(change.type)}`;
      result += change.brand ? ` - ${change.brand}: ` : ': ';
      result += `${this.$t_locale('pages-extended/emails/notifications/make-surveys/make-surveys-notification/body')('J+')}${parseInt(change.prevValue) + delta} ${this.$t_locale('pages-extended/emails/notifications/make-surveys/make-surveys-notification/body')('à')} ${this.$t_locale('pages-extended/emails/notifications/make-surveys/make-surveys-notification/body')('J+')}${parseInt(change.value) + delta}`;
      return result;
    },
    hasChange(changes) {
      return changes.length > 0;
    }
  },
  computed: {
    payload() { return this.$store.getters.payload; },
    data() {
      return (this.payload.contact && this.payload.contact.payload && this.payload.contact.payload.data) || {};
    },
    isGarageScore() {
      if (this.data && this.data.changerUserEmail && this.data.changerUserEmail.includes('garagescore')) {
        return true;
      }
      return false;
    }
  },
}
</script>


<style lang="scss" scoped>
  * {
    font-family: Arial;
  }
  #bg-man {
    background-color: #F1F9FB;
  }
  #man {
    margin: 23px 0;
    height: 146px;
    width: 232px;
    display: block;
  }



  /** --------------------------- **/

  /** ----------Content---------- **/
  #welcome-msg {
    padding-top: 22px;
    padding-bottom: 41px;
    width: 192px;
    height: 24px;
    font-family:Arial;
    font-size: 20px;
    font-weight: bold;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.15;
    letter-spacing: normal;
    color: black;
  }
  #content {
    padding-bottom: 18px;
    padding-left: 20px;
    padding-right: 20px;
    padding-top:0;
    height: 53px;
    font-family:Arial;
    font-size: 14px;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.43;
    letter-spacing: normal;
    text-align: left;
    color: #757575;

  }
  .button-row {
    padding-bottom: 42px;
  }
  .button-text {
    border-radius: 3px;
    background-color: #EC5601!important;
    padding: 0px;
    text-decoration: none;
    border-radius: 3px;
    padding: 15px 30px;
    max-width: 315px;
    display: inline-block;
    font-family:Arial;
    font-size: 14px;
    font-weight: bold;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.14;
    letter-spacing: 0.7px;
    text-align: center;
    color: white;
    /*margin: 0 38px;*/

  }
  /** --------------------------- **/

  /** -----------Footer---------- **/
  #why {
    padding-bottom: 45px;
    font-family:Arial;
    font-size: 20px;
    font-weight: bold;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.15;
    letter-spacing: normal;
    color: black;
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
    font-family:Arial;
    font-size: 14px;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.14;
    letter-spacing: normal;
    text-align: center;
    color: #757575;
  }
  .question {
    padding-left: 20px;
    padding-right: 20px;
    padding-bottom: 21px;
    font-family:Arial;
    font-size: 14px;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.14;
    letter-spacing: normal;
    text-align: left;
    color: #757575;
  }
  #email {
    text-decoration: none;
  }
  #signature {
    padding-left: 20px;
    padding-right: 20px;
    padding-bottom: 25px;
  }
  #sign-part-1 {
    font-family:Arial;
    font-size: 14px;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.14;
    letter-spacing: normal;
    text-align: left;
    color: #757575;
  }
  .bolded {
    font-family:Arial;
    font-size: 14px;
    font-weight: bold;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.14;
    letter-spacing: normal;
    color: #757575;
  }
  .color-blue {
    color: #219ab5;
  }
  .bgcolor-grey {
    background-color: #e0e0e0;
    font-style: italic;
    border-right:1px solid white;
    border-bottom:1px solid white;
  }
  .color-darkgrey {
    color: #757575;
  }
  .bgcolor-darkgrey {
    background-color: #bcbcbc;
    border-right:1px solid white;
    border-bottom:1px solid white;

  }
  .color-black {
    color: black;
  }
  .padded {
    padding: 14px;
  }
  .padded-tr {
    padding-left: 20px;
    padding-right: 20px;
  }
</style>
