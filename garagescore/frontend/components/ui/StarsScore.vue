<template>
    <section class="stars-score">
      <i class="icon-gs-star stars-score--full" v-for="fullStar in fullStars"></i>
      <i class="icon-gs-half-star stars-score--half" v-for="halfStar in halfStars"><span class="path1 left"></span><span class="path2 right"></span></i>
      <i class="icon-gs-star stars-score--empty" v-for="emptyStar in emptyStars"></i>
    </section>
</template>

<script>
  export default {
    data() {
      return {
        max: 5
      };
    },

    props: {
      score: [Number, String]
    },

    computed: {
      secureScore() {
        return Math.abs(parseFloat(this.score)) % (this.max + 1 );
      },
      fullStars() {
        return Math.floor(this.secureScore);
      },
      halfStars() {
        return Math.round(this.secureScore) > this.fullStars ? 1 : 0;
      },
      emptyStars() {
        return this.max - this.fullStars - this.halfStars;
      }
    }
  }
</script>

<style lang="scss" scoped>
  $fullStarColor: #f5cc00;
  $emptyStarColor: #bcbcbc;

  .stars-score {
    &--full {
      color: $fullStarColor;
    }

    &--half {
      .left {
        color: $fullStarColor;
      }

      .right {
        color: $emptyStarColor;
      }
    }

    &--empty {
      color: $emptyStarColor;
    }
  }
</style>
