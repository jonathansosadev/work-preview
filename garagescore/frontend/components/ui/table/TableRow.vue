<template>
  <div class="table__row" :class="classBinding">
    <slot />
  </div>
</template>

<script>
export default {
  props: {
    border: { type: Boolean, default: false }
  },

  computed: {
    classBinding() {
      return {
        "table__row--border": this.border
      };
    }
  }
};
</script>

<style lang="scss" scoped>
.table__row {
  width: 100%;
  display: flex;
  flex-direction: row;
  box-sizing: border-box;
  flex-wrap: nowrap;
  /*border-left: solid 0.357rem $white;*/
  padding-left: 0.357rem;
  border-radius: 3px;
}

@media (max-width: $breakpoint-max-sm) {
  .table__row {
    flex-wrap: wrap;
  }
}
</style>
