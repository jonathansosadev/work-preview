<template>
  <Tile class="tile-ereputation-skeleton">
    <slot />
  </Tile>
</template>

<script>
export default {
  name:"TileEreputationSkeleton",
}
</script>

<style lang="scss" scoped>
.tile-ereputation-skeleton {
  ::v-deep.tile {
    padding-bottom: 38px;
  }
}
</style>