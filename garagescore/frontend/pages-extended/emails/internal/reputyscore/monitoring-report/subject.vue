<template>
  <span>{{ subject }}</span>
</template>

<script>
  export default {
    computed: {
      payload() { return this.$store.getters.payload; },
      subject() {
        return 'Custeed E-Réputation : Rapport quotidien de monitoring';
      }
    }
  }
</script>
