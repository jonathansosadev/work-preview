<template>
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <BaseHeader :title="$t_locale('pages-extended/emails/notifications/escalate/unsatisfied/2/body')('title', { type: $t_locale('pages-extended/emails/notifications/escalate/unsatisfied/2/body')(type) })" :subTitle="garageName" color="red">
      </BaseHeader>
    </tr>
    <tr>
      <td>
        <ProTip class="pro-tip" v-bind="proTipProps">
          <span slot="link">
            {{ proTipProps.preLinkLabel }}
            <a :href="proTipProps.link">{{ proTipProps.linkLabel }}</a>
          </span>
        </ProTip>
      </td>
    </tr>
    <tr>
      <td align="center" id="content">
        {{ $t_locale('pages-extended/emails/notifications/escalate/unsatisfied/2/body')('greetings') }}<br/><br/>
        {{ $t_locale('pages-extended/emails/notifications/escalate/unsatisfied/2/body')('mainText', { days: elapsedDays, date: lastEscalationAlert }) }}<br><br>
        <span v-if="alertedUser">
          {{ $t_locale('pages-extended/emails/notifications/escalate/unsatisfied/2/body')(`alertSentTo`, { timestamp: alertSentTimeStamp }) }}
          <span class="alert-user">{{ alertedUser }}</span>.
          <br><br>
        </span>
        <span v-else>
          <span class="bolded">{{ $t_locale('pages-extended/emails/notifications/escalate/unsatisfied/2/body')('warning') }}</span>, {{ $t_locale('pages-extended/emails/notifications/escalate/unsatisfied/2/body')(`noAlertSent`, { timestamp: alertSentTimeStamp }) }}
          <a bgcolor="#EC5601" :href="payload.config.get('publicUrl.app_url') + '/cockpit/admin/users'" target="_blank">{{ $t_locale('pages-extended/emails/notifications/escalate/unsatisfied/2/body')('goToAdmin') }}</a>
          <br><br>
        </span>
        {{ $t_locale('pages-extended/emails/notifications/escalate/unsatisfied/2/body')('secondText', {timestamp: alertSentTimeStamp, days: (followupDays - elapsedDays) }) }}
      </td>
    </tr>
    <tr>
      <CentralButton :text="$t_locale('pages-extended/emails/notifications/escalate/unsatisfied/2/body')('goToTicket')" :url="ticketUrl"></CentralButton>
    </tr>
    <tr>
      <td>
        <TicketClientInformation v-bind="ticketClientInformation"></TicketClientInformation>
      </td>
    </tr>
    <tr>
      <CentralButton :text="$t_locale('pages-extended/emails/notifications/escalate/unsatisfied/2/body')('goToTicket')" :url="ticketUrl"></CentralButton>
    </tr>
    <tr>
      <BulletList v-if="!isVehicleInspection" class="bullet-list" :title="$t_locale('pages-extended/emails/notifications/escalate/unsatisfied/2/body')('bullet-list-title')" :list="bulletListItems"></BulletList>
    </tr>
    <tr>
      <BaseFooter></BaseFooter>
    </tr>
  </table>
</template>


<script>

import BaseHeader from '../../../../../../components/emails/notifications/BaseHeader';
import KPIs from '../../../../../../components/emails/notifications/KPIs';
import BaseFooter from '../../../../../../components/emails/notifications/BaseFooter';
import JobHandler from '../../../../../../components/emails/notifications/JobHandler';
import CentralButton from '../../../../../../components/emails/general/CentralButton';
import ProTip from '../../../../../../components/emails/notifications/ProTip';
import TicketClientInformation from '../../../../../../components/emails/notifications/TicketClientInformations';
import BulletList from '../../../../../../components/emails/notifications/BulletList';
import GarageTypes from '~/utils/models/garage.type.js';


