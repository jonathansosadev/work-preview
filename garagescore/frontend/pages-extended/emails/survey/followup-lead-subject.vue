<template>
  <div>{{ hello }}{{ question }}</div>
</template>
<script>

export default {
  layout: 'email',
  computed: {
    payload() { return this.$store.getters.payload; },
    hello() {
      let title = this.payload.addressee.title || '';
      title = title.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // removeDiacritics
      let fullName = this.payload.addressee.fullName;
      return (fullName && title) ? this.$t_locale('pages-extended/emails/survey/followup-lead-subject')("helloM", {fullName, title: this.$t_locale('pages-extended/emails/survey/followup-lead-subject')(title)}) : this.$t_locale('pages-extended/emails/survey/followup-lead-subject')("hello");
    },
    question() {
      if (this.payload.sourceTypeCategory === 'XLEADS' && this.payload.adTitle) {
        return this.$t_locale('pages-extended/emails/survey/followup-lead-subject')(`question_XLEADS`, { adTitle: this.payload.adTitle });
      } else if (this.payload.sourceTypeCategory === 'AUTOMATION') {
        return this.$t_locale('pages-extended/emails/survey/followup-lead-subject')(`question_AUTOMATION`);
      }
      return this.$t_locale('pages-extended/emails/survey/followup-lead-subject')('question_DEFAULT');
    }
  }
};
</script>
