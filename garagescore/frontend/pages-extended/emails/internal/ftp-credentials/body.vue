<template slot="content">
  <table border="0" cellspacing="0" cellpadding="0">
    <tr>
      <BaseHeader title="login FTP" color="blue" :subTitle="payload.user" logo-url="/images/www/alert/notepad.png"/>
    </tr>
    <tr>
      <td class="content">
        Cher collègue,<br/><br/>
        <span>Ci dessous les identifiants FTP:</span><br/><br/>
        <div style="padding-left: 20px">
        <p>Login: <b>{{ payload.user }}</b><br/></p>
        <p>Password: <b>{{ payload.pwd }}</b><br/></p>
        <p>Host: <b>ftp.garagescore.com</b><br/><br/><br/></p>
        </div>
      </td>
    </tr>
    <tr><BaseFooter/></tr>
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

<style lang="scss" scoped>
  .content {
    margin-bottom: 50px;
  }
</style>
