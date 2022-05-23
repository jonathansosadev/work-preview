<template>
  <div>
    <span v-if="channel === 'email' && surveyComplete && !surveyDetractor && contactType === 'make'">
      {{ thanksMake }}
    </span>
    <span v-if="channel === 'email' && surveyComplete && !surveyDetractor && contactType !== 'make'">
      {{ thanksAlot }} {{garageType}} {{garageName}}
    </span>
    <span v-if="channel === 'email' && surveyComplete && surveyDetractor">
      {{ gotIt }}
    </span>
    <span v-if="channel === 'email' && !surveyComplete">
      {{ dontForget}} {{garageType}} {{garageName}}
    </span>
  </div>
</template>
<script>
  export default {
    components: { },
    data() {
      return { }
    },
    layout () {
      return 'email';
    },
    computed: {
      channel() {
        return this.contactData('channel');
      },
      contactType() {
      return this.contactData('contactType');
      },
      surveyComplete() {
        return this.contactData('surveyComplete');
      },
      surveyDetractor() {
        return this.contactData('surveyDetractor');
      },
      // Nous comptons sur votre participation
      thanksMake() {
        return this.$t_locale('pages-extended/emails/survey/thanks-subject')(`thanksMake`);
      },
      // Merci infiniment pour votre avis sur
      thanksAlot() {
        return this.$t_locale('pages-extended/emails/survey/thanks-subject')(`thanksAlot`);
      },
      // Votre avis vient d'être pris en compte
      gotIt() {
        return this.$t_locale('pages-extended/emails/survey/thanks-subject')(`gotIt`);
      },
      // N'oubliez pas de finir votre avis sur
      dontForget() {
        return this.$t_locale('pages-extended/emails/survey/thanks-subject')(`dontForget`);
      },
      // établissement : centre
      garageType() {
        const campaignType = this.$store.getters.emailData('contact').campaignType;
        const type = campaignType === 'VehicleInspection' ? 'inspection' : 'garage';
        return this.$t_locale('pages-extended/emails/survey/thanks-subject')(`type_${type}`);
      },
      // garage.publicDisplayName
      garageName() {
        const garage = this.$store.getters.emailData('garage');
        return garage && garage.publicDisplayName;
      }
    },
    methods: {
      contactData(key, fallback = '') {
        const contact = this.$store.getters.emailData('contact');
        return (contact && contact[key]) || fallback;
      }
    }
  }
</script>

