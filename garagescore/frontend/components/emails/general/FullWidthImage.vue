<template>
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr align="center" >
      <td width="20px"></td>
      <td :style="headerPicture" class="header-picture"></td><!-- My header picture - Wave 2 ? -->
      <td width="20px"></td>
    </tr>
  </table>
</template>
<script>
export default {
 props: {
   url: String
 },
 computed: {
   headerPicture() {
     return  {
       'background-image': `url(${this.url ? this.url : 'https://i.imgur.com/zllqozI.png'})`,
     }
   },
 }
}
</script>
<style scoped>
.header-picture {
 background-size: contain;
 background-repeat: no-repeat;
 height: 81px;
}

</style>