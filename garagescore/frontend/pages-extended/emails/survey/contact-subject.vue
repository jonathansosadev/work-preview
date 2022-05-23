<template>
  <div>
    <span v-if="channel === 'email' && contactNumber === 1">
      {{$t_locale('pages-extended/emails/survey/contact-subject')("q1")}}{{ isSatisfied }} {{ reason }} {{garageType}} {{garageName}}{{$t_locale('pages-extended/emails/survey/contact-subject')("q2")}}
    </span>
    <span v-if="channel === 'email' && contactNumber === 2 && fromXDaysAgo < 35">
      {{ share }} {{ reason }} {{garageType}} {{garageName}}
    </span>
    <span v-if="channel === 'email' && contactNumber === 2 && fromXDaysAgo >= 35">
      {{ discover }} {{garageType}} {{garageName}}
    </span>
    <span v-if="channel === 'email' && contactNumber === 3 && fromXDaysAgo < 40">
	    {{ lastChance }} {{garageType}} {{garageName}}
    </span>
    <span v-if="channel === 'email' && contactNumber === 3 && fromXDaysAgo >= 40">
	    {{ noMoreTime }} {{garageType}} {{garageName}}
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
      contactNumber() {
        return this.contactData('contactNumber');
      },
      fromXDaysAgo() {
        return this.$store.getters.emailData('fromXDaysAgo');
      },
      // 'Satisfaite ou mécontente de' : 'Satisfait ou mécontent de'
      isSatisfied() {
        const customerTitle = this.$store.getters.emailData('customerTitle');
        return this.$t_locale('pages-extended/emails/survey/contact-subject')(`isSatisfied${customerTitle}`);

      },
      // Partagez votre avis sur
      share() {
        return this.$t_locale('pages-extended/emails/survey/contact-subject')(`share`);
      },
      // Découvrez ce que nos clients disent de notre
      discover() {
        return this.$t_locale('pages-extended/emails/survey/contact-subject')(`discover`);
      },
      // Dernière chance pour partager votre avis sur notre
      lastChance() {
        return this.$t_locale('pages-extended/emails/survey/contact-subject')(`lastChance`);
      },
      // Plus que quelques heures pour découvrir ce que nos clients pensent de notre
      noMoreTime() {
        return this.$t_locale('pages-extended/emails/survey/contact-subject')(`noMoreTime`);
      },
      vehicleName() {
        return this.$t_locale('pages-extended/emails/survey/contact-subject')(`vehiculeName_${this.$store.getters.emailData('garage').type}`);
      },
      //  votre visite : l'achat de votre {{ vehicleName }}
      reason() {
        const campaignType = this.$store.getters.emailData('contact').campaignType;
        const vehicleName = this.vehicleName;
        return campaignType === 'VehicleSale' ? this.$t_locale('pages-extended/emails/survey/contact-subject')('reasonSale', { vehicleName }) : this.$t_locale('pages-extended/emails/survey/contact-subject')('reasonMaintenance'); 
      },
      // établissement : centre
      garageType() {
        const campaignType = this.$store.getters.emailData('contact').campaignType;
        const type = campaignType === 'VehicleInspection' ? 'inspection' : 'garage';
        return this.$t_locale('pages-extended/emails/survey/contact-subject')(`type_${type}`);
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

