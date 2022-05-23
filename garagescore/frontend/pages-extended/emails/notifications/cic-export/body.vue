<template slot="content">
  <table border="0" cellspacing="0" cellpadding="0">
    <tr>
      <BaseHeader title="login FTP" color="green" logo-url="/images/www/alert/notepad.png"></BaseHeader>
    </tr>
    <tr>
      <td class="content">
        Bonjour, voici ci-joint un export automatique des mécontents de la semaine dernière.
      </td>
    </tr>
    <tr><BaseFooter></BaseFooter></tr>
  </table>
</template>

<script>
  import BaseHeader from '../../../../components/emails/notifications/BaseHeader';
  import BaseFooter from '../../../../components/emails/notifications/BaseFooter';

  export default {
    layout: 'email',
    components: { BaseHeader, BaseFooter },
    computed: {
      payload() { return this.$store.getters.payload; }
    }
  }
</script>

<style lang="scss" scoped></style>
