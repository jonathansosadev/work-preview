<template>
  <div class="description--pros">
    <img
      class="description--pros__icon"
      :src="icon"
      :alt="title"
      v-tooltip="{ content: title }"
    />
    <div class="description--pros__text">
      <span class="description--pros__block">
        <b>
          {{ title }}
        </b>
        {{ text }}
        <div class="description--pros__logos">
          <div v-for="(logo, index) in displayLogos" :key="index">
            <img
              class="description--pros__logos__logo"
              v-tooltip="{ content: logo.title }"
              :title="logo.title"
              :src="logo.link"
              :alt="logo.title"
            />
          </div>
        </div>
      </span>
      
    </div>
  </div>
</template>

<script>
export default {
  name: 'BenefitService',
  props: {
    icon: String,
    title: String,
    text: String,
    logos: { 
      default: () => [],
      type: Array
    }
  },
  computed: {
    displayLogos() {
      return this.logos.filter(({ showLogo }) => showLogo);
    }
  }
}
</script>

<style lang="scss" scoped>
.description {

  &--pros {
    display: flex;
    flex-direction: row;
    justify-content: left;
    align-items: flex-start;
    font-size: 1.2rem;
    margin: 0 0 2rem 0;
    line-height: 1.5;
    width: 90%;

    &__icon {
      background-color: $bg-grey;
      padding: 1.2rem;
      border-radius: 20px;
      width: 3rem;
    }

    &__text {
      font-weight: 400;
      margin-left: 1rem;
      position: relative;
      top: .7rem;
    }

    &__block {
      display: inline-block;
      font-weight: 400;
    }

    &__logos {
      display: inline-flex;
      width: fit-content;
      position: relative;
      top: .5rem;
      margin-left: .5rem;

      &__logo {
        width: 1.7rem;
        height: 1.7rem;
        margin-right: .7rem;
      }
    }
  }
}
</style>