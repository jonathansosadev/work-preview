<template>
  <div class="card">
    <div class="card__header" v-if="$slots.title">
      <AppText tag="span" bold class="card__title">
        <slot name="title" />
      </AppText>
    </div>
    <div class="card__body">
      <slot />
    </div>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
.card {
  width: 100%;
  background-color: $very-light-grey;
  min-height: 4rem;
  font-size: 1rem;

  &__header {
    background-color: $active-cell-color;
    padding: 1rem 1rem 1rem 1.5rem;
    display: flex;
    align-items: center;
  }

  &__body {
    padding: 1rem 1rem 1rem 1.5rem;

    ::v-deep .text {
      font-size: 0.9rem;
    }
  }
}
</style>
