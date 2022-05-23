<template>
  <div class="images-ctn">
    <img 
      class="image"
      v-for="imageSrc in images"
      :key="imageSrc"
      :src="imageSrc"
      :height="size"
      :width="size"
    />
  </div>
</template>

<script>
  export default {
    computed: {
      badgeData() {
        return this.$store.getters.badgeData;
      },
      images() {
        return (this.badgeData && this.badgeData.images) || [];
      },
      size() {
        return (this.badgeData && this.badgeData.size) || 179;
      }
    }
  };
</script>

<style>
  .images-ctn {
    position: relative;
    top: 0;
    left: 0;
  }
  .image {
    position: absolute;
    top: 0;
    left: 0;
  }
</style>