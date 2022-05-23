<template>
    <section id="teaser" class="teaser firstsection">
        <div class="teaser__container">
          <div class="teaser__content" v-if="showTeaser">
            <div class="teaser__content__txt">{{ $t_locale('components/home/classic-b2c/TeaserSection')('teaserTitle') }}</div>
            <div class="teaser__content__txt">{{ $t_locale('components/home/classic-b2c/TeaserSection')('teaserTxt1') }} <span style="font-weight: 900;">{{reviewsCount}} {{ $t_locale('components/home/classic-b2c/TeaserSection')('teaserTxt2') }}</span></div>
            <div class="teaser__content__txt">{{ $t_locale('components/home/classic-b2c/TeaserSection')('teaserTxt3') }}</div>
            <div class="teaser__thinline"></div>
          </div>
        </div>
    </section>
</template>
<style lang="scss" scoped>
.teaser {
    background: #333 url('/home/classic-b2c/teaser/teaser-bg.jpg') no-repeat 0 0;
    background-size: cover;
    height: 430px;
    padding-top: 35px;
    &__container {
      position: relative;
    }
    &__content {
      box-sizing: border-box;
      margin: auto;
      max-width: 1110px;
      @media (max-width: $breakpoint-min-sm) {
        margin-left: 10px;
        margin-right: 10px;
      }
      @media (max-width: $breakpoint-min-md) {
        margin-left: 15px;
        margin-right: 15px;
      }
      &__txt {
        font-size: 32px;
        line-height: 48px;
        font-family: 'Lato';
        font-style: normal;
        font-weight: 400;
        color: $greyish-brown;
        @media (max-width: $breakpoint-min-sm) {
          font-size: 25px;
          line-height: 45px;
        }
      }
    }
  &__thinline {
      height: 2px;
      width: 7rem;
      background-color: $gsBrandColor;
      margin-top: 1rem;
  }
}
</style>
<script>
export default {
  data() {
    return {};
  },
  computed: {
    showTeaser() {
      return (this.$store.state.b2c && this.$store.state.b2c.home && this.$store.state.b2c.home.reviewsCount && this.$store.state.b2c.home.reviewsCount > 0);
    },
    reviewsCount() {
      const c = (this.$store.state.b2c && this.$store.state.b2c.home && this.$store.state.b2c.home.reviewsCount) || 0;

      return c.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }
  }
}
</script>

