<template>
  <ul class="inline-list">
    <slot/>
  </ul>
</template>

<script>
export default {
}
</script>

<style lang="scss" scoped>
.inline-list {
  list-style: none;
  display: inline-flex;
  flex-flow: row;
  margin: 0;
  padding: 0;
  margin-bottom: 1rem;

  li {
    padding: 0 1rem;

    &:first-child {
      padding-left: 0;
    }
    &:last-child {
      padding-right: 0;
    }
    &:not(:last-child) {
      border-right: 1px solid $grey;
      letter-spacing: 1px;
    }
  }
}
</style>

