<template slot="content">
  <table border="0" cellspacing="0" cellpadding="0">
    <tr>
      <BaseHeader :title="$t_locale('pages-extended/emails/notifications/auto-allow-crawlers/body')('title')" color="blue" logo-url="/images/www/alert/notepad.png"></BaseHeader>
    </tr>

    <tr>
      <td class="content">
        {{ $t_locale('pages-extended/emails/notifications/auto-allow-crawlers/body')('greetings') }},<br/><br/>
        {{ $t_locale('pages-extended/emails/notifications/auto-allow-crawlers/body')('content', {garageName, date}) }}
      </td>
    </tr>

    <tr><CentralButton :text="$t_locale('pages-extended/emails/notifications/auto-allow-crawlers/body')('backOfficeLink')" :url="backOfficeLink"/></tr>

    <tr><BaseFooter></BaseFooter></tr>
  </table>
</template>

<script>
  import BaseHeader from '../../../../components/emails/notifications/BaseHeader';
  import BaseFooter from '../../../../components/emails/notifications/BaseFooter';
  import CentralButton from '../../../../components/emails/general/CentralButton.vue';

  export default {
    layout: 'email',
    components: { BaseHeader, BaseFooter, CentralButton },
    computed: {
      payload() { return this.$store.getters.payload; },
      contact() { return (this.payload.contact || {}); },
      garage() {
        return this.payload.garage;
      },
      garageName() {
        return this.garage.publicDisplayName;
      },
      date() {
        return (this.contact.payload && this.contact.payload.updateAt) ? this.$dd(new Date(this.contact.payload.updateAt), 'DD MMMM YYYY') : '';
      },
      backOfficeLink() {
        return `${this.payload.gsClient.url.getShortUrl('ADMIN_GARAGES')}#${this.garage.id}`;
      }
    }
  }
</script>

<style lang="scss" scoped></style>
