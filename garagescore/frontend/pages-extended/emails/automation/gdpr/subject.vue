<template>
  <span>{{ getContent('subject') }}</span>
</template>

<script>
  export default {
    methods: {
      getContent(key) {
        return this.$t_locale('pages-extended/emails/automation/gdpr/subject')(`${key}`, this.arguments);
      },
      applyArguments(str) {
        for (const arg of Object.keys(this.arguments)) {
          while (str.includes(`{${arg}}`)) {
            str = str.replace(`{${arg}}`, this.arguments[arg]);
          }
        }
        return str;
      }
    },
    computed: {
      arguments() {
        return {
          garageName: this.payload.garagePublicDisplayName || '',
          customerName: this.payload.customerName || '',
          brandName: this.payload.brandName || '',
        }
      },
      payload() {
        return this.$store.getters.payload;
      },
      locale() {
        return this.payload.locale || 'fr_FR'
      },
    }
  }
</script>
