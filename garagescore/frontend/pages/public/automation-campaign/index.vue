<template>
  <section>
    <div v-if="loading">
      {{ $t_locale('pages/public/automation-campaign/index')('loading') }}
    </div>
    <div v-else-if="thanks" class="thanks">
      <ThankYou :logo="firstFormattedLogo">
        <template slot="title">{{ $t_locale('pages/public/automation-campaign/index')('thankYou_title') }}</template>
        <template slot="content">{{ $t_locale('pages/public/automation-campaign/index')('thankYou_content') }}</template>
        <template slot="signature">{{ $t_locale('pages/public/automation-campaign/index')('thankYou_signature', { garageName: garagePublicDisplayName || 'GarageScore' }) }}</template>
      </ThankYou>
    </div>
    <div v-else-if="isCampaignActive" class="landing">
      <Header :logoUrls="formattedLogoUrls" :garageName="garagePublicDisplayName"></Header>
      <div class="landing__content">
        <div class="landing__title">
          <Title :title="title" :customStyle="titleStyle"></Title>
        </div>
        <div class="landing__texte">
          <innerHTML :cssStyle="texteStyle" :content="getContent('contentText')"></innerHTML>
        </div>
        <div class="landing__insert" v-if="customContent && customContent.promotionalMessage" :style="insertStyle">
          <innerHTML :content="customContent.promotionalMessage" />
        </div>
        <div class="landing__subTitle" :style="subTitleStyle">
          {{ subTitle }}
        </div>
        <div class="landing__buttons">
          <div class="landing__button" >
            <span :style="buttonStyle" @click="setInterested()">{{ customContent && customContent.customButtonText || getContent('choice1') }}</span>
          </div>
          <div v-if="isAsterisk" class="asterisk"><i>{{ getContent('asterisk') }}</i></div>
        </div>
        <Footer>
          <div slot="greetings">{{ getContent('greetings') }}</div>
          <div slot="sender">{{ getContent('sender') }}</div>
        </Footer>
      </div>
    </div>
    <div v-else>
      <ThankYou :logo="firstFormattedLogo">
        <template slot="title">{{ $t_locale('pages/public/automation-campaign/index')('expired_campaign_thankYou_title') }}</template>
        <template slot="content">{{ $t_locale('pages/public/automation-campaign/index')('expired_campaign_thankYou_content', { phone }) }}</template>
        <template slot="signature">{{ $t_locale('pages/public/automation-campaign/index')('thankYou_signature', { garageName: garagePublicDisplayName || 'GarageScore' }) }}</template>
      </ThankYou>
    </div>
  </section>
</template>

