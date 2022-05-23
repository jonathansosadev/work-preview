<template>
  <table class="email-new-lead" cellspacing="0" cellpadding="0">
    <!-- BASE HEADER -->
    <tr>
      <td>
        <BaseHeader :title="title" :subTitle="subTitle" color="gold" logoUrl="/images/www/alert/ticket/lead-gold.png" :bannerPrefix="$t_locale('pages-extended/emails/notifications/cross-leads/self-assign/missed-call/body')('bannerPrefix')"></BaseHeader>
      </td>
    </tr>
    <!-- GREETINGS MESSAGE -->
    <tr>
      <td>{{ $t_locale('pages-extended/emails/notifications/cross-leads/self-assign/missed-call/body')('greetings') }}</td>
    </tr>

    <!-- EXPLANATION MESSAGE -->
    <tr>
      <td>{{ firstSentence }}</td>
    </tr>
    <!-- SECOND EXPLANATION MESSAGE -->
    <tr>
      <td>{{ secondSentence }}</td>
    </tr>

    <!-- WARNING -->
    <tr>
      <td><b><i>{{ $t_locale('pages-extended/emails/notifications/cross-leads/self-assign/missed-call/body')('warning') }}</i></b></td>
    </tr>

    <!-- CTA -->
    <tr>
      <CentralButton :text="$t_locale('pages-extended/emails/notifications/cross-leads/self-assign/missed-call/body')('cta')" :url="url" />
    </tr>

    <tr>
      <BulletList class="bullet-list" :title="$t_locale('pages-extended/emails/notifications/cross-leads/self-assign/missed-call/body')('bulletListTitle')" :list="bulletListItems"></BulletList>
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

  export default {
    layout: "email",
    components: { BaseHeader, BaseFooter, CentralButton, BulletList },
    computed: {
      payload() { return this.$store.getters.payload; },
      data() { return this.payload.data; },
      sourceType() { return this.$t_locale('pages-extended/emails/notifications/cross-leads/self-assign/missed-call/body')(this.data.get('source.type')); },
      title() { return this.$t_locale('pages-extended/emails/notifications/cross-leads/self-assign/missed-call/body')("title", { sourceType: this.sourceType }); },
      subTitle() { return this.payload.garage.publicDisplayName; },
      followupDelay() { return this.data.get("leadTicket.followUpDelayDays") || 10; },
      url() { return encodeURI(this.payload.baseUrl + this.payload.gsClient.url.getShortUrl("COCKPIT_LEAD_TICKET") + this.payload.data.id.toString() + '?self-assign'); },
      bulletListItems() {
        return [
          { label: this.$t_locale('pages-extended/emails/notifications/cross-leads/self-assign/missed-call/body')(`bulletListLabel1`), item: this.$t_locale('pages-extended/emails/notifications/cross-leads/self-assign/missed-call/body')(`bulletListItem1`) },
          { label: this.$t_locale('pages-extended/emails/notifications/cross-leads/self-assign/missed-call/body')(`bulletListLabel2`, { followupDelay: this.followupDelay }), item: this.$t_locale('pages-extended/emails/notifications/cross-leads/self-assign/missed-call/body')(`bulletListItem2`) }
        ];
      },
      firstSentence() { return this.$t_locale('pages-extended/emails/notifications/cross-leads/self-assign/missed-call/body')('firstSentence', { sourceType: this.sourceType }); },
      secondSentence() {
        let secondSentence = this.$t_locale('pages-extended/emails/notifications/cross-leads/self-assign/missed-call/body')('secondSentence');
        if (this.payload.stage < 4) secondSentence += ` ${this.$t_locale('pages-extended/emails/notifications/cross-leads/self-assign/missed-call/body')('secondSentence_part2')}`;
        return secondSentence;
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
