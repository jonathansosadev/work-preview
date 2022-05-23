<template>
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <BaseHeader
          :title="$t_locale('pages-extended/emails/notifications/user-access-request/body')('title')"
          color="blue"
          logo-url="/images/www/alert/feature-add.png"
        ></BaseHeader>
      </tr>
      <tr>
        <td align="center" id="content">
          {{ $t_locale('pages-extended/emails/notifications/user-access-request/body')('greetings') }}<br/><br/>
          <span class="bolded">{{ payload.requestSenderName && payload.requestSenderName.trim() }}</span>, <JobHandler :job="payload.requestSenderJob"></JobHandler>, {{ $t_locale('pages-extended/emails/notifications/user-access-request/body')('wishToGet') }} <span class="bolded">{{ $t_locale('pages-extended/emails/notifications/user-access-request/body')(`description_${payload.featureName}`) }}</span> {{ $t_locale('pages-extended/emails/notifications/user-access-request/body')('onGS') }}<br/><br/>

          <span v-if="payload.message">{{ $t_locale('pages-extended/emails/notifications/user-access-request/body')('leftMessage') }}</span><br/><br/>
          <div v-if="payload.message" style="padding:15px;font-style:italic;">
            "{{ payload.message }}"
          </div>
        </td>
      </tr>
      <tr>
        <CentralButton
          :text="$t_locale('pages-extended/emails/notifications/user-access-request/body')('go')"
          :url="payload.config.get('publicUrl.app_url') + payload.gsClient.url.getShortUrl('COCKPIT_ADMIN_USER') + userIdQuery"
        >
        </CentralButton>
      </tr>
      <tr>
        <BaseFooter></BaseFooter>
      </tr>
  </table>
</template>


<script>
import BaseHeader from '../../../../components/emails/notifications/BaseHeader';
import BaseFooter from '../../../../components/emails/notifications/BaseFooter';
import JobHandler from '../../../../components/emails/notifications/JobHandler';
import CentralButton from '../../../../components/emails/general/CentralButton';

export default {
  layout: 'email',
  components: { BaseHeader, BaseFooter, JobHandler, CentralButton },
  computed: {
    payload() { return this.$store.getters.payload; },
    userIdQuery() {
      return `?id=${this.payload.userId}`;
    }
  }
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
