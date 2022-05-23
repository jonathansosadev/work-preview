<template>
  <section class="kpi-box-skeleton">
    <div class="kpi-box-skeleton__title">
      <Skeleton />
    </div>
    <div class="kpi-box-skeleton__content">
      <slot></slot>
    </div>
  </section>
</template>


<style lang="scss" scoped>
$box-border: 1px;
$box-padding: 1rem;
$box-margin: 1rem;

.kpi-box-skeleton {
  display: flex;
  flex-flow: column;
  flex: 1 0 auto;
  padding: $box-padding;
  text-align: center;
  height: 13rem;
  min-width: 8rem;
  position: relative;
  background-color: $white;
  box-shadow: 0 0 3px 0 rgba(0, 0, 0, 0.16);
  border-radius: 3px;

  &__title {
    z-index: 1;
    pointer-events: none;

    ::v-deep .skeleton {
      width: 10rem;
      height: 1.5rem;
    }

    display: flex;
    justify-content: center;
    align-items: center;
  }

  &__content {
    z-index: 1;
    display: flex;
    flex-flow: column;
    flex: 1 0 auto;
    pointer-events: none;
  }
}

@media (max-width: $breakpoint-max-md) {
  $box-padding: 0.75rem;
  $box-margin: 0.75rem;

  .kpi-box-skeleton {
    margin: $box-margin $box-margin 0 0;
    padding: $box-padding;
    min-width: 6rem;
    height: 11rem;

    &:last-child {
      margin: $box-margin 0 0 0;
    }

    &__title {
      &__text {
        font-size: 0.85rem;
      }
    }
  }
}

@media (max-width: $breakpoint-max-sm) {
  $box-padding: 0.5rem;
  $box-margin: 0.5rem;

  .kpi-box-skeleton {
    display: inline-block;
    height: auto;
    padding: $box-padding;
    margin: $box-margin 0 0 0;

    width: 100%;
    box-sizing: border-box;

    &__title {
      margin: 0 0 $box-margin 0;
      position: relative;
    }

    &__content {
      position: relative;
    }
  }
}
</style>