<script>
/*
Pourquoi on utilise pas le même composant que l'email (extrait de Slack)
A la base on savait pas trop comment ça allait se préciser : Landing page avec plus d'éléments, interactions. On parlait aussi de faire une landing page email, tu lis l'email et t'as aussi accès a la LP, donc assez différents. Ensuite, dans la landing page le bouton ne t'amène pas vers un lien mais lance une requête a notre serveur, donc différent outcome vs email
Et puis email -> limité avec de l'html vieux, landing page -> html5
*/
  import ThankYou from '~/components/automation/ThankYou.vue';
  import Carousel from '~/components/automation/carousel/Carousel.vue';
  import CarouselSlide from '~/components/automation/carousel/CarouselSlide.vue';
  import CentralButton from '~/components/automation/CentralButton.vue';
  import Footer from '~/components/automation/Footer.vue';
  import Title from '~/components/automation/Title.vue';
  import Header from '~/components/automation/Header.vue';
  import innerHTML from '~/components/automation/innerHTML.vue';
  import { isOnMobileDevice } from '~/utils/is-on-mobile-device.js';


  export default {
    name: 'Campaign',
    components: {
      ThankYou,
      Carousel,
      CarouselSlide,
      CentralButton,
      Footer,
      Header,
      Title,
      innerHTML,
    },
    props: {
      titleStyle: {
        type: Object,
        default() {
          return {};
        }
      },
    },
    data() {
      return {
        loading: true,
        thanks: false,
        target: null,
        garagePublicDisplayName: null,
        customerName: null,
        logoUrls: null,
        customContent: null,
        fromMobile: false,
        isCampaignActive: null,
        phone: null,
        isMotorbikeDealership: false,
        customUrl: null
      };
    },
    async mounted() {
      const campaignid = this.$route.query.campaignid;
      const customerid = this.$route.query.customerid;
      const isLead = this.$route.query.isLead;
      if (campaignid && customerid) {
        const url = `/automation-campaign/${campaignid}/${customerid}/${isLead}/${this.fromMobile}`;
        this.handleServerResponse(url);
      }
      this.isFromMobile = isOnMobileDevice();
    },
    computed: {
      firstFormattedLogo() {
        return this.formattedLogoUrls[0] && this.formattedLogoUrls[0].toString();
      },
      isAsterisk() {
        // display asterisk for target essai/cotation
        return /_6|_12|_18|_24/.test(this.target);
      },
      title() {
        return this.getContent('title')
      },
      subTitle() {
        return this.getContent('titleChoices');
      },
      texteStyle() {
        return  {
          'font-family': 'Lato,sans-serif',
          'font-style': 'normal',
          'font-weight': 'normal',
          'color': '#757575'
        }
      },
      subTitleStyle() {
        return  {
          'font-family': 'Lato,sans-serif',
          'font-style': 'normal',
          'font-weight': 'bold',
          'color': '#000'
        }
      },
      insertStyle() {
        const themeColor = this.customContent && this.customContent.themeColor || '#F36233'
        return {
          "border-color": themeColor,
          "background-color": `${themeColor}10`
        }
      },
      buttonStyle() {
        return  {
          color : '#FFF',
          'background-color' : this.customContent && this.customContent.themeColor || '#F36233',
          'border-color' : this.customContent && this.customContent.themeColor || '#F36233',
          'max-width' : '600px !important',
          'width' : '100% !important',
          'font-weight': 'bold',
          'font-style': 'normal',
          'font-family' : 'Lato',
          'letter-spacing' : '0',
          'border-left' : 'inherit',
          'border-right' : 'inherit',
          'padding-left' : '15px',
          'padding-right' : '15px',
          'box-sizing' : 'border-box',
          'line-height' : '1.43',
          'margin': '0 auto'
        }
      },
      formattedLogoUrls() {
        if (this.logoUrls) {
          return [this.logoUrls];
        }
        return [''];
      },
      arguments() {
        return {
          garageName: this.garagePublicDisplayName,
          customerName: this.customerName,
          brandName: this.brandName,
          vehiculeType: this.vehiculeType
        }
      },
      vehiculeType() {
        if (this.isMotorbikeDealership) {
          return this.$t_locale('pages/public/automation-campaign/index')('Motorbike');
        }
        return this.$t_locale('pages/public/automation-campaign/index')('Vehicle');
      }
    },
    methods: {
      getContent(key) {
        if (this.customContent && this.customContent[key]) {
          return this.applyArguments(this.customContent[key]);
        }
        return this.$t_locale('pages/public/automation-campaign/index')(`${this.target}_${key}`, this.arguments);
      },
      applyArguments(str) {
        for (const arg of Object.keys(this.arguments)) {
          while (str.includes(`{${arg}}`)) {
            str = str.replace(`{${arg}}`, this.arguments[arg]);
          }
        }
        return str;
      },
      redirectCustomUrl(customUrl) {
        window.location = customUrl;
      },
      uploadSuccess(response) {
        this.target = response.target;
        this.logoUrls = response.logoUrls;
        this.garagePublicDisplayName = response.garagePublicDisplayName;
        this.customerName = response.customerName;
        this.thanks = response.thanks;
        this.brandName = response.brandName;
        this.customContent = response.customContent;
        this.isCampaignActive = response.isCampaignActive;
        this.phone = response.phone;
        this.isMotorbikeDealership = response.isMotorbikeDealership;
      },
      uploadFailed(response) {
        console.error('Request Error', response);
        this.thanks = true;
      },
      setInterested() {
        const campaignid = this.$route.query.campaignid;
        const customerid = this.$route.query.customerid;
        let url = `/automation-campaign/${campaignid}/${customerid}/isLeadFromLP/${this.fromMobile}`;
        if (this.customContent && this.customContent.customUrl) {
          url = `/public/automation-campaign-redirect/${campaignid}/${customerid}/${this.customContent._id.toString()}/isLeadFromLP/${this.fromMobile}`
        }
        this.handleServerResponse(url);
      },
      handleServerResponse(url) {
        this.loading = true;
        const requestSubmit = new XMLHttpRequest();
        requestSubmit.open('GET', url);
        requestSubmit.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        requestSubmit.onload = function onload() {
          const response = JSON.parse(requestSubmit.response);
          if (requestSubmit.status !== 200) {
            this.uploadFailed(response);
          } else if (response.customUrl){
            this.redirectCustomUrl(response.customUrl);
          } else {
            this.uploadSuccess(response);
          }
        }.bind(this);
        requestSubmit.send();
        this.loading = false;
      }
    },
  }
