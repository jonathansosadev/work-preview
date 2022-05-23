<template>
  <div>
    <EmailLogos/>
    <EmailGreetings/>
    <p>{{ followup1 }}</p>
    <p>
      {{ $t_locale('pages-extended/emails/survey/followup-unsatisfied-body')('followup2') }}
    </p>
    <p>
      <a class="surveyUrl" :href="surveyUrl">
        {{ $t_locale('pages-extended/emails/survey/followup-unsatisfied-body')('followup3') }}
      </a>
    </p>
    <br/>
    <p>
      {{ $t_locale('pages-extended/emails/survey/followup-unsatisfied-body')('followup4') }}
    </p>
    <div class="spacer-before-signature"></div>
    <EmailSignature/>
    <div class="spacer-before-footer"></div>
    <EmailCopyright/>
    <EmailTracking/>
  </div>
</template>

<script>
  import EmailSignature from "../../../components/emails/survey/EmailSignature.vue";
  import EmailCopyright from "../../../components/emails/survey/EmailCopyright.vue";
  import EmailGreetings from "../../../components/emails/survey/EmailGreetings.vue";
  import EmailLogos from "../../../components/emails/survey/EmailLogos.vue";
  import EmailTracking from '../../../components/emails/survey/EmailTracking';

  export default {
    layout () {
      return 'email';
    },
    components: {
      EmailSignature,
      EmailCopyright,
      EmailGreetings,
      EmailLogos,
      EmailTracking,
    },

    computed: {
        vehicleName() {
          const garageType = this.$store.getters.emailData('garage').type;
          return this.$t_locale('pages-extended/emails/survey/followup-unsatisfied-body')(`vehiculeName_${garageType}`);
        },
        garageType() {
          const campaignType = this.$store.getters.emailData('contact').campaignType;
          const type = campaignType === 'VehicleInspection' ? 'inspection' : 'garage';
          return this.$t_locale('pages-extended/emails/survey/followup-unsatisfied-body')(`type_${type}`);
        },
        reason() {
          const campaignType = this.$store.getters.emailData('contact').campaignType;
          const vehicleName = this.vehicleName;
          return campaignType === 'VehicleSale' ? this.$t_locale('pages-extended/emails/survey/followup-unsatisfied-body')('reasonSale', { vehicleName }) : this.$t_locale('pages-extended/emails/survey/followup-unsatisfied-body')('reasonMaintenance');
        },
        followup1() {
          const garage = this.$store.getters.emailData("garage").publicDisplayName;
          const garageType = this.garageType;
          return this.$t_locale(
            'pages-extended/emails/survey/followup-unsatisfied-body'
          )(
            "followup1",
            {
              reason: this.reason,
              garage,
              garageType,
            }
          );
        },
        surveyUrl() {
          return this.$store.getters.emailData("surveyUrls")?.base || 'no url';
        }
      },
    methods: {
      contactData(key, fallback = '') {
        const contact = this.$store.getters.emailData('contact');
        return (contact && contact[key]) || fallback;
      }
    },
  }
</script>

<style>
.spacer-before-signature {
  margin-bottom: 30px;
}
.spacer-before-footer {
  margin-bottom: 50px;
}
.surveyUrl {
  color: #219ab5;
  text-decoration: underline;
}
</style>


