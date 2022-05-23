<template>
  <div>{{smsContent}}</div>
</template>
<script>

export default {
  components: { },
  data() {
    return {};
  },
  layout() {
    return "email";
  },
  computed: {
    vehicleName() {
      return this.$t_locale('pages-extended/sms/survey/contact-sms')(`vehiculeName_${this.$store.getters.emailData('garage').type}`);
    },
    smsContent() {
      const vehicleName = this.vehicleName;
      let garage = this.$store.getters.emailData("garage").publicDisplayName;
      garage = garage.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // removeDiacritics
      let abbreviatedTitle = this.$store.getters.emailData("addressee").abbreviatedTitle || '';
      abbreviatedTitle = abbreviatedTitle.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // removeDiacritics
      let fullName = this.$store.getters.emailData("addressee").fullName || '';
      fullName = fullName.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // removeDiacritics
      let gender = this.$store.getters.emailData("addressee").gender;
      let surveyUrl = this.$store.getters.emailData("surveyUrls").baseShort;

      const campaignType = this.$store.getters.emailData("contact")
        .campaignType;

      let content_XL = "";
      let content_L = "";
      let content_M = "";
      let content_S = "";
      let content_XS = "";
      if (this.contactData("name") ===  "ALLIANCE - SMS #1 (Maintenance)") {
        let brandName = this.$store.getters.emailData("garage").brandNames[0];
        content_XL = this.$t_locale('pages-extended/sms/survey/contact-sms')("sms_alliance_XL", { garage, surveyUrl, brandName, vehicleName }); // Bonjour, merci d’avoir choisi notre garage, partagez votre expérience ici { surveyUrl } { brandName }
        content_L = this.$t_locale('pages-extended/sms/survey/contact-sms')("sms_alliance_L", { garage, surveyUrl, brandName, vehicleName }); // Bonjour, merci d’avoir choisi notre garage, partagez votre expérience ici { surveyUrl } { brandName }
        content_M = this.$t_locale('pages-extended/sms/survey/contact-sms')("sms_alliance_M", { garage, surveyUrl, brandName, vehicleName }); // Bonjour, merci d’avoir choisi notre garage, partagez votre expérience ici { surveyUrl } { brandName }
        content_S = this.$t_locale('pages-extended/sms/survey/contact-sms')("sms_alliance_S", { garage, surveyUrl, brandName, vehicleName }); // Bonjour, merci d’avoir choisi notre garage, partagez votre expérience en cliquant ici { surveyUrl } { brandName }
        content_XS = this.$t_locale('pages-extended/sms/survey/contact-sms')("sms_alliance_XS", { garage, surveyUrl, brandName, vehicleName }); // Bonjour, merci d’avoir choisi le {{ garage.publicDisplayName | removeDiacritics }}, partagez votre expérience en cliquant ici { surveyUrl } { brandName }
      } else if (campaignType === "VehicleSale") {
        content_XL = this.$t_locale('pages-extended/sms/survey/contact-sms')("sms_VehicleSale_XL", { surveyUrl, garage, vehicleName }); // Bonjour, pourriez-vous nous partager votre avis suite à l’achat de votre véhicule dans notre établissement ? {surveyUrl}
        content_L = this.$t_locale('pages-extended/sms/survey/contact-sms')("sms_VehicleSale_L", { surveyUrl, garage, vehicleName }); //Bonjour, pourriez-vous nous partager votre avis suite à l’achat de votre véhicule dans notre établissement ? {surveyUrl}
        content_M = this.$t_locale('pages-extended/sms/survey/contact-sms')("sms_VehicleSale_M", { surveyUrl, garage, vehicleName }); // Bonjour, pourriez-vous nous partager votre avis suite à l’achat de votre véhicule dans notre établissement ? {surveyUrl}
        content_S = this.$t_locale('pages-extended/sms/survey/contact-sms')("sms_VehicleSale_S", { surveyUrl, garage, vehicleName }); // Bonjour, pourriez-vous nous partager votre avis suite à l’achat de votre véhicule dans notre établissement ? {surveyUrl}
        content_XS = this.$t_locale('pages-extended/sms/survey/contact-sms')("sms_VehicleSale_XS", { surveyUrl, garage, vehicleName }); // Bonjour, satisfait de l’achat de votre véhicule ? Evaluez notre établissement {garage} sur {surveyUrl}
      } else if (campaignType === "VehicleInspection") {
        content_XL = this.$t_locale('pages-extended/sms/survey/contact-sms')("sms_VehicleInspection_XL", {
          surveyUrl,
          garage
        }); // Satisfait de votre centre {garage} ? Evaluez le service sur {surveyUrl}
        content_L = this.$t_locale('pages-extended/sms/survey/contact-sms')("sms_VehicleInspection_L", {
          surveyUrl,
          garage
        }); // Merci pour votre visite chez {garage}. Evaluez le service sur {surveyUrl}
        content_M = this.$t_locale('pages-extended/sms/survey/contact-sms')("sms_VehicleInspection_M", {
          surveyUrl,
          garage
        }); // Merci pour votre visite chez {garage}. Satisfait ? Evaluez le service sur {surveyUrl}
        content_S = this.$t_locale('pages-extended/sms/survey/contact-sms')("sms_VehicleInspection_S", {
          surveyUrl,
          garage
        }); // Merci pour votre visite chez {garage}. Satisfait ou mécontent ? Evaluez le service sur {surveyUrl}
        content_XS = this.$t_locale('pages-extended/sms/survey/contact-sms')("sms_VehicleInspection_XS", {
          surveyUrl,
          garage
        }); // Bonjour, satisfait ou mécontent de votre centre {garage} ? Evaluez le service sur {surveyUrl}
      } else {
        if (fullName && abbreviatedTitle === "F") {
          content_XL = this.$t_locale('pages-extended/sms/survey/contact-sms')("sms_Maintenance_XL_title_F", {
            surveyUrl,
            garage,
            fullName,
            abbreviatedTitle: this.$t_locale('pages-extended/sms/survey/contact-sms')(abbreviatedTitle)
          });
        } // Bonjour {abbreviatedTitle} {fullName}. Satisfaite ou mécontente du service de {garage} ? Evaluez-le sur {surveyUrl}
        else if (fullName) {
          content_XL = this.$t_locale('pages-extended/sms/survey/contact-sms')("sms_Maintenance_XL_title_M", {
            surveyUrl,
            garage,
            fullName,
            abbreviatedTitle: this.$t_locale('pages-extended/sms/survey/contact-sms')(abbreviatedTitle)
          });
        } // Bonjour {abbreviatedTitle} {fullName}. Satisfaite ou mécontente du service de {garage} ? Evaluez-le sur {surveyUrl}
        else {
          content_XL = this.$t_locale('pages-extended/sms/survey/contact-sms')("sms_Maintenance_XL_Unknown", {
            surveyUrl,
            garage
          });
        } // Bonjour, satisfait ou mécontent du service de {garage} ? Evaluez le service sur {surveyUrl}
        content_L = this.$t_locale('pages-extended/sms/survey/contact-sms')("sms_Maintenance_L", { surveyUrl, garage, vehicleName }); // Merci pour votre visite chez {garage}. Satisfait ou mécontent ? Evaluez le service sur {surveyUrl}
        content_M = this.$t_locale('pages-extended/sms/survey/contact-sms')("sms_Maintenance_M", { surveyUrl, garage, vehicleName }); // Merci pour votre visite chez {garage}. Satisfait ? Evaluez le service sur {surveyUrl}
        content_S = this.$t_locale('pages-extended/sms/survey/contact-sms')("sms_Maintenance_S", { surveyUrl, garage, vehicleName }); // Merci pour votre visite chez {garage}. Evaluez le service sur {surveyUrl}
        content_XS = this.$t_locale('pages-extended/sms/survey/contact-sms')("sms_Maintenance_XS", { surveyUrl, garage, vehicleName }); // Merci pour votre visite chez votre garagiste. Satisfait ? Evaluez le service sur {surveyUrl}
      }
      if (content_XL.length < 140) {
        return content_XL;
      }
      if (content_L.length < 140) {
        return content_L;
      }
      if (content_M.length < 140) {
        return content_M;
      }
      if (content_S.length < 140) {
        return content_S;
      }
      return content_XS;
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

