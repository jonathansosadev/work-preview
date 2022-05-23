<template>
  <div>
    <EmailLogos/>
    <EmailGreetings/>
    <p>{{recontact1}}</p>
    <p>
      <b>{{$t_locale('pages-extended/emails/survey/recontact-body')('recontact2a', {reason: this.reason2})}}</b>
      {{$t_locale('pages-extended/emails/survey/recontact-body')('recontact2b')}}
      <b>{{recontact2c}}</b>.
    </p>
    <p>{{$t_locale('pages-extended/emails/survey/recontact-body')('recontact3')}}</p>
    <p>{{$t_locale('pages-extended/emails/survey/recontact-body')('recontact4')}}</p>
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
    components: {
      EmailSignature,
      EmailCopyright,
      EmailGreetings,
      EmailLogos,
      EmailTracking
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
      reason() {
        const campaignType = this.$store.getters.emailData('contact').campaignType;
        return campaignType === 'VehicleSale' ? this.$t_locale('pages-extended/emails/survey/recontact-body')('reasonSale') : this.$t_locale('pages-extended/emails/survey/recontact-body')('reasonMaintenance');
      },
      reason2() {
        const campaignType = this.$store.getters.emailData('contact').campaignType;
        return campaignType === 'VehicleSale' ? this.$t_locale('pages-extended/emails/survey/recontact-body')('reasonSale2') : this.$t_locale('pages-extended/emails/survey/recontact-body')('reasonMaintenance2');
      },
      recontact1() {
        const garage = this.$store.getters.emailData("garage").publicDisplayName
        const date = this.$dd(this.$store.getters.emailData('completedAt'), "long");
        return this.$t_locale('pages-extended/emails/survey/recontact-body')("recontact1", {garage, date, reason: this.reason});
      },
      recontact2c() {
        const respondent = this.contactData('respondent');
        if (respondent) {
          return this.$t_locale('pages-extended/emails/survey/recontact-body')("recontact2c");
        }
        return "";
      }

    },
    methods: {
      contactData(key, fallback = '') {
        const contact = this.$store.getters.emailData('contact');
        return (contact && contact[key]) || fallback;
      },
      displayDate(date, locale) {

        if (!date) { return ""; }
        if (locale === 'es') {
          // nope https://github.com/nodejs/node/issues/8500
          // const options = { year: 'numeric', month: 'long', day: 'numeric' };
          // return date.toLocaleDateString('es-ES', options);
        const days = ['Domingo','Lunes','Martes','Miercoles','Jueves','Viernes','Sábado'];
        const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return `${days[date.getDay()]} ${date.getDate()} de ${months[date.getMonth()]} ${date.getFullYear()}`;
        }
        // nope https://github.com/nodejs/node/issues/8500
        // const options = { year: 'numeric', month: 'long', day: 'numeric' };
        // return date.toLocaleDateString('fr-FR', options);
        const days = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
        const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
      }
    }
  }
</script>
