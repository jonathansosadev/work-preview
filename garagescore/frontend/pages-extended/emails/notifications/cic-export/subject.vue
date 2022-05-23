<template>
  <span>{{ subject }}</span>
</template>

<script>
  export default {
    computed: {
      payload() { return this.$store.getters.payload; },
      subject() {
        return `GarageScore - ${this.payload.garage.publicDisplayName} Export automatique des ${this.payload.details.unsatisfied.length} mécontents (${this.payload.date})`
      }
    }
  }
</script>
