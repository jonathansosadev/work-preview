<template>
  <div class="chart__skeleton">
    <Skeleton class="chart__skeleton__bar" v-for="(height, index) in barsHeight" :key="index" :style="barStyle(height)" />
  </div>
</template>

<script>
export default {
  name: "ChartSkeleton",
  props: {
    barsHeight : {
      type : Array,
      default: () => ["30%", "20%", "10%", "40%", "50%", "70%", "40%", "32%", "78%", "23%", "42%", "36%"]
    }
  },

  computed: {
    barStyle() {
      return function(height) {
        return {
          width: `calc(100% / ${this.$props.barsHeight.length} - 5px)`,
          height: height
        }
      }
    },
  }
};
</script>


<style lang="scss" scoped>
.chart {
  &__skeleton {
    min-width: 50px;
    min-height: 50px;
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: space-evenly;
    align-items: baseline;
  }
}
</style>
