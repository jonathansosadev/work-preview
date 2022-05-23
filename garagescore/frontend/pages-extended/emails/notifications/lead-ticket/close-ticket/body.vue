<template>
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <BaseHeader
          :title="$t_locale('pages-extended/emails/notifications/lead-ticket/close-ticket/body')('title')"
          :subTitle="payload.garage.publicDisplayName"
          color="red"
          logo-url="/images/www/alert/ticket/red-alert.png"
        ></BaseHeader>
      </tr>
      <tr>
        <td align="center" id="content">
          {{ $t_locale('pages-extended/emails/notifications/lead-ticket/close-ticket/body')('greetings') }}<br/><br/>
          <span class="bolded">{{ payload.assigner.getShortDescription() && payload.assigner.getShortDescription().trim() }}, </span>
          <JobHandler :job="payload.assigner.job"/>, {{ payload.data.get('leadTicket.wasTransformedToSale') ? $t_locale('pages-extended/emails/notifications/lead-ticket/close-ticket/body')('closedSuccess') : $t_locale('pages-extended/emails/notifications/lead-ticket/close-ticket/body')('closedFailure') }} {{ $t_locale('pages-extended/emails/notifications/lead-ticket/close-ticket/body')('noticeBecause') }}<br/><br/>
          <div class="bolded">{{ $t_locale('pages-extended/emails/notifications/lead-ticket/close-ticket/body')('details') }}</div><br/>
          <div class="left-margin">
            <span>
              {{$t_locale('pages-extended/emails/notifications/lead-ticket/close-ticket/body')('client')}}
              <span class="gs-blue-txt">{{ payload.data.customer_getCustomerFullName() }}</span>
            </span><br/><br/>
            <span>
              {{$t_locale('pages-extended/emails/notifications/lead-ticket/close-ticket/body')('duration')}}
              <span class="gs-blue-txt">{{ dateDiff }}</span>
            </span><br/><br/>
            <span>
              {{$t_locale('pages-extended/emails/notifications/lead-ticket/close-ticket/body')('closingReasons')}}
              <span class="gs-blue-txt">
                {{ payload.data.get('leadTicket.wasTransformedToSale') ? $t_locale('pages-extended/emails/notifications/lead-ticket/close-ticket/body')('sold') : closingReasons }}
              </span>
            </span>
          </div><br/>
          {{ $t_locale('pages-extended/emails/notifications/lead-ticket/close-ticket/body')('conclusion') }}
        </td>
      </tr>
    <tr>
      <CentralButton
        :text="$t_locale('pages-extended/emails/notifications/lead-ticket/close-ticket/body')('go')"
        :url="payload.config.get('publicUrl.app_url') + payload.gsClient.url.getShortUrl('COCKPIT_LEAD_TICKET') + payload.data.getId().toString()">
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
  methods: {
    getDateDiff: (date1, date2) => {
      class Diff {
        constructor(diff) {
          this.sec = diff.sec;
          this.min = diff.min;
          this.hour = diff.hour;
          this.day = diff.day;
        }
      }

      const diff = {};                           // Initialisation du retour
      let tmp = date2 - date1;

      tmp = Math.floor(tmp / 1000);             // Nombre de secondes entre les 2 dates
      diff.sec = tmp % 60;                    // Extraction du nombre de secondes

      tmp = Math.floor((tmp - diff.sec) / 60);    // Nombre de minutes (partie entière)
      diff.min = tmp % 60;                    // Extraction du nombre de minutes

      tmp = Math.floor((tmp - diff.min) / 60);    // Nombre d'heures (entières)
      diff.hour = tmp % 24;                   // Extraction du nombre d'heures

      tmp = Math.floor((tmp - diff.hour) / 24);   // Nombre de jours restants
      diff.day = tmp;

      return new Diff(diff);
    }
  },
  computed: {
    payload() { return this.$store.getters.payload; },
    closingReasons() {
      const reasons = this.payload.data.get('leadTicket.missedSaleReason');

      let stringList = '';
      for (const reason of reasons) {
        if (stringList !== '') {
          stringList += ', ';
        }
        stringList += this.$t_locale('pages-extended/emails/notifications/lead-ticket/close-ticket/body')(reason);
      }
      return stringList;
    },
    dateDiff() {
      let diff = this.getDateDiff(this.payload.data.get('lead.reportedAt'), this.payload.ticketAction.createdAt);
      return `${diff.day}${this.$t_locale('pages-extended/emails/notifications/lead-ticket/close-ticket/body')('d')} ${diff.hour}${this.$t_locale('pages-extended/emails/notifications/lead-ticket/close-ticket/body')('h')} ${diff.min}${this.$t_locale('pages-extended/emails/notifications/lead-ticket/close-ticket/body')('m')}`
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
