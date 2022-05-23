<template>
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <BaseHeader
          :title="$t_locale('pages-extended/emails/notifications/unsatisfied-ticket/reopen-ticket/body')('title')"
          :subTitle="payload.garage.publicDisplayName"
          color="yellow"
          logo-url="/images/www/alert/ticket/yellow-alert.png"
        ></BaseHeader>
      </tr>
      <tr>
        <td align="center" id="content">
          {{ $t_locale('pages-extended/emails/notifications/unsatisfied-ticket/reopen-ticket/body')('greetings') }}<br/><br/>
          <span class="bolded">
            {{ payload.assigner.getShortDescription() }}</span>,
            <JobHandler :job="payload.assigner.job"></JobHandler>,
            {{ $t_locale('pages-extended/emails/notifications/unsatisfied-ticket/reopen-ticket/body')('reopened') }}.<br/><br/>
          <div class="bolded">{{ $t_locale('pages-extended/emails/notifications/unsatisfied-ticket/reopen-ticket/body')('details') }}</div><br/>
          <div class="left-margin">
            <span>
              {{$t_locale('pages-extended/emails/notifications/unsatisfied-ticket/reopen-ticket/body')('client')}}
              <span class="gs-blue-txt">{{ payload.data.customer_getCustomerFullName() }}</span>
            </span><br/>
          </div>
        </td>
      </tr>
    <tr>
      <CentralButton
        :text="$t_locale('pages-extended/emails/notifications/unsatisfied-ticket/reopen-ticket/body')('go')"
        :url="payload.config.get('publicUrl.app_url') + payload.gsClient.url.getShortUrl('COCKPIT_UNSATISFIED_TICKET') + payload.data.getId().toString()"
      >
      </CentralButton>
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
import CentralButton from '../../../../../components/emails/general/CentralButton';

export default {
  layout: 'email',
  components: { BaseHeader, BaseFooter, JobHandler, CentralButton },
  computed: {
    payload() { return this.$store.getters.payload; },
    closingReasons() {
      const reasons = this.payload.data.get('leadTicket.missedSaleReason');

      let stringList = '';
      for (const reason of reasons) {
        if (stringList !== '') {
          stringList += ', ';
        }
        stringList += this.$t_locale('pages-extended/emails/notifications/unsatisfied-ticket/reopen-ticket/body')(reason);
      }
      return stringList;
    }
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
  .left-margin {
    margin-left:30px;
  }
  .gs-blue-txt {
    color: #219ab5;
  }

  /** --------------------------- **/

</style>
