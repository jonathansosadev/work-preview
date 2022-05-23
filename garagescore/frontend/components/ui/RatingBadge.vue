<template>
  <div class="rating-badge" :class="classBindingBackground">
    <a target="_blank" :href="certifUrl" class="rating-badge__link">
      <div class="rating-badge__value">{{ value | oneDecimal | frenchFloating }}</div>
    </a>
  </div>
</template>


<script>
  import GarageTypes from '~/utils/models/garage.type.js';
  export default {
    props: {
      value: {
        type: [String, Number]
      },

      garageSlug: String,
      garageType: String
    },

    computed: {
      classBindingBackground() {
        return {
          'rating-badge--bg-excellence': this.value >= 9,
          'rating-badge--bg-premium': this.value < 9 && this.value >= 8,
          'rating-badge--bg-certified': this.value < 8,
        };
      },
      certifUrl() {
        return `${this.$store.getters['wwwUrl']}/${GarageTypes.getSlug(this.garageType) || 'garage'}/${this.garageSlug}`;
      }
    }
  }
</script>

<style lang="scss" scoped>
.rating-badge {

  background-size: cover;
  height: 3rem;
  width: 3rem;
  background-image: url('/rating-badge/certified.svg');
  text-align: center;

  &__link {
    color: inherit;
    text-decoration: inherit;
  }

  &--bg-premium {
    background-image: url('/rating-badge/premium.svg');
  }
  &--bg-excellence {
    background-image: url('/rating-badge/excellence.svg');
  }
  &--bg-certified {
    background-image: url('/rating-badge/certified.svg');
  }

  &__value {
    padding-top: 1rem;
    font-size: 1rem;
    font-weight: 900;
  }
}
</style>

