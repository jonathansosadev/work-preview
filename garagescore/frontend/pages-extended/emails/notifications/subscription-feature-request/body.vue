<template>
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <BaseHeader
          :title="$t_locale('pages-extended/emails/notifications/subscription-feature-request/body')('title')"
          color="blue"
          logo-url="/images/www/alert/feature-add.png"
        ></BaseHeader>
      </tr>
      <tr>
        <td align="center" id="content">
          {{ $t_locale('pages-extended/emails/notifications/subscription-feature-request/body')('greetings') }}<br/><br/>
          <span class="bolded">{{ payload.requestSenderName && payload.requestSenderName.trim() }}</span>, <JobHandler :job="payload.requestSenderJob"></JobHandler>, {{ $t_locale('pages-extended/emails/notifications/subscription-feature-request/body')('wishToGet') }} {{ payload.featureName }} {{ $t_locale('pages-extended/emails/notifications/subscription-feature-request/body')('onGS') }}<br/><br/>
          <span>{{ $t_locale('pages-extended/emails/notifications/subscription-feature-request/body')('thanksToThat') }}</span><br/><br/>
          <div style="padding-left:15px;padding-bottom:5px;">
            <img style="position:relative;top:3px;margin-right:5px;" :src="payload.gsClient.latestStaticUrl('/images/www/alert/check.png')"/>
            <span style="font-size:14px;">
              <span class="bolded">{{ $t_locale('pages-extended/emails/notifications/subscription-feature-request/body')('centralization') }}</span>
              {{$t_locale('pages-extended/emails/notifications/subscription-feature-request/body')('centralization2')}}
            </span>
            <img style="position:relative;top:3px;margin-right:1px;margin-left:5px;" :src="payload.gsClient.latestStaticUrl('/images/www/alert/garagescore-mini.png')"/>
            <img style="position:relative;top:3px;margin-right:1px;" :src="payload.gsClient.latestStaticUrl('/images/www/alert/google-mini.png')"/>
            <img style="position:relative;top:3px;margin-right:1px;" :src="payload.gsClient.latestStaticUrl('/images/www/alert/facebook-mini.png')"/>
            <img v-if="locale !== 'es'" style="position:relative;top:3px;margin-right:1px;" :src="payload.gsClient.latestStaticUrl('/images/www/alert/pagesjaunes-mini.png')"/>
          </div>
          <div style="padding-left:15px;padding-bottom:5px;">
            <img style="position:relative;top:3px;margin-right:5px;" :src="payload.gsClient.latestStaticUrl('/images/www/alert/check.png')"/>
            <span style="font-size:14px;">
              <span class="bolded">{{ $t_locale('pages-extended/emails/notifications/subscription-feature-request/body')('processing') }}</span>
              {{ $t_locale('pages-extended/emails/notifications/subscription-feature-request/body')('processing2') }}
            </span>
          </div>
          <div style="padding-left:15px;">
            <img style="position:relative;top:3px;margin-right:5px;" :src="payload.gsClient.latestStaticUrl('/images/www/alert/check.png')"/>
            <span style="font-size:14px;">
              <span class="bolded">
                {{ $t_locale('pages-extended/emails/notifications/subscription-feature-request/body')('mastery') }}
                </span>
              {{ $t_locale('pages-extended/emails/notifications/subscription-feature-request/body')('mastery2') }}
            </span>
          </div>
        </td>
      </tr>
      <tr>
        <td>
          <div style="text-align:center;padding-top:35px;padding-bottom:30px;">
            <img style="width:211px" :src="payload.gsClient.frontEndStaticUrl('/e-reputation/e-reputation-subscription-screen.png')"/>
          </div>

          <div style="color:#e7b22f;font-weight:bold;font-size:22px;margin-bottom:5px;text-align:center;font-family: arial"><!-- Add font-family prop, to overide a strange css bug -->
            {{ price }}
          </div>
        </td>
      </tr>
      <tr>
        <CentralButton
          :text="$t_locale('pages-extended/emails/notifications/subscription-feature-request/body')('add')"
          :url="payload.config.get('publicUrl.app_url') + payload.gsClient.url.getShortUrl('COCKPIT_E_REPUTATION') + garageIdQuery()"
        >
        </CentralButton>
      </tr>
      <tr>
        <BaseFooter></BaseFooter>
      </tr>
  </table>
</template>


<script>
import BaseHeader from '../../../../components/emails/notifications/BaseHeader';
import BaseFooter from '../../../../components/emails/notifications/BaseFooter';
import JobHandler from '../../../../components/emails/notifications/JobHandler';
import CentralButton from '../../../../components/emails/general/CentralButton';

export default {
  layout: 'email',
  components: { BaseHeader, BaseFooter, JobHandler, CentralButton },
  methods: {
    garageIdQuery() {
      return this.payload.garageId ? `?garageId=${this.payload.garageId}` : '';
    }
  },
  computed: {
    payload() { return this.$store.getters.payload; },
    locale() {
      return this.$store.getters.locale;
    },
    price() {
      return this.$t_locale('pages-extended/emails/notifications/subscription-feature-request/body')('price', { price: this.payload.garageLocale === 'fr_FR' ? '29' : '20' });
    }
  }
}
</script>


<style lang="scss" scoped>

  /** ----------Header----------- **/

  #bg-man {
    background-color: #F1F9FB;
  }
  #man {
    margin: 23px 0;
    height: 146px;
    width: 232px;
    display: block;
  }
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
  #button-row {
    padding: 50px 0;
  }
  .button {
    border-radius: 3px;
    background-color: transparent!important;
    max-width: 200px;
  }
  .button-text {
    text-decoration: none;
    border-radius: 3px;
    padding: 15px 40px;
    max-width: 200px;
    border: 1px solid #EC5601;
    display: inline-block;
    font-family: Arial;
    font-size: 14px;
    font-weight: bold;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.14;
    letter-spacing: 0.7px;
    text-align: center;
    color: #EC5601;
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
    letter-spacing: normal;
    text-align: left;
    color: #757575;
  }

  /** --------------------------- **/

</style>
