<template>
  <div>
    <EmailLogos/>
    <p>
      {{ $t_locale('pages-extended/emails/survey/recontact-google-body')('greeting', { fullName }) }}
    </p>
    <br/>

    <p v-if="hasComment">
        {{ $t_locale('pages-extended/emails/survey/recontact-google-body')('comment_customer') }}
        <i>
          {{reviewRating}} - {{ comment }}
        </i>
    </p>
    <br v-if="hasComment" />

    <div>
      <p>
        {{ $t_locale('pages-extended/emails/survey/recontact-google-body')('content') }}
      </p>
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr >         
          <CentralButton
            :clipboard="comment"
            :fullWidth ="false"
            :padding="padding" 
            :color="color" 
            :text="$t_locale('pages-extended/emails/survey/recontact-google-body')('share_comment_on_google')" 
            :url="redirectUrl"
            width="360px"
          >
          </CentralButton>
        </tr>
      </table>
      <p v-if="hasComment" class="nota-bene">
        {{ $t_locale('pages-extended/emails/survey/recontact-google-body')('copy_past') }}
      </p>
      <br/>
      <br/>
    </div>
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
import CentralButton from '../../../components/emails/general/CentralButton.vue';

export default {
    components: {
      EmailSignature,
      EmailCopyright,
      EmailGreetings,
      EmailLogos,
      EmailTracking,
      CentralButton
    },
    data() {
      return { }
    },
    layout () {
      return 'email';
    },
    mounted() {
    },
    computed: {
      color() {
        return '#F36233' // orange
      },
      padding() {
        return '20px 0 5px 0';
      },
      ratingType() {
        return this.$store.getters.emailData('garage').ratingType;
      },
      reviewRating() {
        if (this.ratingType === 'stars') {
          // start notation
          return `${this.$store.getters.emailData("reviewRating") / 2}/5`;
        }
        return `${this.$store.getters.emailData("reviewRating")}/10`;
      },
      hasComment() {
        return !!this.$store.getters.emailData("comment")
      },
      comment() {
        return this.$store.getters.emailData("comment") || this.$t_locale('pages-extended/emails/survey/recontact-google-body')('no_comment');
      },
      fullName() {
        return this.$store.getters.emailData("addressee").fullName;
      },
      redirectUrl() {
        return this.$store.getters.emailData('redirectUrl');
      },
    },
    methods: {}
  }
</script>

<style lang="scss" scoped>
  .hide {
    display: none;  
  }
  .spacer-before-signature {
    margin-bottom: 30px;
  }
  .spacer-before-footer {
    margin-bottom: 50px;
  }
  .nota-bene {
    font-size: 12px;
    text-align: center;
    font-style: italic;
    color: $dark-grey;
  }
</style>
