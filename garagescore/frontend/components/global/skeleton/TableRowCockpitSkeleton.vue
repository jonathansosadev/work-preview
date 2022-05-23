<template>
  <TableRowSkeleton>
    <TableRowCellSkeleton :style="{ flex: 2 }">
      <ReviewSkeleton />
    </TableRowCellSkeleton>
    <TableRowCellSkeleton v-for="n in columnCount" :key="n" center>
      <SimpleNumberSkeleton />
    </TableRowCellSkeleton>
    <slot />
  </TableRowSkeleton>
</template>

<script>
import TableRowSkeleton from "./TableRowSkeleton";
import TableRowCellSkeleton from "./TableRowCellSkeleton";
import SimpleNumberSkeleton from "./SimpleNumberSkeleton";
import ReviewSkeleton from "./ReviewSkeleton";

export default {
  components: {
    TableRowSkeleton,
    TableRowCellSkeleton,
    SimpleNumberSkeleton,
    ReviewSkeleton
  },

  props: {
    columnCount: Number
  }
};
</script>