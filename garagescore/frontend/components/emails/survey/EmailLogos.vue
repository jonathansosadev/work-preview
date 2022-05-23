<template>
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
  <tr>
    <td class="two-column" style="padding-bottom:20px;">
      <!--[if (gte mso 9)|(IE)]>
      <table width="100%">
        <tr>
          <td width="30%" valign="top">
      <![endif]-->

      <div v-if="localeIndex === 0" class="logos-and-garage-name">
        <div class="brand-logo" v-for="logo in garage.logoEmail" :key="logo">
          <img v-if="isGoogleRecontact" class="google" src="/e-reputation/Google.svg" alt="Google" />
          <img v-else :src="logoSource(logo)">
        </div>
        <div class="garage-name-and-garagescore-signature">
          <p class="garage-name">
            {{garageNamePart1}}
            <span v-if="garageNamePart2"><br>{{garageNamePart2}}</span>
          </p>
          <p v-if="!isVehicleInspection" class="garagescore-logo">
            {{$t_locale('components/emails/survey/EmailLogos')('by')}}
            <a href="https://www.garagescore.com/"><img class="garagescore-logo-inline-img" :src="gsLogoPicto"/> garage<b>Score</b></a>
          </p>
        </div>
      </div>
      <div v-else class="logos-and-garage-name">
        <div class="garage-name-and-garagescore-signature">
          <p class="garage-name">
            <span v-if="garageNamePart2"><br>{{garageNamePart2}}</span>
          </p>
          <p v-if="!isVehicleInspection" class="garagescore-logo">
            {{$t_locale('components/emails/survey/EmailLogos')('by')}}
            <a href="https://www.garagescore.com/"><img class="garagescore-logo-inline-img" :src="gsLogoPicto"/> garage<b>Score</b></a>
          </p>
        </div>
      </div>
    </td>
  </tr>
  </table>
</template>
<style>
.logos-and-garage-name {
  text-align: left;
  margin: 0;
  padding: 10px;
}
.logos-and-garage-name .brand-logo {
  height: 60px;
  margin: 0 10px 0 0;
  padding: 5px 0;
  float: left;
}
.logos-and-garage-name .brand-logo img {
  height: 100%;
  width: auto;
}
.logos-and-garage-name .garage-name-and-garagescore-signature {
  height: 30px;
  min-width: 220px;
  margin: 0 0 0 10px;
  float: right;
  text-align: right;
  padding: 20px 5px;
}
.logos-and-garage-name .garage-name-and-garagescore-signature .garage-name {
  font-size: 18px;
  font-weight: bold;
  color: #333333;
  margin: 0;
  text-align: right;
}
.logos-and-garage-name .garage-name-and-garagescore-signature .garagescore-signature {
  font-size: 13px;
  font-weight: bold;
  color: #43b9ad;
  margin: 0;
}
.logos-and-garage-name .garage-name-and-garagescore-signature .garagescore-signature a {
  text-decoration: none;
  color: #43b9ad;
}
.logos-and-garage-name .garage-name-and-garagescore-signature .garagescore-signature a img {
  border: 0;
  vertical-align: middle;
}

 .garagescore-logo {
 	color: #43b9ad;
  font-size: 13px;
  font-weight: normal;
  text-align: right;
 }

 .garagescore-logo a {
 	color: #43b9ad;
 	text-decoration: none;
 }

 .garagescore-logo-inline-img {
 	vertical-align:middle;
 }
</style>

<script>
import GarageTypes from '~/utils/models/garage.type.js';

export default {
  components: {},

  data() {
    return {};
  },
  layout() {
    return "email";
  },
  computed: {
    payload() { return this.$store.getters.payload; },
    logoSource() {
      return (logo) => `${this.$store.state.wwwUrl}/static/latest/images/survey/${logo}`;
    },
    isGoogleRecontact() {
        return this.$store.getters.emailData('isGoogleRecontact');
      },
    garage() {
      return this.$store.getters.emailData("garage");
    },
    isVehicleInspection() {
      return (this.garage && this.garage.type === GarageTypes.VEHICLE_INSPECTION);
    },
    garageNamePart1() {
      return this.$store.getters.emailData("garageNamePart1");
    },
    garageNamePart2() {
      return this.$store.getters.emailData("garageNamePart2");
    },
    gsLogoPicto() {
      return `/logo/icons/gs/icon-16x16.png`;
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
  }
};
</script>
