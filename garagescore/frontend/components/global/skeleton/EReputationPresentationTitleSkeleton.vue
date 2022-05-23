<template>
  <Tile class="tile-erep-pres-skeleton">
    <div class="tile-erep-pres-skeleton__left">
      <Skeleton class="tile-erep-pres-skeleton__icon" />
      <Skeleton class="tile-erep-pres-skeleton__row" />
      <Skeleton class="tile-erep-pres-skeleton__row tile-erep-pres-skeleton__row--big" />
    </div>
    <div class="tile-erep-pres-skeleton__right">
      <Skeleton class="tile-erep-pres-skeleton__title" />

      <div class="tile-erep-pres-skeleton__icons">
        <div class="tile-erep-pres-skeleton__icon-item" v-for="n in 6" :key="n">
          <Skeleton class="tile-erep-pres-skeleton__icon" />
          <Skeleton class="tile-erep-pres-skeleton__row tile-erep-pres-skeleton__row--small" />
        </div>
      </div>
    </div>
  </Tile>
</template>

<script>
export default {
  name:"EReputationPresentationTitleSkeleton",
}
</script>

<style lang="scss" scoped>
.tile-erep-pres-skeleton {
  margin: 1rem 1rem 0 1rem;
  height: 208px;
  flex-direction: row;

  ::v-deep.tile {
    display: flex;
    padding: 2rem 1rem;
    box-sizing: border-box;
  }

  &__right {
    margin-left: 1rem;
    flex: 2;

    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }

  &__left {
    border-right: 1px solid rgba($grey, .5);
    margin-right: 1rem;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .tile-erep-pres-skeleton__icon {
      margin-bottom: 1rem;
    }

    .tile-erep-pres-skeleton__row + .tile-erep-pres-skeleton__row {
      margin-top: 9px;
    }
  }

  &__icon {
    height: 36px;
    width: 36px;
  }

  &__icons {
    display: flex;
    flex-direction: row;

    & > * + * {
      margin-left: 1rem;
    }
  }

  &__icon-item {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .tile-erep-pres-skeleton__icon {
      margin-bottom: 8px;
    }
  }

  &__title {
    margin-bottom: 21px;
    width: 271px;
    height: 1rem;
  }

  &__row {
    height: 1rem;
    width: 80px;

    &--big {
      height: 21px;
      width: 132px;
    }

    &--small {
      width: 64px;
    }
  }
}
</style>