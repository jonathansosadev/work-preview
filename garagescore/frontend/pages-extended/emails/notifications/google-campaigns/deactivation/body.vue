<!-- #4251 Google campaign is suspended<template slot="content">
  <table border="0" cellspacing="0" cellpadding="0">
    <tr>
      <BaseHeader :title="$t_locale('pages-extended/emails/notifications/google-campaigns/deactivation/body')('title')" :subTitle="garageName" color="red" logo-url="/images/www/alert/google.png"></BaseHeader>
    </tr>

    <tr>
      <td class="content">
        {{ $t_locale('pages-extended/emails/notifications/google-campaigns/deactivation/body')('greetings') }},<br/><br/><br/>
        <p>{{ $t_locale('pages-extended/emails/notifications/google-campaigns/deactivation/body')('googleNote') }}</p><br/><br/>
        <p>{{ $t_locale('pages-extended/emails/notifications/google-campaigns/deactivation/body')('googleNoteFinal') }}</p><br/><br/>
      </td>
    </tr>

    <tr><BaseFooter></BaseFooter></tr>
  </table>
</template>

<script>
  import BaseHeader from '../../../../../components/emails/notifications/BaseHeader';
  import BaseFooter from '../../../../../components/emails/notifications/BaseFooter';

  export default {
    layout: 'email',
    components: { BaseHeader, BaseFooter },
    computed: {
      payload() { return this.$store.getters.payload; },
      garageName() {
        return this.payload.garage.publicDisplayName;
      }
    }
  }
</script>

<style lang="scss" scoped></style>
-->