<template>
  <span>Identifiants FTP pour {{ payload.user }}</span>
</template>

<script>
  export default {
    computed: {
      payload() { return this.$store.getters.payload; }
    }
  }
</script>
