<template>
  <div>
    <EmailLogos/>
    <EmailGreetings/><br>
    <div>
      <p>{{ $t_locale('pages-extended/emails/survey/reply-body')('thanks1_1') }}</p>
      <p>{{ $t_locale('pages-extended/emails/survey/reply-body')('justReplied', { garageName: payload.garage.publicDisplayName, garageType })}}</p>
      <p class="reply"><i>{{ payload.reply }}</i></p>
      <p v-if="online"><br>{{ $t_locale('pages-extended/emails/survey/reply-body')('thanks1_2') }} <a :href="payload.garageURL" >{{$t_locale('pages-extended/emails/survey/reply-body')("click")}}</a></p>
    </div>
    <div class="spacer-before-signature"></div>
    <EmailSignature/>
    <div class="spacer-before-footer"></div>
    <EmailCopyright/>
    <EmailTracking/>
  </div>
</template>
<style>
.spacer-before-signature {
  margin-bottom: 30px;
}
.spacer-before-footer {
  margin-bottom: 50px;
}
.reply {
  margin: 20px;
  color: #219AB5;
}
</style>

<script>
import EmailSignature from "../../../components/emails/survey/EmailSignature.vue";
import EmailCopyright from "../../../components/emails/survey/EmailCopyright.vue";
import EmailGreetings from "../../../components/emails/survey/EmailGreetings.vue";
import EmailLogos from "../../../components/emails/survey/EmailLogos.vue";
import EmailTracking from '../../../components/emails/survey/EmailTracking';

export default {
  components: {
    EmailSignature,
    EmailCopyright,
    EmailGreetings,
    EmailLogos,
    EmailTracking
  },
  data() {
    return {};
  },
  layout() {
    return "email";
  },
  computed: {
    payload() { return this.$store.getters.payload; },
    // établissement OU centre
    garageType() {
      const campaignType = this.payload.contact.campaignType;
      const type = (campaignType === 'VehicleInspection') ? 'inspection' : 'garage';
      return this.$t_locale('pages-extended/emails/survey/reply-body')(`type_${type}`);
    },
    online() {
      return this.payload.online;
    }
  }
};
</script>

