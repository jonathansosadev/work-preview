<template>
  <span>{{ $t_locale('pages-extended/emails/notifications/campaigns-ready/subject')('title', { garageName: payload.garageName }) }}</span>
</template>

<script>
  export default {
    computed: {
      payload() { return this.$store.getters.payload; }
    }
  }
</script>