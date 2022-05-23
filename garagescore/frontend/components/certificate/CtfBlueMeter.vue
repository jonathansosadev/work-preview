<template>
  <div class="meter-container">
    <div class="meter-bar" :style="{'width': percentValue + '%',backgroundColor: getColor()}"></div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        height: '2px'
      }
    },
    props: {
      percentValue: 0,
      multiColor: false,
      useCusteedHeader: false
    },
    methods: {
      getColor() {
        if(this.useCusteedHeader) {
          return '#152543';
        }

        if (this.multiColor) {
          if (this.percentValue >= 80) return '#43b9ad';
          if (this.percentValue < 60) return '#D14836';
          return '#EAB436'
        }
        return '#43b9ad';
      }
    }
  }
</script>

<style lang="scss" scoped>
  .meter-container {
    display: inline-block;
    text-align: left;
    background-color: #BCBCBC;
    height: 4px;
    width: 100%;
    border-radius: 4px;
    line-height: 0;
    .meter-bar {
      display: inline-block;
      height: 6px;
      transition: width 0.2s, opacity 0.4s;
      opacity: 1;
      background-color: #43b9ad;
      position: relative;
      border-radius: 6px;
      top: -1.5px;
    }
  }
</style>
