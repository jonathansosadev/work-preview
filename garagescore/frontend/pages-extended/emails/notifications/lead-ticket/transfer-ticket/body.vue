<template>
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <BaseHeader
          :title="$t_locale('pages-extended/emails/notifications/lead-ticket/transfer-ticket/body')('title', { type: leadSaleType })"
          :subTitle="payload.garage.publicDisplayName"
          color="green"
          logo-url="/images/www/alert/ticket/green-alert.png"
        ></BaseHeader>
      </tr>
      <tr>
        <td align="center" id="content">
          {{ $t_locale('pages-extended/emails/notifications/lead-ticket/transfer-ticket/body')('greetings', { name: recipientName }) }}<br/><br/>

          <span class="bolded">{{ payload.assigner.getShortDescription() }}</span>,
          <JobHandler :job="payload.assigner.job"></JobHandler>,
          {{ $t_locale('pages-extended/emails/notifications/lead-ticket/transfer-ticket/body')('transfered') }}.<br/><br/>

          <div class="left-margin">
            <span>
              {{$t_locale('pages-extended/emails/notifications/lead-ticket/transfer-ticket/body')('comment')}}
              <span :class="payload.ticketAction.comment ? 'gs-blue-txt' : ''">
                {{ payload.ticketAction.comment || $t_locale('pages-extended/emails/notifications/lead-ticket/transfer-ticket/body')('undefined') }}
              </span>
            </span><br/>
          </div>
        </td>
      </tr>
    <tr>
      <CentralButton :text="$t_locale('pages-extended/emails/notifications/lead-ticket/transfer-ticket/body')('go')" :url="leadUrl"></CentralButton>
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
    leadSaleType() {
      const ticketLeadSaleType = this.payload.data.get('lead.saleType') 
      && this.payload.data.get('lead.saleType') !== LeadSaleTypes.UNKNOWN ? this.payload.data.get('lead.saleType') : '';
      if (LeadSaleTypes.hasValue(ticketLeadSaleType)) {
        return this.$t_locale('pages-extended/emails/notifications/lead-ticket/transfer-ticket/body')(ticketLeadSaleType);
      }
      return ticketLeadSaleType;
    },
    recipientName() {
      return this.payload.addressee && this.payload.addressee.getShortDescription();
    },
    leadUrl() {
      const baseUrl = this.payload.baseUrl;
      const leadTicketUrl = this.payload.gsClient.url.getShortUrl('COCKPIT_LEAD_TICKET');
      const leadTicketId = this.payload.data.getId().toString();
      return `${baseUrl}${leadTicketUrl}${leadTicketId}`;
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
