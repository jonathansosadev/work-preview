<template>
  <span>{{ subject }}</span>
</template>

<script>
  export default {
    computed: {
      payload() { return this.$store.getters.payload; },
      subject() {
        if (this.payload.type === "SUPERVISOR_ZOHO_SYNCHRONISATION_REPORT") {
          return `Rapport journalier de synchronisation de zoho (${this.payload.countMissingGarages} garages manquants)`;
        } else if (this.payload.type === "SUPERVISOR_LACK_OF_PHONE") {
          return `Attention: Indicatif 0${this.payload.area} - ${this.payload.stock} numéros restant !`;
        } else if (this.payload.type === "SUPERVISOR_SOURCE_TYPE_MISMATCH") {
          return `Attention: Incompatibilité de type de source !`;
        } else if (this.payload.type === "SUPERVISOR_X_LEADS_STATS_REPORT") {
          return `XLeads: Rapport hebdomadaire de monitoring`;
        }
        return 'Rapport de supervision';
      }
    }
  }
</script>
