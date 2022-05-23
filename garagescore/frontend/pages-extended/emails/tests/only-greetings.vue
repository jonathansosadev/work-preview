<template>
  <EmailGreetings/>
</template>
<script>
import EmailGreetings from "~/components/emails/survey/EmailGreetings.vue";

export default {
    components: {
      EmailGreetings
    },
    data() {
      return { }
    },
    layout () {
      return 'email';
    }
  }
</script>

