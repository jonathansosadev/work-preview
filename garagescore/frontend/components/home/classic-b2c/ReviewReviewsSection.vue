<template>
  <div class="review">
    <div class="review__container">
      <div class="review__container__garage">{{ review.garage }}</div><div class="review__rating">
        <div class="review__container__rating__note" :style="{ backgroundImage: 'url(' + getMiniTrophyBackgroundUrl + ')' }">
          <AppText class="review__container__rating__note__text" tag="span" extra-bold size="md">{{ review.rating }}</AppText>
          </div>
        <div class="review__container__rating__customer">
          <span class="review__container__rating__customer__row1">{{ review.customerName }}</span>
          <span v-if="review.customerCity"> à </span>
          <span v-if="review.customerCity" class="review__container__rating__customer__city">{{ review.customerCity }}</span>
          <div class="review__container__rating__customer__row2">
            <div class="review__container__rating__customer__date">{{ $d(new  Date(review.date)) }}</div>
            <div class="review__container__rating__customer__stars">
              <RatingStar class="review__container__rating" :maxValue="5" :value="review.rating / 2"/>
            </div>
          </div>
        </div>
      </div>
      <div class="review__container__comment">{{ comment }}</div>
      <div class="review__container__details">
        <div class="review__container__details__vehicle">{{ review.vehicle }}</div>
        <div class="review__container__details__transaction">{{ transactions }}</div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.review {
  width: 100%;
  position: relative;
  box-sizing: border-box;
  display: flex;

  &__container {
    &__garage {
      color: $gsBrandColor;
      font-weight: 300;
      padding-bottom: .5rem;
      height: 1.8rem;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      font-size: 1.25rem;
    }
    &__rating {
      display: flex;
      flex-wrap: row wrap;
      
      &__note {
        display: inline-block;
        width: 64px;
        height: 50px;
        text-align: center;
        font-size: 1.5rem;
        background-size: contain;
        vertical-align: top;
        background-repeat: no-repeat;
        margin-right: 5px;
        //background-color: red;

        &__text {
          position: relative;
          top: 1.4rem;
        }
      }
      &__customer {
        font-size: 1.3rem;
        color: $dark-grey;
        font-weight: 300;
        display: inline-block;
        
        &__row1 {
          font-weight: 700;
        }
        &__row2 {
          display: flex;
          font-weight: 300;
          flex-flow: row nowrap;
          margin-top: .5rem;
        }
        &__stars {
          margin-left: 5px;
          justify-content: center;
          position: relative;
          top: 5px;
        }
      }
    }
    &__comment {
      overflow: hidden;
      overflow-y: hidden;
      font-size: 1.5rem;
      line-height: 1.2;
      padding-top: .5rem;
      word-wrap: break-word;
      text-align: left;
      color: $gsBrandColor;
      font-weight: 300;
      max-height: 150px;
    }
    &__details {
      font-weight: 300;
      color: $dark-grey;
      font-size: 12px;
      font-style: italic;
      margin-top: 10px;
      &__transaction {
        padding-top: 5px;
      }
    }
  }
}
.icon-gs-star, .icon-gs-half-star {
  font-size: 1rem;
}
</style>
<script>
import RatingStar from "../../ui/RatingStar.vue";
export default {
  name: "ReviewReviewsSection",
  components: { RatingStar },
  props: ["review"],
  computed: {
    comment() {
      const m = this.review.comment;
      return m.length > 200 ? `${m.substring(0, 200)}...`: m;
    },
    transactions() {
      return this.review.transaction.map(transaction => this.$t_locale('components/home/classic-b2c/ReviewReviewsSection')(transaction)).join(', ');
    },
    getMiniTrophyBackgroundUrl() {
      const rouderedRating = Math.round(this.review.rating * 2) / 2;
      return `/home/classic-b2c/reviews/mini-trophy/${rouderedRating.toString().replace(/\./, ',')}.png`;
    }
  },
};
</script>

