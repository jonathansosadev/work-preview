<template>
  <div>
     {{ $t_locale('pages-extended/sms/survey/recontact-sms')("content") }}
  </div>
</template>
<script>
  export default {
    components: { },
    data() {
      return { }
    },
    layout () {
      return 'email';
    },
    computed: {

    },
    methods: {
      contactData(key, fallback = '') {
        const contact = this.$store.getters.emailData('contact');
        return (contact && contact[key]) || fallback;
      }
    }
  }
</script>

