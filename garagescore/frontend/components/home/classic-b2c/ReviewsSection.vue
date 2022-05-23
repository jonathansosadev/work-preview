<template>
  <section id="reviews" class="reviews">
      <div class="reviews__container">
            <div class="reviews__container__title">
              {{ $t_locale('components/home/classic-b2c/ReviewsSection')('reviewsTitle')}}
            </div>
            <div class="reviews__container__thinline"></div>
          <div class="reviews__container__reviews">
            <div role="button" class="reviews__container__reviews__control">
              <div class="reviews__container__reviews__control__arrow" v-on:click="unslide"><i class="icon-gs-left color-grey gs-arrow"></i></div>
            </div>
            <div class="reviews__container__reviews__bloc" id="reviews__container__reviews__bloc1">
              <div class="reviews__container__reviews__bloc__slider">
              <span v-for="(review, i) in reviews1" :key="review.comment" class="reviews__container__reviews__bloc__slider__item">
                <transition 
                v-on:before-enter="beforeEnter"
                v-on:enter="enter"
                v-on:before-leave="beforeLeave"
                v-on:leave="leave"
                >
                  <ReviewReviewsSection :review="review" v-if="showReview1(i)"  />
                </transition>
                </span>
              </div>
            </div>
            <div class="reviews__container__reviews__bloc" id="reviews__container__reviews__bloc2">
              <div class="reviews__container__reviews__bloc__slider">
              <span v-for="(review, i) in reviews2" :key="review.comment" class="reviews__container__reviews__bloc__slider__item">
                <transition 
                v-on:before-enter="beforeEnter"
                v-on:enter="enter"
                v-on:before-leave="beforeLeave"
                v-on:leave="leave"
                >
                  <ReviewReviewsSection :review="review" v-if="showReview2(i)"  />
                </transition>
                </span>
              </div>
            </div>
            <div role="button" class="reviews__container__reviews__control">
              <div class="reviews__container__reviews__control__arrow" v-on:click="slide"><i class="icon-gs-right color-grey  gs-arrow"></i></div>
            </div>
          </div>
      </div>
  </section>
</template>
<style lang="scss" scoped>

.slide-leave-active,
.slide-enter-active {
  transition: 1s;
}
.slide-enter {
  transform: translate('-150px', 0);
}
.slide-enter {
  transform: translate('-150px', 0);
}
.slide-leave-to {
  transform: translate('150px', 0);
}
.reviews {
  padding-top: 40px;
  margin-bottom: 10px;

  &__container {
    max-width: 1110px;
    margin: auto;
    box-sizing: border-box;
    padding-right: 15px;
    padding-left: 15px;

    &__title {
      font-size: 1.9em;
      line-height: 1.6;
      font-weight: 300;
      margin-bottom: 1rem;
    }
    &__thinline {
      height: 2px;
      width: 7rem;
      background-color: $gsBrandColor;
    }
    &__reviews {
      margin-top: 30px;
      margin-bottom: 30px;
      display: flex;
      flex-flow: row;
      flex-wrap: nowrap;
      &__bloc {
        box-sizing: border-box;
        height: 220px;
        flex-grow: 0.5;
        padding-left: 15px;
        padding-right: 15px;
        margin-left: 20px;
        margin-right: 20px;
        @media (max-width: $breakpoint-min-md) {
          flex-grow: 1;
        }
        &__slider {
          position: relative;
          height: 350px;
          overflow: hidden;
          &__item {
            width: 100%;
            position: absolute;
            top: 0;
            left: 0;
          }
        }
      }
      &__control {
        font-size: 1.5rem;
        width: 50px;
        flex-direction: column;
        justify-content: center;
        text-align: center;
        display: flex;
        z-index: 1;
        background: white;
        &__arrow {
          cursor: pointer;
          font-size: 22px;
          cursor: pointer;
          color: #494949;
        }
      }
    }
  }
}

@media (max-width: $breakpoint-min-md) {
  #reviews__container__reviews__bloc2 {
    display: none;
  }
}
</style>
<script>
import ReviewReviewsSection from "./ReviewReviewsSection.vue";
export default {
  components: { 'ReviewReviewsSection': ReviewReviewsSection },
  data() {
    return {
      direction: 1,
      transitionDuration: 900,
      timeoutDuration: 5000,
      currentReview1: 0,
      currentReview2: 0,
      currentTimeout: null,
    }
  },
  methods: {
    beforeEnter: function (el) {
      el.style.opacity = 0;
      el.style.left = this.direction > 0 ? '-150px' : '150px';
      el.style.display = 'block';
    },
    enter: function (el, done) {
      Velocity(el, { opacity: 1, left: '0px'}, { duration: this.transitionDuration }, done)
    },
    beforeLeave: function (el) {
      Velocity(el, { opacity: 0, left: this.direction > 0 ? '150px' : '-150px'}, { duration: this.transitionDuration })
    },
    leave: function (el, done) {
      //Velocity(el, { opacity: 0, left: '150px' }, { duration: 900 }, { complete: done })
    },
    unslide(e) {
      this.slide(e);
      this.direction = -1;
    },
    slide(e) {
      clearTimeout(this.currentTimeout);
      this.currentReview1 = (this.currentReview1 + this.direction + 5) % 5;
      this.currentReview2 = (this.currentReview2 + this.direction + 5) % 5;
      this.currentTimeout = setTimeout(() => {
        this.direction = Math.abs(this.direction);
        this.slide();
      }, this.timeoutDuration);
    }
  },
  mounted() {
    let velocity = document.createElement('script');
    velocity.setAttribute('src', 'https://cdnjs.cloudflare.com/ajax/libs/velocity/1.2.3/velocity.min.js');
    document.head.appendChild(velocity);
    this.currentTimeout = setTimeout(this.slide, this.timeoutDuration);
  },
  computed: {
    reviews1() {
      return this.$store.state.b2c.home.reviews && this.$store.state.b2c.home.reviews.slice(0, 5);
    },
    reviews2() {
      return this.$store.state.b2c.home.reviews && this.$store.state.b2c.home.reviews.slice(5);
    },
    showReview1() {
      return (i) => i === this.currentReview1
    },
    showReview2() {
      return (i) => i === this.currentReview2
    }

  }
};
</script>

