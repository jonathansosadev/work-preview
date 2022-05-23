<template>
  <div>
    {{ title }}
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
      title() {
        const garage = this.$store.getters.emailData("garage").publicDisplayName
        const respondent = this.contactData('respondent');
        if (respondent) {
          return this.$t_locale('pages-extended/emails/survey/recontact-subject')("respondent", {garage});
        }
        return this.$t_locale('pages-extended/emails/survey/recontact-subject')("nonrespondent", {garage});
      }
    },
    methods: {
      contactData(key, fallback = '') {
        const contact = this.$store.getters.emailData('contact');
        return (contact && contact[key]) || fallback;
      }
    }
  }
</script>

