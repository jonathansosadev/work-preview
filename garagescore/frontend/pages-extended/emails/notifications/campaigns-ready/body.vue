<template>
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <BaseHeader
          :title="$t_locale('pages-extended/emails/notifications/campaigns-ready/body')('title')"
          color="blue"
          logo-url="/images/www/alert/feature-add.png"
        ></BaseHeader>
      </tr>
      <tr>
        <td align="center" id="content">
          {{ $t_locale('pages-extended/emails/notifications/campaigns-ready/body')('greetings') }}<br/><br/>
          <span>{{ $t_locale('pages-extended/emails/notifications/campaigns-ready/body')('campaignsReady') }}</span><br/><br/>
          <span>{{ $t_locale('pages-extended/emails/notifications/campaigns-ready/body')('startWell') }}</span><br/><br/>
          <div style="padding-left:15px;padding-bottom:5px;">
            <img style="position:relative;top:3px;margin-right:5px;" :src="payload.gsClient.latestStaticUrl('/images/www/alert/check.png')"/>
            <span style="font-size:14px;">{{ $t_locale('pages-extended/emails/notifications/campaigns-ready/body')('recommandation1') }}</span>
          </div>
          <div style="padding-left:15px;padding-bottom:5px;">
            <img style="position:relative;top:3px;margin-right:5px;" :src="payload.gsClient.latestStaticUrl('/images/www/alert/check.png')"/>
            <span style="font-size:14px;">{{ $t_locale('pages-extended/emails/notifications/campaigns-ready/body')('recommandation2') }}</span>
          </div>
          <br/><br/>

          {{ $t_locale('pages-extended/emails/notifications/campaigns-ready/body')('perform') }}
        </td>
      </tr>
      <tr>
        <BaseFooter></BaseFooter>
      </tr>
  </table>
</template>


<script>
import BaseHeader from '../../../../components/emails/notifications/BaseHeader';
import BaseFooter from '../../../../components/emails/notifications/BaseFooter';

export default {
  layout: 'email',
  components: { BaseHeader, BaseFooter },
  methods: {
  },
  computed: {
    payload() { return this.$store.getters.payload; }
  }
}
</script>


<style lang="scss" scoped>

  /** ----------Header----------- **/
  #content {
    padding-left: 20px;
    padding-right: 20px;
    padding-top:30px;
    height: 53px;
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
    letter-spacing: normal;
    text-align: left;
    color: #757575;
  }

  /** --------------------------- **/

</style>
