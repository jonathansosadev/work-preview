<template>
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td width="20px"></td>
        <td>
          <div class="content" v-html="content"></div>
        </td>
        <td width="20px"></td>
      </tr>
  </table>
</template>
<script>
export default {
  data() {
    return {
      count: 0
    }
  },
  props: {
   content: String,
  }
}
</script>
<style scoped lang="scss">
  .content {
    font-size: 14px;
    color: $dark-grey;
    line-height: 1.5;
  }
</style>