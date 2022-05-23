<template>
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <BaseHeader
          :title="$t_locale('pages-extended/emails/notifications/make-surveys/make-surveys-alert/body')('title')"
          color="blue"
          logo-url="/images/www/alert/notepad.png"
        />
      </tr>
      <tr id="bg-man">
        <td align="center">
          <img id="man" height="150" :src="payload.gsClient.latestStaticUrl('/images/www/alert/make-surveys.png')"/>
        </td>
      </tr>
      <tr>
        <td align="center" id="content">
          {{ $t_locale('pages-extended/emails/notifications/make-surveys/make-surveys-alert/body')('greetings') }}<br/><br/>
          {{ $t_locale('pages-extended/emails/notifications/make-surveys/make-surveys-alert/body')('intro') }}<br/><br/>
          <div class="bolded">{{ $t_locale('pages-extended/emails/notifications/make-surveys/make-surveys-alert/body')('introQuestion') }}</div>
        </td>
      </tr>
      <tr>
        <td align="center" id="button-row">
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr align="center">
              <td>
                <table border="0" cellspacing="0" cellpadding="0" width="100%">
                  <tr>
                    <td class="button" align="center" bgcolor="#ed5600">
                      <a class="button-text" :href="payload.config.get('publicUrl.app_url') + payload.gsClient.url.getShortUrl('ADMIN') + '/surveys?results=yes'" target="_blank">{{ $t_locale('pages-extended/emails/notifications/make-surveys/make-surveys-alert/body')('yes') }}</a>
                    </td>
                    <td class="button" align="center" bgcolor="#ed5600">
                      <a class="button-text" :href="payload.config.get('publicUrl.app_url') + payload.gsClient.url.getShortUrl('ADMIN') + '/surveys?results=partially'" target="_blank">{{ $t_locale('pages-extended/emails/notifications/make-surveys/make-surveys-alert/body')('partially') }}</a>
                    </td>
                    <td class="button" align="center" bgcolor="#ed5600">
                      <a class="button-text" :href="payload.config.get('publicUrl.app_url') + payload.gsClient.url.getShortUrl('ADMIN') + '/surveys?results=no'" target="_blank">{{ $t_locale('pages-extended/emails/notifications/make-surveys/make-surveys-alert/body')('no') }}</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center" id="question">
          <a :href="payload.config.get('publicUrl.app_url') + payload.gsClient.url.getShortUrl('ADMIN') + '/surveys?results=unsubscribed'" target="_blank">{{ $t_locale('pages-extended/emails/notifications/make-surveys/make-surveys-alert/body')('notConcerned') }}</a>
        </td>
      </tr>
      <tr>
        <BaseFooter/>
      </tr>
  </table>
</template>


<script>

import BaseHeader from '../../../../../components/emails/notifications/BaseHeader';
import BaseFooter from '../../../../../components/emails/notifications/BaseFooter';

export default {
  layout: 'email',
  components: { BaseHeader, BaseFooter },
  computed: {
    payload() { return this.$store.getters.payload; }
  },
}
</script>


<style lang="scss" scoped>

  /** ----------Header----------- **/

  #bg-man {
    background-color: #F1F9FB;
  }
  #man {
    margin: 23px 0;
    height: 146px;
    width: 232px;
    display: block;
  }
  #content {
    padding-left: 20px;
    padding-right: 20px;
    padding-top:30px;
    height: 53px;
    font-family: Arial;
    font-size: 14px;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.43;
    letter-spacing: normal;
    text-align: left;
    color: #757575;
  }
  #button-row {
    padding: 50px 0;
  }
  .button {
    border-radius: 3px;
    background-color: transparent!important;
    max-width: 200px;
  }
  .button-text {
    text-decoration: none;
    border-radius: 3px;
    padding: 15px 40px;
    max-width: 200px;
    border: 1px solid #EC5601;
    display: inline-block;
    font-family: Arial;
    font-size: 14px;
    font-weight: bold;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.14;
    letter-spacing: 0.7px;
    text-align: center;
    color: #EC5601;
    /*margin: 0 38px;*/

  }
  /** --------------------------- **/

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
  .bolded {
    font-family: Arial;
    font-size: 14px;
    font-weight: bold;
    font-style: normal;
    font-stretch: normal;
    letter-spacing: normal;
    text-align: left;
    color: #757575;
  }

  /** --------------------------- **/

</style>
