<template>
  <table class="email-new-lead" cellspacing="0" cellpadding="0">

    <!-- BASE HEADER -->
    <tr>
      <td>
        <BaseHeader :title="title" :subTitle="subTitle" color="gold" logoUrl="/images/www/alert/ticket/lead-gold.png" :bannerPrefix="$t_locale('pages-extended/emails/notifications/cross-leads/recontact/email/body')('bannerPrefix')"></BaseHeader>
      </td>
    </tr>

    <!-- GREETINGS MESSAGE -->
    <tr>
      <td>{{ $t_locale('pages-extended/emails/notifications/cross-leads/recontact/email/body')('greetings') }}</td>
    </tr>
    
    <!-- FIRST LINE -->
    <tr>
      <td>
        {{ firstSentence }}
      </td>
    </tr>
    <tr>
      <td>
        {{ $t_locale('pages-extended/emails/notifications/cross-leads/recontact/email/body')('secondSentence') }}
      </td>
    </tr>

    <!-- CTA -->
    <tr>
       <CentralButton :text="$t_locale('pages-extended/emails/notifications/cross-leads/recontact/email/body')('cta')" :url="url" padding="10px 0 30px 0" />
    </tr>

    <tr>
      <BulletList class="bullet-list" :title="$t_locale('pages-extended/emails/notifications/cross-leads/recontact/email/body')('bulletListTitle')" :list="bulletListItems"></BulletList>
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
  import BaseHeader from "../../../../../../components/emails/notifications/BaseHeader";
  import BaseFooter from "../../../../../../components/emails/notifications/BaseFooter";
  import CentralButton from "../../../../../../components/emails/general/CentralButton";
  import BulletList from "../../../../../../components/emails/notifications/BulletList";
  import { getDeepFieldValue } from "../../../../../../../common/lib/util/object.js";

  export default {
    layout: "email",
    components: { BaseHeader, BaseFooter, CentralButton, BulletList },
    data() {
      return {
        deep: (fieldName) => getDeepFieldValue(this, `$store.getters.payload.${fieldName}`),
      };
    },
    computed: {
     
      sourceType() { return this.$t_locale('pages-extended/emails/notifications/cross-leads/recontact/email/body')(this.deep('data.source.type')); },
      title() { return this.$t_locale('pages-extended/emails/notifications/cross-leads/recontact/email/body')("title", { sourceType: this.$t_locale('pages-extended/emails/notifications/cross-leads/recontact/email/body')(this.deep('data.source.type')), garageName: this.deep('garage.publicDisplayName') }); },
      subTitle() { return this.deep('garage.publicDisplayName'); },
      followupDelay() { return this.deep('data.leadTicket.followUpDelayDays') || 10; },
      actions() { return this.deep('data.leadTicket.actions'); },
      contact() { return this.deep('data.leadTicket.customer.fullName') || this.deep('data.leadTicket.customer.contact.email') || this.deep('data.leadTicket.customer.contact.mobilePhone') },
      ago() {
        const lastcontactDate =  this.deep('currentAction.createdAt');
        const secondsFromLastContact = Math.floor((new Date() - lastcontactDate) / 1000);
        const dayAgo = Math.floor(secondsFromLastContact / 86400);
        return dayAgo === 0 ? 'aujourd\'hui' : `il y a ${dayAgo} jour(s)`;
      },
      url() { return encodeURI(this.deep('baseUrl') + this.deep('gsClient.url').getShortUrl("COCKPIT_LEAD_TICKET") + this.deep('data._id').toString());},
      bulletListItems() {
        return [
          { label: this.$t_locale('pages-extended/emails/notifications/cross-leads/recontact/email/body')(`bulletListLabel1`), item: this.$t_locale('pages-extended/emails/notifications/cross-leads/recontact/email/body')(`bulletListItem1`) },
          { label: this.$t_locale('pages-extended/emails/notifications/cross-leads/recontact/email/body')(`bulletListLabel2`, { followupDelay: this.followupDelay }), item: this.$t_locale('pages-extended/emails/notifications/cross-leads/recontact/email/body')(`bulletListItem2`) }
        ];
      },
      firstSentence() {
        return this.$t_locale('pages-extended/emails/notifications/cross-leads/recontact/email/body')('firstSentence', { contact: this.contact, ago: this.ago, sourceType: this.sourceType });
      }
    }
  };
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

  .no-padding {
    padding: 0;
  }

  .pro-tip {
    padding-bottom: 30px;
  }

  .bullet-list {
    margin-top: 40px;
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

  .bold {
    font-weight: bold;
  }

  .blue {
    color: #219ab5;
    a {
      text-decoration: underline;
    }
  }

  .subtitle {
    font-weight: 700;
    margin: 10px 0;
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
    color: #ffffff;
    border-radius: 3px;
    font-size: 16px;
    font-weight: bold;
  }

  .copyright {
    font-size: 12px;
    font-style: italic;
    color: #999;
  }
}
</style>
