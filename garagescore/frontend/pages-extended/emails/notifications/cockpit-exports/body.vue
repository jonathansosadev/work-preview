<template>
  <table class="export-ready" cellspacing="0" cellpadding="0">

    <!-- BASE HEADER -->
    <tr>
      <td>
        <BaseHeader :title="title" :color="color" :logoUrl="logoUrl"></BaseHeader>
      </td>
    </tr>

    <!-- GREETINGS MESSAGE -->
    <tr>
      <td>
        {{ $t_locale('pages-extended/emails/notifications/cockpit-exports/body')('Greetings') }}
      </td>
    </tr>

    <tr>
      <td v-if="isEmptyExcel">
        <span>
          <b>{{ $t_locale('pages-extended/emails/notifications/cockpit-exports/body')('emptyExcel', { exportType }) }}</b>
         </span>
        <br/> <br/>
        <span>{{ $t_locale('pages-extended/emails/notifications/cockpit-exports/body')('changeParameter') }}</span>
      </td>
      <td v-else>
        {{ yourExportIsReady }}
      </td>
    </tr>

    <tr>
      <td>
        <div class="left-tab detail">
          {{ $t_locale('pages-extended/emails/notifications/cockpit-exports/body')('exportType') }} <span class="value">{{ exportType }}</span>
        </div>
        <div v-if="!isAdminExport && !isAutomation" class="left-tab detail">
          {{ $t_locale('pages-extended/emails/notifications/cockpit-exports/body')('dataTypes') }} <span class="value">{{ displayedDataTypes }}</span>
        </div>
        <div v-if="!isAdminExport" class="left-tab detail">
          {{ $t_locale('pages-extended/emails/notifications/cockpit-exports/body')('period') }} <span class="value">{{ displayedPeriod }}</span>
        </div>
        <div v-if="!isAdminExport" class="left-tab detail">
          {{ $t_locale('pages-extended/emails/notifications/cockpit-exports/body')('Frequency') }} <span class="value">{{ displayedFrequency }}</span>
        </div>
        <div v-if="!isAdminExport" class="left-tab detail">
          {{ $t_locale('pages-extended/emails/notifications/cockpit-exports/body')('nGarages') }} <span class="value">{{ nGarages }}</span>
        </div>
      </td>
    </tr>

    <!-- CTA -->
    <tr>
      <CentralButton v-if="!isEmptyExcel" :text="$t_locale('pages-extended/emails/notifications/cockpit-exports/body')('ClickHere')" :url="downloadUrl" />
    </tr>

    <!-- GOOD BYE MESSAGE -->
    <tr>
      <td v-bind:class="[isEmptyExcel ? 'padding-top-10' : 'no-padding']">
        <BaseFooter></BaseFooter>
      </td>
    </tr>
  </table>
</template>

<script>
import BaseFooter from '../../../../components/emails/notifications/BaseFooter';
import BaseHeader from '../../../../components/emails/notifications/BaseHeader';
import CentralButton from '../../../../components/emails/general/CentralButton';
import { ExportTypes, ExportFrequencies } from '../../../../utils/enumV2';

