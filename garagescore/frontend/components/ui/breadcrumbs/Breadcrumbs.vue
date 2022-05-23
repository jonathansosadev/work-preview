<template>
  <ul class="breadcrumbs">
    <slot />
  </ul>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
.breadcrumbs {
  background-color: $grey;
  display: flex;
  flex-flow: row;
  justify-content: center;
  align-items: center;
  list-style: none;
  padding: 0px;
  margin: 0px;
  border-radius: 5px;
}
</style>

