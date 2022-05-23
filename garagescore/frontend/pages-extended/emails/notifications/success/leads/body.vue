<template>
  <table border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <BaseHeader
        :title="$t_locale('pages-extended/emails/notifications/success/leads/body')('title', {saleType: $t_locale('pages-extended/emails/notifications/success/leads/body')(saleType)})"
        :subTitle="publicDisplayName"
        color="gold"
        logo-url="/images/www/alert/lead_success.png"
      />
    </tr>
    <tr>
      <td align="center" id="content">
        {{ $t_locale('pages-extended/emails/notifications/success/leads/body')('greetings') }}<br/><br/>
        {{ mainText }}<br><br>
        {{ $t_locale('pages-extended/emails/notifications/success/leads/body')('congrats') }}
      </td>
    </tr>
    <tr>
      <CentralButton
        :text="$t_locale('pages-extended/emails/notifications/success/leads/body')('goToTicket')"
        :url="payload.config.get('publicUrl.app_url') + payload.gsClient.url.getShortUrl('COCKPIT_LEAD_TICKET') + payload.dataId"
      />
    </tr>
    <tr>
      <KPIs
        class="kpi"
        :title="$t_locale('pages-extended/emails/notifications/success/leads/body')('recap')"
        :kpis="kpis"
      />
    </tr>
    <tr>
      <BaseFooter />
    </tr>
  </table>
</template>


<script>

import BaseHeader from '../../../../../components/emails/notifications/BaseHeader';
import KPIs from '../../../../../components/emails/notifications/KPIs';
import BaseFooter from '../../../../../components/emails/notifications/BaseFooter';
import CentralButton from '../../../../../components/emails/general/CentralButton';

export default {
  layout: 'email',
  components: { BaseHeader, BaseFooter, CentralButton, KPIs },
  methods: {},
  computed: {
    payload() { return this.$store.getters.payload; },
    data() {
      return (this.payload && this.payload.data) || {};
    },
    client() {
      return this.data.get('leadTicket.customer.fullName') || this.$t_locale('pages-extended/emails/notifications/success/leads/body')('client')
    },
    publicDisplayName() {
      return this.payload && this.payload.garage && this.payload.garage.publicDisplayName || '?';
    },
    userName() {
      return this.payload && this.payload.closingUser && this.payload.closingUser.getFullName() || this.$t_locale('pages-extended/emails/notifications/success/leads/body')('user');
    },
    mainText() {
      if (this.payload.crossLeadConverted) return this.$t_locale('pages-extended/emails/notifications/success/leads/body')('intro_crossLeadConverted', { garageName: this.garageName });
      return this.$t_locale('pages-extended/emails/notifications/success/leads/body')('intro_default', { saleType: this.$t_locale('pages-extended/emails/notifications/success/leads/body')(this.saleType), userName: this.userName, client: this.client })
    },
    saleType() {
      return this.data.get('leadTicket.saleType');
    },
    leadConversion() {
      return this.payload && this.payload.leadConversion || {};
    },
    kpis() {
      return [
        {
          icon: '/images/www/alert/kpiSold.png',
          title: this.$t_locale('pages-extended/emails/notifications/success/leads/body')('soldKPI'),
          value: this.leadConversion.countConversions || '-'
        },
        {
          icon: '/images/www/alert/kpiMeetingDone.png',
          title: this.$t_locale('pages-extended/emails/notifications/success/leads/body')('leadsKPI'),
          value: this.leadConversion.countPotentialSales || '-'
        }
      ]
    }
  },
};
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

  .kpi {
    margin-bottom: 30px;
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
