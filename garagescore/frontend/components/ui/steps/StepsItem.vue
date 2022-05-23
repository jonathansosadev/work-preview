<template>
  <div class="steps-item">
    <div class="steps-item__header">
      <slot name="header">
      </slot>
    </div>
    <div class="steps-item__body">
      <slot>
      </slot>
    </div>
    <div class="steps-item__footer">
      <slot name="footer">
      </slot>
    </div>
  </div>
</template>

<script>
export default {
}
</script>

<style lang="scss" scoped>
$size: 3rem;

.steps-item {
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  
  &__header {
    margin-bottom: 0.5rem;
  }

  &__footer {
    margin-top: 0.5rem;
  }

  &__body {
    display: flex;
    justify-content: center;
    align-items: center;
    height: $size;
    width: $size;
    padding: 1rem;
    border: 3px solid $black-grey;
    border-radius: 9999px;
    background-color: $bg-grey;
    z-index: 2;
    box-sizing: border-box;
  }
}
</style>
