<template>
  <div class="ereputation-stats-skeleton">
    <Skeleton class="ereputation-stats-skeleton__icon" />
    <Skeleton class="ereputation-stats-skeleton__row-1" />
    <Skeleton class="ereputation-stats-skeleton__row-2" />
    <Skeleton class="ereputation-stats-skeleton__row-3" />
  </div>
</template>

<style lang="scss" scoped>
.ereputation-stats-skeleton {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  & > * + * {
    margin-top: 14px;
  }

  &__icon {
    height: 36px;
    width: 36px;
  }

  &__row-1 {
    height: 1rem;
    width: 80px;
  }

  &__row-2 {
    height: 26px;
    width: 132px;
  }

  &__row-3 {
    height: 1rem;
    width: 188px;
  }
}
</style>