</script>

<style lang="scss" scoped>
  .thanks {
    margin-top: 2rem;
  }
  .asterisk {
    font-family: Arial,sans-serif;
    text-align: center;
    margin-top: 5px;
    padding: 2rem;
    padding-top: 0;
    color: $dark-grey;
    line-height: 1.43;
  }
  .landing {
    &__content {
      margin: 0 auto;
      max-width: 980px;
      padding: 0 15%;
    }
    &__insert {
      word-break: break-word;
      width: calc(100% - 4rem);
      margin-left: 2rem;
      border-radius: 3px;
      border: 1px solid;
      padding: 1rem;
      margin-top: 2rem;
    }
    &__buttons {
      border: none;
      display: block;
      margin-left: auto;
      margin-right: auto;
      font-size: 1.2rem;
      padding: 2rem 6rem 3rem;
    }
    &__button {
      margin-bottom: 1rem;
      &:last-child {
        margin-bottom: 0;
      }
      span {
        display: block;
        padding: 1rem;
        text-decoration: none;
        line-height: 1.43;
        color: white;
        background-color: $orange;
        cursor: pointer;
        text-align: center;
      }
    }
    &__title {
      padding: 0 2rem;
      max-width: 500px;
      margin: 0 auto;
      .title {
        font-size: 1.9rem;
        line-height: 1.43;
        text-align: center;
      }
    }
    &__subTitle {
      padding: 2rem 2rem 0 2rem;
      display: block;
      font-size: 1.4rem;
      font-stretch: normal;
      line-height: 1.43;
      text-align: left;
    }
    &__texte {
      padding: 0 2rem;
    }
  }
  @media (max-width: $breakpoint-min-md) {
    .landing {
      &__content {
        padding: 0 0;
      }
      &__insert {
        margin-left: 1rem;
      }
      &__button {
        padding-left: 20%;
        padding-right: 20%;
      }
      &__title {
        padding: 0;
      }
      &__subTitle {
        padding: 1rem 1rem 0rem 1rem;
      }
      &__texte {
        padding: 0 1rem;
      }
    }
    .test{
      background-position-x: -32px;
    }
  }

  @media (max-width: $breakpoint-min-sm) {
    .landing {
      &__buttons {
        padding-left: 2rem;
        padding-right: 2rem;
      }
      &__button {
        padding-left: 0;
        padding-right: 0;
      }
      &__title {
        padding: 0 1rem;
      }
      &__subTitle {
        padding: 1rem 1rem 1.5rem 1rem;
      }
      &__texte {
        padding: 0 1rem;
      }
      .test{
        height: 430px;
        background-image: url("https://i.imgur.com/YMKDTHq.jpg");
        background-position-x: -72px;
      }
    }
  }

  @media (max-width: 320px) {
    .test{
      height: 430px;
      background-image: url("https://i.imgur.com/YMKDTHq.jpg");
      background-position-x: -100px;
    }
  }
</style>
