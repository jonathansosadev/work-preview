<template>
  <div class="card">
    <slot/>
  </div>
</template>

<style lang="scss" scoped>
.card {
  padding: 1rem;
  background-color: $white;
  box-shadow: 0 1px 3px 0 rgba($black, .16);
  border-radius: 5px;
}
</style>
