<template>
  <div class="rating-star">
    <div class="rating-star__item" v-for="n in maxValue" :key="n" :class="classBinding(n)" aria-hidden="true">
      <slot name="icon" v-if="!isHalf(n)">
        <i class="icon-gs-star"></i>
      </slot>
      <slot name="icon-half" v-else>
        <i class="icon-gs-half-star"><span class="path1"></span><span class="path2"></span></i>
      </slot>
    </div>
  </div>
</template>


<script>
export default {
  props: {
    maxValue: { type: Number, default: 5 },
    value: Number,
  },

  methods: {
    isHalf(n) {
      return this.value > (n-1) && this.value < (n+1) && this.value < n
    },

    isFull(n) {
      return this.value >= n
    },

    classBinding(n) {
      return {
        'rating-star__item--full': this.isFull(n),
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.rating-star {
  display: flex;
  flex-flow: row;
  justify-content: center;
  align-items: center;

  &__item {
    font-size: 0.9rem;

    .icon-gs-star {
      color: $grey;
    }

    & + & {
      margin-left: 0.15rem;
    }

    &--full {
      .icon-gs-star {
        color: $yellow;
      }
    }
  }
}
</style>

