<template>
  <section class="thumb-score" :class="classBinding">
    <i v-if="recommend" class="icon-gs-like"></i>
    <i v-else class="icon-gs-dislike"></i>
  </section>
</template>

<script>
  export default {
    props: {
      recommend: Boolean,
      size: {
        type: String,
        default: 'md'
      }
    },

    computed: {
      classBinding() {
        return {
          positive: this.recommend,
          negative: !this.recommend,
          md: this.size === 'md',
          sm: this.size === 'sm'
        };
      }
    }
  }
</script>

<style lang="scss" scoped>
  .thumb-score {
    i {
      color: inherit;
      font-size: inherit;
    }
  }

  .positive {
    color: $green;
  }

  .negative {
    color: $red;
  }

  .md {
    font-size: 2rem;
  }

  .sm {
    font-size: 1rem;
  }
</style>
