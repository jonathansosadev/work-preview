<template>
  <span>{{ $t_locale('pages-extended/emails/notifications/exogenous/subject')('subject', { garageName, satisfactionLvl, type }) }}</span>
</template>

<script>
  export default {
    computed: {
      payload() { return this.$store.getters.payload; },
      data() {
        return this.payload.data;
      },
      garageName() {
        return this.payload.garage.publicDisplayName;
      },
      satisfactionLvl() {
        const score = this.data.get('review.rating.value');
        if (score > 6 && score < 9) return this.$t_locale('pages-extended/emails/notifications/exogenous/subject')('neutral');
        else if (score >= 9) return this.$t_locale('pages-extended/emails/notifications/exogenous/subject')('positive');
        return this.$t_locale('pages-extended/emails/notifications/exogenous/subject')('negative');
      },
      type() {
        return this.data.get('source.type');
      },
    },
  }
</script>
