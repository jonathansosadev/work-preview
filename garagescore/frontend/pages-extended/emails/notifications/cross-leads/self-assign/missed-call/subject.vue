<template>
  <span>{{ subject }}</span>
</template>

<script>
  export default {
    components: {},
    methods: {},
    computed: {
      payload() { return this.$store.getters.payload; },
      garage() { return this.payload.garage; },
      publicDisplayName() { return this.garage.publicDisplayName },
      data() { return this.payload.data; },
      sourceType() { return this.$t_locale('pages-extended/emails/notifications/cross-leads/self-assign/missed-call/subject')(this.data.get('source.type')); },
      stage() { return this.payload.stage; },
      remainingTime() { return 60 - (this.stage * 15); }, // 1 = 45, 2 = 30, 3 = 15
      createdAt() {
        const createdAt = new Date(this.data.get('leadTicket.createdAt'));
        return this.$dd(createdAt, 'date shortTime readable');
      },
      subject() {
        let subjectType = '';
        if (!this.stage) subjectType = this.$t_locale('pages-extended/emails/notifications/cross-leads/self-assign/missed-call/subject')('subjectType_NEW', { sourceType: this.sourceType });
        else if (this.stage < 4) subjectType = this.$t_locale('pages-extended/emails/notifications/cross-leads/self-assign/missed-call/subject')('subjectType_REMINDER', { sourceType: this.sourceType, remainingTime: this.remainingTime });
        else if (this.stage >= 4) subjectType = this.$t_locale('pages-extended/emails/notifications/cross-leads/self-assign/missed-call/subject')('subjectType_LAST_REMINDER', { sourceType: this.sourceType });
        return this.$t_locale('pages-extended/emails/notifications/cross-leads/self-assign/missed-call/subject')('subject', { subjectType, publicDisplayName: this.publicDisplayName, createdAt: this.createdAt});
      }
    },
  }
</script>
