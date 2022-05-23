<template>
  <div class="history-item">
    <div class="history-item__left">
      <div class="history-item__icon">
        <slot name="icon"/>
      </div>
    </div>
    <div class="history-item__right">
      <slot/>
    </div>
  </div>
</template>


<script>
export default {
}
</script>

<style lang="scss" scoped>
$padding: 1rem 0;

.history-item {
  display: flex;
  flex-flow: row;

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.1rem;
    background-color: $bg-grey;
    border: 2px solid $blue;
    border-radius: 9999px;
    color: $blue;
    height: 1.75rem;
    width: 1.75rem;
    font-size: 1rem;
    z-index: 2;
  }

  &__left {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: $padding;
    margin-right: 1rem;
  }

  &__right {
    flex: 1;
    padding: $padding;
  }

  &:not(:last-child) {
    .history-item__left {
      &::after {
        content: "";
        z-index: 1;
        top: 2rem;
        left: 50%;
        position: absolute;
        height: 100%;
        width: 2px;
        background: linear-gradient(transparent 50%, $white 50%) 0% 0% / 2px 6px, linear-gradient($blue, $blue) 0% 0% / 2px 100%
      }
    }
  }
}
</style>
