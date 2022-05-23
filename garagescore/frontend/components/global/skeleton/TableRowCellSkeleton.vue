<template>
  <div class="table-row-cell-skeleton" :class="{ center }">
    <div class="table-row-cell-skeleton__content">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    center: Boolean
  }
};
</script>

<style lang="scss" scoped>
.table-row-cell-skeleton {
  border-bottom: 1px solid #e4e4e4;

  display: block;
  width: 0px;
  padding: 1rem 0px;
  flex: 1;

  &.center {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  &:first-child {
    .table-row-cell-skeleton__content {
      margin-left: 14px;
    }
  }
}
</style>