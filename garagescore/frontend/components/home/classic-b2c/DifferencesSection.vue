<template>
  <section id="differences" class="differences">
    <div class="differences__container">
      <div class="differences__container__txt">
        {{ $t_locale('components/home/classic-b2c/DifferencesSection')('differencesTitle1') }}
        <span class="differences__container__txt__gsname">garage</span>
        <span class="differences__container__txt__gsname__bold">Score</span>
        {{ $t_locale('components/home/classic-b2c/DifferencesSection')('differencesTitle2') }}
      </div>
      <div class="differences__container__thinline"></div>
      <div class="differences__container__boxes">
        <DifferenceBlocDifferencesSection
          v-for="box in boxes"
          :key="box.title"
          :icon="box.icon"
          :title="box.title"
          :text="box.text"
        ></DifferenceBlocDifferencesSection>
      </div>
    </div>
  </section>
</template>
<style lang="scss" scoped>
.differences {
  background-color: $gsBrandColor;
  padding-bottom: 1.5rem;
  padding-top: 1.5rem;
  &__container {
    margin: auto;
    max-width: 1110px;
    padding-right: 15px;
    padding-left: 15px;
    &__txt {
      color: white;
      font-style: normal;
      font-weight: 300;
      font-size: 2rem;
      margin-bottom: 1rem;
      @media (max-width: $breakpoint-min-md) {
        font-size: 1.5em;
      }
      &__gsname {
        font-family: "NexaLight", sans-serif;
        &__bold {
          font-family: "NexaBold", sans-serif;
        }
      }
    }
    &__thinline {
      height: 2px;
      width: 7rem;
      background-color: $white;
    }
    &__boxes {
      display: flex;
      flex-wrap: wrap;
      padding-top: 3rem;
    }
  }
}
</style>
<script>
import DifferenceBlocDifferencesSection from "./DifferenceBlocDifferencesSection.vue";
export default {
  components: { DifferenceBlocDifferencesSection },
  data() {
    const boxes = [
      {
        title: this.$t_locale('components/home/classic-b2c/DifferencesSection')("dt1"),
        icon: "icon-gs-groupe-bubble",
        text: this.$t_locale('components/home/classic-b2c/DifferencesSection')("dd1")
      },
      {
        title: this.$t_locale('components/home/classic-b2c/DifferencesSection')("dt2"),
        icon: "icon-gs-avis-bubble",
        text: this.$t_locale('components/home/classic-b2c/DifferencesSection')("dd2")
      },
      {
        title: this.$t_locale('components/home/classic-b2c/DifferencesSection')("dt3"),
        icon: "icon-gs-cadnat-bubble",
        text: this.$t_locale('components/home/classic-b2c/DifferencesSection')("dd3")
      },
      {
        title: this.$t_locale('components/home/classic-b2c/DifferencesSection')("dt4"),
        icon: "icon-gs-checked-bubble-2",
        text: this.$t_locale('components/home/classic-b2c/DifferencesSection')("dd4")
      }
    ];
    return { boxes };
  }
};
</script>

