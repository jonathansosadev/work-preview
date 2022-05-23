
<template>
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
  <tr>
    <td class="two-column" :style="headerStyle">
      <!--[if (gte mso 9)|(IE)]>
      <table width="100%">
        <tr>
          <td width="30%" valign="top">
      <![endif]-->

      <div class="logos-and-garage-name">
        <table>
          <tr>
            <td align="left">
              <div class="brand-logo"><!-- v-for="logo in garage.logoEmail" :key="logo" -->
                <img :src="logoImg">
              </div>
            </td>
            <td align="left">
              <div class="garage-name-and-garagescore-signature">
                <p class="garage-name">
                  {{garageNamePart1}}
                  <span v-if="garageNamePart2"><br>{{garageNamePart2}}</span>
                </p>
              </div>
            </td>
          </tr>
        </table>
      </div>
    </td>
  </tr>
  </table>
</template>

<script>
export default {
  props: {
    logoUrl: String,
    garageName: String,
    themeColor: String
  },
  data() {
    return {};
  },
  layout() {
    return "email";
  },
  computed: {
    payload() { return null },
    garageNamePart1() {
      const publicDisplayName = this.garageName || '';
      let splits = publicDisplayName.replace(')', '').split('(');
      if (splits.length > 1) {
        return splits[0].trim();
      }
      splits = publicDisplayName.split(' ');
      const beginning = splits.slice(0, (splits.length / 2) || 1)
      return beginning.join(' ');
    },
    garageNamePart2() {
      const publicDisplayName = this.garageName || '';
      let splits = publicDisplayName.replace(')', '').split('(');
      if (splits.length > 1) {
        return splits[1].trim();
      }
      splits = publicDisplayName.split(' ');
      const end = splits.slice(splits.length / 2, splits.length);
      return end.join(' ');
    },
    headerStyle() {
     return  {
       'background-image': `url(${process.env.www_url}/automation/header-email-automation.jpg)`,
       'border-color': this.themeColor || '#F36233'
      }
    },
    logoImg() {
      return `${process.env.www_url}/static/latest/images/survey/${this.logoUrl}`;
    }
  }
};
</script>

<style lang="scss" scoped>
.two-column {
  padding-bottom:20px;
  padding-top:20px;
  border-bottom: 2px solid;
  background-size: cover;
  background-repeat: no-repeat;
  background-position-x: right;
  background-color: #F9F9F9;
}
.logos-and-garage-name {
  text-align: left;
  margin: 0;
  padding-left: 10px;
  padding-right: 10px;
}
.logos-and-garage-name .brand-logo {
  height: 60px;
  margin: 0 10px 0 0;
  float: left;
}
.logos-and-garage-name .brand-logo img {
  height: 100%;
  width: auto;
}
.logos-and-garage-name .garage-name-and-garagescore-signature {
  min-width: 200px;
  float: left;
  text-align: left;
}
.logos-and-garage-name .garage-name-and-garagescore-signature .garage-name {
  font-size: 14px;
  font-weight: 900;
  color: #000;
  margin: 0;
  text-align: left;
  text-transform: uppercase;
  font-family: Arial, Helvetica, sans-serif;
  line-height: 1.43;
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
.test {
  float: right;
  height: 63px;
  vertical-align: middle;
}
.test p {
  margin: 0;
}
.test p img {
  vertical-align: middle;
    border: 0;
    width: 93px;
}
</style>
