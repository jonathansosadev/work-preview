<template>
  <div class="review-skeleton">
    <div class="review-skeleton__part review-skeleton__part--1">
      <Skeleton />
    </div>
    <div class="review-skeleton__part review-skeleton__part--2">
      <Skeleton />
    </div>
    <div class="review-skeleton__part review-skeleton__part--3">
      <Skeleton />
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
.review-skeleton {
  height: 100%;

  &__part {
    & + & {
      margin-top: 14px;
    }

    ::v-deep .skeleton {
      height: 100%;
    }

    &--1 {
      height: 1.5rem;
      width: 100%;
    }

    &--2 {
      height: 2rem;
      width: 90%;
    }

    &--3 {
      height: 1.5rem;
      width: 40%;
    }
  }
}
</style>