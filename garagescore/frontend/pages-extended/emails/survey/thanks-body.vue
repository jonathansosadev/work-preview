<template>
  <div v-if="isCustom">
    <EmailLogos/>
    <EmailGreetings/>
    <div v-html="customHTML"></div>
    <div class="spacer-before-signature"></div>
    <EmailSignature/>
    <div class="spacer-before-footer"></div>
    <EmailCopyright/>
  </div>
  <div v-else-if="channel === 'sms'"></div>
  <div v-else>
    <EmailLogos/>
    <EmailGreetings/>
    <div v-if="surveyComplete && !surveyDetractor">
      <br/>
      <p>{{$t_locale('pages-extended/emails/survey/thanks-body')("thanks1_1")}}</p>

      <p v-if="contactType == 'make'">
        <br/>
        <strong>
          <span class="nota">{{ $t_locale('pages-extended/emails/survey/thanks-body')("nota") }}:&nbsp;</span>
          <span v-if="brandName">{{ $t_locale('pages-extended/emails/survey/thanks-body')('notaBrand', { brandName, countryName }) }}</span>
          <span v-else>{{ $t_locale('pages-extended/emails/survey/thanks-body')('notaMake') }}</span>
        </strong>
      </p>

      <div v-if="customerComment">
        <br/>
        <p>
            {{ $t_locale('pages-extended/emails/survey/thanks-body')('share_comment') }}
            <a :href="redirectUrl" target="_blank">
              <img class="google" src="/e-reputation/Google2.svg" alt="Google" />
            </a>
        </p>
        <p>
          <i>
            {{$t_locale('pages-extended/emails/survey/thanks-body')("customer_comment")}}
            {{ reviewRating }}- {{ customerComment }}
          </i>
        </p>
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <CentralButton
              :clipboard="customerComment"
              :fullWidth ="false"
              :padding="padding"
              :color="color"
              :text="$t_locale('pages-extended/emails/survey/thanks-body')('share_comment_on_google')"
              :url="redirectUrl"
              width="360px"
            >
            </CentralButton>
          </tr>
        </table>
        <p class="nota-bene">
          {{ $t_locale('pages-extended/emails/survey/thanks-body')('copy_past') }}
        </p>
        <br/>
        <br/>
      </div>

      <p>{{$t_locale('pages-extended/emails/survey/thanks-body')("thanks1_2")}}
        <a :href="garageURL" >{{$t_locale('pages-extended/emails/survey/thanks-body')("click")}}</a>
      </p>
    </div>

    <div v-if="surveyComplete && surveyDetractor">
      <p>{{$t_locale('pages-extended/emails/survey/thanks-body')("thanks2_1")}}</p>
      <p>{{$t_locale('pages-extended/emails/survey/thanks-body')("thanks2_2")}}
        <a :href="garageURL">{{$t_locale('pages-extended/emails/survey/thanks-body')("click")}}</a>
      </p>
    </div>

    <div v-if="!surveyComplete && !surveyDetractor">
      <p>{{$t_locale('pages-extended/emails/survey/thanks-body')("thanks3_1")}}</p>

      <br v-if="contactType === 'make'" />
      <p v-if="contactType === 'make'">
        <strong>
          <span class="nota">{{ $t_locale('pages-extended/emails/survey/thanks-body')('nota') }}:&nbsp;</span>
          <span v-if="brandName">{{ $t_locale('pages-extended/emails/survey/thanks-body')('notaBrand', { brandName, countryName }) }}</span>
          <span v-else>{{ $t_locale('pages-extended/emails/survey/thanks-body')('notaMake') }}</span>
        </strong>
      </p>
      <br v-if="contactType === 'make'" />

      <p>{{$t_locale('pages-extended/emails/survey/thanks-body')("thanks3_2")}}
        <u>
          <a :href="surveyUrls.base" class="yes">{{$t_locale('pages-extended/emails/survey/thanks-body')("finish")}}</a>
        </u>
      </p>

    </div>
    <div v-if="!surveyComplete && surveyDetractor">
      <p>{{$t_locale('pages-extended/emails/survey/thanks-body')("thanks4_1")}}</p>
      <p>{{$t_locale('pages-extended/emails/survey/thanks-body')("thanks4_2")}}
        <br>
        <br>
        <u>
          <a :href="surveyUrls.base" class="yes">{{$t_locale('pages-extended/emails/survey/thanks-body')("finish")}}</a>
        </u>
      </p>
    </div>

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
    return {};
  },
  layout() {
    return "email";
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
    channel() {
      return this.contactData('channel');
    },
    contactType() {
      return this.contactData('contactType');
    },
    brandName() {
      const customerBrand = this.$store.getters.emailData('vehicleMake');
      const garageBrands = this.$store.getters.emailData('garage').brandNames;
      if (customerBrand && garageBrands && garageBrands.length > 0 && garageBrands[0] === customerBrand) {
        return customerBrand;
      }
      return '';
    },
    countryName() {
      const rawLocale = this.$store.getters.emailData('garage').locale;
      return rawLocale && this.brandName ? this.$t_locale('pages-extended/emails/survey/thanks-body')(`country_${rawLocale.split('_').pop()}`) : '';
    },
    isCustom() {
      return this.contactData('custom');
    },
    surveyComplete() {
      return this.contactData('surveyComplete');
    },
    surveyDetractor() {
      return this.contactData('surveyDetractor');
    },
    garageURL() {
      return this.$store.getters.emailData("garageURL");
    },
    surveyUrls() {
      return this.$store.getters.emailData("surveyUrls") || {};
    },
    customerComment() {
      return this.$store.getters.emailData('comment');
    },
    redirectUrl() {
      return this.$store.getters.emailData('redirectUrl');
    },
    customHTML() {
      // in the future this should be plain text taken from the database
      // like this.$store.getters.emailData("customHTML") as a json
      // with one field per surveyComplete/this.surveyDetractor
      // and the data taken from renderContactPayload
      // at the moment it's just an hack made for Fiat St Brieuc without any db access
      const notaFiat = `<br/><b>${this.$t_locale('pages-extended/emails/survey/thanks-body')('notaFiat')}</b>`;
      const notaMakeOrBrand = this.brandName ? this.$t_locale('pages-extended/emails/survey/thanks-body')('notaBrand', { brandName: this.brandName, countryName: this.countryName }) : this.$t_locale('pages-extended/emails/survey/thanks-body')('notaMake');
      if (this.surveyComplete && !this.surveyDetractor) {
        return `<div><p>${this.$t_locale('pages-extended/emails/survey/thanks-body')("thanks1_1")}${notaFiat}</p><p><span class="nota">${this.$t_locale('pages-extended/emails/survey/thanks-body')("nota")}: </span>${notaMakeOrBrand}</p><p>${this.$t_locale('pages-extended/emails/survey/thanks-body')("thanks1_2")}<a href="${this.garageURL}" >${this.$t_locale('pages-extended/emails/survey/thanks-body')("click")}</a></p></div>`
      }
      if (this.surveyComplete && this.surveyDetractor) {
        return `<div><p>${this.$t_locale('pages-extended/emails/survey/thanks-body')("thanks2_1")}${notaFiat}</p><p>${this.$t_locale('pages-extended/emails/survey/thanks-body')("thanks2_2")}<a href="${this.garageURL}" >${this.$t_locale('pages-extended/emails/survey/thanks-body')("click")}</a></p></div>`
      }
      if (!this.surveyComplete && !this.surveyDetractor) {
        return `<div><p>${this.$t_locale('pages-extended/emails/survey/thanks-body')("thanks3_1")}${notaFiat}</p><p><span class="nota">${this.$t_locale('pages-extended/emails/survey/thanks-body')("nota")}: </span>${notaMakeOrBrand}</p><p>${this.$t_locale('pages-extended/emails/survey/thanks-body')("thanks3_2")}<a href="${this.surveyUrls.base}" class="yes">${this.$t_locale('pages-extended/emails/survey/thanks-body')("finish")}</a></p></div>`
      }
      if (!this.surveyComplete && this.surveyDetractor) {
        return `<div><p>${this.$t_locale('pages-extended/emails/survey/thanks-body')("thanks4_1")}${notaFiat}</p><p>${this.$t_locale('pages-extended/emails/survey/thanks-body')("thanks4_2")}<a href="${this.surveyUrls.base}" class="yes">${this.$t_locale('pages-extended/emails/survey/thanks-body')("finish")}</a></p></div>`
      }
    }
  },
  methods: {
    contactData(key, fallback = '') {
      const contact = this.$store.getters.emailData('contact');
      return (contact && contact[key]) || fallback;
    }
  }
};
</script>

<style lang="scss" scoped>
  .spacer-before-signature {
    margin-bottom: 30px;
  }
  .spacer-before-footer {
    margin-bottom: 50px;
  }
  .nota {
    color: #219ab5;
  }
  .google {
    width:70px;
    vertical-align: middle;
  }
  .nota-bene {
    text-align: center;
    font-style: italic;
    font-size: 12px;
    color: $dark-grey;
  }
</style>
