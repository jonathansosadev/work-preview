<template>
  <TileSkeleton>
    <StatsSkeleton v-for="rowIndex in rowQuantity" :key="rowIndex" />
  </TileSkeleton>
</template>

<script>
  import StatsSkeleton from '~/components/global/skeleton/StatsSkeleton.vue';
  import TileSkeleton from '~/components/global/skeleton/TileSkeleton.vue';

  export default {
    components: {
      StatsSkeleton,
      TileSkeleton,
    },
    props: {
      rowQuantity: {
        type: Number,
        default: 1,
      },
    },
  }
</script>

<style lang="scss" scoped>
.tile-skeleton {
  &__padding-bar {
    // IE hack for height 1px
    padding: 1px 0px 0px 0px;
    height: 0px;

    background-color: $light-grey;
    width: 100%;
  }

  &__title {
    height: 2rem;
    width: 50%;
    align-self: center;
    margin-bottom: 7px;
  }

  &__header {
    justify-content: center;
    margin-bottom: 14px;
  }

  &__body {
    display: flex;
    flex-flow: row;
    justify-content: space-between;
    height: 100%;

    margin-top: 1rem;
    margin-bottom: 19px;
  }

  &__link {
    width: 13rem;
    align-self: flex-end;
    margin-top: 5px;
    height: 1rem;
  }
}

@media (min-width: $breakpoint-min-md) {
  .tile-skeleton {
    &__header {
      justify-content: center;
      margin-bottom: 14px;
    }

    &__body {
      flex-flow: column;
      align-items: flex-start;
    }
  }
}
</style>
