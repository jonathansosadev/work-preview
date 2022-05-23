<template>
  <section id="partners" class="partners">
      <div class="partners__container">
            <div class="partners__container__title">
             {{ $t_locale('components/home/classic-b2c/PartnersSection')('partnersTitle')}}
              <span class="partners__container__title__gsname">garage</span>
              <span class="partners__container__title__gsname__bold">Score</span>
              {{ $t_locale('components/home/classic-b2c/PartnersSection')('partnersTitlePunc')}}
            </div>
            <div class="partners__container__thinline"></div>
          <div class="partners__container__images">
            <div v-if="partners.google" class="partners__container__images__img"><img src="/home/classic-b2c/partners/google.svg" alt="Google" /></div>
            <div v-if="partners.pj" class="partners__container__images__img"><img src="/home/classic-b2c/partners/pj.svg" alt="Pages Jaunes" /></div>
            <div v-if="partners.lc" class="partners__container__images__img"><img src="/home/classic-b2c/partners/lc.svg" alt="La Centrale" /></div>
            <div v-if="partners.promoneuve" class="partners__container__images__img"><img src="/home/classic-b2c/partners/promoneuve.svg" alt="PromoNeuve" /></div>
            <div v-if="partners.ofr" class="partners__container__images__img"><img src="/home/classic-b2c/partners/ofr.svg" alt="OuestFrance" /></div>
            <div v-if="partners.mappy" class="partners__container__images__img"><img src="/home/classic-b2c/partners/mappy.svg" alt="Mappy" /></div>
            <div v-if="partners.zoomcar" class="partners__container__images__img"><img src="/home/classic-b2c/partners/zoomcar.svg" alt="ZoomCar" /></div>
          </div>
      </div>
  </section>
</template>
<style lang="scss" scoped>
.partners {
  padding-top: 40px;
  margin-bottom: 10px;

  &__container {
    margin: auto;
    max-width: 1110px;
    padding-right: 15px;
    padding-left: 15px;

    &__title {
      font-size: 1.9em;
      line-height: 1.6;
      font-weight: 300;
      margin-bottom: 1rem;

      &__gsname {
        color: $gsBrandColor;
        font-family: "NexaLight", sans-serif;
        
        &__bold {
          color: $gsBrandColor;
          font-family: "NexaBold", sans-serif;
        }
      }
    }
    &__thinline {
        height: 2px;
        width: 7rem;
        background-color: $gsBrandColor;
    }
    &__images {
      display:flex;
      justify-content: center;
      flex-direction: row;
      flex-wrap: wrap;
      text-align: center;
      margin-top: 1.5rem;

      &__img {
        img {
          margin: auto;
          width: 216px;
          height: 87px;
        }
      flex: 0 0 25%;
      max-width: 25%;
      @media (max-width: $breakpoint-min-lg) {
        flex: 0 0 33%;
        max-width: 33%;
      }
      @media (max-width: $breakpoint-min-md) {
        flex: 0 0 50%;
        max-width: 50%;
      }
      @media (max-width: $breakpoint-min-sm) {
        flex: 0 0 100%;
        max-width: 100%;
      }
      }
    }
  }
}
</style>
<script>
export default {
  data() {
    const locale = this.$store.getters['b2c/locale'];
    const partners = {
      google: true,
      pj: locale === 'fr_FR',
      lc: locale === 'fr_FR',
      promoneuve: locale === 'fr_FR',
      ofr: locale === 'fr_FR',
      mappy: locale === 'fr_FR',
      zoomcar: locale === 'fr_FR'
    };
    return { partners };
  }
};
</script>

