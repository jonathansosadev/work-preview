<template>
  <div>
    <EmailLogos/>
    <EmailGreetings/>
    <div v-if="contactNumber === 1">
      <p>{{ thanks }}</p>
      <div v-if="contactType === 'make'">
        <p>{{$t_locale('pages-extended/emails/survey/contact-body')("shareMake1")}}</p>
        <ul>
          <li>
            {{$t_locale('pages-extended/emails/survey/contact-body')("shareMake2")}}
            <strong>{{$t_locale('pages-extended/emails/survey/contact-body')("shareMake3")}}</strong>
            {{$t_locale('pages-extended/emails/survey/contact-body')("shareMake4")}}
          </li>
          <li>
            {{$t_locale('pages-extended/emails/survey/contact-body')("shareMake5")}}
            <strong>{{$t_locale('pages-extended/emails/survey/contact-body')("shareMake6")}}
              <span v-if="brandName">{{ $t_locale('pages-extended/emails/survey/contact-body')('brandCountry', { brandName, countryName }) }}</span>
              <span v-else>{{$t_locale('pages-extended/emails/survey/contact-body')('make')}}</span>
            </strong>
            {{$t_locale('pages-extended/emails/survey/contact-body')("shareMake7")}}
          </li>
        </ul>
      </div>
      <p v-else>{{ pleaseRespondSurvey }}</p>
      <p>
        {{ $t_locale('pages-extended/emails/survey/contact-body')('shareOpinion') }}&nbsp;<span class="bold">{{ $t_locale('pages-extended/emails/survey/contact-body')('happyRating', { n: ratingType === 'rating' ? 10 : 5 }) }}</span>
      </p>
    </div>
    <div v-if="contactNumber === 2 && contactType !== 'make'">
      <p>
        {{ satisfactionLevel }}
        {{ $t_locale('pages-extended/emails/survey/contact-body')('stillCan') }}
      </p>
      <p>
        {{ $t_locale('pages-extended/emails/survey/contact-body')('shareOpinion') }}&nbsp;<span class="bold">{{ $t_locale('pages-extended/emails/survey/contact-body')('happyRating', { n: ratingType === 'rating' ? 10 : 5 }) }}</span>
      </p>
    </div>
    <div v-if="contactNumber === 2 && contactType === 'make'">
      <p>
        {{ thanksMake_contact2 }}
      </p>
      <p>{{ $t_locale('pages-extended/emails/survey/contact-body')('blablaMake1_contact2') }}</p>
      <p>{{ $t_locale('pages-extended/emails/survey/contact-body')('blablaMake2_contact2') }} <a :href="surveyUrl" class="surveyUrl">{{$t_locale('pages-extended/emails/survey/contact-body')("blablaMakeLink_contact2")}}</a></p>
      <p>{{ $t_locale('pages-extended/emails/survey/contact-body')('blablaMake3_contact2') }}</p>
      <p>{{ $t_locale('pages-extended/emails/survey/contact-body')('blablaMake4_contact2') }}</p>
    </div>

    <div v-if="contactNumber === 3 && contactType !== 'make'">
      <p>
        {{ lastHour }}
      </p>
      <p>
        {{ $t_locale('pages-extended/emails/survey/contact-body')('shareOpinion') }}&nbsp;<span class="bold">{{ $t_locale('pages-extended/emails/survey/contact-body')('happyRating', { n: ratingType === 'stars' ? 5 : 10 }) }}</span>
      </p>
    </div>

    <EmailStars v-if="displayRating && ratingType === 'stars'" :lang="currentLocale"/>
    <EmailRating v-else-if="displayRating" :isReverseRating="isReverseRating" :lang="currentLocale"/>
    <EmailSignature/>
    <div class="spacer-before-footer"></div>
  </div>
</template>

<style>
.spacer-before-footer {
  margin-bottom: 30px;
}
.surveyUrl {
  color: #219ab5;
  text-decoration: underline;
}
.bold {
  font-weight: 700;
}
</style>

<script>
import EmailGreetings from "../../../components/emails/survey/EmailGreetings.vue";
import EmailLogos from "../../../components/emails/survey/EmailLogos.vue";
import EmailRating from "../../../components/emails/survey/EmailRating.vue";
import EmailStars from "../../../components/emails/survey/EmailStars.vue";
import EmailSignature from "../../../components/emails/survey/EmailSignature.vue";


