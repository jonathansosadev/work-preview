<template>
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <BaseHeader
          :title="$t_locale('pages-extended/emails/notifications/unsatisfied-ticket/transfer-ticket/body')('title', { type: dataType })"
          :subTitle="payload.garage.publicDisplayName"
          color="green"
          logo-url="/images/www/alert/ticket/green-alert.png"
        ></BaseHeader>
      </tr>
      <tr>
        <td align="center" id="content">
          {{ $t_locale('pages-extended/emails/notifications/unsatisfied-ticket/transfer-ticket/body')('greetings', { name: recipientName }) }}<br/><br/>

          <span class="bolded">{{ payload.assigner.getShortDescription() }}</span>,
          <JobHandler :job="payload.assigner.job"></JobHandler>,
          {{ $t_locale('pages-extended/emails/notifications/unsatisfied-ticket/transfer-ticket/body')('transfered') }}.<br/><br/>

          <div class="left-margin">
            <span>
              {{$t_locale('pages-extended/emails/notifications/unsatisfied-ticket/transfer-ticket/body')('comment')}}
              <span :class="payload.ticketAction.comment ? 'gs-blue-txt' : ''">
                {{ payload.ticketAction.comment || $t_locale('pages-extended/emails/notifications/unsatisfied-ticket/transfer-ticket/body')('undefined') }}
              </span>
            </span><br/>
          </div>
        </td>
      </tr>
    <tr>
      <CentralButton :text="$t_locale('pages-extended/emails/notifications/unsatisfied-ticket/transfer-ticket/body')('go')" :url="unsatisfiedTicketUrl"></CentralButton>
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
import LeadSaleTypes from '../../../../../utils/models/data/type/lead-sale-types';

export default {
  layout: 'email',
  components: { BaseHeader, BaseFooter, JobHandler, CentralButton },
  computed: {
    payload() { return this.$store.getters.payload; },
    dataType() {
      const ticketDataType = this.payload.data.type;
      if (LeadSaleTypes.hasValue(ticketDataType)) {
        return this.$t_locale('pages-extended/emails/notifications/unsatisfied-ticket/transfer-ticket/body')(ticketDataType);
      }
      return ticketDataType;
    },
    recipientName() {
      return this.payload.addressee && this.payload.addressee.getShortDescription();
    },
    unsatisfiedTicketUrl() {
      const baseUrl = this.payload.baseUrl;
      const unsatisfiedTicketUrl = this.payload.gsClient.url.getShortUrl('COCKPIT_UNSATISFIED_TICKET');
      const unsatisfiedTicketId = this.payload.data.getId().toString();
      return `${baseUrl}${unsatisfiedTicketUrl}${unsatisfiedTicketId}`;
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
