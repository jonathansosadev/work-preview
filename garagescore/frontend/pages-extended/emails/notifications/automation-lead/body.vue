<template>
  <table class="email-new-lead" cellspacing="0" cellpadding="0">
    <!-- BASE HEADER -->
    <tr>
      <td>
        <BaseHeader :title="title" :subTitle="subTitle" :color="color" :logoUrl="logoUrl" :bannerPrefix="bannerPrefix"></BaseHeader>
      </td>
    </tr>

    <!-- GREETINGS MESSAGE -->
    <tr>
      <td>
        {{ $t_locale('pages-extended/emails/notifications/automation-lead/body')('greetings') }}
      </td>
    </tr>

    <!-- EXPLANATION MESSAGE -->
    <tr>
      <td v-html="explanation"></td>
    </tr>

    <tr v-if="manager">
      <td>
        {{ $t_locale('pages-extended/emails/notifications/automation-lead/body')('assignedTo') }}&nbsp;<span style="font-weight: bold;">{{ managerName }}, <JobHandler :job="managerJob"/>.</span>
      </td>
    </tr>

    <!-- CTA -->
    <tr>
      <CentralButton :text="$t_locale('pages-extended/emails/notifications/automation-lead/body')('cta')" :url="url"/>
    </tr>

    <tr>
      <td>
        <div class="customer-name">{{ $t_locale('pages-extended/emails/notifications/automation-lead/body')(`civility${customerCivility}`) }} {{ customerFullName }}</div>
        <div class="customer-info">
          {{ $t_locale('pages-extended/emails/notifications/automation-lead/body')('mobile') }}
          <span :class="{blue: hasPhone}"> {{ hasPhone ? phone : $t_locale('pages-extended/emails/notifications/automation-lead/body')('undefined') }}</span>
          <br>
          {{ $t_locale('pages-extended/emails/notifications/automation-lead/body')('email') }}
          <span :class="{blue: hasEmail}">
            <a v-if="hasEmail" :href="`mailto:${email}`">{{ email }}</a>
            <span v-else>{{ $t_locale('pages-extended/emails/notifications/automation-lead/body')('undefined') }}</span>
          </span>
          <br>
          {{ $t_locale('pages-extended/emails/notifications/automation-lead/body')('city') }}
          <span :class="{blue: hasCity}"> {{ hasCity ? city : $t_locale('pages-extended/emails/notifications/automation-lead/body')('undefined') }}</span>
          <br>
          {{ $t_locale('pages-extended/emails/notifications/automation-lead/body')('postalCode') }}
          <span :class="{blue: hasPostalCode}"> {{ hasPostalCode ? postalCode : $t_locale('pages-extended/emails/notifications/automation-lead/body')('undefined') }}</span>
        </div>
      </td>
    </tr>

    <!-- GOOD BYE MESSAGE -->
    <tr>
      <td class="no-padding">
        <BaseFooter></BaseFooter>
      </td>
    </tr>
  </table>
</template>

<script>
import BaseFooter from '../../../../components/emails/notifications/BaseFooter';
import BaseHeader from '../../../../components/emails/notifications/BaseHeader';
import CentralButton from '../../../../components/emails/general/CentralButton';
import JobHandler from '../../../../components/emails/notifications/JobHandler';
import ContactTypes from '../../../../utils/models/automation-campaign.contact';
import { getDeepFieldValue } from "~/utils/object.js";