export default {
  name: 'ExportEmailBody',
  layout: 'email',
  components: { BaseHeader, BaseFooter, CentralButton },
  props: {
    alternativePayload: { type: Object, default: () => {} },
    useAlternativePayload: { type: Boolean, default: false },
  },
  computed: {
    payload() {
      return this.useAlternativePayload ? this.alternativePayload : this.$store.getters.payload;
    },
    downloadUrl() {
      return this.payload.downloadUrl;
    },
    isRecurring() {
      return this.payload.frequency && this.payload.frequency !== ExportFrequencies.NONE;
    },
    frequency() {
      if (this.isRecurring) {
        return this.payload.frequency;
      }
      return ExportFrequencies.NONE;
    },
    title() {
      if (this.isEmptyExcel) {
        return this.$t_locale('pages-extended/emails/notifications/cockpit-exports/body')('Title_empty_export');
      }
      return this.$t_locale('pages-extended/emails/notifications/cockpit-exports/body')('Title');
    },
    yourExportIsReady() {
      const exportName = this.payload.exportName;
      const period = this.isAdminExport ? '' : this.displayedPeriod.toLowerCase();
      const exportType = this.$t_locale('pages-extended/emails/notifications/cockpit-exports/body')(`ExportType_${this.payload.exportType}`).toLowerCase();
      const isRecurring = this.isRecurring ? this.$t_locale('pages-extended/emails/notifications/cockpit-exports/body')('Recurring') : '';

      if (exportName) {
        return this.$t_locale('pages-extended/emails/notifications/cockpit-exports/body')('subjectNamed', { isRecurring, exportName, period });
      }
      if (this.isAutomation) {
        return this.$t_locale('pages-extended/emails/notifications/cockpit-exports/body')('subjectAutomation');
      }
      return this.$t_locale('pages-extended/emails/notifications/cockpit-exports/body')('subjectAnonymous', { isRecurring, exportType, period });
    },
    exportType() {
      const exportName = this.payload.exportName;
      const exportType = this.payload.exportType;
      return exportName || this.$t_locale('pages-extended/emails/notifications/cockpit-exports/body')(`ExportType_${exportType}`);
    },
    displayedDataTypes() {
      const dataTypes = this.payload.dataTypes;
      if (!dataTypes || !dataTypes.length) {
        return this.$t_locale('pages-extended/emails/notifications/cockpit-exports/body')('DataType_All');
      }
      return dataTypes.map((dataType) => this.$t_locale('pages-extended/emails/notifications/cockpit-exports/body')(`DataType_${dataType}`)).join(', ');
    },
    displayedPeriod() {
      const { periodId, startPeriodId, endPeriodId } = this.payload;
      if (startPeriodId && endPeriodId && startPeriodId === endPeriodId) {
        return this.periodIdToString(startPeriodId);
      }
      if (!periodId) {
        const startPeriodString = this.periodIdToString(startPeriodId);
        const endPeriodString = this.periodIdToString(endPeriodId);
        return `${startPeriodString} - ${endPeriodString}`;
      }
      return this.periodIdToString(periodId);
    },
    displayedFrequency() {
      return this.$t_locale('pages-extended/emails/notifications/cockpit-exports/body')(`Frequency_${this.frequency}`);
    },
    nGarages() {
      const { nGarages, garageIds } = this.payload;
      if (garageIds[0] === 'All') {
        return this.$t_locale('pages-extended/emails/notifications/cockpit-exports/body')('Garages_All');
      }
      return nGarages;
    },
    color() {
      return 'blue';
    },
    logoUrl() {
      return '/images/www/alert/notepad.png';
    },
    isAdminExport() {
      return [ExportTypes.ADMIN_USERS, ExportTypes.ADMIN_GARAGES].includes(this.payload.exportType);
    },
    isAutomation() {
      return [ExportTypes.AUTOMATION_RGPD, ExportTypes.AUTOMATION_CAMPAIGN].includes(this.payload.exportType);
    },
    isEmptyExcel() {
      return this.payload.isEmptyExcel
    }
  },
  methods: {
    periodIdToString(periodId) {
      if (typeof periodId !== 'string') {
        return periodId;
      }
      if (periodId.match(/^[0-9]+$/)) {
        return periodId;
      }
      const month = periodId.match(/([0-9]+)-(month[0-9]+)/);
      if (month) {
        return `${this.$t_locale('pages-extended/emails/notifications/cockpit-exports/body')(`Period_${month[2]}`)} ${month[1]}`;
      }
      const quarter = periodId.match(/([0-9]+)-(quarter[0-9]+)/);
      if (quarter) {
        return `${this.$t_locale('pages-extended/emails/notifications/cockpit-exports/body')(`Period_${quarter[2]}`)} ${quarter[1]}`;
      }
      return this.$t_locale('pages-extended/emails/notifications/cockpit-exports/body')(`Period_${periodId}`);
    },
  },
};
</script>

<style lang="scss" scoped>
.export-ready {
  width: 100%;
  color: #7f7f7f;
  font-size: 14px;
  font-family: 'Trebuchet MS', sans-serif;

  td {
    padding: 10px 5px;
  }

  .bullet-list {
    margin-top: 40px;
  }

  .no-padding {
    padding: 0;
  }

  .padding-top-10 {
    padding: 10px 0 0 0;
  }

  .pro-tip {
    padding-bottom: 30px;
  }

  .customer-name {
    color: $black;
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 10px;
  }

  .customer-info {
    line-height: 1.5;
  }

  .blue {
    color: #219ab5;
    a {
      text-decoration: underline;
    }
  }

  .subtitle {
    font-weight: 700;
    margin: 10px 0;
  }

  .review {
    font-size: 16px;
    font-weight: 700;
    font-style: italic;
    color: $blue;
    padding: 10px 15px;
  }

  .rejected {
    color: #d14836;
    padding-left: 15px;
  }

  .bold {
    margin-bottom: 1.5rem;
  }
  .left-tab {
    margin-left: 2rem;
  }
  .detail {
    margin-bottom: 0.5rem;
  }
  .value {
    color: #219ab5;
  }

  .details {
    padding-left: 15px;
    .lead > div {
      padding: 5px 0;
    }
    .lead-subdetail {
      padding: 10px 15px 5px 15px;
    }
  }

  .cta-wrapper {
    padding: 25px 0;
    text-align: center;
  }

  .cta {
    padding-bottom: 12px;
    text-decoration: none;
    padding-left: 39px;
    padding-right: 39px;
    padding-top: 12px;
    display: inline-block;
    background-color: #ed5600;
    color: $white;
    border-radius: 3px;
    font-size: 16px;
    font-weight: bold;
  }

  .copyright {
    font-size: 12px;
    font-style: italic;
    color: #999;
  }
}
</style>
