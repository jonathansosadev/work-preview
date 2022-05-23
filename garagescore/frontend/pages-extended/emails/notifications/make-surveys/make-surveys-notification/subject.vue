<template>
  <span>{{ $t_locale('pages-extended/emails/notifications/make-surveys/make-surveys-notification/subject')('title') }} <span v-if="groupName">: {{ $t_locale('pages-extended/emails/notifications/make-surveys/make-surveys-notification/subject')('groupeName') }} {{ groupName }}</span></span>
</template>

<script>
export default {
  computed: {
    groupName() {
      return this.$store.getters.payload.contact.payload.data.modifications[0].groupName;
    }
  }
}
</script>