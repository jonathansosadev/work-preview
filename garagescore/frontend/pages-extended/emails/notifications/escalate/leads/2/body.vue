<template>
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <BaseHeader :title="title" :subTitle="garagePublicDisplayName" color="gold">
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
        {{ $t_locale('pages-extended/emails/notifications/escalate/leads/2/body')('greetings') }}<br><br>
        {{ content_1 }}<br><br>
        <span v-if="alertedUserName">
          {{ content_2 }}
        </span>
        <span v-else>
          <span class="bolded">{{ $t_locale('pages-extended/emails/notifications/escalate/leads/2/body')('warning') }}</span>, {{ $t_locale('pages-extended/emails/notifications/escalate/leads/2/body')('noAlertSent') }}
          <a bgcolor="#EC5601" :href="payload.config.get('publicUrl.app_url') + '/cockpit/admin/users'" target="_blank">{{ $t_locale('pages-extended/emails/notifications/escalate/leads/2/body')('goToAdmin') }}</a>
        </span>
        <br><br>
        <span v-if="hasSecondText">
          {{ followupText }}
        </span>
        <span>{{ content_3 }}</span>
      </td>
    </tr>
    <tr>
      <CentralButton :text="$t_locale('pages-extended/emails/notifications/escalate/leads/2/body')('goToTicket')" :url="ticketUrl"></CentralButton>
    </tr>
    <tr>
      <BaseFooter></BaseFooter>
    </tr>
  </table>
</template>


<script>

import BaseHeader from '../../../../../../components/emails/notifications/BaseHeader';
import BaseFooter from '../../../../../../components/emails/notifications/BaseFooter';
import CentralButton from '../../../../../../components/emails/general/CentralButton';
import ProTip from '../../../../../../components/emails/notifications/ProTip';
import LeadSaleTypes from '../../../../../../utils/models/data/type/lead-sale-types';


export default {
  layout: 'email',
  components: { BaseHeader, BaseFooter, CentralButton, ProTip },
  methods: {
    generateEmailHref(address, subject, body) {
      return `mailto:${address}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
  },
  computed: {
    payload() { return this.$store.getters.payload; },
    data() { return this.payload.data; },
    sourceTypeCategory() { return this.payload.sourceTypeCategory; },
    sourceType() { return this.payload.data.get('source.type'); },
    followupDays() { return this.data.get('leadTicket.followUpDelayDays'); },
    alertedUserName() { return this.payload.alertedUser && this.payload.alertedUser.name; },
    managerName() { return this.payload.managerName || ''; },
    garagePublicDisplayName() { return (this.payload.garage && this.payload.garage.publicDisplayName) || '?'; },
    saleType() { return this.data.get('leadTicket.saleType') && this.data.get('leadTicket.saleType') !== LeadSaleTypes.UNKNOWN ? this.data.get('leadTicket.saleType') : ''; },
    client() { return this.data.get('customer.fullName.value') || this.data.get('customer.lastName.value') || this.data.get('customer.contact.email.value') || this.data.get('customer.contact.mobilePhone.value'); },
    title() {
      return this.$t_locale('pages-extended/emails/notifications/escalate/leads/2/body')('title', {
        lead: this.$t_locale('pages-extended/emails/notifications/escalate/leads/2/body')(`lead_${this.sourceTypeCategory}`, { sourceType: this.sourceType }),
        saleType: this.$t_locale('pages-extended/emails/notifications/escalate/leads/2/body')(this.saleType)
      });
    },
    followupText() {
      return !isNaN(this.followupRemainingTime) ? this.$t_locale('pages-extended/emails/notifications/escalate/leads/2/body')('followupText', { followupRemainingTime: this.followupRemainingTime }) : "";
    },
    followupRemainingTime() {
      const elapsedTime = Math.abs(Date.now() - this.payload.followupScheduledAt.getTime());
      const elapsedHours = Math.round(elapsedTime / (1000 * 60 * 60));
      if (elapsedHours <= 24) return this.$t_locale('pages-extended/emails/notifications/escalate/leads/2/body')('hours', { hours: elapsedHours });
      return this.$t_locale('pages-extended/emails/notifications/escalate/leads/2/body')('days', { days: Math.round(elapsedHours / 24) });
    },
    content_1() {
      return this.$t_locale('pages-extended/emails/notifications/escalate/leads/2/body')('content_1', {
        client: this.client,
        subject: this.$t_locale('pages-extended/emails/notifications/escalate/leads/2/body')(`subject_${this.sourceTypeCategory}`),
        elapsedTime: this.elapsedTime
      });
    },
    content_2() {
      if (this.sourceTypeCategory === 'XLEADS') return this.$t_locale('pages-extended/emails/notifications/escalate/leads/2/body')('content_2_XLEADS', { createdAt: this.createdAt });
      return this.$t_locale('pages-extended/emails/notifications/escalate/leads/2/body')('content_2_DEFAULT', { manager: this.managerName, createdAt: this.createdAt });
    },
    content_3() {
      if (this.sourceTypeCategory === 'XLEADS') return this.$t_locale('pages-extended/emails/notifications/escalate/leads/2/body')('content_3_XLEADS');
      return this.$t_locale('pages-extended/emails/notifications/escalate/leads/2/body')('content_3_DEFAULT');
    },
    hasSecondText() {
      return !isNaN(this.followupDays);
    },
    createdAt() {
      const sentOn = new Date(this.data.get('leadTicket.createdAt'));
      return this.$dd(sentOn, 'date shortTime readable');
    },
    elapsedTime() {
      let now = new Date();
      let sentOn = new Date(this.data.get('leadTicket.createdAt'));
      const diffTime = Math.abs(now.getTime() - sentOn.getTime());
      const elapsedHours = Math.round(diffTime / (1000 * 60 * 60));
      if (elapsedHours <= 24) return this.$t_locale('pages-extended/emails/notifications/escalate/leads/2/body')('hours', { hours: elapsedHours });
      return this.$t_locale('pages-extended/emails/notifications/escalate/leads/2/body')('days', { days: Math.round(elapsedHours / 24) });
    },
    ticketUrl() {
      return this.payload.config.get('publicUrl.app_url') + this.payload.gsClient.url.getShortUrl('COCKPIT_LEAD_TICKET') + this.payload.dataId;
    },
    proTipProps() {
      return {
        title: this.$t_locale('pages-extended/emails/notifications/escalate/leads/2/body')('whyThis'),
        imgUrl: '/images/www/alert/zoomGuy.png',
        color: 'gold',
        text: this.$t_locale('pages-extended/emails/notifications/escalate/leads/2/body')('explanation'),
        preLinkLabel: this.$t_locale('pages-extended/emails/notifications/escalate/leads/2/body')('moreInfo'),
        linkLabel: this.$t_locale('pages-extended/emails/notifications/escalate/leads/2/body')('clickHere'),
        link: this.generateEmailHref('customer_success@custeed.com', this.$t_locale('pages-extended/emails/notifications/escalate/leads/2/body')('emailSubject'), this.$t_locale('pages-extended/emails/notifications/escalate/leads/2/body')('emailBody'))
      };
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
