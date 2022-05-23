<template>
  <p class="content" :style="cssStyle" v-html="content">
  </p>
</template>
<script>
export default {
  name:"AutomationInnerHTML",
  data() {
    return {
      count: 0
    }
  },
  props: {
   content: String,
    cssStyle: Object
  }
}
</script>
<style scoped>
  .content {
    font-size: 1.2rem;
    line-height: 1.43;
    text-align: left;
  }
</style>