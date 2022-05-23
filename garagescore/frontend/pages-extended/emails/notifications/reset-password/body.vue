<template slot="content">
  <table border="0" cellspacing="0" cellpadding="0">
    <tr>
      <BaseHeader :title="$t_locale('pages-extended/emails/notifications/reset-password/body')('title')" color="blue" logo-url="/images/www/reinit-lock.png"></BaseHeader>
    </tr>

    <tr>
      <td class="content">
        {{ $t_locale('pages-extended/emails/notifications/reset-password/body')('greetings') }} {{ userFullName }},<br/><br/>
        {{ $t_locale('pages-extended/emails/notifications/reset-password/body')('content') }}. <b>{{ $t_locale('pages-extended/emails/notifications/reset-password/body')('expire')}}.</b>
      </td>
    </tr>

    <tr><CentralButton :text="$t_locale('pages-extended/emails/notifications/reset-password/body')('resetPasswordLink')" :url="resetPasswordLink"/></tr>

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
      user() {
        return this.payload.user;
      },
      userFullName() {
        return (this.user && this.user.getFullName()) || '';
      },
      resetPasswordLink() {
        const urlWithoutToken = this.payload.baseUrl + this.payload.gsClient.url.getShortUrl('AUTH_RESET_PASSWORD');
        return encodeURI(urlWithoutToken + this.payload.token);
      },
    }
  }
</script>

<style lang="scss" scoped>

  /** ----------Header----------- **/
  .bold {
    font-weight: 700;
  }
  .nowrap {
    white-space: nowrap;
  }

  .content {
    padding-bottom: 30px;
    padding-left: 20px;
    padding-right: 20px;
    font-family: Arial;
    font-size: 14px;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.43;
    letter-spacing: normal;
    text-align: left;
    color: #757575;
  }
  #button-row {
    padding-bottom: 50px;
  }
  .button {
    border-radius: 3px;
    background-color: #ED5600!important;
    max-width: 250px;
  }
  .button-text {
    text-decoration: none;
    border-radius: 3px;
    padding: 15px 30px;
    max-width: 200px;
    display: inline-block;
    font-family: Arial;
    font-size: 14px;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.43;
    letter-spacing: 0.7px;
    text-align: center;
    color: #FFF;
    /*margin: 0 38px;*/

  }
  /** --------------------------- **/

  #question {
    padding-left: 20px;
    padding-right: 20px;
    padding-bottom: 33px;
    font-family: Arial;
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
    font-family: Arial;
    font-size: 14px;
    font-weight: bold;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.14;
    letter-spacing: normal;
    text-align: left;
    color: #757575;
  }

  /** --------------------------- **/

</style>
