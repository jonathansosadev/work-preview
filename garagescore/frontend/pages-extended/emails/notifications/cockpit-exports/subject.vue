<template>
  <span>{{ subject }}</span>
</template>

<script>
import { ExportFrequencies, ExportTypes } from '../../../../utils/enumV2';

  export default {
    name:'ExportEmailSubject',
    props: {
      alternativePayload: { type: Object, default: () => {} },
      useAlternativePayload: { type: Boolean, default: false },
    },
    components: {},
    methods: {
      periodIdToString(periodId) {
        if (typeof periodId !== "string") {
          return periodId;
        }
        if (periodId.match(/^[0-9]+$/)) {
          return periodId;
        }
        const month = periodId.match(/([0-9]+)-(month[0-9]+)/);
        if (month) {
          return `${this.$t_locale('pages-extended/emails/notifications/cockpit-exports/subject')(`Period_${month[2]}`)} ${month[1]}`;
        }
        const quarter = periodId.match(/([0-9]+)-(quarter[0-9]+)/);
        if (quarter) {
          return `${this.$t_locale('pages-extended/emails/notifications/cockpit-exports/subject')(`Period_${quarter[2]}`)} ${quarter[1]}`;
        }
        return this.$t_locale('pages-extended/emails/notifications/cockpit-exports/subject')(`Period_${periodId}`);
      }
    },
    computed: {
      payload() {
        return this.useAlternativePayload ? this.alternativePayload : this.$store.getters.payload;
      },
      isRecurring() {
        return this.payload.frequency && this.payload.frequency !== ExportFrequencies.NONE;
      },
      subject() {
        const exportName = this.payload.exportName;
        let period = "";
        // Admin exports don't have a period
        if(![ExportTypes.ADMIN_USERS, ExportTypes.ADMIN_GARAGES].includes(this.payload.exportType)) {
          period = this.displayedPeriod;
        }

        let exportType = this.$t_locale('pages-extended/emails/notifications/cockpit-exports/subject')(`ExportType_${this.payload.exportType}`).toLowerCase();
        if (this.payload.exportType === ExportTypes.AUTOMATION_RGPD) {
          exportType = this.$t_locale('pages-extended/emails/notifications/cockpit-exports/subject')(`ExportType_${this.payload.exportType}`);
        }
        const isRecurring = this.isRecurring ? this.$t_locale('pages-extended/emails/notifications/cockpit-exports/subject')('Recurring') : '';
        if (this.payload.isEmptyExcel) {
          return this.$t_locale('pages-extended/emails/notifications/cockpit-exports/subject')('subjectNotReady', { isRecurring, exportType, period });
        }
        if (exportName) {
          return this.$t_locale('pages-extended/emails/notifications/cockpit-exports/subject')('subjectNamed', { isRecurring, exportName, period });
        }
        return this.$t_locale('pages-extended/emails/notifications/cockpit-exports/subject')('subjectAnonymous', { isRecurring, exportType, period });
      },
      displayedPeriod() {
        const { periodId, startPeriodId, endPeriodId } = this.payload;
        if (startPeriodId && endPeriodId && startPeriodId === endPeriodId) {
          return this.periodIdToString(startPeriodId).toLowerCase();
        }
        if (!periodId) {
          const startPeriodString = this.periodIdToString(startPeriodId).toLowerCase();
          const endPeriodString = this.periodIdToString(endPeriodId).toLowerCase();
          return `${startPeriodString} - ${endPeriodString}`;
        }
        return this.periodIdToString(periodId);
      }
    },
  }
</script>
