<template>
  <div>
    <EmailLogos/>
    <EmailGreetings/>
    <p v-html="followup1"></p>
    <p>{{ $t_locale('pages-extended/emails/survey/followup-lead-body')('followup2') }}</p>
    <p class="space-before"><a class="surveyUrl" :href="surveyUrl">{{ $t_locale('pages-extended/emails/survey/followup-lead-body')('followup3') }}</a></p>
    <p class="space-after">{{ $t_locale('pages-extended/emails/survey/followup-lead-body')('followup4') }}</p>
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
.space-before {
  margin-top: 30px;
}
.space-after {
  margin-top: 30px;
}
.surveyUrl {
  color: #219ab5;
  text-decoration: underline;
}
</style>
<script>
import EmailSignature from "../../../components/emails/survey/EmailSignature.vue";
import EmailCopyright from "../../../components/emails/survey/EmailCopyright.vue";
import EmailGreetings from "../../../components/emails/survey/EmailGreetings.vue";
import EmailLogos from "../../../components/emails/survey/EmailLogos.vue";
import EmailTracking from '../../../components/emails/survey/EmailTracking';

export default {
  layout: 'email',
  components: {
    EmailSignature,
    EmailCopyright,
    EmailGreetings,
    EmailLogos,
    EmailTracking
  },
  computed: {
    payload() { return this.$store.getters.payload; },
    followup1() {
      const garagePublicDisplayName = this.payload.garage.publicDisplayName;
      let projectType = this.$t_locale('pages-extended/emails/survey/followup-lead-body')('project_type_DEFAULT', { garagePublicDisplayName });
      if (this.payload.sourceTypeCategory === 'XLEADS' && this.payload.adTitle && this.payload.adUrl) {
        projectType = this.$t_locale('pages-extended/emails/survey/followup-lead-body')('project_type_XLEADS', { adTitle: this.payload.adTitle, adUrl: this.payload.adUrl, garagePublicDisplayName });
      } else if (this.payload.sourceTypeCategory === 'AUTOMATION') {
        projectType = this.$t_locale('pages-extended/emails/survey/followup-lead-body')('project_type_AUTOMATION', { garagePublicDisplayName });
      }
      return this.$t_locale('pages-extended/emails/survey/followup-lead-body')("followup1", { projectType });
    },
    surveyUrl() {
      return this.payload.surveyUrls.base;
    }
  }
}
</script>

