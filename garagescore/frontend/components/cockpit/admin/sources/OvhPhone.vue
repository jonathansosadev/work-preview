<template>
  <span>{{ formattedPhone }}</span>
</template>

<script>
  export default {
    props: {
      phone: String
    },
    computed: {
      formattedPhone() {
        return this.phone.replace(/^0033/, '0').replace(/(.{2})/g, '$1 ').trim(); // to change
      }
    }
  };
</script>

<style lang="scss" scoped>
</style>
