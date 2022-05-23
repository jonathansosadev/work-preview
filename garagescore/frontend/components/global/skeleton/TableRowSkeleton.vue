<template>
  <div class="table-row-skeleton" :style="inputStyle">
    <slot />
  </div>
</template>
<script>
export default {
  props: {
    fixedHeight: String
  },
  computed: {
    inputStyle() {
      return {
        height: this.fixedHeight || '117px'
      };
    }
  },
}
</script>

<style lang="scss" scoped>
.table-row-skeleton {
  width: 100%;
  background-color: #fff;
  display: flex;
  flex-direction: row;
}
</style>