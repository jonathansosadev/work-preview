<template>
  <span>{{ $t_locale('pages-extended/emails/notifications/user-add/subject')('subject') }} - {{ newUserEmail }}</span>
</template>

<script>
  export default {
    computed: {
      payload() { return this.$store.getters.payload; },
      contact() {
        return this.payload.contact;
      },
      newUserEmail() {
        return this.contact && this.contact.payload && this.contact.payload.newUserEmail;
      }
    }
  }
</script>
