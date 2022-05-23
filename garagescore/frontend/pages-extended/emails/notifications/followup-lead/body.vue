<template slot="content">
  <table class="email-new-lead" cellspacing="0" cellpadding="0">
    <!-- BASE HEADER -->
    <tr>
      <td>
        <BaseHeader :title="title" :subTitle="publicDisplayName" color="red" logo-url="/images/www/alert/warning-red.png"></BaseHeader>
      </td>
    </tr>

    <!-- GREETINGS MESSAGE -->
    <tr>
      <td>
        {{ $t_locale('pages-extended/emails/notifications/followup-lead/body')('greetings') }}
      </td>
    </tr>

    <!-- EXPLANATION MESSAGE -->
    <tr>
      <td>
        {{ content }}
      </td>
    </tr>

    <!-- CTA -->
    <tr>
      <CentralButton :text="$t_locale('pages-extended/emails/notifications/followup-lead/body')('cta')" :url="url"/>
    </tr>
    <!-- GOOD BYE MESSAGE -->
    <tr>
      <td class="no-padding">
        <BaseFooter></BaseFooter>
      </td>
    </tr>

    <!-- COPYRIGHT -->
    <tr>
      <td class="copyright">
        {{ $t_locale('pages-extended/emails/notifications/followup-lead/body')('copyright1') }}
        {{ $t_locale('pages-extended/emails/notifications/followup-lead/body')('copyright2', { fullYearNumber }) }}
      </td>
    </tr>
  </table>
</template>

<script>
import BaseFooter from '../../../../components/emails/notifications/BaseFooter';
import BaseHeader from '../../../../components/emails/notifications/BaseHeader';
import CentralButton from '../../../../components/emails/general/CentralButton';
import LeadSaleTypes from '../../../../utils/models/data/type/lead-sale-types';

export default {
  layout: 'email',
  components: { BaseHeader, BaseFooter, CentralButton },
  computed: {
    payload() { return this.$store.getters.payload; },
    campaignDisplayName() {
      return ((this.payload.automationCampaign && this.payload.automationCampaign.displayName) || '');
    },
    content() {
      const action = (this.data.get('leadTicket.followup.appointment') === 'NotProposed') ? this.$t_locale('pages-extended/emails/notifications/followup-lead/body')('action_content_appointment') : this.$t_locale('pages-extended/emails/notifications/followup-lead/body')('action_content_recontacted');
      const saleType = this.saleType;
      const campaignDisplayName = this.campaignDisplayName;
      const publicDisplayName = this.publicDisplayName;
      let type = this.$t_locale('pages-extended/emails/notifications/followup-lead/body')('type_2_DEFAULT');
      if (this.payload.sourceTypeCategory === 'XLEADS') type = this.$t_locale('pages-extended/emails/notifications/followup-lead/body')('type_2_XLEADS');
      else if (this.payload.sourceTypeCategory === 'AUTOMATION') type = this.$t_locale('pages-extended/emails/notifications/followup-lead/body')('type_2_AUTOMATION', { saleType, campaignDisplayName });
      return this.$t_locale('pages-extended/emails/notifications/followup-lead/body')('content', { customerName: this.customerName, action, publicDisplayName, type });
    },
    saleType() {
      const saleType = this.data.get('leadTicket.saleType') ? this.data.get('leadTicket.saleType') : null;
      switch(saleType) {
        case LeadSaleTypes.NEW_VEHICLE_SALE:
          return this.$t_locale('pages-extended/emails/notifications/followup-lead/body')(`saleType_${LeadSaleTypes.NEW_VEHICLE_SALE}`);
        case LeadSaleTypes.USED_VEHICLE_SALE:
          return this.$t_locale('pages-extended/emails/notifications/followup-lead/body')(`saleType_${LeadSaleTypes.USED_VEHICLE_SALE}`);
        case LeadSaleTypes.UNKNOWN:
          return this.$t_locale('pages-extended/emails/notifications/followup-lead/body')(`saleType_${LeadSaleTypes.NEW_VEHICLE_SALE}`);
        default:
          return '';
      }
    },
    title() {
      const saleType = this.saleType;
      const action = (this.data.get('leadTicket.followup.appointment') === 'NotProposed') ? this.$t_locale('pages-extended/emails/notifications/followup-lead/body')('action_title_appointment') : this.$t_locale('pages-extended/emails/notifications/followup-lead/body')('action_title_recontacted');
      let type = this.$t_locale('pages-extended/emails/notifications/followup-lead/body')('type_DEFAULT');
      if (this.payload.sourceTypeCategory === 'XLEADS') type = this.$t_locale('pages-extended/emails/notifications/followup-lead/body')('type_XLEADS', { sourceType: this.$t_locale('pages-extended/emails/notifications/followup-lead/body')(this.data.get('source.type')) });
      else if (this.payload.sourceTypeCategory === 'AUTOMATION') type = this.$t_locale('pages-extended/emails/notifications/followup-lead/body')('type_AUTOMATION');
      return this.$t_locale('pages-extended/emails/notifications/followup-lead/body')('subject', { type, saleType, action })
    },
    publicDisplayName() {
      return this.payload.garage.publicDisplayName;
    },
    fullYearNumber() {
      return this.payload.fullYearNumber;
    },
    data() {
      return this.payload.data;
    },
    url() {
      return encodeURI(this.payload.baseUrl + this.payload.gsClient.url.getShortUrl('COCKPIT_LEAD_TICKET') + this.data.id.toString());
    },
    customerName() {
      const fullName = this.payload.data.get('leadTicket.customer.fullName');
      const email = this.payload.data.get('leadTicket.customer.contact.email');
      const mobilePhone = this.payload.data.get('leadTicket.customer.contact.mobilePhone');
      return fullName || email || mobilePhone || '';
    },
  },
}
</script>


<style lang="scss" scoped>
  .left-margin {
    margin: 20px 0;
    margin-left: 30px;
  }
  .email-new-lead {
    width: 100%;
    color: #7f7f7f;
    font-size: 14px;
    font-family: "Trebuchet MS", sans-serif;

    td {
      padding: 10px 5px;
    }

    .no-padding {
      padding: 0;
    }

    .customer-info {
      line-height: 1.5;
    }

    .black {
      color: black;
    }

    .subtitle {
      font-weight: 700;
      margin: 10px 0;
    }

    .review {
      font-size: 16px;
      font-weight: 700;
      font-style: italic;
      color: #219AB5;
      padding: 10px 15px;
    }

    .rejected {
      color: #d14836;
      padding-left: 15px;
    }

    .details {
      padding-left: 15px;
      .lead > div {
        padding: 5px 0;
      }
      .lead-subdetail {
        padding: 10px 15px 5px 15px;
      }
    }

    .cta-wrapper {
      padding: 25px 0;
      text-align: center;
    }

    .cta {
      padding-bottom: 12px;
      text-decoration: none;
      padding-left: 39px;
      padding-right: 39px;
      padding-top: 12px;
      display: inline-block;
      background-color: #ed5600;
      color: #FFFFFF;
      border-radius: 3px;
      font-size: 16px;
      font-weight: bold;
    }

    .copyright {
      font-size: 12px;
      font-style: italic;
      color: #999
    }
  }
</style>