export default {
  layout: 'email',
  components: { BaseHeader, BaseFooter, JobHandler, CentralButton, KPIs, ProTip, TicketClientInformation, BulletList },
  methods: {
    generateEmailHref(address, subject, body) {
      return `mailto:${address}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
  },
  computed: {
    payload() { return this.$store.getters.payload; },
    data() {
      return (this.payload && this.payload.data) || {};
    },
    alertedUser() {
      return this.payload && this.payload.alertedUser && this.payload.alertedUser.name;
    },
    followupDays() {
      return this.data.get('unsatisfiedTicket.followUpDelayDays') || 5;
    },
    managerName() {
      return (this.payload && this.payload.managerName) || null;
    },
    client() {
      return this.data.get('unsatisfiedTicket.customer.fullName') || this.$t_locale('pages-extended/emails/notifications/escalate/unsatisfied/2/body')('client')
    },
    garageName() {
      return this.payload && this.payload.garage && this.payload.garage.publicDisplayName || '?'
    },
    type() {
      return this.data.get('unsatisfiedTicket.type')
    },
    alertSentTimeStamp() {
      const sentOn = new Date(this.data.get('unsatisfiedTicket.createdAt'));
      return this.$dd(sentOn, 'date shortTime')
    },
    elapsedDays() {
      let now = new Date();
      let sentOn = new Date(this.data.get('unsatisfiedTicket.createdAt'));
      const diffTime = Math.abs(now.getTime() - sentOn.getTime());
      return Math.round(diffTime / (1000 * 60 * 60 * 24));
    },
    lastEscalationAlert() {
      let sentOn = new Date(this.data.get('unsatisfiedTicket.createdAt'));
      return this.$dd(new Date(sentOn.getTime() + (1000 * 60 * 60 * 24)), 'date shortTime');
    },
    ticketUrl() {
      return this.payload.config.get('publicUrl.app_url') + this.payload.gsClient.url.getShortUrl('COCKPIT_UNSATISFIED_TICKET') + this.payload.dataId;
    },
    bulletListItems() {
      return [
        { label: this.$t_locale('pages-extended/emails/notifications/escalate/unsatisfied/2/body')(`bullet-list-label-1`), item: this.$t_locale('pages-extended/emails/notifications/escalate/unsatisfied/2/body')(`bullet-list-item-1`) },
        { label: this.$t_locale('pages-extended/emails/notifications/escalate/unsatisfied/2/body')(`bullet-list-label-2`, { days: this.followupDays }), item: this.$t_locale('pages-extended/emails/notifications/escalate/unsatisfied/2/body')(`bullet-list-item-2`) }
      ];
    },
    proTipProps() {
      return {
        title: this.$t_locale('pages-extended/emails/notifications/escalate/unsatisfied/2/body')('whyThis'),
        imgUrl: '/images/www/alert/zoomGuy.png',
        color: 'red',
        text: this.$t_locale('pages-extended/emails/notifications/escalate/unsatisfied/2/body')('explanation'),
        preLinkLabel: this.$t_locale('pages-extended/emails/notifications/escalate/unsatisfied/2/body')('moreInfo'),
        linkLabel: this.$t_locale('pages-extended/emails/notifications/escalate/unsatisfied/2/body')('clickHere'),
        link: this.generateEmailHref('customer_success@custeed.com', this.$t_locale('pages-extended/emails/notifications/escalate/unsatisfied/2/body')('emailSubject'), this.$t_locale('pages-extended/emails/notifications/escalate/unsatisfied/2/body')('emailBody'))
      };
    },
    ticketClientInformation() {
      return {
        ticket: this.data.get('unsatisfiedTicket') || {},
        city: this.data.get('customer.city.value'),
        postalCode: this.data.get('customer.postalCode.value'),
        manager: this.managerName
      }
    },
    isVehicleInspection() {
      return this.data.garageType === GarageTypes.VEHICLE_INSPECTION;
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

  .pro-tip {
    margin-bottom: 30px;
  }

  .bullet-list {
    margin-bottom: 30px;
  }

  .alert-user {
    font-weight: bold;
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
    padding-top: 10px;
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
