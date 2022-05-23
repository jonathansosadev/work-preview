<template>
  <Card class="recommendations">
    <h1 class="recommendations__title">
      <i class="icon-gs-book-open"></i>
      {{ $t_locale('components/global/Recommendations')("recommendations") }}
    </h1>
    <div class="horizontal-separator" />
    <div class="recommendations__content">
      <div class="recommendations__part recommendations__part--small recommendations__part--border">
        <button
          v-for="(recommendation, index) in recommendations"
          :key="index"
          class="recommendations__content__title"
          @click="recommendationsDisplay = index"
          :class="{ 'recommendations__content__title--active': recommendationsDisplay === index }"
        >
          {{ recommendation.title }}
          <i class="icon-gs-right" v-if="recommendationsDisplay === index"></i>
        </button>
      </div>
      <div class="recommendations__separator" />
      <div class="recommendations__part">
        <div
          v-for="(recommendation, index) in recommendations"
          v-bind:key="index"
          v-if="recommendationsDisplay === index">
          <span class="recommendations__content__sub-title">{{ recommendation.subTitle }}</span>
          <ul class="recommendations__content__list">
            <li v-for="(line, index) in recommendation.lines" v-bind:key="index"><i class="icon-gs-ok-bubble"></i><span v-html="line"></span></li>
          </ul>
        </div>
      </div>
    </div>
  </Card>
</template>
<script>

  export default {
    props: {
      recommendations: Object
    },

    data() {
      return {
        recommendationsDisplay: '0' // First element
      };
    }
  };
</script>

<style lang="scss" scoped>
  .recommendations {
    position: relative;
    padding: 1rem;
    &__title {
      margin: 0;
      max-width: 100%;
      font-size: 1.2rem;
      font-weight: bold;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    &__separator {
      width: 100%;
      height: 0.07rem;
      background-color: $grey;
      margin: 1rem 0;
    }

    &__part {
      padding: 0 1rem;
      flex: 1;
    }

    &__content {
      width: 100%;
      margin-top: 1.5rem;
      display: flex;
      flex-direction: column;

      &__title {
        text-align: left;
        border: none;
        background-color: transparent;
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 1.2rem;
        color: $black;
        cursor: pointer;
        outline: 0;
        padding: 0;

        & + & {
          margin-top: 1rem;
        }

        &--active {
          color: $blue;
          font-weight: bold;
        }

        i {
          font-size: 0.8rem;
        }
      }

      &__sub-title {
        font-size: 1.2rem;
        font-weight: bold;
        color: $black;
      }

      &__help {
        margin-top: 1rem;
        font-size: 1rem;
        color: $dark-grey;
      }

      &__list {
        i {
          font-size: 0.7rem;
          margin-right: 0.5rem;
        }
        list-style-type: none;
        padding-inline-start: 0;
        margin-block-end: 0;
        li {
          font-size: 1rem;
          color: $dark-grey;
        }
        > li {
          margin-bottom: 1rem;
          &:last-child {
            margin-bottom: 0;
          }
        }
      }
    }
    h1 {
      display: flex;
      align-items: center;
      font-size: 1.2rem;
      font-weight: bold;
      color: $black;
      margin: 0 0 0.7rem 1rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      i {
        font-size: 1.3rem;
        margin-right: 0.5rem;
      }
    }

    .horizontal-separator {
      width: 100%;
      height: 0.07rem;
      background-color: rgba(0, 0, 0, 0.16);
    }
  }

  @media (min-width: $breakpoint-min-md) {
    .recommendations {

      &__separator {
        display: none;
      }
      &__part {
        &--small {
          flex: 0.5;
        }
        &--border {
          border-right: 0.07rem solid rgba($grey, .5);
        }
      }
      &__content {
        flex-direction: row;
      }
    }
  }
</style>