export default {
  components: {
    EmailSignature,
    EmailRating,
    EmailStars,
    EmailGreetings,
    EmailLogos,
  },
  data() {
    return {};
  },
  layout() {
    return "email";
  },
  computed: {
    contactNumber() {
      return this.contactData('contactNumber', 1);
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
      return rawLocale && this.brandName ? this.$t_locale('pages-extended/emails/survey/contact-body')(`country_${rawLocale.split('_').pop()}`) : '';
    },
    surveyUrl() {
      return this.$store.getters.emailData("surveyUrls").base;
    },
    //  Nous vous remercions d’avoir...
    thanks() {
      const campaignType = this.$store.getters.emailData("contact").campaignType;
      const vehicleName = this.vehicleName;
      const contactType = this.contactData("contactType");
      const group = this.$store.getters.emailData("garage").group;
      const garage = contactType === 'default' ?
        this.$store.getters.emailData("garage").publicDisplayName
        :this.$t_locale('pages-extended/emails/survey/contact-body')(`group_of`, { group });
      return this.$t_locale('pages-extended/emails/survey/contact-body')(`thanks_${campaignType}`, { vehicleName, garage });
    },
    // nous souhaitons nous assurer...
    pleaseRespondSurvey() {
      const campaignType = this.$store.getters.emailData("contact").campaignType;
      const garage = this.$store.getters.emailData("garage").publicDisplayName;
      const group = this.$store.getters.emailData("garage").group;
      return this.$t_locale('pages-extended/emails/survey/contact-body')(`pleaseRespondSurvey_${campaignType}`, { garage, group });
    },
    //  Nous vous avons récemment consulté ca
    satisfactionLevel() {
      const campaignType = this.$store.getters.emailData("contact").campaignType;
      const vehicleName = this.vehicleName;
      const contactType = this.contactData("contactType");
      const group = this.$store.getters.emailData("garage").group;
      const garageType = this.garageType;
      const garage = contactType === 'default' ?
        `${garageType} ${this.$store.getters.emailData("garage").publicDisplayName}`
        :this.$t_locale('pages-extended/emails/survey/contact-body')(`garage_of`, { group });
      return this.$t_locale('pages-extended/emails/survey/contact-body')(`satisfactionLevel`, { reason: this.reason, garage });
    },
    // Nous vous remercions d’avoir...
    thanksMake_contact2() {
      const group = this.$store.getters.emailData("garage").group;
      return this.$t_locale('pages-extended/emails/survey/contact-body')(`thanksMake_contact2`, { reasonTM: this.reasonTM, group });
    },
    // uite à votre visite dans notre établissement du groupe garagescore, il ne vous reste plus que quelques heures
    lastHour() {
      const group = this.$store.getters.emailData("garage").group;
      const garageType = this.garageType;
      const contactType = this.contactData("contactType");
      const garage = contactType === 'default' ?
        `${garageType} ${this.$store.getters.emailData("garage").publicDisplayName}`
        :this.$t_locale('pages-extended/emails/survey/contact-body')(`garage_of`, { group });
      return this.$t_locale('pages-extended/emails/survey/contact-body')(`lastHour`, { reason: this.reason, garage });
    },
    vehicleName() {
      return this.$t_locale('pages-extended/emails/survey/contact-body')(`vehiculeName_${this.$store.getters.emailData('garage').type}`);
    },
    reason() {
      const campaignType = this.$store.getters.emailData('contact').campaignType;
      const vehicleName = this.vehicleName;
      return campaignType === 'VehicleSale' ? this.$t_locale('pages-extended/emails/survey/contact-body')('reasonSale', { vehicleName }) : this.$t_locale('pages-extended/emails/survey/contact-body')('reasonMaintenance');
    },
    reasonTM() {
      const campaignType = this.$store.getters.emailData('contact').campaignType;
      const vehicleName = this.vehicleName;
      return campaignType === 'VehicleSale' ? this.$t_locale('pages-extended/emails/survey/contact-body')('reasonTMSale', { vehicleName }) : this.$t_locale('pages-extended/emails/survey/contact-body')('reasonTMMaintenance');
    },
    garageType() {
      const campaignType = this.$store.getters.emailData('contact').campaignType;
      const type = campaignType === 'VehicleInspection' ? 'inspection' : 'garage';
      return this.$t_locale('pages-extended/emails/survey/contact-body')(`type_${type}`);
    },
    displayRating() {
      return this.contactNumber === 1 || ((this.contactNumber === 2 || this.contactNumber === 3) && this.contactType !== 'make');
    },
    ratingType() {
      return this.$store.getters.emailData("garage").ratingType || 'rating';
    },
    isReverseRating() {
      return !!this.$store.getters.emailData("garage").isReverseRating;
    },
    currentLocale() {
      return this.$store.getters.emailData('locale')
    },
    localeIndex() {
      return this.$store.getters.emailData('localeIndex')
    },
    totalLocales() {
      return this.$store.getters.emailData('totalLocales')
    },
    isLastLocale() {
      return this.localeIndex === this.totalLocales - 1
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
