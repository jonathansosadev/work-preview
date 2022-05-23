<template>
  <span>{{title}}</span>
</template>

<script>
  export default {
    computed: {
      payload() { return this.$store.getters.payload; },
      title() {
        if (this.payload.context === 'analytics') return 'Demande d\'inscription forfait analytics';
        else if (this.payload.context === 'apv') return 'Demande d\'accès aux donnèes "Atelier"';
        else if (this.payload.context === 'vn') return 'Demande d\'accès aux donnèes "Vente neuf"';
        else if (this.payload.context === 'vo') return 'Demande d\'accès aux donnèes "Vente occasion"';
        else if (this.payload.context === 'lead') return 'Demande d\'inscription forfait projets d\'achat';
        else if (this.payload.context === 'login') return 'Demande d\'aide formulaire login';
        return 'Message de Contact depuis garagescore.com';
      }
    }
  }
</script>
