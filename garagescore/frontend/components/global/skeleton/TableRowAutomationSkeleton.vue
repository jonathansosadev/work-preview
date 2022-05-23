<template>
  <TableRowSkeleton :fixedHeight="fixedHeight">
    <TableRowCellSkeleton :style="{ flex: 1.7 }">
      <GarageNameSkeleton />
    </TableRowCellSkeleton>
    <TableRowCellSkeleton v-for="n in columnCount" :key="n" center>
      <SimpleNumberSkeleton />
    </TableRowCellSkeleton>
    <div class="small-end-element" v-if="addSmallEndElement"></div>

    <slot />
  </TableRowSkeleton>
</template>

<script>
import TableRowSkeleton from "./TableRowSkeleton";
import TableRowCellSkeleton from "./TableRowCellSkeleton";
import SimpleNumberSkeleton from "./SimpleNumberSkeleton";
import GarageNameSkeleton from "./GarageNameSkeleton";

export default {
  components: {
    TableRowSkeleton,
    TableRowCellSkeleton,
    SimpleNumberSkeleton,
    GarageNameSkeleton
  },

  props: {
    columnCount: Number,
    fixedHeight: String,
    addSmallEndElement: Boolean
  }
};
</script>

<style scoped lang="scss">
.small-end-element {
  flex-grow: 0;
  padding: 1.5rem;
  min-width: 3rem;
  flex-shrink: 0;
  border-bottom: 1px solid rgba($grey, .5);
}
</style>
