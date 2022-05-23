
<template>
  <Carousel class="carousel">
    <CarouselSlide v-for="(logoUrl, index) in logoUrls" :key="index">
      <div class="logos-and-garage-name">
        <div class="brand-logo"><!-- v-for="logo in garage.logoEmail" :key="logo" -->
          <img :src="logoPath(logoUrl)">
        </div>
        <div class="garage-name-and-garagescore-signature">
          <p class="garage-name">
            {{garageNamePart1}}
            <span v-if="garageNamePart2"><br>{{garageNamePart2}}</span>
          </p>
        </div>
      </div>
      <div class="background" :style="backgroundStyle"></div>
    </CarouselSlide>
  </Carousel>
</template>

<script>

  import Carousel from './carousel/Carousel'
  import CarouselSlide from './carousel/CarouselSlide'
export default {
  name:"AutomationHeader",
  components: {
    Carousel,
    CarouselSlide
  },
  props: {
    logoUrls: Array,
    garageName: String
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
    headerPicture() {
     return  {
       'background-image': `url(${this.$store.state.wwwUrl}/automation/header-email-automation.jpg)`
      }
    },
    backgroundStyle() {
      if (window.innerWidth > 480) {
        return {'background-image': `url(${this.$store.state.wwwUrl}/automation/header-landing-page-desktop.jpg)`}
      } else {
        return {'background-image': `url(${this.$store.state.wwwUrl}/automation/header-landing-page-mobile.jpg)`}
      }
    }
  },
  methods: {
    logoPath (imgName) {
      return '/certificate/images/logos/' + imgName;
    }
  }
};
</script>

<style scoped lang="scss">
  .carousel {
    max-width: 980px;
    margin: 0 auto;
  }
  .brand-logo {
    height: 90px;
    margin: 0 0 0 0;
    padding: 5px 0;
  }
  .brand-logo img {
    height: 100%;
    width: auto;
  }
  .background{
    width: 100%;
    height: 260px;
    background-size: cover;
    background-repeat: no-repeat;
    background-position-x: center;
  }

  .logos-and-garage-name {
    position: absolute;
    text-align: center;
    margin: 0;
    padding: 20px 0;
    width: 100%;
  }

  .garage-name {
    padding-top: 8px;
  }

  .logos-and-garage-name .garage-name-and-garagescore-signature {
    height: 30px;
    min-width: 220px;
    text-align: center;
  }
  .logos-and-garage-name .garage-name-and-garagescore-signature .garage-name {
    font-size: 21px;
    font-weight: bold;
    color: #000;
    margin: 0;
    text-align: center;
    text-transform: uppercase;
    font-family: Arial, Helvetica, sans-serif;
    line-height: 1.43;
  }

  @media (max-width: $breakpoint-min-sm) {
    .background{
      height: 250px;
    }
  }
</style>