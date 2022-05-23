<template>
  <div class="garage-name-skeleton">
    <div class="garage-name-skeleton__part garage-name-skeleton__part--1">
      <Skeleton />
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
.garage-name-skeleton {
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
      margin-top: .5rem;
    }
  }
}
</style>