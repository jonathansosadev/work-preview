<template>
  <div class="signature">
    <p>{{ $t_locale('components/emails/survey/EmailSignature')("cordially") }}</p>
    <p v-if="isValidSignature">
      <b>
        {{ signatureFirstName }} {{ signatureLastName }}
      </b>
      <br>
      {{ signature.job }}
      <br>
    </p>
    <p v-else>
      <b>
        {{ translatedGarageDisplayName }}
      </b>
    </p>
    
    <p v-if="isLastLocale">
      <b v-if="isValidSignature">{{ garage.publicDisplayName }}</b>
      <br>
      <span v-if="hasStreetAddress">{{ garage.streetAddress }}</span>
      <span v-if="hasCity">
        <br>
      </span>
      <span v-if="hasPostalCode">
        {{ garage.postalCode }}&nbsp;
      </span>
      <span v-if="hasCity">
        {{ garage.city }}
      </span>
    </p>
    <p v-if="hasSignaturePhone && isLastLocale">
      <b>Tel : {{ signature.phone }}</b>
    </p>
    <p v-if="!isLastLocale"> 
      <b v-if="isValidSignature">{{ garage.publicDisplayName }}</b>
    </p>
  </div>
</template>

<script>
  export default {
    name: "EmailSignature",
    layout() {
      return "email";
    },

    computed: {
      payload() {
        return this.$store.getters.payload;
      },
      garage() {
        return this?.payload?.garage;
      },
      dataType() {
        return this?.payload?.dataType;
      },
      hasCity() {
        return this?.garage?.city;
      },
      hasPostalCode() {
        return this.hasCity && this?.garage?.postalCode
      },
      hasStreetAddress() {
        return this?.garage?.streetAddress;
      },
      translatedGarageDisplayName() {
        return this.$t_locale('components/emails/survey/EmailSignature')(
          "gsTeam",
          { garage: this.garage.publicDisplayName },
        );
      },
      signature() {
        const { surveySignature } = this.garage;

        if (!surveySignature) {
          return '';
        }

        if (surveySignature?.useDefault) {
          return surveySignature.defaultSignature;
        }

        return this.getSignatureByType(this.dataType, surveySignature);
      },
      isValidSignature() {
        // I slightly change the rule here
        // Before: lastName was required to make the signature valid
        // Now: either firstName or lastName (or both) make the signature valid
        return this?.signature?.firstName || this?.signature?.lastName;
      },
      hasSignaturePhone() {
        return this?.signature?.phone;
      },
      signatureFirstName() {
        return this?.signature?.firstName || '';
      },
      signatureLastName() {
        return this?.signature?.lastName || '';
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
      isValidSurveySignature({ firstName, lastName } = {}) {
        return firstName || lastName;
      },
      getSignatureByType(type, surveySignature) {
        if (!surveySignature) {
          return '';
        }
        if (this.isValidSurveySignature(surveySignature[type])) {
          return surveySignature[type];
        }

        return surveySignature.defaultSignature;
      },
    }
  };
</script>

<style scoped>
  p {
    margin: 0 0 10px 0;
  }
</style>
