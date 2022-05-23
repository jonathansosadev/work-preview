<template>
  <div class="thankYou">
      <div class="thankYou__logo">
          <img :src="imgPath">
        </div>
      <div class="thankYou__title">
          <slot name="title" />
        </div>
      <div class="thankYou__content">
          <slot name="content" />
      </div>
      <div class="thankYou__signature">
          <slot name="signature" />
      </div>
</div>
</template>
<script>
export default {
  name:"AutomationThankYou",
  props: {
    logo: String,
    title: String,
    content: String,
    signature: String
  },
  computed: {
    imgPath() {
      return '/certificate/images/logos/' + this.logo;
    },
  },
}
</script>
<style lang="scss" scoped>
.thankYou {
    text-align: center;

    &__title {
        font-size: 3rem;
        font-weight: 900;
        color: $black;
        line-height: 1.43;
        padding: 2rem 1rem;
    }
    &__content {
        padding: 1rem;
        font-size: 1.5rem;
        font-weight: 300;
        color: $dark-grey;
        line-height: 1.43;
    }
    &__signature {
        font-weight: 400;
        color: $grey;
    }
}
</style>