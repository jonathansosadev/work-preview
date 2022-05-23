<template>
  <span>{{subject}}</span>
</template>

<script>
  import { getDeepFieldValue } from "../../../../../../../common/lib/util/object.js";

  export default {
    components: {},
    methods: {},
    data() {
      return {
        deep: (fieldName) => getDeepFieldValue(this, '$store.getters.payload.' + fieldName),
      };
    },
    computed: {
      publicDisplayName() { return this.deep('garage.publicDisplayName'); },
      sourceType() { return this.$t_locale('pages-extended/emails/notifications/cross-leads/recontact/email/subject')(this.deep('data.source.type')); },
      day() {
        const day = this.deep('currentAction.createdAt').getDate();
        return day < 10 ? '0' + day : day;
      },
      month() {
        const month = this.deep('currentAction.createdAt').getMonth();
        return month < 10 ? '0' + month : month;
      },
      hour() {
        const lastcontactDate =  this.deep('currentAction.createdAt');
        return lastcontactDate.toTimeString().split(' ')[0];
      },
      subject() {
        return this.$t_locale('pages-extended/emails/notifications/cross-leads/recontact/email/subject')('subject', { garageName: this.deep('garage.publicDisplayName'), sourceType: this.sourceType,day: this.day, hour: this.hour, month: this.month });
      }
    },
  }
</script>