export default {
  layout: 'email',
  data () {
    return {
      deep: (fieldName) => getDeepFieldValue(this, fieldName)
    }
  },
  components: { BaseHeader, BaseFooter, CentralButton, JobHandler },
  computed: {
    payload() { return this.$store.getters.payload; },
    garageType() {
      return this.data.garageType;
    },
    bannerPrefix() {
      return this.$t_locale('pages-extended/emails/notifications/automation-lead/body')('bannerPrefix')
    },
    title() {
      return this.$t_locale('pages-extended/emails/notifications/automation-lead/body')('title', { leadSaleType: this.leadSaleType, campaignName: this.campaignName });
    },
    subTitle() {
      return this.garage.publicDisplayName;
    },
    color() {
      return 'gold';
    },
    logoUrl() {
      return '/images/www/alert/ticket/lead-gold.png';
    },
    garage() {
      return this.payload.garage;
    },
    explanation() {
      const serviceType = this.payload.data.get('lead.saleType') === 'Maintenance' ? this.$t_locale('pages-extended/emails/notifications/automation-lead/body')('serviceTypeAPV') : this.$t_locale('pages-extended/emails/notifications/automation-lead/body')('serviceTypeVN');
      return this.$t_locale('pages-extended/emails/notifications/automation-lead/body')('explanation', { customerName: this.customerName, campaignName: this.campaignName, serviceType });
    },
    customerName() {
      const fullName = this.payload.data.get('leadTicket.customer.fullName');
      const email = this.payload.data.get('leadTicket.customer.contact.email');
      const mobilePhone = this.payload.data.get('leadTicket.customer.contact.mobilePhone');
      if (fullName) return fullName + ' ';
      if (this.payload.automationCampaign.contactType === ContactTypes.EMAIL) {
        if (email) return email + ' ';
        return (mobilePhone && (mobilePhone + ' ')) || '';
      }
      if (this.payload.automationCampaign.contactType === ContactTypes.MOBILE) {
        if (mobilePhone) return mobilePhone + ' ';
        return (email && (email + ' ')) || '';
      }
      return '';
    },
    campaignName() {
      return this.payload.automationCampaign && this.payload.automationCampaign.displayName;
    },
    dataId() {
      return this.data.id.toString();
    },
    data() {
      return this.payload.data;
    },
    url() {
      return encodeURI(this.payload.baseUrl + this.gsClient.url.getShortUrl('COCKPIT_LEAD_TICKET') + this.dataId);
    },
    fullYearNumber() {
      return this.payload.fullYearNumber;
    },
    gsClient() {
      return this.payload.gsClient;
    },
    config() {
      return this.payload.config;
    },
    lead() {
      return this.data.lead;
    },
    leadSaleType() {
      return this.payload.data.get('lead.saleType') === 'Unknown' ? '' : this.$t_locale('pages-extended/emails/notifications/automation-lead/body')(this.payload.data.get('lead.saleType'));
    },
    manager() {
      return this.payload.manager;
    },
    managerName() {
      if (this.manager) {
        if (this.manager.firstName && this.manager.lastName) {
          return `${this.manager.firstName} ${this.manager.lastName}`;
        }
        return this.manager.email;
      }
    },
    managerJob() {
      return this.manager ? this.manager.job : '';
    },
    customerCivility() {
      return this.deep('data.customer.title.value') || 'Monsieur';
    },
    customerFullName() {
      return this.deep('data.customer.fullName.value');
    },
    hasPhone() {
      return !!this.deep('data.customer.contact.mobilePhone.value');
    },
    phone() {
      return this.deep('data.customer.contact.mobilePhone.value');
    },
    hasEmail() {
      return !!this.deep('data.customer.contact.email.value');
    },
    email() {
      return this.deep('data.customer.contact.email.value');
    },
    hasCity() {
      return !!this.deep('data.customer.city.value');
    },
    city() {
      return this.deep('data.customer.city.value');
    },
    hasPostalCode() {
      return !!this.deep('data.customer.postalCode.value');
    },
    postalCode() {
      return this.deep('data.customer.postalCode.value');
    },
  },
}
</script>


<style lang="scss" scoped>
  .email-new-lead {
    width: 100%;
    color: #7f7f7f;
    font-size: 14px;
    font-family: "Trebuchet MS", sans-serif;

    td {
      padding: 10px 5px;
    }

    .bullet-list {
      margin-top: 40px;
    }

    .no-padding {
      padding: 0;
    }

    .pro-tip {
      padding-bottom: 30px;
    }

    .customer-name {
      color: #000000;
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 10px;
    }

    .customer-info {
      line-height: 1.5;
    }

    .blue {
      color: #219AB5;
      a {
        text-decoration: underline;
      }
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
